import { Button } from "@starter/ui/components/button";
import { Input } from "@starter/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@starter/ui/components/select";
import { Textarea } from "@starter/ui/components/textarea";
import { useQuery } from "@tanstack/react-query";
import { api } from "@web/lib/api-client";
import { authClient } from "@web/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";

export type IssueStatus = "todo" | "in_progress" | "done";
export type IssuePriority = "high" | "medium" | "low";

export type CreateIssuePayload = {
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  labelIds?: string[];
};

export type CreateIssueFormProps = {
  orgId: string;
  teamId: string;
  onSubmit: (payload: CreateIssuePayload) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

export function CreateIssueForm({
  orgId,
  teamId,
  onSubmit,
  onCancel,
  isSubmitting,
}: CreateIssueFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<IssueStatus>("todo");
  const [priority, setPriority] = useState<IssuePriority>("medium");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [labelIds, setLabelIds] = useState<string[]>([]);

  const { data: membersData } = useQuery({
    queryKey: ["org-members", orgId],
    queryFn: () =>
      authClient.organization.listMembers({
        query: { organizationId: orgId, limit: 200 },
      }),
    enabled: !!orgId,
  });

  const { data: labels = [] } = useQuery({
    queryKey: ["team-labels", orgId, teamId],
    queryFn: async () => {
      const res = await api.todos[":orgId"].team[":teamId"].labels.$get({
        param: { orgId, teamId },
      });
      if (!res.ok) throw new Error("Failed to fetch labels");
      return res.json() as Promise<
        { id: string; name: string; color: string | null }[]
      >;
    },
    enabled: !!orgId && !!teamId,
  });

  const raw = (membersData as { data?: unknown })?.data;
  const members: {
    userId: string;
    user?: { name?: string; email?: string };
  }[] = Array.isArray(raw)
    ? raw
    : ((raw as { members?: unknown[] })?.members ?? []);

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
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      labelIds: labelIds.length ? labelIds : undefined,
    });
  };

  const toggleLabel = (id: string) => {
    setLabelIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
            onValueChange={(v) => setStatus((v || "todo") as IssueStatus)}
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
            onValueChange={(v) => setPriority((v || "medium") as IssuePriority)}
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
      <div>
        <span
          className="text-sm font-medium mb-1.5 block"
          id="new-issue-assignee-label"
        >
          Assignee
        </span>
        <Select
          aria-labelledby="new-issue-assignee-label"
          onValueChange={(v) => setAssigneeId(v === "unassigned" ? null : v)}
          value={assigneeId ?? "unassigned"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {members.map((m) => {
              const uid = m.userId;
              const name = m.user?.name ?? m.user?.email ?? uid;
              return (
                <SelectItem key={uid} value={uid}>
                  {name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label
          className="text-sm font-medium mb-1.5 block"
          htmlFor="new-issue-due"
        >
          Due date
        </label>
        <Input
          id="new-issue-due"
          onChange={(e) => setDueDate(e.target.value)}
          type="date"
          value={dueDate}
        />
      </div>
      {labels.length > 0 && (
        <div>
          <span className="text-sm font-medium mb-1.5 block">Labels</span>
          <div className="flex flex-wrap gap-2 rounded-md border p-2">
            {labels.map((l) => (
              <label
                className="flex cursor-pointer items-center gap-2 rounded border px-2 py-1 text-sm has-[:checked]:bg-muted"
                key={l.id}
              >
                <input
                  checked={labelIds.includes(l.id)}
                  className="size-4 rounded"
                  onChange={() => toggleLabel(l.id)}
                  type="checkbox"
                />
                {l.name}
              </label>
            ))}
          </div>
        </div>
      )}
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
