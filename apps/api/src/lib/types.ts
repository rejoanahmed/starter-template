import type { getAuth } from "@api/lib/auth";
import type { DB } from "@starter/db";
import type { Session, User } from "better-auth";

export type AppBindings = {
  Bindings: Cloudflare.Env;
  Variables: {
    user: User | null;
    session: Session | null;
    auth: ReturnType<typeof getAuth>;
    db: DB;
  };
};
