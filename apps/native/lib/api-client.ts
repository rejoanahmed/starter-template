import type { AppType } from "@api/app";
import { hc } from "hono/client";
import { authClient } from "./auth-client";

// Get the API URL from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8787";
/**
 * Hono RPC client with authentication support
 * Provides end-to-end type safety between the Hono server and React Native client
 *
 * Following Better Auth Expo documentation:
 * https://www.better-auth.com/docs/integrations/expo
 */

// Custom fetch wrapper that adds authentication headers
const authenticatedFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const headers = new Headers(init?.headers);

  // Get session cookies from Better Auth client
  const cookies = authClient.getCookie();
  if (cookies) {
    headers.set("Cookie", cookies);
  }

  // Make the request with credentials: "include" for cookie support
  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "omit",
  });

  // Handle response
  if (response.status === 401) {
    console.log("[API] Unauthorized - session may have expired");
  }

  if (response.status >= 400) {
    const text = await response.clone().text();
    console.error(`[API] Error ${response.status}:`, text);
  }

  return response;
};

// Create the Hono client with authentication
export const api = hc<AppType>(API_URL, {
  fetch: authenticatedFetch,
});

export default api;
