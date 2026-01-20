import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const rooms = pgTable(
  "rooms",
  {
    id: text("id").primaryKey(),
    merchantId: text("merchant_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    district: text("district").notNull(),
    address: text("address").notNull(),
    latitude: text("latitude").notNull(),
    longitude: text("longitude").notNull(),
    minGuests: integer("min_guests").notNull().default(1),
    maxGuests: integer("max_guests").notNull().default(1),
    includedGuests: integer("included_guests").notNull().default(1),
    extraPersonChargePerHour: decimal("extra_person_charge_per_hour", {
      precision: 10,
      scale: 2,
    }).default("0"),
    hourlyTiers:
      jsonb("hourly_tiers").$type<Array<{ hours: number; price: number }>>(),
    basePricePerHour: decimal("base_price_per_hour", {
      precision: 10,
      scale: 2,
    }).default("0"),
    minimumHours: integer("minimum_hours").default(1),
    discountPercentage: integer("discount_percentage").default(0),
    facilities:
      jsonb("facilities").$type<
        Record<string, Array<{ name: string; icon?: string }>>
      >(),
    amenities: jsonb("amenities").$type<string[]>().default([]),
    policies: jsonb("policies").$type<{
      cancellation?: {
        type: "lenient" | "strict";
        rules: Array<{ cutoff: string; refund: string }>;
      };
    }>(),
    status: text("status", {
      enum: ["draft", "active", "inactive"],
    })
      .notNull()
      .default("draft"),
    approved: boolean("approved").notNull().default(false),
    bufferMinutes: integer("buffer_minutes").notNull().default(0),
    minBookingMinutes: integer("min_booking_minutes").notNull().default(60),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("rooms_merchantId_idx").on(table.merchantId),
    index("rooms_status_idx").on(table.status),
    index("rooms_district_idx").on(table.district),
  ]
);

export const roomPhotos = pgTable(
  "room_photos",
  {
    id: text("id").primaryKey(),
    roomId: text("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    isCover: boolean("is_cover").notNull().default(false),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("room_photos_roomId_idx").on(table.roomId),
    index("room_photos_isCover_idx").on(table.isCover),
  ]
);

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  merchant: one(user, {
    fields: [rooms.merchantId],
    references: [user.id],
  }),
  photos: many(roomPhotos),
}));

export const roomPhotosRelations = relations(roomPhotos, ({ one }) => ({
  room: one(rooms, {
    fields: [roomPhotos.roomId],
    references: [rooms.id],
  }),
}));
