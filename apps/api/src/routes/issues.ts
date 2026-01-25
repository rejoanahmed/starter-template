import type { AppBindings } from "@api/lib/types";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  type SQL,
  sql,
} from "@starter/db";
import { member, team as teamTable } from "@starter/db/schema/auth";
import {
  issueLabel as issueLabelTable,
  issue as issueTable,
  label as labelTable,
} from "@starter/db/schema/issue";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { nanoid } from "nanoid";

async function requireOrgMember(c: Context<AppBindings>, orgId: string) {
  const user = c.get("user");
  if (!user) throw new HTTPException(401, { message: "Unauthorized" });
  const db = c.get("db");
  const [m] = await db
    .select()
    .from(member)
    .where(and(eq(member.organizationId, orgId), eq(member.userId, user.id)))
    .limit(1);
  if (!m)
    throw new HTTPException(403, {
      message: "Not a member of this organization",
    });
  return { db, user };
}

async function requireTeamInOrg(
  c: Context<AppBindings>,
  orgId: string,
  teamId: string
) {
  const { db } = await requireOrgMember(c, orgId);
  const [team] = await db
    .select()
    .from(teamTable)
    .where(and(eq(teamTable.id, teamId), eq(teamTable.organizationId, orgId)))
    .limit(1);
  if (!team) throw new HTTPException(404, { message: "Team not found" });
  return { db, team };
}

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

