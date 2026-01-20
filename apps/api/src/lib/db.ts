import { createDb } from "@starter/db";
import type { AppBindings } from "./types";

export const getDb = (env: AppBindings["Bindings"]) => {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  return createDb(env.DATABASE_URL);
};
