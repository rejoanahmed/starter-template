import { createDb, eq } from "@starter/db";
import {
  member as memberTable,
  organization as orgTable,
  team as teamTable,
  user as userTable,
} from "@starter/db/schema/auth";
import { issue as issueTable } from "@starter/db/schema/issue";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Forbidden, NotFound, Unauthorized } from "./errors";
import { TodoService } from "./todo.service";

const TEST_ORG_ID = "api-test-org-id";
const TEST_TEAM_ID = "api-test-team-id";
const TEST_USER_ID = "api-test-user-id";

const hasDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasDb)("TodoService", () => {
  let db: ReturnType<typeof createDb>;

  beforeAll(async () => {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL required");
    db = createDb(url);
    const now = new Date();

    const [u] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, TEST_USER_ID))
      .limit(1);
    if (!u) {
      await db.insert(userTable).values({
        id: TEST_USER_ID,
        name: "API Test User",
        email: "api-test-todo@example.com",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    const [o] = await db
      .select()
      .from(orgTable)
      .where(eq(orgTable.id, TEST_ORG_ID))
      .limit(1);
    if (!o) {
      await db.insert(orgTable).values({
        id: TEST_ORG_ID,
        name: "API Test Org",
        slug: "api-test-org",
        createdAt: now,
      });
    }

    const [t] = await db
      .select()
      .from(teamTable)
      .where(eq(teamTable.id, TEST_TEAM_ID))
      .limit(1);
    if (!t) {
      await db.insert(teamTable).values({
        id: TEST_TEAM_ID,
        name: "API Test Team",
        organizationId: TEST_ORG_ID,
        createdAt: now,
      });
    }

    const [existingMember] = await db
      .select()
      .from(memberTable)
      .where(eq(memberTable.organizationId, TEST_ORG_ID))
      .limit(1);
    if (!existingMember) {
      await db.insert(memberTable).values({
        id: crypto.randomUUID(),
        organizationId: TEST_ORG_ID,
        userId: TEST_USER_ID,
        role: "owner",
        createdAt: now,
      });
    }
  });

  afterAll(async () => {
    if (!db) return;
    await db.delete(issueTable).where(eq(issueTable.teamId, TEST_TEAM_ID));
  });

  describe("requireOrgMember / requireTeamInOrg", () => {
    it("throws Unauthorized when userId is null", async () => {
      await expect(
        TodoService.requireOrgMember(db, null, TEST_ORG_ID)
      ).rejects.toThrow(Unauthorized);
    });

    it("throws Forbidden when user is not org member", async () => {
      await expect(
        TodoService.requireOrgMember(db, "random-user-id", TEST_ORG_ID)
      ).rejects.toThrow(Forbidden);
    });

    it("succeeds when user is org member", async () => {
      const out = await TodoService.requireOrgMember(
        db,
        TEST_USER_ID,
        TEST_ORG_ID
      );
      expect(out.userId).toBe(TEST_USER_ID);
    });

    it("throws NotFound when team does not exist in org", async () => {
      await expect(
        TodoService.requireTeamInOrg(
          db,
          TEST_USER_ID,
          TEST_ORG_ID,
          "non-existent-team"
        )
      ).rejects.toThrow(NotFound);
    });
  });

  describe("listTeamIssues", () => {
    it("returns empty list when no issues", async () => {
      const result = await TodoService.listTeamIssues(
        db,
        TEST_USER_ID,
        TEST_ORG_ID,
        TEST_TEAM_ID,
        { page: 1, perPage: 10 }
      );
      expect(result.data).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it("filters by status and due date, sorts by title", async () => {
      const created = await TodoService.createIssue(
        db,
        TEST_USER_ID,
        TEST_ORG_ID,
        TEST_TEAM_ID,
        {
          title: "Alpha Issue",
          description: "Desc",
          status: "todo",
          dueDate: "2025-06-15T12:00:00.000Z",
        }
      );
      expect(created.id).toBeDefined();
      expect(created.title).toBe("Alpha Issue");
      expect(created.status).toBe("todo");

      const list = await TodoService.listTeamIssues(
        db,
        TEST_USER_ID,
        TEST_ORG_ID,
        TEST_TEAM_ID,
        { page: 1, perPage: 10, status: "todo" }
      );
      expect(list.data.length).toBeGreaterThanOrEqual(1);
      expect(list.data.every((i) => i.status === "todo")).toBe(true);

      const byDueAfter = await TodoService.listTeamIssues(
        db,
        TEST_USER_ID,
        TEST_ORG_ID,
        TEST_TEAM_ID,
        { page: 1, perPage: 10, dueAfter: "2025-06-01T00:00:00.000Z" }
      );
      expect(byDueAfter.data.some((i) => i.id === created.id)).toBe(true);

      const byDueBefore = await TodoService.listTeamIssues(
        db,
        TEST_USER_ID,
        TEST_ORG_ID,
        TEST_TEAM_ID,
        { page: 1, perPage: 10, dueBefore: "2025-06-10T00:00:00.000Z" }
      );
      expect(byDueBefore.data.some((i) => i.id === created.id)).toBe(false);

      const sorted = await TodoService.listTeamIssues(
        db,
        TEST_USER_ID,
        TEST_ORG_ID,
        TEST_TEAM_ID,
        { page: 1, perPage: 10, sort: "title:asc" }
      );
      expect(sorted.data.length).toBeGreaterThanOrEqual(1);
      const titles = sorted.data.map((i) => i.title);
      const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b));
      expect(titles).toEqual(sortedTitles);
    });
  });

  describe("createIssue", () => {
    it("creates an issue with required and optional fields", async () => {
      const created = await TodoService.createIssue(
        db,
        TEST_USER_ID,
        TEST_ORG_ID,
        TEST_TEAM_ID,
        {
          title: "Create Test Issue",
          description: "Optional desc",
          status: "in_progress",
          priority: "high",
          dueDate: "2025-07-01T00:00:00.000Z",
        }
      );
      expect(created.id).toBeDefined();
      expect(created.title).toBe("Create Test Issue");
      expect(created.description).toBe("Optional desc");
      expect(created.status).toBe("in_progress");
      expect(created.priority).toBe("high");
      expect(created.dueDate).toBe("2025-07-01T00:00:00.000Z");
      expect(created.teamId).toBe(TEST_TEAM_ID);
    });
  });

  describe("updateIssue", () => {
    it("updates title and status", async () => {
      const created = await TodoService.createIssue(
        db,
        TEST_USER_ID,
        TEST_ORG_ID,
        TEST_TEAM_ID,
        { title: "To Update", status: "todo" }
      );
      const updated = await TodoService.updateIssue(
        db,
        TEST_USER_ID,
        TEST_ORG_ID,
        TEST_TEAM_ID,
        created.id,
        { title: "Updated Title", status: "done" }
      );
      expect(updated.title).toBe("Updated Title");
      expect(updated.status).toBe("done");
    });

    it("throws NotFound when issue does not exist", async () => {
      await expect(
        TodoService.updateIssue(
          db,
          TEST_USER_ID,
          TEST_ORG_ID,
          TEST_TEAM_ID,
          "non-existent-issue-id",
          { title: "No" }
        )
      ).rejects.toThrow(NotFound);
    });
  });

  describe("deleteIssue", () => {
    it("deletes an issue", async () => {
      const created = await TodoService.createIssue(
        db,
        TEST_USER_ID,
        TEST_ORG_ID,
        TEST_TEAM_ID,
        { title: "To Delete" }
      );
      await TodoService.deleteIssue(
        db,
        TEST_USER_ID,
        TEST_ORG_ID,
        TEST_TEAM_ID,
        created.id
      );
      const list = await TodoService.listTeamIssues(
        db,
        TEST_USER_ID,
        TEST_ORG_ID,
        TEST_TEAM_ID,
        { page: 1, perPage: 100 }
      );
      expect(list.data.some((i) => i.id === created.id)).toBe(false);
    });

    it("throws NotFound when issue does not exist", async () => {
      await expect(
        TodoService.deleteIssue(
          db,
          TEST_USER_ID,
          TEST_ORG_ID,
          TEST_TEAM_ID,
          "non-existent-issue-id"
        )
      ).rejects.toThrow(NotFound);
    });
  });
});
