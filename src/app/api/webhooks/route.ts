import { processWebhook } from "corsair";
import { corsair } from "~/server/corsair";
import { NextResponse } from "next/server";
import { decodePubSubMessage } from "@corsair-dev/gmail";
import { db } from "~/server/db";
import { user } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const url = new URL(request.url);
  let tenantId = url.searchParams.get("tenantId") ?? url.searchParams.get("tenant_id");

  const rawBody = await request.text();
  const parsedBody = JSON.parse(rawBody) as Record<string, unknown>;

  if (!tenantId) {
    const data = (parsedBody as { message?: { data?: string } })?.message?.data;
    if (data) {
      try {
        const decoded = decodePubSubMessage(data);
        if (decoded.emailAddress) {
          const userRecord = await db
            .select({ id: user.id })
            .from(user)
            .where(eq(user.email, decoded.emailAddress))
            .limit(1)
            .then((r) => r[0]);
          if (userRecord) tenantId = userRecord.id;
        }
      } catch {}
    }
  }

  const result = await processWebhook(corsair, Object.fromEntries(request.headers as Iterable<[string, string]>), parsedBody, {
    tenantId: tenantId ?? undefined,
  });

  if (result.response !== undefined) return NextResponse.json(result.response);
  return NextResponse.json(null, { status: 200 });
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook endpoint is running",
  });
}