/** Serialized issue DTO returned by the service */
export type IssueDto = {
  id: string;
  teamId: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "high" | "medium" | "low";
  assigneeId: string | null;
  dueDate: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

/** Serialized label DTO */
export type LabelDto = {
  id: string;
  teamId: string;
  name: string;
  color: string | null;
};

export type ListFilters = {
  search?: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "high" | "medium" | "low";
  assigneeId?: string;
  labelIds?: string[];
  dueBefore?: string;
  dueAfter?: string;
};

export type TeamListFilters = ListFilters & {
  page?: number;
  perPage?: number;
  sort?: string; // "title:asc" | "createdAt:desc" etc
};

export type CreateIssueInput = {
  title: string;
  description?: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "high" | "medium" | "low";
  assigneeId?: string | null;
  dueDate?: string | null;
  labelIds?: string[];
};

export type UpdateIssueInput = Partial<CreateIssueInput> & {
  position?: number;
};

export type CreateLabelInput = {
  name: string;
  color?: string;
};
