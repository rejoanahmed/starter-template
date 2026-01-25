import { createFileRoute, redirect } from "@tanstack/react-router";
import PrimaryLayout from "@web/components/layout";

export const Route = createFileRoute("/org/$orgId")({
  beforeLoad: ({ context }) => {
    if (!context.session?.user) {
      throw redirect({ to: "/login", search: { redirect: "/" } });
    }
  },
  component: OrgLayout,
});

function OrgLayout() {
  return <PrimaryLayout />;
}
