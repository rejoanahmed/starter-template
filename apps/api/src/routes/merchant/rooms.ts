import type { AppBindings } from "@api/lib/types";
import { asc, desc, eq, roomPhotos, rooms } from "@starter/db";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { nanoid } from "nanoid";

const roomsRouter = new Hono<AppBindings>()
  // GET /api/merchant/rooms - List all rooms for authenticated merchant
  .get("/", async (c) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = c.get("db");
    const merchantRooms = await db.query.rooms.findMany({
      where: eq(rooms.merchantId, user.id),
      with: {
        photos: {
          orderBy: (photos) => [asc(photos.order)],
        },
      },
      orderBy: (rooms) => [desc(rooms.createdAt)],
    });

    return c.json({ rooms: merchantRooms });
  })

  // POST /api/merchant/rooms - Create a new room
  .post("/", async (c) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const formData = await c.req.formData();

    // Extract form fields
    const title = formData.get("title")?.toString()?.trim();
    const description = formData.get("description")?.toString()?.trim() || "";
    const address = formData.get("address")?.toString()?.trim();
    const district = formData.get("district")?.toString()?.trim();
    const latitude = formData.get("latitude")?.toString()?.trim();
    const longitude = formData.get("longitude")?.toString()?.trim();
    const includedGuests = Number.parseInt(
      formData.get("includedGuests")?.toString() || "1",
      10
    );
    const basePricePerHour = Number.parseFloat(
      formData.get("basePricePerHour")?.toString() || "0"
    );
    const minimumHours = Number.parseInt(
      formData.get("minimumHours")?.toString() || "1",
      10
    );
    const discountPercentage = Number.parseInt(
      formData.get("discountPercentage")?.toString() || "0",
      10
    );
    const maxGuests = Number.parseInt(
      formData.get("maxGuests")?.toString() || includedGuests.toString(),
      10
    );
    const extraPersonCharge = Number.parseFloat(
      formData.get("extraPersonCharge")?.toString() || "0"
    );
    const facilitiesStr = formData.get("facilities")?.toString() || "{}";
    const policiesStr = formData.get("policies")?.toString() || "{}";
    const coverId = formData.get("coverId")?.toString()?.trim();
    const imagesMetadataStr =
      formData.get("imagesMetadata")?.toString() || "[]";

    // Validate required fields
    if (!title) {
      throw new HTTPException(400, { message: "Title is required" });
    }
    if (!address) {
      throw new HTTPException(400, { message: "Address is required" });
    }
    if (!district) {
      throw new HTTPException(400, { message: "District is required" });
    }
    const hasLocation = latitude && longitude;
    if (!hasLocation) {
      throw new HTTPException(400, {
        message: "Location (latitude and longitude) is required",
      });
    }

    // Validate numeric values
    const lat = Number.parseFloat(latitude);
    const lng = Number.parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new HTTPException(400, {
        message: "Invalid latitude or longitude values",
      });
    }

    if (basePricePerHour <= 0) {
      throw new HTTPException(400, {
        message: "Base price per hour must be greater than 0",
      });
    }

    if (minimumHours < 1) {
      throw new HTTPException(400, {
        message: "Minimum hours must be at least 1",
      });
    }

    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new HTTPException(400, {
        message: "Discount percentage must be between 0 and 100",
      });
    }

    if (includedGuests < 1) {
      throw new HTTPException(400, {
        message: "Included guests must be at least 1",
      });
    }

    if (maxGuests < includedGuests) {
      throw new HTTPException(400, {
        message: "Maximum guests must be at least equal to included guests",
      });
    }

    // Parse JSON fields
    const hourlyTiers: Array<{ hours: number; price: number }> = [];

    if (basePricePerHour > 0 && minimumHours > 0) {
      for (let hours = minimumHours; hours <= 24; hours += 1) {
        const price =
          hours === minimumHours
            ? basePricePerHour
            : basePricePerHour *
              ((100 - discountPercentage) / 100) ** (hours - minimumHours);

        hourlyTiers.push({ hours, price: Math.round(price * 100) / 100 });
      }
    }

    let facilities: Record<string, Array<{ name: string; icon?: string }>> = {};
    try {
      facilities = JSON.parse(facilitiesStr);
    } catch (error) {
      console.error("[ROOMS] Failed to parse facilities:", error);
      // Invalid JSON, use empty object
    }

    let policies: {
      cancellation?: {
        type: "lenient" | "strict";
        rules: Array<{ cutoff: string; refund: string }>;
      };
    } = {};
    try {
      policies = JSON.parse(policiesStr);
    } catch (error) {
      console.error("[ROOMS] Failed to parse policies:", error);
      // Invalid JSON, use empty object
    }

    let imagesMetadata: Array<{
      tempId: string;
      width: number;
      height: number;
    }> = [];
    try {
      imagesMetadata = JSON.parse(imagesMetadataStr);
    } catch (error) {
      console.error("[ROOMS] Failed to parse imagesMetadata:", error);
      throw new HTTPException(400, {
        message: "Invalid images metadata format",
      });
    }

    // Get image files
    const imageFiles = formData.getAll("images") as File[];
    if (imageFiles.length === 0) {
      throw new HTTPException(400, {
        message: "At least one image is required",
      });
    }

    if (imageFiles.length !== imagesMetadata.length) {
      throw new HTTPException(400, {
        message: "Number of images does not match metadata",
      });
    }

    if (!coverId) {
      throw new HTTPException(400, { message: "Cover photo must be selected" });
    }

    // Verify coverId exists in metadata
    const coverExists = imagesMetadata.some((meta) => meta.tempId === coverId);
    if (!coverExists) {
      throw new HTTPException(400, {
        message: "Cover photo ID does not match any uploaded image",
      });
    }

    const db = c.get("db");
    const roomId = nanoid();

    // Upload images to R2
    const uploadedPhotos: Array<{
      id: string;
      url: string;
      width: number;
      height: number;
      isCover: boolean;
      order: number;
    }> = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const metadata = imagesMetadata[i];
      if (!metadata) {
        console.warn(`[ROOMS] Missing metadata for image ${i}`);
        continue;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        console.warn(`[ROOMS] Invalid file type for image ${i}: ${file.type}`);
        continue;
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop() || "jpg";
      const filename = `${roomId}/${nanoid()}.${fileExt}`;

      try {
        // Upload image to R2 - R2.put() returns metadata, not a URL
        const arrayBuffer = await file.arrayBuffer();
        await c.env.R2.put(filename, arrayBuffer, {
          httpMetadata: {
            contentType: file.type || "image/jpeg",
          },
        });

        // Construct URL - R2 doesn't provide URLs, we build it ourselves
        // Use R2_PUBLIC_URL env var if configured, otherwise serve through API route
        const url = c.env.R2_PUBLIC_URL
          ? `${c.env.R2_PUBLIC_URL}/${filename}`
          : `${new URL(c.req.url).origin}/api/merchant/rooms/images/${filename}`;

        const photoId = nanoid();
        const isCover = metadata.tempId === coverId;

        uploadedPhotos.push({
          id: photoId,
          url,
          width: metadata.width || 0,
          height: metadata.height || 0,
          isCover,
          order: i,
        });
      } catch (error) {
        console.error(`[ROOMS] Failed to upload image ${i}:`, error);
        throw new HTTPException(500, {
          message: `Failed to upload image: ${file.name}`,
        });
      }
    }

    if (uploadedPhotos.length === 0) {
      throw new HTTPException(400, {
        message: "No valid images were uploaded",
      });
    }

    // Ensure at least one cover photo
    const hasCover = uploadedPhotos.some((photo) => photo.isCover);
    if (!hasCover) {
      uploadedPhotos[0].isCover = true;
    }

    try {
      await db
        .insert(rooms)
        .values({
          id: roomId,
          merchantId: user.id,
          title,
          description,
          address,
          district,
          latitude,
          longitude,
          minGuests: 1,
          maxGuests: maxGuests || includedGuests || 1,
          includedGuests,
          extraPersonChargePerHour: extraPersonCharge.toString(),
          hourlyTiers,
          facilities,
          amenities: [],
          policies,
          status: "draft",
          approved: false,
          bufferMinutes: 0,
          minBookingMinutes: 60,
          basePricePerHour: basePricePerHour.toString(),
          minimumHours,
          discountPercentage,
        })
        .returning();

      // Insert photos
      if (uploadedPhotos.length > 0) {
        await db.insert(roomPhotos).values(
          uploadedPhotos.map((photo) => ({
            id: photo.id,
            roomId,
            url: photo.url,
            width: photo.width,
            height: photo.height,
            isCover: photo.isCover,
            order: photo.order,
          }))
        );
      }
    } catch (error) {
      console.error("[ROOMS] Database error:", error);
      // Cleanup uploaded files on error
      for (const photo of uploadedPhotos) {
        try {
          const url = new URL(photo.url);
          const key = url.pathname.replace("/api/merchant/rooms/images/", "");
          await c.env.R2.delete(key);
        } catch (cleanupError) {
          console.error("[ROOMS] Failed to cleanup file:", cleanupError);
        }
      }
      throw new HTTPException(500, {
        message: "Failed to create room listing",
      });
    }

    // Fetch complete room with photos
    const roomWithPhotos = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
      with: {
        photos: {
          orderBy: (photos) => [asc(photos.order)],
        },
      },
    });

    if (!roomWithPhotos) {
      throw new HTTPException(500, {
        message: "Room was created but could not be retrieved",
      });
    }

    return c.json(roomWithPhotos);
  })

  // PATCH /api/merchant/rooms/:id - Update room
  .patch("/:id", async (c) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const roomId = c.req.param("id");
    const body = await c.req.json();

    const db = c.get("db");

    // Verify room belongs to merchant
    const existingRoom = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
    });

    if (!existingRoom) {
      throw new HTTPException(404, { message: "Room not found" });
    }

    if (existingRoom.merchantId !== user.id) {
      throw new HTTPException(403, { message: "Forbidden" });
    }

    // Update room
    await db
      .update(rooms)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(rooms.id, roomId))
      .returning();

    // Fetch with photos
    const roomWithPhotos = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
      with: {
        photos: {
          orderBy: (photos) => [asc(photos.order)],
        },
      },
    });

    return c.json(roomWithPhotos);
  })

  // DELETE /api/merchant/rooms/:id - Delete room
  .delete("/:id", async (c) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const roomId = c.req.param("id");
    const db = c.get("db");

    // Verify room belongs to merchant
    const existingRoom = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
      with: {
        photos: true,
      },
    });

    if (!existingRoom) {
      throw new HTTPException(404, { message: "Room not found" });
    }

    if (existingRoom.merchantId !== user.id) {
      throw new HTTPException(403, { message: "Forbidden" });
    }

    // Delete photos from R2
    for (const photo of existingRoom.photos) {
      // Extract key from URL (remove base URL)
      const url = new URL(photo.url);
      const key = url.pathname.replace("/api/merchant/rooms/images/", "");
      await c.env.R2.delete(key);
    }

    // Delete room (cascade will delete photos from DB)
    await db.delete(rooms).where(eq(rooms.id, roomId));

    return c.json({ success: true });
  })

  // PATCH /api/merchant/rooms/:id/status - Update room status
  .patch("/:id/status", async (c) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const roomId = c.req.param("id");
    const body = await c.req.json();
    const { status } = body;

    if (!(status && ["draft", "active", "inactive"].includes(status))) {
      throw new HTTPException(400, {
        message: "Invalid status. Must be 'draft', 'active', or 'inactive'",
      });
    }

    const db = c.get("db");

    // Verify room belongs to merchant
    const existingRoom = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
    });

    if (!existingRoom) {
      throw new HTTPException(404, { message: "Room not found" });
    }

    if (existingRoom.merchantId !== user.id) {
      throw new HTTPException(403, { message: "Forbidden" });
    }

    // Update status
    await db
      .update(rooms)
      .set({
        status: status as "draft" | "active" | "inactive",
        updatedAt: new Date(),
      })
      .where(eq(rooms.id, roomId));

    // Fetch with photos
    const roomWithPhotos = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
      with: {
        photos: {
          orderBy: (photos) => [asc(photos.order)],
        },
      },
    });

    return c.json(roomWithPhotos);
  })

  // GET /api/merchant/rooms/images/:filename - Serve images from R2
  .get("/images/:filename{.+}", async (c) => {
    const filename = c.req.param("filename");

    if (!filename) {
      throw new HTTPException(400, { message: "Filename is required" });
    }

    try {
      // Get file from R2
      const object = await c.env.R2.get(filename);

      if (!object) {
        throw new HTTPException(404, { message: "File not found" });
      }

      // Get content type from object metadata or default to image/jpeg
      const contentType = object.httpMetadata?.contentType || "image/jpeg";

      // Return the file with appropriate headers
      return new Response(object.body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (error) {
      console.error("[ROOMS] Error serving image:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Failed to serve image" });
    }
  });

export default roomsRouter;
