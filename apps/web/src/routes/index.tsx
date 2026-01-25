import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { NoOrgShell } from "@web/components/layout";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    const session = context.session as
      | { user: unknown; session?: { activeOrganizationId?: string | null } }
      | undefined;
    if (!session?.user) {
      return;
    }
    const orgId = session.session?.activeOrganizationId;
    if (orgId) {
      throw redirect({ to: "/org/$orgId", params: { orgId } });
    }
  },
  component: IndexPage,
});

function IndexPage() {
  const context = Route.useRouteContext();
  const session = context.session as
    | { user: unknown; session?: { activeOrganizationId?: string | null } }
    | undefined;
  const isAuthenticated = !!session?.user;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Welcome</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access your issues.
          </p>
          <Link
            className="text-primary mt-4 inline-block font-medium underline underline-offset-2"
            search={{ redirect: "/" }}
            to="/login"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <NoOrgShell>
      <div className="flex min-h-[60vh] flex-1 items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold">
            Select or create an organization
          </h1>
          <p className="text-muted-foreground mt-2">
            Use the sidebar to choose an existing organization or create a new
            one to get started.
          </p>
        </div>
      </div>
    </NoOrgShell>
  );
}
