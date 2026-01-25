import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@starter/ui/components/badge";
import { Card, CardContent, CardHeader } from "@starter/ui/components/card";
import { cn } from "@starter/ui/lib/utils";

type Issue = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
};

export function IssueCard({ issue }: { issue: Issue }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      className={cn(
        "cursor-grab active:cursor-grabbing touch-none",
        isDragging && "opacity-50 shadow-md"
      )}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
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
