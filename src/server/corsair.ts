import 'dotenv/config';
import { createCorsair } from 'corsair';
import { googlecalendar } from '@corsair-dev/googlecalendar';
import { gmail } from '@corsair-dev/gmail';
import { eq } from 'drizzle-orm';
import { conn, db } from './db';
import { user } from './db/schema';
import { pushEvent } from '~/lib/sse';
import { inngest } from '~/inngest/client';

const seenEvents = new Map<string, number>();

function isDuplicate(userId: string, historyId: string): boolean {
    const key = `${userId}:${historyId}`;
    const now = Date.now();
    const last = seenEvents.get(key);
    if (last && now - last < 60_000) return true;
    seenEvents.set(key, now);
    if (seenEvents.size > 10_000) {
        const cutoff = now - 60_000;
        for (const [k, t] of seenEvents) {
            if (t < cutoff) seenEvents.delete(k);
        }
    }
    return false;
}

export const corsair = createCorsair({
    plugins: [gmail({
        webhookHooks: {
            messageChanged: {
                async after(ctx, result) {
                    if (!result.data) return;
                    try {
                        const { emailAddress, historyId, type } = result.data;
                        if (type !== "messageReceived") return;
                        const userRecord = await db
                            .select({ id: user.id })
                            .from(user)
                            .where(eq(user.email, emailAddress))
                            .limit(1)
                            .then(r => r[0]);
                        if (!userRecord) return;
                        if (isDuplicate(userRecord.id, historyId)) return;
                        pushEvent(userRecord.id, 'gmail:messageChanged', {
                            type,
                            emailAddress,
                            historyId,
                        });
                        await inngest.send({
                            name: 'gmail/message.processed',
                            data: {
                                tenantId: ctx.tenantId,
                                emailAddress,
                                eventType: type,
                                historyId,
                            },
                        });
                    } catch (e) {
                        console.error('[webhook] after hook failed:', e);
                    }
                },
            },
        },
    }), googlecalendar()],
    database: conn,
    kek: process.env.CORSAIR_KEK!,
    multiTenancy: true,
});