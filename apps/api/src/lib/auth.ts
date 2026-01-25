import { createAuth } from "@starter/auth";
import type { DB } from "@starter/db";
import { openAPI } from "better-auth/plugins";
import type { AppBindings } from "./types";

/**
 * Better Auth Instance
 */
export const getAuth = (env: AppBindings["Bindings"], db: DB) => {
  return createAuth({
    db,
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    trustedOrigins: [
      ...(env.CORS_ORIGINS.split(",").map((o) => o.trim()) || []),
    ],
    subDomainPrefix: ".rejoanahmed.com",
    plugins: [openAPI()],
    phoneNumber: {
      sendOTP: (params) => {
        console.log("sendOTP", params);
      },
    },
    email: {
      sendEmailVerificationOTP: (params) => {
        console.log("sendEmailVerificationOTP", params);
        return Promise.resolve();
      },
      sendInvitationEmail: (params) => {
        console.log("sendInvitationEmail", params);
        return Promise.resolve();
      },
    },
  });
};
