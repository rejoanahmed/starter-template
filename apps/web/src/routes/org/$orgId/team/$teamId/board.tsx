import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@starter/ui/components/badge";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnHandle,
  KanbanItem,
  KanbanOverlay,
} from "@starter/ui/components/kanban";
import { Skeleton } from "@starter/ui/components/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "@web/lib/api-client";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const STATUSES = ["todo", "in_progress", "done"] as const;
const COLUMN_TITLES: Record<(typeof STATUSES)[number], string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

type Issue = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: string;
  assigneeId: string | null;
  dueDate: string | null;
  teamId: string;
  position: number;
  createdAt: string;
};

type ColumnsValue = Record<(typeof STATUSES)[number], Issue[]>;

export const Route = createFileRoute("/org/$orgId/team/$teamId/board")({
  component: TeamBoardPage,
});

function toColumns(issues: Issue[]): ColumnsValue {
  const cols: ColumnsValue = {
    todo: [],
    in_progress: [],
    done: [],
  };
  for (const issue of issues) {
    if (cols[issue.status]) cols[issue.status].push(issue);
  }
  return cols;
}

function IssueCardContent({ issue }: { issue: Issue }) {
  return (
    <div className="rounded-md border bg-card p-3 shadow-xs">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-1 font-medium text-sm">
            {issue.title}
          </span>
          <Badge
            className="pointer-events-none h-5 rounded-sm px-1.5 text-[11px] capitalize"
            variant={
              issue.priority === "high"
                ? "destructive"
                : issue.priority === "medium"
                  ? "default"
                  : "secondary"
            }
          >
            {issue.priority}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          {issue.dueDate && (
            <time className="text-[10px] tabular-nums">
              {new Date(issue.dueDate).toLocaleDateString()}
            </time>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamBoardPage() {
  const { orgId, teamId } = Route.useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["board-issues", orgId, teamId],
    queryFn: async () => {
      const res = await api.todos[":orgId"].team[":teamId"].issues.$get({
        param: { orgId, teamId },
        query: { page: 1, perPage: 100 },
      });
      if (!res.ok) throw new Error("Failed to fetch issues");
      const json = (await res.json()) as { data: Issue[]; totalCount: number };
      return json.data;
    },
    enabled: !!orgId && !!teamId,
  });

  const issues = useMemo(() => data ?? [], [data]);
  const serverColumns = useMemo(() => toColumns(issues), [issues]);
  const [columns, setColumns] = useState<ColumnsValue>(serverColumns);
  const serverColumnsRef = useRef(serverColumns);
  serverColumnsRef.current = serverColumns;

  useEffect(() => {
    setColumns(serverColumns);
  }, [serverColumns]);

  // Use server data when we have it but local state is still empty (avoids one-render empty flash)
  const displayColumns =
    issues.length > 0 && STATUSES.every((s) => !columns[s]?.length)
      ? serverColumns
      : columns;

  const patchMutation = useMutation({
    mutationFn: async ({
      issueId,
      status,
    }: {
      issueId: string;
      status: "todo" | "in_progress" | "done";
    }) => {
      const res = await api.todos[":orgId"].team[":teamId"].issues[
        ":issueId"
      ].$patch({
        param: { orgId, teamId, issueId },
        json: { status },
      });
      if (!res.ok) throw new Error("Failed to update issue");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["board-issues", orgId, teamId],
      });
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setColumns(serverColumnsRef.current);
    },
  });

  const handleValueChange = (next: Record<string, Issue[]>) => {
    setColumns(next as ColumnsValue);
    const prevIds = new Map<string, string>();
    for (const [col, items] of Object.entries(displayColumns)) {
      for (const i of items) prevIds.set(i.id, col);
    }
    for (const [col, items] of Object.entries(next)) {
      for (const i of items) {
        const s = prevIds.get(i.id);
        if (s && s !== col) {
          patchMutation.mutate({
            issueId: i.id,
            status: col as "todo" | "in_progress" | "done",
          });
          return;
        }
      }
    }
  };

  const value = useMemo(
    () =>
      Object.fromEntries(
        STATUSES.map((s) => [s, displayColumns[s] ?? []])
      ) as Record<string, Issue[]>,
    [displayColumns]
  );

  const allIssues = useMemo(
    () => Object.values(displayColumns).flat(),
    [displayColumns]
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <Skeleton className="h-80 w-72 shrink-0 rounded-lg" key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Board</h1>
      <Kanban<Issue>
        getItemValue={(i) => i.id}
        onValueChange={handleValueChange}
        value={value}
      >
        <KanbanBoard className="grid min-h-[320px] auto-rows-fr overflow-x-auto pb-4 sm:grid-cols-3">
          {STATUSES.map((status) => (
            <KanbanColumn
              className="min-w-[288px] min-h-[320px]"
              key={status}
              value={status}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {COLUMN_TITLES[status]}
                  </span>
                  <Badge
                    className="pointer-events-none rounded-sm"
                    variant="secondary"
                  >
                    {(displayColumns[status] ?? []).length}
                  </Badge>
                </div>
                <KanbanColumnHandle
                  aria-label={`Drag to reorder ${COLUMN_TITLES[status]} column`}
                  className="size-8 rounded-md p-0"
                >
                  <HugeiconsIcon className="size-4" icon={Menu01Icon} />
                </KanbanColumnHandle>
              </div>
              <div className="flex flex-col gap-2 p-0.5">
                {(displayColumns[status] ?? []).map((issue) => (
                  <KanbanItem asHandle key={issue.id} value={issue.id}>
                    <IssueCardContent issue={issue} />
                  </KanbanItem>
                ))}
              </div>
            </KanbanColumn>
          ))}
        </KanbanBoard>
        <KanbanOverlay>
          {({ value: activeId, variant }) => {
            if (variant !== "item" || typeof activeId !== "string") return null;
            const issue = allIssues.find((i) => i.id === activeId);
            return issue ? <IssueCardContent issue={issue} /> : null;
          }}
        </KanbanOverlay>
      </Kanban>
    </div>
  );
}
