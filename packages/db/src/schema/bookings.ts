import { relations } from "drizzle-orm";
import {
  decimal,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { rooms } from "./rooms";

export const bookings = pgTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    roomId: text("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    merchantId: text("merchant_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    guestCount: integer("guest_count").notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    totalAmount: decimal("total_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    currency: text("currency").notNull().default("HKD"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    status: text("status", {
      enum: ["pending", "confirmed", "cancelled", "completed"],
    })
      .notNull()
      .default("pending"),
    specialRequests: text("special_requests"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("bookings_roomId_idx").on(table.roomId),
    index("bookings_userId_idx").on(table.userId),
    index("bookings_merchantId_idx").on(table.merchantId),
    index("bookings_startTime_idx").on(table.startTime),
    index("bookings_status_idx").on(table.status),
  ]
);

export const bookingsRelations = relations(bookings, ({ one }) => ({
  room: one(rooms, {
    fields: [bookings.roomId],
    references: [rooms.id],
  }),
  user: one(user, {
    fields: [bookings.userId],
    references: [user.id],
  }),
  merchant: one(user, {
    fields: [bookings.merchantId],
    references: [user.id],
  }),
}));
