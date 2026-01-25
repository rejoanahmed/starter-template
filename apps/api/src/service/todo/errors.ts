/** Tagged errors for the Todo/Issue service. Map 1:1 to HTTP responses. */

export class Unauthorized extends Error {
  readonly _tag = "Unauthorized" as const;
  constructor() {
    super("Unauthorized");
    this.name = "Unauthorized";
  }
}

export class Forbidden extends Error {
  readonly _tag = "Forbidden" as const;
  readonly message: string;
  constructor(props: { message: string }) {
    super(props.message);
    this.name = "Forbidden";
    this.message = props.message;
  }
}

export class NotFound extends Error {
  readonly _tag = "NotFound" as const;
  readonly resource: string;
  readonly id?: string;
  constructor(props: { resource: string; id?: string }) {
    super(`${props.resource} not found`);
    this.name = "NotFound";
    this.resource = props.resource;
    this.id = props.id;
  }
}

export class ValidationError extends Error {
  readonly _tag = "Validation" as const;
  readonly errors: unknown;
  constructor(props: { errors: unknown }) {
    super("Validation error");
    this.name = "Validation";
    this.errors = props.errors;
  }
}

export class Internal extends Error {
  readonly _tag = "Internal" as const;
  override readonly message: string;
  readonly cause?: unknown;
  constructor(props: { message: string; cause?: unknown }) {
    super(props.message);
    this.name = "Internal";
    this.message = props.message;
    this.cause = props.cause;
  }
}

export type TodoError =
  | Unauthorized
  | Forbidden
  | NotFound
  | ValidationError
  | Internal;

export function isTodoError(e: unknown): e is TodoError {
  return (
    e instanceof Error &&
    "_tag" in e &&
    typeof (e as TodoError)._tag === "string" &&
    [
      "Unauthorized",
      "Forbidden",
      "NotFound",
      "Validation",
      "Internal",
    ].includes((e as TodoError)._tag)
  );
}
