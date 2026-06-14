import { generateOAuthUrl } from "corsair/oauth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { corsair } from "~/server/corsair";
import { auth } from "~/server/better-auth";

const REDIRECT_URI = `${process.env.APP_URL}/api/corsair/callback`;

const COMBINED_SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/calendar",
];

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.id;

  const { url, state } = await generateOAuthUrl(corsair, "gmail", {
    tenantId,
    redirectUri: REDIRECT_URI,
  });

  const parsedUrl = new URL(url);
  parsedUrl.searchParams.set("scope", COMBINED_SCOPES.join(" "));

  const response = NextResponse.redirect(parsedUrl.toString());
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
  });
  response.cookies.set("connect_all", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
  });
  return response;
}
