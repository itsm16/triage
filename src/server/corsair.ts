import 'dotenv/config';
import { createCorsair } from 'corsair';
import { googlecalendar } from '@corsair-dev/googlecalendar';
import { gmail } from '@corsair-dev/gmail';
import { decodePubSubMessage } from '@corsair-dev/gmail';
import { eq } from 'drizzle-orm';
import { conn, db } from './db';
import { user } from './db/schema';
import { pushEvent } from '~/lib/sse';


export const corsair = createCorsair({
    plugins: [gmail({
        webhookHooks: {
            messageChanged: {
                async before(ctx, args) {
                    try {
                        const body = args as { message?: { data?: string } };
                        const data = body?.message?.data;
                        if (data) {
                            const decoded = decodePubSubMessage(data);
                            if (decoded.emailAddress) {
                                const userRecord = await db
                                    .select({ id: user.id })
                                    .from(user)
                                    .where(eq(user.email, decoded.emailAddress))
                                    .limit(1)
                                    .then(r => r[0]);
                                if (userRecord) {
                                    const historyId = decoded.historyId ?? '';
                                    pushEvent(userRecord.id, 'gmail:messageChanged', {
                                        type: 'messageReceived',
                                        emailAddress: decoded.emailAddress,
                                        historyId,
                                    });
                                }
                            }
                        }
                    } catch (e) {
                        console.error('[webhook] push sse failed:', e);
                    }
                    return { ctx, args };
                },
            },
        },
    }), googlecalendar()],
    database: conn,
    kek: process.env.CORSAIR_KEK!,
    multiTenancy: true,
});