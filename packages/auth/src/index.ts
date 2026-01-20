import { expo } from "@better-auth/expo";
import { createDb } from "@starter/db";
import * as schema from "@starter/db/schema/auth";
import { type BetterAuthPlugin, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { tanstackStartCookies } from "better-auth/tanstack-start";

export type AuthConfig = {
  databaseUrl: string;
  baseURL: string;
  secret: string;
  googleClientId: string;
  googleClientSecret: string;
  trustedOrigins?: string[];
  corsOrigin?: string;
  resendApiKey: string;
  resendFromEmail?: string;
  plugins?: BetterAuthPlugin[];
};

/**
 * Create a Better Auth instance with the provided configuration.
 * For Cloudflare Workers, this creates a new DB connection per request.
 *
 * @param config - Auth configuration object
 * @returns Better Auth instance
 */
export function createAuth(config: AuthConfig) {
  // Create a new DB connection per request (required for Cloudflare Workers)
  const db = createDb(config.databaseUrl);

  return betterAuth({
    baseURL: config.baseURL,
    secret: config.secret,
    socialProviders: {
      google: {
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret,
      },
    },
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    trustedOrigins: [
      ...(config.trustedOrigins || []),
      config.corsOrigin || "",
      // Production schemes
      "spotfinder://",
      "mybettertapp://",
      "partyroom://",
      // Development mode - Expo's exp:// scheme with local IP ranges
      // Following Better Auth Expo documentation
      "exp://*/*", // Trust all Expo development URLs
      "exp://10.0.0.*:*/*", // Trust 10.0.0.x IP range
      "exp://192.168.*.*:*/*", // Trust 192.168.x.x IP range
      "exp://172.*.*.*:*/*", // Trust 172.x.x.x IP range
      "exp://localhost:*/*", // Trust localhost
    ].filter(Boolean),
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    advanced: {
      defaultCookieAttributes: {
        // In local dev (localhost), use "lax" and secure: false for HTTP
        // In production, use "none" and secure: true for cross-subdomain (spotfinderce.com -> api.spotfinderce.com)
        sameSite: config.baseURL.includes("localhost") ? "lax" : "none",
        secure: !config.baseURL.includes("localhost"), // false for localhost, true for production
        httpOnly: true,
      },
      crossSubDomainCookies: {
        enabled: !config.baseURL.includes("localhost"), // Only enable for production
        domain: config.baseURL.includes("localhost")
          ? undefined
          : ".spotfinderce.com", // Only set domain for production
      },
    },
    plugins: [expo(), ...(config.plugins || [])],
  });
}

export type Auth = ReturnType<typeof createAuth>;
