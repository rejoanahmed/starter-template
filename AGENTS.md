# Spotfinder Development Guide

## Project Overview
Bun-powered monorepo with Turbo, supporting web (TanStack Router/Vite), API (Hono/Cloudflare Workers), and native (Expo/React Native) applications.

## Development Commands

### Monorepo-wide commands (run from root):
- `bun run dev` - Start all apps in development mode
- `bun run build` - Build all packages and apps
- `bun run check` - Run Biome linter (ultracite check)
- `bun run fix` - Fix linting issues automatically
- `bun run check-types` - Run TypeScript type checking across monorepo
- `bun run dev:web` - Start web app only (port 3000)
- `bun run dev:server` - Start API server only (port 3001)
- `bun run dev:native` - Start native app (Expo)

### App-specific commands:
- **Web** (`apps/web`): `bun run dev`, `bun run build`, `bun run test`
- **API** (`apps/api`): `bun run dev`, `bun run type-check`, `bun run deploy`
- **Native** (`apps/native`): `bun run dev` (disabled), `expo start`, `expo run:android`, `expo run:ios`

### Testing:
- Run all tests: `cd apps/web && bun run test` (uses Vitest)
- Run single test file: `cd apps/web && vitest run path/to/test.test.ts`
- Watch mode: `cd apps/web && vitest`

### Database commands:
- `bun run db:push` - Push schema to database
- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:migrate` - Run migrations
- `bun run db:studio` - Open Drizzle Studio

## Code Style Guidelines

### TypeScript & Types:
- Strict TypeScript mode enabled (`strict: true`)
- Use explicit types for function parameters and returns
- Prefer interfaces over types for object shapes
- Export types used across packages
- Avoid `any` (Biome warns on `noExplicitAny`)
- Type imports: `import type { X }` for type-only imports
- Use Zod for runtime validation schemas

### Imports:
- Use `@starter/*` workspace aliases for internal packages
- Use `@web/*` alias for web app internal imports
- Group imports: external → internal → type imports (separated by blank lines)
- Use default exports for main components/routers, named exports for utilities
- Namespace imports allowed but warned (`noNamespaceImport: warn`)

### Formatting (Biome/Ultracite):
- Linter: Ultracite presets (extends ultracite/core, ultracite/react, ultracite/next)
- Run `bun run check` to lint, `bun run fix` to auto-fix
- Consistent member accessibility rules disabled (`useConsistentMemberAccessibility: off`)
- No nested component definition rules (`noNestedComponentDefinitions: off`)
- Nested ternaries allowed (`noNestedTernary: off`)
- Non-null assertions allowed but warned (`noNonNullAssertion: warn`)

### Naming Conventions:
- Components: PascalCase (`RoomListingForm.tsx`)
- Utilities/Functions: camelCase (`createRoom`, `handleUpload`)
- Constants: UPPER_SNAKE_CASE (`DATABASE_URL`)
- Files: kebab-case for utilities, PascalCase for components
- Private members: underscore prefix (`_internalMethod`)

### Error Handling:
- Use Hono's `HTTPException` for API errors (status code + message)
- Use try-catch blocks for async operations
- Log errors with context: `console.error("[CONTEXT] Error:", error)`
- Validate user input before processing (throw 400 for missing fields)
- Check authorization: verify user/session exists (throw 401)
- Check permissions: verify resource ownership (throw 403)

### React/Web (TanStack Start):
- Functional components with hooks
- Use TanStack Query for data fetching (`useQuery`, `useMutation`)
- State management: React hooks (`useState`, `useContext`)
- Router: TanStack Router file-based routing (`src/routes/`)
- Use Sonner for toast notifications (`toast.success()`, `toast.error()`)
- Shadcn/ui components from `@web/components/ui`
- Tailwind CSS v4 for styling

### API (Hono):
- Use Hono with TypeScript generics for typed context (`AppBindings`)
- Route organization: `src/routes/` with grouped routers
- Auth middleware sets `user`, `session`, `auth` in context
- Use `c.get()` for context values, `c.set()` for middleware
- Return JSON responses: `c.json(data)`
- FormData handling for uploads: `await c.req.formData()`

### Database (Drizzle):
- Schema defined in `packages/db/src/schema/`
- Use Drizzle queries with type inference
- Use `eq()` for equality comparisons
- Use `asc()`, `desc()` for ordering
- Use `db.query.table.findMany({ with: {...} })` for relations
- R2 for file storage (Cloudflare)
- Create new DB connection per request in Cloudflare Workers

## Architecture Notes

### Apps:
- `apps/api` - Hono server on Cloudflare Workers (port 3001), handles auth and business logic
- `apps/web` - TanStack Start with Vite, file-based routing (port 3000)
- `apps/native` - Expo React Native app, uses same auth package

### Packages:
- `packages/auth` - Better Auth configuration with Google OAuth
- `packages/db` - Drizzle ORM with PostgreSQL schema
- `packages/config` - Shared configuration

### Authentication:
- Better Auth with Google OAuth only (no email/password)
- API endpoint: `http://localhost:3001/api/auth` (dev)
- Session: 7 days expiry, 1 day update age
- Cookies: SameSite=none, Secure, HttpOnly
- Expo plugin for native app auth

### CORS Configuration:
- Trusted origins include Expo dev schemes (`exp://*/*`, local IP ranges)
- Production schemes: `spotfinder://`, `mybettertapp://`, `partyroom://`
- Custom headers: Content-Type, Authorization, Cookie, Set-Cookie

### Testing Guidelines:
- Write tests alongside source files or in `__tests__` directories or `web/e2e` for web playwright test
- Use Vitest for web app testing
- Test user-facing behavior, not implementation details
- Mock external dependencies (API calls, DB queries)
- Ensure tests pass before committing (`bun run check && bun run test`)

### Important Patterns:
- Auth middleware runs before all routes in API
- Create new DB connection per request (Cloudflare Workers requirement)
- Use nanoid for generating IDs
- Validate required form fields before processing
- Use `HTTPException` for controlled error responses
- Log context for debugging: `[MIDDLEWARE NAME] Action performed`
