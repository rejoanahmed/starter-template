import { expect, test } from "@playwright/test";
import {
  createRoomListing,
  createTestUser,
  loginAsTestUser,
} from "./helpers/auth";
import { navigateToCreateListing } from "./helpers/navigation";

test.describe("Host Listing Management", () => {
  test.beforeEach(async ({ page }) => {
    await createTestUser(page);
    await loginAsTestUser(page);
  });

  test("should create a listing via multi-step flow", async ({ page }) => {
    await navigateToCreateListing(page);

    await page.fill('[data-testid="listing-title"]', "Cozy Test Room");
    await page.fill(
      '[data-testid="listing-description"]',
      "A comfortable and well-lit space perfect for small gatherings and work sessions."
    );
    await page.click('[data-testid="step-1-next"]');
    await expect(
      page.locator('[data-testid="step-indicator-2"]')
    ).toBeVisible();

    await page.click('[data-testid="amenity-wifi"]');
    await page.click('[data-testid="amenity-aircon"]');
    await page.click('[data-testid="amenity-tv"]');
    await page.click('[data-testid="step-2-next"]');
    await expect(
      page.locator('[data-testid="step-indicator-3"]')
    ).toBeVisible();

    await page.fill('[data-testid="address-search"]', "Jakarta, Indonesia");
    await page.waitForSelector('[data-testid="location-suggestions"]');
    await page.click('[data-testid="location-suggestion"]:first-child');
    await expect(
      page.locator('[data-testid="location-confirmed"]')
    ).toBeVisible();
    await page.click('[data-testid="step-3-next"]');
    await expect(
      page.locator('[data-testid="step-indicator-4"]')
    ).toBeVisible();

    const files = [
      "tests/fixtures/room1.jpg",
      "tests/fixtures/room2.jpg",
      "tests/fixtures/room3.jpg",
      "tests/fixtures/room4.jpg",
      "tests/fixtures/room5.jpg",
    ];

    for (const file of files) {
      const fileInput = page.locator('[data-testid="photo-upload"]');
      await fileInput.setInputFiles(file);
      await page.waitForTimeout(500);
    }

    await page.click('[data-testid="set-cover-0"]');
    await page.click('[data-testid="step-4-next"]');
    await expect(
      page.locator('[data-testid="step-indicator-5"]')
    ).toBeVisible();

    await page.fill('[data-testid="base-price"]', "150");
    await page.fill('[data-testid="minimum-hours"]', "2");
    await page.fill('[data-testid="discount-percentage"]', "10");
    await page.fill('[data-testid="included-guests"]', "4");
    await page.fill('[data-testid="max-guests"]', "8");
    await page.fill('[data-testid="extra-person-charge"]', "25");

    await expect(page.locator('[data-testid="sample-price"]')).toContainText(
      "HKD"
    );

    await page.click('[data-testid="step-5-next"]');
    await expect(
      page.locator('[data-testid="step-indicator-6"]')
    ).toBeVisible();

    await expect(page.locator('[data-testid="review-title"]')).toContainText(
      "Cozy Test Room"
    );
    await expect(
      page.locator('[data-testid="review-description"]')
    ).toContainText("comfortable and well-lit space");
    await expect(
      page.locator('[data-testid="review-photos-count"]')
    ).toContainText("5");
    await expect(
      page.locator('[data-testid="review-base-price"]')
    ).toContainText("HKD 150/hour");
    await expect(
      page.locator('[data-testid="review-sample-price"]')
    ).toContainText("HKD");

    await page.click('[data-testid="submit-listing"]');
    await expect(
      page.locator('[data-testid="listing-success-message"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="stripe-connect-prompt"]')
    ).toBeVisible();
  });

  test("should enforce 5-photo minimum", async ({ page }) => {
    await navigateToCreateListing(page);

    await page.fill('[data-testid="listing-title"]', "Test Room");
    await page.fill('[data-testid="listing-description"]', "Test description");
    await page.click('[data-testid="step-1-next"]');

    const files = [
      "tests/fixtures/room1.jpg",
      "tests/fixtures/room2.jpg",
      "tests/fixtures/room3.jpg",
    ];
    await page.locator('[data-testid="photo-upload"]').setInputFiles(files);
    await page.click('[data-testid="set-cover-0"]');

    await page.click('[data-testid="step-4-next"]');
    await expect(page.locator('[data-testid="photo-error"]')).toContainText(
      "Add 2 more photos to continue"
    );
  });

  test("should validate pricing formula correctly", async ({ page }) => {
    await navigateToCreateListing(page);

    await page.fill('[data-testid="listing-title"]', "Test Room");
    await page.fill('[data-testid="listing-description"]', "Test");
    await page.click('[data-testid="step-1-next"]');
    await page.click('[data-testid="step-2-next"]');

    await page.fill('[data-testid="address-search"]', "Jakarta, Indonesia");
    await page.waitForSelector('[data-testid="location-suggestions"]');
    await page.click('[data-testid="location-suggestion"]:first-child');
    await page.click('[data-testid="step-3-next"]');

    const files = [
      "tests/fixtures/room1.jpg",
      "tests/fixtures/room2.jpg",
      "tests/fixtures/room3.jpg",
      "tests/fixtures/room4.jpg",
      "tests/fixtures/room5.jpg",
    ];

    for (const file of files) {
      const fileInput = page.locator('[data-testid="photo-upload"]');
      await fileInput.setInputFiles(file);
      await page.waitForTimeout(500);
    }

    await page.click('[data-testid="step-4-next"]');

    await page.fill('[data-testid="base-price"]', "100");
    await page.fill('[data-testid="minimum-hours"]', "2");
    await page.fill('[data-testid="discount-percentage"]', "50");
    await page.fill('[data-testid="included-guests"]', "2");
    await page.fill('[data-testid="max-guests"]', "4");
    await page.fill('[data-testid="extra-person-charge"]', "20");

    await expect(page.locator('[data-testid="sample-price"]')).toContainText(
      "HKD 270.00"
    );
  });

  test("should show created listing in host listings page", async ({
    page,
  }) => {
    const room = await createRoomListing(page);

    await page.goto("/host/listings");

    await expect(
      page.locator('[data-testid="room-card"]').first()
    ).toContainText(room.title);
    await expect(page.locator('[data-testid="room-status"]')).toContainText(
      "Pending Approval"
    );
    await expect(
      page.locator('[data-testid="room-edit-button"]')
    ).toBeVisible();
  });

  test("should prevent unauthorized edit/delete", async ({ page }) => {
    const room = await createRoomListing(page);
    const roomUrl = `/host/listings/${room.id}/edit`;

    await page.goto("/logout");
    await page.goto(roomUrl);

    await expect(page).toHaveURL("/login");
  });

  test("should show today's bookings in agenda-style calendar", async ({
    page,
  }) => {
    await page.goto("/host/today");

    await expect(page.locator('[data-testid="today-header"]')).toContainText(
      "Today's Schedule"
    );

    const bookingCards = page.locator('[data-testid="booking-card"]');
    if ((await bookingCards.count()) > 0) {
      await expect(
        page.locator('[data-testid="time-group-morning"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="time-group-afternoon"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="time-group-evening"]')
      ).toBeVisible();
    }
  });
});

