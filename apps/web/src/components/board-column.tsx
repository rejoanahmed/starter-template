import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@starter/ui/lib/utils";
import { IssueCard } from "./issue-card";

type Issue = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
};

type BoardColumnProps = {
  id: string;
  title: string;
  issues: Issue[];
};

export function BoardColumn({ id, title, issues }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={cn(
        "flex h-fit min-h-[320px] w-72 shrink-0 flex-col rounded-lg border bg-muted/30 p-2 transition-colors",
        isOver && "bg-muted/60"
      )}
      ref={setNodeRef}
    >
      <h2 className="mb-2 px-1 font-semibold text-sm">{title}</h2>
      <SortableContext
        items={issues.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-1 flex-col gap-2">
          {issues.map((issue) => (
            <IssueCard issue={issue} key={issue.id} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
