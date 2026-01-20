import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";

const onError: ErrorHandler = (err, c) => {
  const currentStatus =
    "status" in err ? err.status : c.newResponse(null).status;
  const statusCode =
    currentStatus !== 200 ? (currentStatus as StatusCode) : 500;
  // eslint-disable-next-line node/prefer-global/process
  const env = c.env?.NODE_ENV || process.env?.NODE_ENV;

  // Comprehensive error logging
  console.error("=".repeat(60));
  console.error("🚨 ERROR HANDLER TRIGGERED");
  console.error("=".repeat(60));
  console.error("Path:", c.req.path);
  console.error("Method:", c.req.method);
  console.error("Status Code:", statusCode);
  console.error("Error Message:", err.message);
  console.error("Error Name:", err.name);
  if (err.stack) {
    console.error("Stack Trace:");
    console.error(err.stack);
  }
  if (err.cause) {
    console.error("Error Cause:", err.cause);
  }
  console.error("Request ID:", c.get("requestId") || "N/A");
  console.error("=".repeat(60));

  return c.json(
    {
      message: err.message,
      stack: env === "production" ? undefined : err.stack,
    },
    statusCode as ContentfulStatusCode
  );
};

export default onError;
