import { createAuth as createSpotfinderAuth } from "@starter/auth";
import { openAPI } from "better-auth/plugins";
import type { AppBindings } from "./types";
import type { DB } from '@starter/db'

/**
 * Better Auth Instance
 */
export const auth = (env: AppBindings["Bindings"], db:DB) => {
  return createSpotfinderAuth({
    db,
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    trustedOrigins: [
      ...(env.CORS_ORIGINS.split(",").map((o) => o.trim()) || []),
    ],
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
