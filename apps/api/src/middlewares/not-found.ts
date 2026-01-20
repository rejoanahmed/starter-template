import type { NotFoundHandler } from "hono";

const notFound: NotFoundHandler = (c) => {
  console.warn("=".repeat(60));
  console.warn("⚠️  404 NOT FOUND");
  console.warn("=".repeat(60));
  console.warn("Path:", c.req.path);
  console.warn("Method:", c.req.method);
  console.warn("URL:", c.req.url);
  console.warn("Request ID:", c.get("requestId") || "N/A");
  console.warn("=".repeat(60));

  return c.json(
    {
      message: `Not Found - ${c.req.path}`,
    },
    404
  );
};

export default notFound;
