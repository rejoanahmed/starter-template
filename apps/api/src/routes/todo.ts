import type { AppBindings } from "@api/lib/types";
import { runTodo, TodoService } from "@api/service/todo";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

// ----- Schemas -----
const statusEnum = z.enum(["todo", "in_progress", "done"]);
const priorityEnum = z.enum(["high", "medium", "low"]);

const OrgIdParamSchema = z.object({
  orgId: z.string().openapi({ param: { name: "orgId", in: "path" } }),
});

const OrgTeamParamsSchema = z.object({
  orgId: z.string().openapi({ param: { name: "orgId", in: "path" } }),
  teamId: z.string().openapi({ param: { name: "teamId", in: "path" } }),
});

const OrgTeamIssueParamsSchema = z.object({
  orgId: z.string().openapi({ param: { name: "orgId", in: "path" } }),
  teamId: z.string().openapi({ param: { name: "teamId", in: "path" } }),
  issueId: z.string().openapi({ param: { name: "issueId", in: "path" } }),
});

const ListIssuesQuerySchema = z.object({
  search: z
    .string()
    .optional()
    .openapi({ param: { name: "search", in: "query" } }),
  status: statusEnum
    .optional()
    .openapi({ param: { name: "status", in: "query" } }),
  priority: priorityEnum
    .optional()
    .openapi({ param: { name: "priority", in: "query" } }),
  assigneeId: z
    .string()
    .optional()
    .openapi({ param: { name: "assigneeId", in: "query" } }),
  labelIds: z
    .string()
    .optional()
    .openapi({ param: { name: "labelIds", in: "query" } }), // comma-separated
  dueBefore: z
    .string()
    .optional()
    .openapi({ param: { name: "dueBefore", in: "query" } }),
  dueAfter: z
    .string()
    .optional()
    .openapi({ param: { name: "dueAfter", in: "query" } }),
});

const TeamListIssuesQuerySchema = ListIssuesQuerySchema.extend({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .openapi({ param: { name: "page", in: "query" } }),
  perPage: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .openapi({ param: { name: "perPage", in: "query" } }),
  sort: z
    .string()
    .optional()
    .openapi({ param: { name: "sort", in: "query" } }), // "title:asc" | "title:desc" | "createdAt:asc" etc
});

const CreateIssueBodySchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    assigneeId: z.string().nullable().optional(),
    dueDate: z.string().datetime().nullable().optional(),
    labelIds: z.array(z.string()).optional(),
  })
  .openapi("CreateIssueBody");

const UpdateIssueBodySchema = CreateIssueBodySchema.partial()
  .extend({ position: z.number().optional() })
  .openapi("UpdateIssueBody");

const CreateLabelBodySchema = z
  .object({
    name: z.string().min(1),
    color: z.string().optional(),
  })
  .openapi("CreateLabelBody");

const IssueSchema = z
  .object({
    id: z.string(),
    teamId: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    status: statusEnum,
    priority: priorityEnum,
    assigneeId: z.string().nullable(),
    dueDate: z.string().nullable(),
    position: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("Issue");

const PaginatedIssuesResponseSchema = z
  .object({
    data: z.array(IssueSchema),
    totalCount: z.number(),
  })
  .openapi("PaginatedIssuesResponse");

const LabelSchema = z
  .object({
    id: z.string(),
    teamId: z.string(),
    name: z.string(),
    color: z.string().nullable(),
  })
  .openapi("Label");

const ValidationErrorSchema = z
  .object({
    ok: z.literal(false),
    errors: z.unknown(),
    source: z.literal("validation"),
  })
  .openapi("ValidationError");

// ----- Routes -----
const routeMyIssues = createRoute({
  method: "get",
  path: "/{orgId}/issues",
  request: { params: OrgIdParamSchema, query: ListIssuesQuerySchema },
  responses: {
    200: {
      content: { "application/json": { schema: z.array(IssueSchema) } },
      description: "Issues assigned to current user in the org",
    },
  },
});

const routeTeamIssues = createRoute({
  method: "get",
  path: "/{orgId}/team/{teamId}/issues",
  request: { params: OrgTeamParamsSchema, query: TeamListIssuesQuerySchema },
  responses: {
    200: {
      content: {
        "application/json": { schema: PaginatedIssuesResponseSchema },
      },
      description: "Paginated issues in the team",
    },
  },
});

const routeCreateIssue = createRoute({
  method: "post",
  path: "/{orgId}/team/{teamId}/issues",
  request: {
    params: OrgTeamParamsSchema,
    body: {
      content: { "application/json": { schema: CreateIssueBodySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: IssueSchema } },
      description: "Created issue",
    },
    400: {
      content: { "application/json": { schema: ValidationErrorSchema } },
      description: "Validation error",
    },
  },
});

const routeUpdateIssue = createRoute({
  method: "patch",
  path: "/{orgId}/team/{teamId}/issues/{issueId}",
  request: {
    params: OrgTeamIssueParamsSchema,
    body: {
      content: { "application/json": { schema: UpdateIssueBodySchema } },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: IssueSchema } },
      description: "Updated issue",
    },
    400: {
      content: { "application/json": { schema: ValidationErrorSchema } },
      description: "Validation error",
    },
    404: { description: "Issue not found" },
  },
});

