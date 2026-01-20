import { auth } from "@api/lib/auth";
import type { AppBindings } from "@api/lib/types";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { getDb } from "./lib/db";
import bookingsRouter from "./routes/bookings";
import roomsRouter from "./routes/merchant/rooms";
import stripeRouter from "./routes/stripe";

const app = new Hono<AppBindings>();
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

    const authInstance = auth(c.env);
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
      c.set("auth", auth(c.env));
      return next();
    }
  })

  // Mount Better Auth handler - following Better Auth on Cloudflare guide
  // This handles all /api/auth/* routes
  .on(["GET", "POST"], "/api/auth/*", (c) => auth(c.env).handler(c.req.raw))

  // Mount routes - these inherit the parent middleware context
  .get("/", (c) => c.text("OK"))
  .route("/api/stripe", stripeRouter)
  .route("/api/bookings", bookingsRouter)
  .route("/api/merchant/rooms", roomsRouter);

export default app;
export type AppType = typeof route;
