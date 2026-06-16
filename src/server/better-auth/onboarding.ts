import { setupCorsair } from "corsair";
import { corsair } from "~/server/corsair";

export async function onUserCreated(userId: string) {
  try {
    await setupCorsair(corsair, { tenantId: userId });
  } catch (error) {
    console.error("[onboarding] setupCorsair failed:", error);
  }
}

export async function syncTokens(
  userId: string,
  tokens: {
    accessToken?: string | null;
    refreshToken?: string | null;
    accessTokenExpiresAt?: Date | null;
  },
) {
  if (!tokens.accessToken) return;

  try {
    const tenant = corsair.withTenant(userId);

    await tenant.gmail.keys.set_access_token(tokens.accessToken);
    if (tokens.refreshToken) {
      await tenant.gmail.keys.set_refresh_token(tokens.refreshToken);
    }
    if (tokens.accessTokenExpiresAt) {
      await tenant.gmail.keys.set_expires_at(
        tokens.accessTokenExpiresAt.toISOString(),
      );
    }

    const calKeys = tenant.googlecalendar.keys;
    await calKeys.set_access_token(tokens.accessToken);
    if (tokens.refreshToken) {
      await calKeys.set_refresh_token(tokens.refreshToken);
    }
    if (tokens.accessTokenExpiresAt) {
      await calKeys.set_expires_at(
        tokens.accessTokenExpiresAt.toISOString(),
      );
    }
  } catch (error) {
    console.error("[onboarding] syncTokens failed:", error);
  }
}
