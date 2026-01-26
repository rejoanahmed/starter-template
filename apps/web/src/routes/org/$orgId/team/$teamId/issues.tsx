import {
  Add01Icon,
  Delete01Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@starter/ui/components/alert-dialog";
import { Badge } from "@starter/ui/components/badge";
import { Button } from "@starter/ui/components/button";
import { DataTable } from "@starter/ui/components/data-table/data-table";
import { DataTableColumnHeader } from "@starter/ui/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@starter/ui/components/data-table/data-table-toolbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@starter/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@starter/ui/components/dropdown-menu";
import { Skeleton } from "@starter/ui/components/skeleton";
import { useDataTable } from "@starter/ui/hooks/use-data-table";
import { getSortingStateParser } from "@starter/ui/lib/parsers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CreateIssueForm,
  type CreateIssuePayload,
  type IssuePriority,
  type IssueStatus,
} from "@web/components/create-issue-form";
import { api } from "@web/lib/api-client";

import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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

const ISSUE_TABLE_KEYS = {
  page: "page",
  perPage: "perPage",
  sort: "sort",
} as const;
const SORT_COLUMN_IDS = new Set([
  "title",
  "status",
  "priority",
  "dueDate",
  "createdAt",
]);

function makeColumns(
  onEdit: (issue: Issue) => void,
  onDelete: (issue: Issue) => void
): ColumnDef<Issue>[] {
  return [
    {
      id: "title",
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Title" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
      enableSorting: true,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Status" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.status}</Badge>
      ),
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        options: [
          { label: "Todo", value: "todo" },
          { label: "In Progress", value: "in_progress" },
          { label: "Done", value: "done" },
        ],
      },
    },
    {
      id: "priority",
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Priority" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.priority}</span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        options: [
          { label: "High", value: "high" },
          { label: "Medium", value: "medium" },
          { label: "Low", value: "low" },
        ],
      },
    },
    {
      id: "dueDate",
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Due" />
      ),
      cell: ({ row }) =>
        row.original.dueDate
          ? new Date(row.original.dueDate).toLocaleDateString()
          : "—",
      enableSorting: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const issue = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  aria-label="Open actions"
                  className="h-8 w-8"
                  size="icon"
                  variant="ghost"
                >
                  <HugeiconsIcon className="size-4" icon={Edit02Icon} />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(issue)}>
                <HugeiconsIcon className="mr-2 size-4" icon={Edit02Icon} />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(issue)}
              >
                <HugeiconsIcon className="mr-2 size-4" icon={Delete01Icon} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
    },
  ];
}

export const Route = createFileRoute("/org/$orgId/team/$teamId/issues")({
  component: TeamIssuesPage,
});

