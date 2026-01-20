import type { auth } from "@api/lib/auth";
import type { DB } from "@starter/db";
import type { Session, User } from "better-auth";

/**
 * Define Bindings explicitly to avoid global Cloudflare.Env conflicts
 * when imported into other apps (like web) in the monorepo.
 */
export type ApiBindings = {
  NODE_ENV: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  WEB_APP_URL?: string; // URL of the web app (e.g., http://localhost:3000)
  CORS_ORIGINS: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string; // Primary webhook secret (for snapshot events)
  STRIPE_WEBHOOK_SECRET_SLIM?: string; // Optional: slim webhook secret (for thin/account events)
  R2_PUBLIC_URL?: string;
  R2: R2Bucket;
};

export type AppBindings = {
  Bindings: ApiBindings;
  Variables: {
    user: User | null;
    session: Session | null;
    auth: ReturnType<typeof auth>;
    db: DB;
  };
};
