import { processWebhook } from "corsair";
import { corsair } from "~/server/corsair";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const url = new URL(request?.url);
  const tenantId = url.searchParams.get("tenantId") ?? url.searchParams.get("tenant_id");
  const result = await processWebhook(
    corsair,
    Object.fromEntries(request.headers as Iterable<[string, string]>),
    await request.json() as Record<string, unknown>,
    {
      tenantId: tenantId ?? undefined,
    },
  );
  console.log(request)
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