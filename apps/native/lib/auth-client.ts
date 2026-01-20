import { expoClient } from "@better-auth/expo/client";
import type { Auth } from "@starter/auth";
import {
  customSessionClient,
  emailOTPClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

const baseURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

// Log the configuration immediately
console.log("=".repeat(50));
console.log("🔧 AUTH CLIENT INITIALIZATION");
console.log("=".repeat(50));
console.log("Base URL:", baseURL);
console.log("EXPO_PUBLIC_API_URL:", process.env.EXPO_PUBLIC_API_URL);
console.log("Environment:", process.env.NODE_ENV);
console.log("=".repeat(50));

/**
 * Better Auth client for Expo
 * Following official Better Auth Expo documentation:
 * https://www.better-auth.com/docs/integrations/expo
 */
export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      storage: SecureStore,
      scheme: "spotfinder", // Deep link scheme from app.json
      storagePrefix: "spotfinder", // Prefix for SecureStore keys
      cookiePrefix: "better-auth", // Match server cookie prefix
    }),
    customSessionClient<Auth>(),
    emailOTPClient(),
  ],
});

console.log("✅ Auth client created successfully");
console.log("Auth client methods:", Object.keys(authClient));

export const { useSession, signIn, signUp, signOut } = authClient;
