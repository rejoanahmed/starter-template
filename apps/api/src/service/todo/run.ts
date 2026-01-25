import { HTTPException } from "hono/http-exception";
import type { TodoError } from "./errors";
import { isTodoError } from "./errors";

function todoErrorToHttp(e: TodoError): HTTPException {
  switch (e._tag) {
    case "Unauthorized":
      return new HTTPException(401, { message: "Unauthorized" });
    case "Forbidden":
      return new HTTPException(403, { message: e.message });
    case "NotFound":
      return new HTTPException(404, {
        message: e.id ? `${e.resource} not found` : "Not found",
      });
    case "Validation":
      return new HTTPException(422, {
        message: "Validation error",
      });
    case "Internal":
      return new HTTPException(500, { message: e.message });
    default:
      return new HTTPException(500, { message: "Internal server error" });
  }
}

/**
 * Await a Promise from TodoService; on TodoError throw HTTPException.
 */
export async function runTodo<A>(promise: Promise<A>): Promise<A> {
  try {
    return await promise;
  } catch (err) {
    if (isTodoError(err)) throw todoErrorToHttp(err);
    throw err;
  }
}