const routeDeleteIssue = createRoute({
  method: "delete",
  path: "/{orgId}/team/{teamId}/issues/{issueId}",
  request: { params: OrgTeamIssueParamsSchema },
  responses: {
    200: {
      content: {
        "application/json": { schema: z.object({ ok: z.literal(true) }) },
      },
      description: "Deleted",
    },
    404: { description: "Issue not found" },
  },
});

const routeListLabels = createRoute({
  method: "get",
  path: "/{orgId}/team/{teamId}/labels",
  request: { params: OrgTeamParamsSchema },
  responses: {
    200: {
      content: { "application/json": { schema: z.array(LabelSchema) } },
      description: "Labels for the team",
    },
  },
});

const routeCreateLabel = createRoute({
  method: "post",
  path: "/{orgId}/team/{teamId}/labels",
  request: {
    params: OrgTeamParamsSchema,
    body: {
      content: { "application/json": { schema: CreateLabelBodySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: LabelSchema } },
      description: "Created label",
    },
    400: {
      content: { "application/json": { schema: ValidationErrorSchema } },
      description: "Validation error",
    },
  },
});

const todosApi = new OpenAPIHono<AppBindings>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          ok: false as const,
          errors: z.treeifyError(result.error),
          source: "validation" as const,
        },
        422
      );
    }
  },
})
  .openapi(routeMyIssues, async (c) => {
    const { orgId } = c.req.valid("param");
    const q = c.req.valid("query");
    const db = c.get("db");
    const user = c.get("user");
    const list = await runTodo(
      TodoService.listMyIssues(db, user?.id ?? null, orgId, {
        search: q.search,
        status: q.status,
        priority: q.priority,
        assigneeId: q.assigneeId,
        labelIds: q.labelIds?.split(",").filter(Boolean),
        dueBefore: q.dueBefore,
        dueAfter: q.dueAfter,
      })
    );
    return c.json(list as z.infer<typeof IssueSchema>[]);
  })
  .openapi(routeTeamIssues, async (c) => {
    const { orgId, teamId } = c.req.valid("param");
    const q = c.req.valid("query");
    const db = c.get("db");
    const user = c.get("user");
    const result = await runTodo(
      TodoService.listTeamIssues(db, user?.id ?? null, orgId, teamId, {
        search: q.search,
        status: q.status,
        priority: q.priority,
        assigneeId: q.assigneeId,
        labelIds: q.labelIds?.split(",").filter(Boolean),
        dueBefore: q.dueBefore,
        dueAfter: q.dueAfter,
        page: q.page,
        perPage: q.perPage,
        sort: q.sort,
      })
    );
    return c.json(result as z.infer<typeof PaginatedIssuesResponseSchema>);
  })
  .openapi(routeCreateIssue, async (c) => {
    const { orgId, teamId } = c.req.valid("param");
    const body = c.req.valid("json");
    const db = c.get("db");
    const user = c.get("user");
    const created = await runTodo(
      TodoService.createIssue(db, user?.id ?? null, orgId, teamId, {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        assigneeId: body.assigneeId ?? undefined,
        dueDate: body.dueDate ?? undefined,
        labelIds: body.labelIds,
      })
    );
    return c.json(created as z.infer<typeof IssueSchema>, 201);
  })
  .openapi(routeUpdateIssue, async (c) => {
    const { orgId, teamId, issueId } = c.req.valid("param");
    const body = c.req.valid("json");
    const db = c.get("db");
    const user = c.get("user");
    const updated = await runTodo(
      TodoService.updateIssue(db, user?.id ?? null, orgId, teamId, issueId, {
        title: body?.title,
        description: body?.description,
        status: body?.status,
        priority: body?.priority,
        assigneeId: body?.assigneeId,
        dueDate: body?.dueDate ?? undefined,
        position: body?.position,
        labelIds: body?.labelIds,
      })
    );
    return c.json(updated as z.infer<typeof IssueSchema>, 200);
  })
  .openapi(routeDeleteIssue, async (c) => {
    const { orgId, teamId, issueId } = c.req.valid("param");
    const db = c.get("db");
    const user = c.get("user");
    await runTodo(
      TodoService.deleteIssue(db, user?.id ?? null, orgId, teamId, issueId)
    );
    return c.json({ ok: true as const }, 200);
  })
  .openapi(routeListLabels, async (c) => {
    const { orgId, teamId } = c.req.valid("param");
    const db = c.get("db");
    const user = c.get("user");
    const labels = await runTodo(
      TodoService.listLabels(db, user?.id ?? null, orgId, teamId)
    );
    return c.json(labels as z.infer<typeof LabelSchema>[]);
  })
  .openapi(routeCreateLabel, async (c) => {
    const { orgId, teamId } = c.req.valid("param");
    const body = c.req.valid("json");
    const db = c.get("db");
    const user = c.get("user");
    const created = await runTodo(
      TodoService.createLabel(db, user?.id ?? null, orgId, teamId, {
        name: body.name,
        color: body.color,
      })
    );
    return c.json(created as z.infer<typeof LabelSchema>, 201);
  });

export { todosApi };