test.describe("Listing Creation Edge Cases", () => {
  test("should validate required fields in each step", async ({ page }) => {
    await navigateToCreateListing(page);

    await page.click('[data-testid="step-1-next"]');
    await expect(page.locator('[data-testid="title-error"]')).toBeVisible();

    await page.fill('[data-testid="listing-title"]', "Valid Title");
    await page.click('[data-testid="step-1-next"]');
    await expect(page.locator('[data-testid="title-error"]')).not.toBeVisible();

    await page.click('[data-testid="step-2-next"]');
    await page.click('[data-testid="step-3-next"]');
    await expect(page.locator('[data-testid="address-error"]')).toBeVisible();
  });

  test("should handle file upload errors gracefully", async ({ page }) => {
    await navigateToCreateListing(page);

    await page.fill('[data-testid="listing-title"]', "Test Room");
    await page.fill('[data-testid="listing-description"]', "Test");
    await page.click('[data-testid="step-1-next"]');
    await page.click('[data-testid="step-2-next"]');

    await page.fill('[data-testid="address-search"]', "Jakarta, Indonesia");
    await page.waitForSelector('[data-testid="location-suggestions"]');
    await page.click('[data-testid="location-suggestion"]:first-child');
    await page.click('[data-testid="step-3-next"]');

    const fileInput = page.locator('[data-testid="photo-upload"]');
    await fileInput.setInputFiles(["tests/fixtures/invalid.txt"]);

    await expect(page.locator('[data-testid="upload-error"]')).toContainText(
      "Only image files are allowed"
    );
  });
});
