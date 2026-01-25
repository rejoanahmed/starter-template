import { Badge } from "@starter/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@starter/ui/components/card";
import { Skeleton } from "@starter/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "@web/lib/api-client";

export const Route = createFileRoute("/org/$orgId/")({
  component: MyIssuesPage,
});

function MyIssuesPage() {
  const { orgId } = Route.useParams();
  const { data: issues = [], isLoading } = useQuery({
    queryKey: ["my-issues", orgId],
    queryFn: async () => {
      const res = await api.todos[":orgId"].issues.$get({
        param: { orgId },
        query: {},
      });
      if (!res.ok) throw new Error("Failed to fetch issues");
      return res.json();
    },
    enabled: !!orgId,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Issues</h1>
      {issues.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No issues assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Issues assigned to you in this organization will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left font-medium p-3">Title</th>
                <th className="text-left font-medium p-3">Status</th>
                <th className="text-left font-medium p-3">Priority</th>
                <th className="text-left font-medium p-3">Due</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr className="border-t hover:bg-muted/30" key={issue.id}>
                  <td className="p-3 font-medium">{issue.title}</td>
                  <td className="p-3">
                    <Badge variant="secondary">{issue.status}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {issue.priority}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {issue.dueDate
                      ? new Date(issue.dueDate).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
