import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@starter/ui/components/badge";
import { Button } from "@starter/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@starter/ui/components/dialog";
import { Input } from "@starter/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@starter/ui/components/select";
import { Skeleton } from "@starter/ui/components/skeleton";
import { Textarea } from "@starter/ui/components/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { api } from "@web/lib/api-client";
import { useState } from "react";
import { toast } from "sonner";

type TeamIssuesGetOpts = Parameters<
  (typeof api.todos)[":orgId"]["team"][":teamId"]["issues"]["$get"]
>[0];
type TeamIssuesPostOpts = Parameters<
  (typeof api.todos)[":orgId"]["team"][":teamId"]["issues"]["$post"]
>[0];

type Issue = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigneeId: string | null;
  dueDate: string | null;
  teamId: string;
  createdAt: string;
};

export const Route = createFileRoute("/org/$orgId/team/$teamId/issues")({
  component: TeamIssuesPage,
  validateSearch: (s: Record<string, unknown>) => ({
    search: (s.search as string) || "",
    status: (s.status as string) || "",
    priority: (s.priority as string) || "",
  }),
});

function TeamIssuesPage() {
  const { orgId, teamId } = Route.useParams();
  const { search, status, priority } = Route.useSearch();
  const navigate = useNavigate({ from: "/org/$orgId/team/$teamId/issues" });
  const queryClient = useQueryClient();
  const [newIssueOpen, setNewIssueOpen] = useState(false);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ["team-issues", orgId, teamId, search, status, priority],
    queryFn: async () => {
      const res = await api.todos[":orgId"].team[":teamId"].issues.$get({
        param: { orgId, teamId },
        query: {
          search: search || undefined,
          status: status || undefined,
          priority: priority || undefined,
        },
      } as TeamIssuesGetOpts);
      if (!res.ok) throw new Error("Failed to fetch issues");
      return res.json() as Promise<Issue[]>;
    },
    enabled: !!orgId && !!teamId,
  });

  const createMutation = useMutation({
    mutationFn: async (body: {
      title: string;
      description?: string;
      status?: string;
      priority?: string;
    }) => {
      const res = await api.todos[":orgId"].team[":teamId"].issues.$post({
        param: { orgId, teamId },
        json: body,
      } as TeamIssuesPostOpts);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string }).message || "Failed to create issue"
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team-issues", orgId, teamId],
      });
      setNewIssueOpen(false);
      toast.success("Issue created");
    },
    onError: (e: Error) => toast.error(e.message),
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Team Issues</h1>
        <Dialog onOpenChange={setNewIssueOpen} open={newIssueOpen}>
          <DialogTrigger
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-4xl border border-transparent bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            type="button"
          >
            <HugeiconsIcon className="size-4" icon={Add01Icon} />
            New issue
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New issue</DialogTitle>
            </DialogHeader>
            <NewIssueForm
              isSubmitting={createMutation.isPending}
              onCancel={() => setNewIssueOpen(false)}
              onSubmit={(v) => createMutation.mutate(v)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          className="max-w-xs"
          defaultValue={search}
          onBlur={(e) => {
            const v = e.target.value?.trim();
            navigate({
              search: (prev) => ({ ...prev, search: v || "" }),
              replace: true,
            });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = (e.target as HTMLInputElement).value?.trim();
              navigate({
                search: (prev) => ({ ...prev, search: v || "" }),
                replace: true,
              });
            }
          }}
          placeholder="Search issues..."
        />
        <Select
          onValueChange={(v) =>
            navigate({
              search: (prev) => ({
                ...prev,
                status: (v === "all" ? "" : v) ?? "",
              }),
              replace: true,
            })
          }
          value={status || "all"}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(v) =>
            navigate({
              search: (prev) => ({
                ...prev,
                priority: (v === "all" ? "" : v) ?? "",
              }),
              replace: true,
            })
          }
          value={priority || "all"}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {issues.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No issues match your filters.
        </div>
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

function NewIssueForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  onSubmit: (v: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
    });
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          className="text-sm font-medium mb-1.5 block"
          htmlFor="new-issue-title"
        >
          Title
        </label>
        <Input
          id="new-issue-title"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Issue title"
          required
          value={title}
        />
      </div>
      <div>
        <label
          className="text-sm font-medium mb-1.5 block"
          htmlFor="new-issue-desc"
        >
          Description
        </label>
        <Textarea
          className="resize-none"
          id="new-issue-desc"
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          rows={3}
          value={description}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span
            className="text-sm font-medium mb-1.5 block"
            id="new-issue-status-label"
          >
            Status
          </span>
          <Select
            aria-labelledby="new-issue-status-label"
            onValueChange={(v) => setStatus(v || "todo")}
            value={status}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <span
            className="text-sm font-medium mb-1.5 block"
            id="new-issue-priority-label"
          >
            Priority
          </span>
          <Select
            aria-labelledby="new-issue-priority-label"
            onValueChange={(v) => setPriority(v || "medium")}
            value={priority}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2 pt-4">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating…" : "Create issue"}
        </Button>
        <Button onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
}
