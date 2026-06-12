import { generateOAuthUrl } from "corsair/oauth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { corsair } from "~/server/corsair";
import { auth } from "~/server/better-auth";

const REDIRECT_URI = `${process.env.APP_URL}/api/corsair/callback`;

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plugin = new URL(request.url).searchParams.get("plugin");
    if (!plugin) {
        return NextResponse.json({ error: "Missing plugin param" }, { status: 400 });
    }

    const tenantId = session.user.id;

    const { url, state } = await generateOAuthUrl(corsair, plugin, {
        tenantId,
        redirectUri: REDIRECT_URI,
    });

    const response = NextResponse.redirect(url);
    response.cookies.set("oauth_state", state, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10,
    });
    return response;
}
