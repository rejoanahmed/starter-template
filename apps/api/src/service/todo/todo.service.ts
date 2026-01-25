import type { DB } from "@starter/db";
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
import { nanoid } from "nanoid";
import { Forbidden, Internal, NotFound, Unauthorized } from "./errors";
import type {
  CreateIssueInput,
  CreateLabelInput,
  IssueDto,
  LabelDto,
  ListFilters,
  TeamListFilters,
  UpdateIssueInput,
} from "./types";

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
}): IssueDto {
  return {
    ...row,
    dueDate: row.dueDate?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function tryDb<A>(
  promise: () => Promise<A>,
  msg = "Database operation failed"
): Promise<A> {
  try {
    return await promise();
  } catch (e) {
    throw new Internal({ message: msg, cause: e });
  }
}

/**
 * Todo/Issue service: vanilla async methods, throws TodoError on failure.
 * DB is request-scoped so we pass it into each method.
 */
// biome-ignore lint/complexity/noStaticOnlyClass: vanilla service class pattern
export class TodoService {
  static async requireOrgMember(
    db: DB,
    userId: string | null,
    orgId: string
  ): Promise<{ userId: string }> {
    if (!userId) throw new Unauthorized();
    const [m] = await tryDb(() =>
      db
        .select()
        .from(member)
        .where(and(eq(member.organizationId, orgId), eq(member.userId, userId)))
        .limit(1)
    );
    if (!m)
      throw new Forbidden({
        message: "Not a member of this organization",
      });
    return { userId };
  }

  static async requireTeamInOrg(
    db: DB,
    userId: string | null,
    orgId: string,
    teamId: string
  ): Promise<{ teamId: string }> {
    await TodoService.requireOrgMember(db, userId, orgId);
    const [team] = await tryDb(() =>
      db
        .select()
        .from(teamTable)
        .where(
          and(eq(teamTable.id, teamId), eq(teamTable.organizationId, orgId))
        )
        .limit(1)
    );
    if (!team) throw new NotFound({ resource: "Team", id: teamId });
    return { teamId };
  }

  static async listMyIssues(
    db: DB,
    userId: string | null,
    orgId: string,
    filters: ListFilters
  ): Promise<IssueDto[]> {
    const { userId: uid } = await TodoService.requireOrgMember(
      db,
      userId,
      orgId
    );
    const teamRows = await tryDb(() =>
      db
        .select({ id: teamTable.id })
        .from(teamTable)
        .where(eq(teamTable.organizationId, orgId))
    );
    const teamIds = teamRows.map((r) => r.id);
    if (teamIds.length === 0) return [];

    const conditions: SQL[] = [
      eq(issueTable.assigneeId, uid),
      inArray(issueTable.teamId, teamIds),
    ];
    if (filters.search) {
      const searchCond = or(
        ilike(issueTable.title, `%${filters.search}%`),
        ilike(issueTable.description, `%${filters.search}%`)
      );
      if (searchCond) conditions.push(searchCond);
    }
    if (filters.status) conditions.push(eq(issueTable.status, filters.status));
    if (filters.priority)
      conditions.push(eq(issueTable.priority, filters.priority));
    if (filters.assigneeId !== undefined)
      conditions.push(eq(issueTable.assigneeId, filters.assigneeId));
    if (filters.dueBefore)
      conditions.push(lte(issueTable.dueDate, new Date(filters.dueBefore)));
    if (filters.dueAfter)
      conditions.push(gte(issueTable.dueDate, new Date(filters.dueAfter)));

    let issues = await tryDb(() =>
      db
        .select()
        .from(issueTable)
        .where(and(...conditions))
        .orderBy(asc(issueTable.updatedAt))
    );

    const labelIds = filters.labelIds?.filter(Boolean);
    if (labelIds?.length) {
      const withLabels = (
        await tryDb(() =>
          db
            .select({ issueId: issueLabelTable.issueId })
            .from(issueLabelTable)
            .where(inArray(issueLabelTable.labelId, labelIds))
        )
      ).map((r) => r.issueId);
      issues = issues.filter((i) => withLabels.includes(i.id));
    }
    return issues.map(serializeIssue);
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: sort/orderBy branches
  static async listTeamIssues(
    db: DB,
    userId: string | null,
    orgId: string,
    teamId: string,
    filters: TeamListFilters
  ): Promise<{ data: IssueDto[]; totalCount: number }> {
    await TodoService.requireTeamInOrg(db, userId, orgId, teamId);
    const labelIds = filters.labelIds?.filter(Boolean) ?? [];
    const perPage = Math.min(Math.max(filters.perPage ?? 10, 1), 100);
    const page = Math.max(filters.page ?? 1, 1);

    const conditions: SQL[] = [eq(issueTable.teamId, teamId)];
    if (filters.search) {
      const searchCond = or(
        ilike(issueTable.title, `%${filters.search}%`),
        ilike(issueTable.description, `%${filters.search}%`)
      );
      if (searchCond) conditions.push(searchCond);
    }
    if (filters.status) conditions.push(eq(issueTable.status, filters.status));
    if (filters.priority)
      conditions.push(eq(issueTable.priority, filters.priority));
    if (filters.assigneeId !== undefined)
      conditions.push(eq(issueTable.assigneeId, filters.assigneeId));
    if (filters.dueBefore)
      conditions.push(lte(issueTable.dueDate, new Date(filters.dueBefore)));
    if (filters.dueAfter)
      conditions.push(gte(issueTable.dueDate, new Date(filters.dueAfter)));

    if (labelIds.length > 0) {
      const withLabelIds = (
        await tryDb(() =>
          db
            .selectDistinct({ issueId: issueLabelTable.issueId })
            .from(issueLabelTable)
            .where(inArray(issueLabelTable.labelId, labelIds))
        )
      ).map((r) => r.issueId);
      if (withLabelIds.length === 0) return { data: [], totalCount: 0 };
      conditions.push(inArray(issueTable.id, withLabelIds));
    }

    const whereClause = and(...conditions);
    const [countRow] = await tryDb(() =>
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(issueTable)
        .where(whereClause)
    );
    const totalCount = Number(countRow?.value ?? 0);

    const sortKey = filters.sort?.split(":")[0];
    const sortDir = filters.sort?.endsWith(":desc");
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

    const issues = await tryDb(() =>
      db
        .select()
        .from(issueTable)
        .where(whereClause)
        .orderBy(...orderBy)
        .limit(perPage)
        .offset((page - 1) * perPage)
    );

    return {
      data: issues.map(serializeIssue),
      totalCount,
    };
  }

  static async createIssue(
    db: DB,
    userId: string | null,
    orgId: string,
    teamId: string,
    body: CreateIssueInput
  ): Promise<IssueDto> {
    await TodoService.requireTeamInOrg(db, userId, orgId, teamId);
    const id = nanoid();
    const [max] = await tryDb(() =>
      db
        .select({ m: sql<number>`COALESCE(MAX(${issueTable.position}), 0)` })
        .from(issueTable)
        .where(eq(issueTable.teamId, teamId))
    );
    const position = ((max?.m as number) ?? 0) + 1;
    await tryDb(
      () =>
        db.insert(issueTable).values({
          id,
          teamId,
          title: body.title,
          description: body.description ?? null,
          status: body.status ?? "todo",
          priority: body.priority ?? "medium",
          assigneeId: body.assigneeId ?? null,
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          position,
        }),
      "Failed to insert issue"
    );
    const labelIds = body.labelIds ?? [];
    if (labelIds.length > 0) {
      await tryDb(
        () =>
          db
            .insert(issueLabelTable)
            .values(labelIds.map((labelId) => ({ issueId: id, labelId }))),
        "Failed to link labels"
      );
    }
    const [created] = await tryDb(() =>
      db.select().from(issueTable).where(eq(issueTable.id, id)).limit(1)
    );
    if (!created) throw new Internal({ message: "Failed to create issue" });
    return serializeIssue(created);
  }

  static async updateIssue(
    db: DB,
    userId: string | null,
    orgId: string,
    teamId: string,
    issueId: string,
    body: UpdateIssueInput
  ): Promise<IssueDto> {
    await TodoService.requireTeamInOrg(db, userId, orgId, teamId);
    const [existing] = await tryDb(() =>
      db
        .select()
        .from(issueTable)
        .where(and(eq(issueTable.id, issueId), eq(issueTable.teamId, teamId)))
        .limit(1)
    );
    if (!existing) throw new NotFound({ resource: "Issue", id: issueId });

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
      await tryDb(
        () =>
          db.update(issueTable).set(update).where(eq(issueTable.id, issueId)),
        "Failed to update issue"
      );
    }
    if (body?.labelIds !== undefined) {
      await tryDb(
        () =>
          db
            .delete(issueLabelTable)
            .where(eq(issueLabelTable.issueId, issueId)),
        "Failed to clear labels"
      );
      const nextLabelIds = body.labelIds;
      if (nextLabelIds.length > 0) {
        await tryDb(
          () =>
            db
              .insert(issueLabelTable)
              .values(nextLabelIds.map((labelId) => ({ issueId, labelId }))),
          "Failed to set labels"
        );
      }
    }
    const [updated] = await tryDb(() =>
      db.select().from(issueTable).where(eq(issueTable.id, issueId)).limit(1)
    );
    if (!updated)
      throw new Internal({ message: "Failed to read updated issue" });
    return serializeIssue(updated);
  }

  static async deleteIssue(
    db: DB,
    userId: string | null,
    orgId: string,
    teamId: string,
    issueId: string
  ): Promise<void> {
    await TodoService.requireTeamInOrg(db, userId, orgId, teamId);
    const [existing] = await tryDb(() =>
      db
        .select()
        .from(issueTable)
        .where(and(eq(issueTable.id, issueId), eq(issueTable.teamId, teamId)))
        .limit(1)
    );
    if (!existing) throw new NotFound({ resource: "Issue", id: issueId });
    await tryDb(
      () => db.delete(issueTable).where(eq(issueTable.id, issueId)),
      "Failed to delete issue"
    );
  }

  static async listLabels(
    db: DB,
    userId: string | null,
    orgId: string,
    teamId: string
  ): Promise<LabelDto[]> {
    await TodoService.requireTeamInOrg(db, userId, orgId, teamId);
    const labels = await tryDb(() =>
      db.select().from(labelTable).where(eq(labelTable.teamId, teamId))
    );
    return labels;
  }

  static async createLabel(
    db: DB,
    userId: string | null,
    orgId: string,
    teamId: string,
    body: CreateLabelInput
  ): Promise<LabelDto> {
    await TodoService.requireTeamInOrg(db, userId, orgId, teamId);
    const id = nanoid();
    await tryDb(
      () =>
        db.insert(labelTable).values({
          id,
          teamId,
          name: body.name,
          color: body.color ?? null,
        }),
      "Failed to insert label"
    );
    const [created] = await tryDb(() =>
      db.select().from(labelTable).where(eq(labelTable.id, id)).limit(1)
    );
    if (!created) throw new Internal({ message: "Failed to create label" });
    return created;
  }
}
