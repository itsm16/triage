import { auth } from "~/server/better-auth";
import { corsair } from "~/server/corsair";

export async function getTenant(headers: Headers) {
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error("Unauthorized");
  return corsair.withTenant(session.user.id);
}

export function getTenantFromUser(userId: string) {
  return corsair.withTenant(userId);
}
