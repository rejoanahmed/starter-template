import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Badge } from "@starter/ui/components/badge";
import { Card, CardContent, CardHeader } from "@starter/ui/components/card";
import { Skeleton } from "@starter/ui/components/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BoardColumn } from "@web/components/board-column";
import { api } from "@web/lib/api-client";
import { useState } from "react";
import { toast } from "sonner";

const STATUSES = ["todo", "in_progress", "done"] as const;

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

export const Route = createFileRoute("/org/$orgId/team/$teamId/board")({
  component: TeamBoardPage,
});

function TeamBoardPage() {
  const { orgId, teamId } = Route.useParams();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ["board-issues", orgId, teamId],
    queryFn: async () => {
      const res = await api.todos[":orgId"].team[":teamId"].issues.$get({
        param: { orgId, teamId },
        query: {},
      });
      if (!res.ok) throw new Error("Failed to fetch issues");
      return res.json() as Promise<Issue[]>;
    },
    enabled: !!orgId && !!teamId,
  });

  const patchMutation = useMutation({
    mutationFn: async ({
      issueId,
      status,
      position,
    }: {
      issueId: string;
      status: "todo" | "in_progress" | "done";
      position?: number;
    }) => {
      const res = await api.todos[":orgId"].team[":teamId"].issues[
        ":issueId"
      ].$patch({
        param: { orgId, teamId, issueId },
        json: {
          status,
          ...(position != null && { position }),
        },
      });
      if (!res.ok) throw new Error("Failed to update issue");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["board-issues", orgId, teamId],
      });
      setActiveId(null);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setActiveId(null);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (e: DragStartEvent) =>
    setActiveId(String(e.active.id));
  const handleDragEnd = (e: DragEndEvent) => {
    const id = String(e.active.id);
    const overId = e.over?.id != null ? String(e.over.id) : null;
    setActiveId(null);
    if (!overId || overId === id) return;
    const issue = issues.find((i) => i.id === id);
    if (!issue) return;
    let newStatus: (typeof STATUSES)[number] | null = STATUSES.includes(
      overId as (typeof STATUSES)[number]
    )
      ? (overId as (typeof STATUSES)[number])
      : null;
    if (!newStatus) {
      const overIssue = issues.find((i) => i.id === overId);
      if (overIssue) newStatus = overIssue.status;
    }
    if (newStatus && newStatus !== issue.status) {
      patchMutation.mutate({ issueId: id, status: newStatus });
    }
  };

  const columns = STATUSES.map((status) => ({
    id: status,
    title:
      status === "todo"
        ? "Todo"
        : status === "in_progress"
          ? "In Progress"
          : "Done",
    issues: issues.filter((i) => i.status === status),
  }));

  const activeIssue = activeId ? issues.find((i) => i.id === activeId) : null;

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
      <DndContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <BoardColumn
              id={col.id}
              issues={col.issues}
              key={col.id}
              title={col.title}
            />
          ))}
        </div>
        <DragOverlay>
          {activeIssue ? (
            <Card className="w-72 shrink-0 opacity-90 shadow-lg">
              <CardHeader className="py-2 px-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">
                    {activeIssue.title}
                  </span>
                  <Badge variant="secondary">{activeIssue.priority}</Badge>
                </div>
              </CardHeader>
              {activeIssue.dueDate && (
                <CardContent className="py-0 px-3 text-muted-foreground text-xs">
                  Due {new Date(activeIssue.dueDate).toLocaleDateString()}
                </CardContent>
              )}
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
