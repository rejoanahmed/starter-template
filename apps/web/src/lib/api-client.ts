import type { AppType } from "api";
import { hc } from "hono/client";

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
// Create the Hono client with authentication
export const api = hc<AppType>(API_URL, {
  init: {
    credentials: "include",
  },
});

export default api;
