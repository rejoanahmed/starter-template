import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@starter/ui/components/badge";
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

const columns: ColumnDef<Issue>[] = [
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
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
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
];

export const Route = createFileRoute("/org/$orgId/team/$teamId/issues")({
  component: TeamIssuesPage,
});

function TeamIssuesPage() {
  const { orgId, teamId } = Route.useParams();
  const queryClient = useQueryClient();
  const [newIssueOpen, setNewIssueOpen] = useState(false);

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
  const [filters] = useQueryStates(
    {
      status: parseAsArrayOf(parseAsString, ",").withDefault([]),
      priority: parseAsArrayOf(parseAsString, ",").withDefault([]),
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
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New issue</DialogTitle>
            </DialogHeader>
            <CreateIssueForm
              isSubmitting={createMutation.isPending}
              onCancel={() => setNewIssueOpen(false)}
              onSubmit={(v) => createMutation.mutate(v)}
              orgId={orgId}
              teamId={teamId}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
