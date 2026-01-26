import { getAuth } from "@api/lib/auth";
import type { AppBindings } from "@api/lib/types";
import { todosApi } from "@api/routes/todo";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { getDb } from "./lib/db";

const app = new OpenAPIHono<AppBindings>();
const route = app
  .use(
    "*",
    cors({
      origin: (_o, c) => {
        return c.env.CORS_ORIGINS.split(",");
      },
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "Cookie",
        "Set-Cookie",
        "X-Requested-With",
      ],
      allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PATCH", "PUT"],
      exposeHeaders: ["Content-Length", "Set-Cookie"],
      maxAge: 600,
      credentials: true,
    })
  )

  // Top-level auth middleware - set user, session, and auth object
  // This runs before all routes and makes auth available to all handlers
  .use("*", async (c, next) => {
    const ExpoOrigin = c.req.header("expo-origin");
    if (ExpoOrigin) {
      const originalRequest = c.req.raw;

      // Create new headers
      const newHeaders = new Headers(originalRequest.headers);
      newHeaders.set("origin", ExpoOrigin);

      // Create a new Request with updated headers
      const newRequest = new Request(originalRequest, {
        headers: newHeaders,
      });

      // Replace the request in context
      c.req.raw = newRequest;
    }
    c.set("db", getDb(c.env));

    const authInstance = getAuth(c.env, c.get("db"));
    c.set("auth", authInstance);

    try {
      // Get session using the same pattern as auth route
      const session = await authInstance.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!session) {
        console.log(`[AUTH MIDDLEWARE] No session found for ${c.req.path}`);
        c.set("user", null);
        c.set("session", null);
        return next();
      }

      c.set("user", session.user);
      c.set("session", session.session);

      // Debug: verify context is set
      console.log(
        `[AUTH MIDDLEWARE] Context set - user: ${c.get("user")?.id}, session: ${c.get("session") ? "exists" : "null"}`
      );

      return next();
    } catch (error) {
      console.error("[AUTH MIDDLEWARE] Error getting session:", error);
      console.error("[AUTH MIDDLEWARE] Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: c.req.path,
      });
      c.set("user", null);
      c.set("session", null);
      c.set("auth", getAuth(c.env, c.get("db")));
      return next();
    }
  })

  // Mount Better Auth handler - following Better Auth on Cloudflare guide
  // This handles all /api/auth/* routes
  .on(["GET", "POST"], "/api/auth/*", (c) =>
    getAuth(c.env, c.get("db")).handler(c.req.raw)
  )

  // Mount routes - these inherit the parent middleware context
  .route("/todos", todosApi)
  .get("/", (c) => c.text("OK"));

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "TODO List API",
    version: "1.0.0",
    description:
      "REST API for the TODO List app. TODOs are represented as **issues** in the schema. Field mapping: TODO name = `title`, description = `description`, due date = `dueDate`, status = `todo` | `in_progress` | `done` (Not Started / In Progress / Completed). List endpoints support filter params: `status`, `dueBefore`, `dueAfter`, `search`, `priority`, etc., and sort param: `sort=title|status|dueDate|createdAt:asc|desc`.",
  },
});

app.get(
  "/scalar",
  Scalar(() => {
    return {
      url: "/doc",
    };
  })
);

export default app;
export type AppType = typeof route;
