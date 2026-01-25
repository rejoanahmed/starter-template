// import { expo } from "@better-auth/expo";
import type { DB } from "@starter/db";
import * as schema from "@starter/db/schema/auth";
import { type BetterAuthPlugin, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  emailOTP,
  oneTap,
  organization,
  phoneNumber,
  twoFactor,
  username,
} from "better-auth/plugins";
import { ac } from "./permissions";
// import { tanstackStartCookies } from "better-auth/tanstack-start";

export type AuthConfig = {
  phoneNumber: {
    sendOTP: (params: { phoneNumber: string }) => void;
  };
  email: {
    sendEmailVerificationOTP: (params: { email: string }) => Promise<void>;
    sendInvitationEmail: (params: { email: string }) => Promise<void>;
  };
  baseURL: string;
  secret: string;
  googleClientId: string;
  googleClientSecret: string;
  trustedOrigins?: string[];
  plugins?: BetterAuthPlugin[];
  db: DB;
  /**
   * @example spotfinderce.com -> api.spotfinderce.com
   * pass the value as '.spotfinderce.com'
   */
  subDomainPrefix?: string;
};

/**
 * Create a Better Auth instance with the provided configuration.
 * For Cloudflare Workers, this creates a new DB connection per request.
 *
 * @param config - Auth configuration object
 * @returns Better Auth instance
 */
export function createAuth(config: AuthConfig) {
  // Define plugin types to avoid TypeScript serialization issues
  // const expoPlugin = expo();
  const twoFactorPlugin = twoFactor();
  const phoneNumberPlugin = phoneNumber({
    sendOTP: config.phoneNumber.sendOTP,
  });
  const emailOTPPlugin = emailOTP({
    sendVerificationOTP: config.email.sendEmailVerificationOTP,
  });
  const oneTapPlugin = oneTap();
  const organizationPlugin = organization({
    teams: { enabled: true },
    ac,
    creatorRole: "president",
    dynamicAccessControl: {
      enabled: true,
    },
    sendInvitationEmail: config.email.sendInvitationEmail,
    organizationHooks: {
      // Create default roles after organization is created
      // afterCreateOrganization: async ({ organization: org }) => {
      //   if (!org?.id) return;
      //   await createDefaultOrganizationRoles(config.db, org.id);
      // },
    },
  });
  const usernamePlugin = username();

  // const customSessionPlugin = customSession(async ({ user, session }) => {
  //   const userVerified = await config.db.query.user.findFirst({
  //     where: eq(userTable.id, user.id),
  //     columns: { isVerified: true },
  //   });
  //   // Add custom session data
  //   return {
  //     session,
  //     user: {
  //       ...user,
  //       isVerified: Boolean(userVerified?.isVerified),
  //     },
  //   } as unknown as Session;
  // });

  type AuthPlugins = [
    // typeof expoPlugin,
    typeof twoFactorPlugin,
    typeof phoneNumberPlugin,
    typeof emailOTPPlugin,
    typeof oneTapPlugin,
    typeof organizationPlugin,
    typeof usernamePlugin,
    // typeof customSessionPlugin,
  ];

  const authPlugins: AuthPlugins = [
    // expoPlugin,
    twoFactorPlugin,
    phoneNumberPlugin,
    emailOTPPlugin,
    oneTapPlugin,
    organizationPlugin,
    usernamePlugin,
    // customSessionPlugin,
  ];

  return betterAuth({
    baseURL: config.baseURL,
    secret: config.secret,
    socialProviders: {
      google: {
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret,
      },
    },
    emailAndPassword: { enabled: true, requireEmailVerification: false },
    database: drizzleAdapter(config.db, {
      provider: "pg",
      schema,
    }),
    trustedOrigins: [...(config.trustedOrigins || [])].filter(Boolean),
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    advanced: {
      defaultCookieAttributes: {
        sameSite: config.baseURL.includes("localhost") ? "lax" : "none",
        secure: !config.baseURL.includes("localhost"),
        httpOnly: true,
      },
      crossSubDomainCookies: {
        enabled: !config.baseURL.includes("localhost"),
        domain: config.subDomainPrefix || undefined,
      },
    },
    plugins: [...authPlugins, ...(config.plugins || [])],
  });
}

// Export types
export type Auth = ReturnType<typeof createAuth>;
export type Session = {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    updatedAt: Date;
    activeOrganizationId: string | null;
    activeTeamId: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string;
    createdAt: Date;
    updatedAt: Date;
    twoFactorEnabled: boolean;
    phoneNumber: string | null;
    phoneNumberVerified: boolean;
    username: string | null;
    displayUsername: string | null;
    isVerified: boolean;
  };
};

export type Organization = {
  logo: string | null;
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  // biome-ignore lint/suspicious/noExplicitAny: no strict reason for now
  metadata?: any;
  // aditional fields if any
};

// ========================================================
// Mock auth instance for schema generation
// ========================================================
// import { createDb } from "@starter/db";
/**
 * Mock auth instance for schema generation
 * @returns Auth instance
 *
 * @example `bun run auth:generate-schema` from the root
 */
// mock auth instance for schema generation:
// export const auth = createAuth({
//   db: createDb("postgresql://postgres:postgres@localhost:5432/postgres"),
//   baseURL: "http://localhost:3000",
//   secret: "secret",
//   googleClientId: "googleClientId",
//   googleClientSecret: "googleClientSecret",
//   trustedOrigins: ["http://localhost:3000"],
//   plugins: [],
//   phoneNumber: {
//     sendOTP: () => {},
//   },
//   email: {
//     sendEmailVerificationOTP: () => Promise.resolve(),
//     sendInvitationEmail: () => Promise.resolve(),
//   },
// });
