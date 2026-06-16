import { processWebhook } from "corsair";
import { corsair } from "~/server/corsair";
import { auth } from "~/server/better-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const url = new URL(request?.url);
  const tenantId = url.searchParams.get("tenantId") || url.searchParams.get("tenant_id");
  console.log("tenantId", tenantId);
  const result = await processWebhook(
    corsair,
    Object.fromEntries(request.headers),
    await request.json(),
    {
      tenantId: tenantId ?? undefined,
    },
  );

  if(result.response !== undefined){
    return NextResponse.json(result.response)
  }

  return NextResponse.json(null, {status: 200})
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook endpoint is running"
  })
}