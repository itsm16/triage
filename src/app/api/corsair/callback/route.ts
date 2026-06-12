import { processOAuthCallback } from "corsair/oauth";
import { and, eq } from "drizzle-orm";
import { randomBytes, scryptSync, createCipheriv } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { corsair } from "~/server/corsair";
import { db } from "~/server/db";
import { corsairAccounts, corsairIntegrations } from "~/server/db/schema";

const REDIRECT_URI = `${process.env.APP_URL}/api/corsair/callback`;

function encryptDek(dek: string, kek: string): string {
    const salt = randomBytes(16);
    const key = scryptSync(kek, salt, 32);
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv, { authTagLength: 16 });
    const encrypted = Buffer.concat([cipher.update(dek, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [
        salt.toString("base64"),
        iv.toString("base64"),
        authTag.toString("base64"),
        encrypted.toString("base64"),
    ].join(":");
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    const clearCookie = {
        "Set-Cookie": "oauth_state=; HttpOnly; Path=/; Max-Age=0",
    };

    if (error) {
        const response = NextResponse.redirect(
            new URL("/dashboard?error=" + encodeURIComponent(error), process.env.APP_URL),
        );
        Object.entries(clearCookie).forEach(([k, v]) =>
            response.headers.set(k, v),
        );
        return response;
    }

    if (!code || !state) {
        const response = NextResponse.redirect(
            new URL("/dashboard?error=missing_params", process.env.APP_URL),
        );
        Object.entries(clearCookie).forEach(([k, v]) =>
            response.headers.set(k, v),
        );
        return response;
    }

    const storedState = request.cookies.get("oauth_state")?.value;

    if (!storedState || storedState !== state) {
        const response = NextResponse.redirect(
            new URL("/dashboard?error=invalid_state", process.env.APP_URL),
        );
        Object.entries(clearCookie).forEach(([k, v]) =>
            response.headers.set(k, v),
        );
        return response;
    }

    try {
        const result = await processOAuthCallback(corsair, {
            code,
            state,
            redirectUri: REDIRECT_URI,
        });

        const connectAll = request.cookies.get("connect_all")?.value;

        if (connectAll === "1") {
            const calendarIntegration = await db
                .select()
                .from(corsairIntegrations)
                .where(eq(corsairIntegrations.name, "googlecalendar"))
                .limit(1)
                .then((r) => r[0]);

            if (calendarIntegration) {
                const existingCalAccount = await db
                    .select()
                    .from(corsairAccounts)
                    .where(
                        and(
                            eq(corsairAccounts.tenantId, result.tenantId),
                            eq(corsairAccounts.integrationId, calendarIntegration.id),
                        ),
                    )
                    .limit(1)
                    .then((r: typeof corsairAccounts.$inferSelect[]) => r[0]);

                if (!existingCalAccount) {
                    const dek = randomBytes(32).toString("base64");
                    const encryptedDek = encryptDek(dek, process.env.CORSAIR_KEK!);

                    await db.insert(corsairAccounts).values({
                        tenantId: result.tenantId,
                        integrationId: calendarIntegration.id,
                        config: {},
                        dek: encryptedDek,
                    });
                }
            }

            const tenant = corsair.withTenant(result.tenantId);
            const [accessToken, refreshToken, expiresAt] = await Promise.all([
                tenant.gmail.keys.get_access_token(),
                tenant.gmail.keys.get_refresh_token(),
                tenant.gmail.keys.get_expires_at(),
            ]);

            const calKeys = corsair.withTenant(result.tenantId).googlecalendar.keys;
            if (accessToken) await calKeys.set_access_token(accessToken);
            if (refreshToken) await calKeys.set_refresh_token(refreshToken);
            if (expiresAt) await calKeys.set_expires_at(expiresAt);
        }

        const response = NextResponse.redirect(
            new URL("/dashboard?connected=" + result.plugin, process.env.APP_URL),
        );
        response.cookies.delete("oauth_state");
        response.cookies.delete("connect_all");
        return response;
    } catch (e) {
        const message = e instanceof Error ? e.message : "oauth_failed";
        const response = NextResponse.redirect(
            new URL("/dashboard?error=" + encodeURIComponent(message), process.env.APP_URL),
        );
        response.cookies.delete("oauth_state");
        response.cookies.delete("connect_all");
        return response;
    }
}
