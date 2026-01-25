import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { team, user } from "./auth";

export const issue = pgTable(
  "issue",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status", {
      enum: ["todo", "in_progress", "done"],
    })
      .default("todo")
      .notNull(),
    priority: text("priority", {
      enum: ["high", "medium", "low"],
    })
      .default("medium")
      .notNull(),
    assigneeId: text("assignee_id").references(() => user.id, {
      onDelete: "set null",
    }),
    dueDate: timestamp("due_date"),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("issue_teamId_status_idx").on(table.teamId, table.status),
    index("issue_assigneeId_idx").on(table.assigneeId),
  ]
);

export const label = pgTable(
  "label",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color"),
  },
  (table) => [index("label_teamId_idx").on(table.teamId)]
);

export const issueLabel = pgTable(
  "issue_label",
  {
    issueId: text("issue_id")
      .notNull()
      .references(() => issue.id, { onDelete: "cascade" }),
    labelId: text("label_id")
      .notNull()
      .references(() => label.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.issueId, table.labelId] }),
    index("issue_label_issueId_idx").on(table.issueId),
    index("issue_label_labelId_idx").on(table.labelId),
  ]
);

export const issueRelations = relations(issue, ({ one, many }) => ({
  team: one(team, {
    fields: [issue.teamId],
    references: [team.id],
  }),
  assignee: one(user, {
    fields: [issue.assigneeId],
    references: [user.id],
  }),
  issueLabels: many(issueLabel),
}));

export const labelRelations = relations(label, ({ one, many }) => ({
  team: one(team, {
    fields: [label.teamId],
    references: [team.id],
  }),
  issueLabels: many(issueLabel),
}));

export const issueLabelRelations = relations(issueLabel, ({ one }) => ({
  issue: one(issue, {
    fields: [issueLabel.issueId],
    references: [issue.id],
  }),
  label: one(label, {
    fields: [issueLabel.labelId],
    references: [label.id],
  }),
}));
