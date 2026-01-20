import type { AppBindings } from "@api/lib/types";
import { and, bookings, eq, gte, lte, rooms } from "@starter/db";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const bookingsRouter = new Hono<AppBindings>()

  .get("/today", async (c) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = c.get("db");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const todayBookings = await db
      .select({
        id: bookings.id,
        startTime: bookings.startTime,
        guestCount: bookings.guestCount,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        specialRequests: bookings.specialRequests,
        room: {
          title: rooms.title,
        },
      })
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .where(
        and(
          eq(bookings.merchantId, user.id),
          gte(bookings.startTime, today),
          lte(bookings.startTime, tomorrow),
          eq(bookings.status, "confirmed")
        )
      )
      .orderBy(bookings.startTime)
      .limit(50);

    return c.json({ bookings: todayBookings });
  })

  .get("/merchant/:roomId", async (c) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const roomId = c.req.param("roomId");
    const db = c.get("db");

    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
      with: {
        photos: true,
      },
    });

    if (!room || room.merchantId !== user.id) {
      throw new HTTPException(404, { message: "Room not found" });
    }

    const roomBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.roomId, roomId),
          eq(bookings.merchantId, user.id),
          eq(bookings.status, "confirmed"),
          gte(bookings.startTime, new Date())
        )
      )
      .orderBy(bookings.startTime)
      .limit(50);

    return c.json({
      room,
      bookings: roomBookings,
    });
  })

  .get("/upcoming", async (c) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = c.get("db");

    const upcomingBookings = await db
      .select()
      .from(bookings)
      .leftJoin(rooms, eq(bookings.roomId, rooms.id))
      .where(
        and(
          eq(bookings.merchantId, user.id),
          eq(bookings.status, "confirmed"),
          gte(bookings.startTime, new Date())
        )
      )
      .orderBy(bookings.startTime)
      .limit(50);

    return c.json({ bookings: upcomingBookings });
  });

export default bookingsRouter;
