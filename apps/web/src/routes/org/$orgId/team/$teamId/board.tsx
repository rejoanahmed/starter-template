import { Badge } from "@starter/ui/components/badge";
import { Card, CardContent, CardHeader } from "@starter/ui/components/card";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
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
    <Card className="w-72 shrink-0">
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium truncate">{issue.title}</span>
          <Badge variant="secondary">{issue.priority}</Badge>
        </div>
      </CardHeader>
      {issue.dueDate && (
        <CardContent className="py-0 px-3 text-muted-foreground text-xs pb-2">
          Due {new Date(issue.dueDate).toLocaleDateString()}
        </CardContent>
      )}
    </Card>
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
        query: { page: 1, perPage: 500 },
      });
      if (!res.ok) throw new Error("Failed to fetch issues");
      const json = (await res.json()) as { data: Issue[]; totalCount: number };
      return json.data;
    },
    enabled: !!orgId && !!teamId,
  });

  const issues = data ?? [];
  const serverColumns = useMemo(() => toColumns(issues), [issues]);
  const [columns, setColumns] = useState<ColumnsValue>(serverColumns);
  const serverColumnsRef = useRef(serverColumns);
  serverColumnsRef.current = serverColumns;

  useEffect(() => {
    setColumns(serverColumns);
  }, [serverColumns]);

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
    for (const [col, items] of Object.entries(columns)) {
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
      Object.fromEntries(STATUSES.map((s) => [s, columns[s] ?? []])) as Record<
        string,
        Issue[]
      >,
    [columns]
  );

  const allIssues = useMemo(() => Object.values(columns).flat(), [columns]);

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
        <KanbanBoard className="min-h-[320px] overflow-x-auto pb-4">
          {STATUSES.map((status) => (
            <KanbanColumn
              className="min-w-[288px] min-h-[320px]"
              key={status}
              value={status}
            >
              <h2 className="mb-2 px-1 font-semibold text-sm">
                {COLUMN_TITLES[status]}
              </h2>
              {(columns[status] ?? []).map((issue) => (
                <KanbanItem asHandle key={issue.id} value={issue.id}>
                  <IssueCardContent issue={issue} />
                </KanbanItem>
              ))}
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