function serializeIssue(row: {
  id: string;
  teamId: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "high" | "medium" | "low";
  assigneeId: string | null;
  dueDate: Date | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...row,
    dueDate: row.dueDate?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

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
    const { db, user } = await requireOrgMember(c, orgId);
    const labelIds = q.labelIds?.split(",").filter(Boolean);

    const teamRows = await db
      .select({ id: teamTable.id })
      .from(teamTable)
      .where(eq(teamTable.organizationId, orgId));
    const teamIds = teamRows.map((r) => r.id);
    if (teamIds.length === 0) return c.json([]);
    const conditions = [
      eq(issueTable.assigneeId, user.id),
      inArray(issueTable.teamId, teamIds),
    ];
    if (q.search) {
      const searchCond = or(
        ilike(issueTable.title, `%${q.search}%`),
        ilike(issueTable.description, `%${q.search}%`)
      );
      if (searchCond) conditions.push(searchCond);
    }
    if (q.status) conditions.push(eq(issueTable.status, q.status));
    if (q.priority) conditions.push(eq(issueTable.priority, q.priority));
    if (q.assigneeId !== undefined)
      conditions.push(eq(issueTable.assigneeId, q.assigneeId));
    if (q.dueBefore)
      conditions.push(lte(issueTable.dueDate, new Date(q.dueBefore)));
    if (q.dueAfter)
      conditions.push(gte(issueTable.dueDate, new Date(q.dueAfter)));

    let issues = await db
      .select()
      .from(issueTable)
      .where(and(...conditions))
      .orderBy(asc(issueTable.updatedAt));
    if (labelIds?.length) {
      const withLabels = (
        await db
          .select({ issueId: issueLabelTable.issueId })
          .from(issueLabelTable)
          .where(inArray(issueLabelTable.labelId, labelIds))
      ).map((r) => r.issueId);
      issues = issues.filter((i) => withLabels.includes(i.id));
    }
    return c.json(issues.map(serializeIssue));
  })
  .openapi(routeTeamIssues, async (c) => {
    const { orgId, teamId } = c.req.valid("param");
    const q = c.req.valid("query");
    const { db } = await requireTeamInOrg(c, orgId, teamId);
    const labelIdsList = q.labelIds?.split(",").filter(Boolean) ?? [];

    const conditions: SQL[] = [eq(issueTable.teamId, teamId)];
    if (q.search) {
      const searchCond = or(
        ilike(issueTable.title, `%${q.search}%`),
        ilike(issueTable.description, `%${q.search}%`)
      );
      if (searchCond) conditions.push(searchCond);
    }
    if (q.status) conditions.push(eq(issueTable.status, q.status));
    if (q.priority) conditions.push(eq(issueTable.priority, q.priority));
    if (q.assigneeId !== undefined)
      conditions.push(eq(issueTable.assigneeId, q.assigneeId));
    if (q.dueBefore)
      conditions.push(lte(issueTable.dueDate, new Date(q.dueBefore)));
    if (q.dueAfter)
      conditions.push(gte(issueTable.dueDate, new Date(q.dueAfter)));

    if (labelIdsList.length > 0) {
      const withLabelIds = (
        await db
          .selectDistinct({ issueId: issueLabelTable.issueId })
          .from(issueLabelTable)
          .where(inArray(issueLabelTable.labelId, labelIdsList))
      ).map((r) => r.issueId);
      if (withLabelIds.length === 0) {
        return c.json({ data: [], totalCount: 0 });
      }
      conditions.push(inArray(issueTable.id, withLabelIds));
    }

    const whereClause = and(...conditions);

    const countRows = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(issueTable)
      .where(whereClause);
    const totalCount = Number(countRows[0]?.value ?? 0);

    const sortKey = q.sort?.split(":")[0];
    const sortDir = q.sort?.endsWith(":desc");
    const orderBy =
      sortKey === "createdAt"
        ? [sortDir ? desc(issueTable.createdAt) : asc(issueTable.createdAt)]
        : sortKey === "title"
          ? [sortDir ? desc(issueTable.title) : asc(issueTable.title)]
          : sortKey === "status"
            ? [sortDir ? desc(issueTable.status) : asc(issueTable.status)]
            : sortKey === "priority"
              ? [sortDir ? desc(issueTable.priority) : asc(issueTable.priority)]
              : sortKey === "dueDate"
                ? [sortDir ? desc(issueTable.dueDate) : asc(issueTable.dueDate)]
                : [asc(issueTable.position), asc(issueTable.createdAt)];

    const issues = await db
      .select()
      .from(issueTable)
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(q.perPage)
      .offset((q.page - 1) * q.perPage);

    return c.json({
      data: issues.map(serializeIssue),
      totalCount,
    });
  })
  .openapi(routeCreateIssue, async (c) => {
    const { orgId, teamId } = c.req.valid("param");
    const body = c.req.valid("json");
    const { db } = await requireTeamInOrg(c, orgId, teamId);
    const id = nanoid();
    const [max] = await db
      .select({ m: sql<number>`COALESCE(MAX(${issueTable.position}), 0)` })
      .from(issueTable)
      .where(eq(issueTable.teamId, teamId));
    const position = ((max?.m as number) ?? 0) + 1;
    await db.insert(issueTable).values({
      id,
      teamId,
      title: body.title,
      description: body.description ?? null,
      status: body.status ?? "todo",
      priority: body.priority ?? "medium",
      assigneeId: body.assigneeId ?? null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      position,
    });
    if (body.labelIds?.length) {
      await db
        .insert(issueLabelTable)
        .values(body.labelIds.map((labelId) => ({ issueId: id, labelId })));
    }
    const [created] = await db
      .select()
      .from(issueTable)
      .where(eq(issueTable.id, id))
      .limit(1);
    if (!created)
      throw new HTTPException(500, { message: "Failed to create issue" });
    return c.json(serializeIssue(created), 201);
  })
  .openapi(routeUpdateIssue, async (c) => {
    const { orgId, teamId, issueId } = c.req.valid("param");
    const body = c.req.valid("json");
    const { db } = await requireTeamInOrg(c, orgId, teamId);
    const [existing] = await db
      .select()
      .from(issueTable)
      .where(and(eq(issueTable.id, issueId), eq(issueTable.teamId, teamId)))
      .limit(1);
    if (!existing) throw new HTTPException(404, { message: "Issue not found" });
    const update: Record<string, unknown> = {};
    if (body?.title !== undefined) update.title = body.title;
    if (body?.description !== undefined) update.description = body.description;
    if (body?.status !== undefined) update.status = body.status;
    if (body?.priority !== undefined) update.priority = body.priority;
    if (body?.assigneeId !== undefined) update.assigneeId = body.assigneeId;
    if (body?.dueDate !== undefined)
      update.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body?.position !== undefined) update.position = body.position;
    if (Object.keys(update).length > 0) {
      await db.update(issueTable).set(update).where(eq(issueTable.id, issueId));
    }
    if (body?.labelIds !== undefined) {
      await db
        .delete(issueLabelTable)
        .where(eq(issueLabelTable.issueId, issueId));
      if (body.labelIds.length) {
        await db
          .insert(issueLabelTable)
          .values(body.labelIds.map((labelId) => ({ issueId, labelId })));
      }
    }
    const [updated] = await db
      .select()
      .from(issueTable)
      .where(eq(issueTable.id, issueId))
      .limit(1);
    if (!updated)
      throw new HTTPException(500, { message: "Failed to update issue" });
    return c.json(serializeIssue(updated), 200);
  })
  .openapi(routeDeleteIssue, async (c) => {
    const { orgId, teamId, issueId } = c.req.valid("param");
    const { db } = await requireTeamInOrg(c, orgId, teamId);
    const [existing] = await db
      .select()
      .from(issueTable)
      .where(and(eq(issueTable.id, issueId), eq(issueTable.teamId, teamId)))
      .limit(1);
    if (!existing) throw new HTTPException(404, { message: "Issue not found" });
    await db.delete(issueTable).where(eq(issueTable.id, issueId));
    return c.json({ ok: true as const }, 200);
  })
  .openapi(routeListLabels, async (c) => {
    const { orgId, teamId } = c.req.valid("param");
    const { db } = await requireTeamInOrg(c, orgId, teamId);
    const labels = await db
      .select()
      .from(labelTable)
      .where(eq(labelTable.teamId, teamId));
    return c.json(labels);
  })
  .openapi(routeCreateLabel, async (c) => {
    const { orgId, teamId } = c.req.valid("param");
    const body = c.req.valid("json");
    const { db } = await requireTeamInOrg(c, orgId, teamId);
    const id = nanoid();
    await db.insert(labelTable).values({
      id,
      teamId,
      name: body.name,
      color: body.color ?? null,
    });
    const [created] = await db
      .select()
      .from(labelTable)
      .where(eq(labelTable.id, id))
      .limit(1);
    if (!created)
      throw new HTTPException(500, { message: "Failed to create label" });
    return c.json(created, 201);
  });

export { todosApi };
