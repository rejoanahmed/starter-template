import { createAuth as createSpotfinderAuth } from "@starter/auth";
import { openAPI } from "better-auth/plugins";
import type { AppBindings } from "./types";

/**
 * Better Auth Instance
 * Following Better Auth on Cloudflare guide pattern
 * Creates a new instance per request (required for Cloudflare Workers)
 */
export const auth = (env: AppBindings["Bindings"]) => {
  return createSpotfinderAuth({
    databaseUrl: env.DATABASE_URL,
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    trustedOrigins: [
      ...(env.CORS_ORIGINS.split(",").map((o) => o.trim()) || []),
    ],
    resendApiKey: env.RESEND_API_KEY,
    resendFromEmail: env.RESEND_FROM_EMAIL,
    plugins: [openAPI()],
  });
};