function TeamIssuesPage() {
  const { orgId, teamId } = Route.useParams();
  const queryClient = useQueryClient();
  const [newIssueOpen, setNewIssueOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [deleteConfirmIssue, setDeleteConfirmIssue] = useState<Issue | null>(
    null
  );

  const [page] = useQueryState(
    ISSUE_TABLE_KEYS.page,
    parseAsInteger.withDefault(1)
  );
  const [perPage] = useQueryState(
    ISSUE_TABLE_KEYS.perPage,
    parseAsInteger.withDefault(10)
  );
  const [sorting] = useQueryState(
    ISSUE_TABLE_KEYS.sort,
    getSortingStateParser<Issue>(SORT_COLUMN_IDS).withDefault([])
  );
  const [filters, setFilters] = useQueryStates(
    {
      status: parseAsArrayOf(parseAsString, ",").withDefault([]),
      priority: parseAsArrayOf(parseAsString, ",").withDefault([]),
      dueAfter: parseAsString.withDefault(""),
      dueBefore: parseAsString.withDefault(""),
    },
    { shallow: false }
  );

  const sortParam = useMemo(() => {
    if (!sorting?.length) return undefined;
    const first = sorting[0];
    if (!first || typeof first.id !== "string") return undefined;
    return `${first.id}:${first.desc ? "desc" : "asc"}`;
  }, [sorting]);

  const { data, isLoading } = useQuery({
    queryKey: [
      "team-issues",
      orgId,
      teamId,
      page,
      perPage,
      sortParam,
      filters.status,
      filters.priority,
      filters.dueAfter,
      filters.dueBefore,
    ],
    queryFn: async () => {
      const res = await api.todos[":orgId"].team[":teamId"].issues.$get({
        param: { orgId, teamId },
        query: {
          page,
          perPage,
          sort: sortParam,
          status: (filters.status?.[0] as IssueStatus | undefined) ?? undefined,
          priority:
            (filters.priority?.[0] as IssuePriority | undefined) ?? undefined,
          dueAfter: filters.dueAfter || undefined,
          dueBefore: filters.dueBefore || undefined,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch issues");
      return res.json() as unknown as Promise<{
        data: Issue[];
        totalCount: number;
      }>;
    },
    enabled: !!orgId && !!teamId,
  });

  const pageCount = data
    ? Math.max(1, Math.ceil(data.totalCount / perPage))
    : 1;
  const tableData = data?.data ?? [];

  const columns = useMemo(
    () =>
      makeColumns(
        (issue) => {
          setEditingIssue(issue);
          setNewIssueOpen(true);
        },
        (issue) => setDeleteConfirmIssue(issue)
      ),
    []
  );

  const { table } = useDataTable<Issue>({
    columns,
    data: tableData,
    pageCount,
    queryKeys: ISSUE_TABLE_KEYS,
  });

  const createMutation = useMutation({
    mutationFn: async (body: CreateIssuePayload) => {
      const res = await api.todos[":orgId"].team[":teamId"].issues.$post({
        param: { orgId, teamId },
        json: body,
      });
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
      queryClient.invalidateQueries({
        queryKey: ["board-issues", orgId, teamId],
      });
      setNewIssueOpen(false);
      setEditingIssue(null);
      toast.success("Issue created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      issueId,
      body,
    }: {
      issueId: string;
      body: CreateIssuePayload;
    }) => {
      const res = await api.todos[":orgId"].team[":teamId"].issues[
        ":issueId"
      ].$patch({
        param: { orgId, teamId, issueId },
        json: body,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string }).message || "Failed to update issue"
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team-issues", orgId, teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["board-issues", orgId, teamId],
      });
      setNewIssueOpen(false);
      setEditingIssue(null);
      toast.success("Issue updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const res = await api.todos[":orgId"].team[":teamId"].issues[
        ":issueId"
      ].$delete({
        param: { orgId, teamId, issueId },
      });
      if (!res.ok) throw new Error("Failed to delete issue");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team-issues", orgId, teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["board-issues", orgId, teamId],
      });
      setDeleteConfirmIssue(null);
      toast.success("Issue deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (payload: CreateIssuePayload) => {
    if (editingIssue) {
      updateMutation.mutate({ issueId: editingIssue.id, body: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

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
        <Dialog
          onOpenChange={(open) => {
            setNewIssueOpen(open);
            if (!open) setEditingIssue(null);
          }}
          open={newIssueOpen}
        >
          <DialogTrigger
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-4xl border border-transparent bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            onClick={() => setEditingIssue(null)}
            type="button"
          >
            <HugeiconsIcon className="size-4" icon={Add01Icon} />
            New issue
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingIssue ? "Edit issue" : "New issue"}
              </DialogTitle>
            </DialogHeader>
            <CreateIssueForm
              initialValue={
                editingIssue
                  ? {
                      title: editingIssue.title,
                      description: editingIssue.description ?? undefined,
                      status: editingIssue.status as IssueStatus,
                      priority: editingIssue.priority as IssuePriority,
                      assigneeId: editingIssue.assigneeId,
                      dueDate: editingIssue.dueDate,
                    }
                  : undefined
              }
              isSubmitting={
                createMutation.isPending || updateMutation.isPending
              }
              key={editingIssue?.id ?? "new"}
              onCancel={() => {
                setNewIssueOpen(false);
                setEditingIssue(null);
              }}
              onSubmit={handleSubmit}
              orgId={orgId}
              submitLabel={editingIssue ? "Save" : "Create issue"}
              teamId={teamId}
            />
          </DialogContent>
        </Dialog>
      </div>

      <AlertDialog
        onOpenChange={(open) => !open && setDeleteConfirmIssue(null)}
        open={!!deleteConfirmIssue}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete issue</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{deleteConfirmIssue?.title}&quot;? This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteConfirmIssue &&
                deleteMutation.mutate(deleteConfirmIssue.id)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <div className="flex items-center gap-2 border rounded-md px-2 py-1 bg-muted/50">
            <label className="flex items-center gap-1.5 text-muted-foreground text-xs">
              Due from
              <input
                aria-label="Due from"
                className="h-7 rounded border bg-background px-1.5 text-xs"
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dueAfter: e.target.value }))
                }
                type="date"
                value={filters.dueAfter}
              />
            </label>
            <span className="text-muted-foreground/60">–</span>
            <label className="flex items-center gap-1.5 text-muted-foreground text-xs">
              Due to
              <input
                aria-label="Due to"
                className="h-7 rounded border bg-background px-1.5 text-xs"
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dueBefore: e.target.value }))
                }
                type="date"
                value={filters.dueBefore}
              />
            </label>
          </div>
        </DataTableToolbar>
      </DataTable>
    </div>
  );
}
