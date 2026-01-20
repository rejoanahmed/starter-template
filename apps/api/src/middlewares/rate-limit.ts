import type { AppBindings } from "@api/lib/types";
import type { Context, MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: Context) => string;
};

export function createRateLimiter(
  options: RateLimitOptions
): MiddlewareHandler<AppBindings> {
  const { windowMs, maxRequests, keyGenerator } = options;
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (c, next) => {
    const key = keyGenerator
      ? keyGenerator(c)
      : c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        "anonymous";
    const now = Date.now();

    const record = requests.get(key);

    if (record && record.resetTime > now) {
      if (record.count >= maxRequests) {
        throw new HTTPException(429, {
          message: "Too many requests, please try again later.",
        });
      }
      record.count += 1;
    } else {
      requests.set(key, { count: 1, resetTime: now + windowMs });
    }

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      for (const [k, v] of requests.entries()) {
        if (v.resetTime < now) {
          requests.delete(k);
        }
      }
    }

    return next();
  };
}

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes
  keyGenerator: (c) => {
    const ip =
      c.req.header("x-forwarded-for") ||
      c.req.header("x-real-ip") ||
      "anonymous";
    const email = c.req.header("x-auth-email") || "";
    return `${ip}:${email}`;
  },
});
