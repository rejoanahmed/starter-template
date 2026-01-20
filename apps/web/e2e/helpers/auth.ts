import type { Page } from "@playwright/test";
import { test as baseTest } from "@playwright/test";

export async function createTestUser(page: Page) {
  await page.goto("/signup");
  await page.fill('[data-testid="name-input"]', "Test User");
  await page.fill(
    '[data-testid="email-input"]',
    `test-${Date.now()}@example.com`
  );
  await page.fill('[data-testid="password-input"]', "password123");
  await page.click('[data-testid="signup-button"]');
  await page.waitForURL("/host/listings");
}

export async function loginAsTestUser(page: Page) {
  await page.goto("/login");
  await page.fill(
    '[data-testid="email-input"]',
    `test-${Date.now()}@example.com`
  );
  await page.fill('[data-testid="password-input"]', "password123");
  await page.click('[data-testid="login-button"]');
  await page.waitForURL("/host/listings");
}

export async function createRoomListing(page: Page) {
  await page.goto("/host/create-listing");

  await page.fill('[data-testid="listing-title"]', `Test Room ${Date.now()}`);
  await page.fill(
    '[data-testid="listing-description"]',
    "A comfortable test space for gatherings."
  );
  await page.click('[data-testid="step-1-next"]');

  await page.click('[data-testid="amenity-wifi"]');
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

  await page.click('[data-testid="set-cover-0"]');
  await page.click('[data-testid="step-4-next"]');

  await page.fill('[data-testid="base-price"]', "100");
  await page.fill('[data-testid="minimum-hours"]', "2");
  await page.fill('[data-testid="discount-percentage"]', "0");
  await page.fill('[data-testid="included-guests"]', "4");
  await page.fill('[data-testid="max-guests"]', "8");
  await page.fill('[data-testid="extra-person-charge"]', "25");

  await page.click('[data-testid="step-5-next"]');
  await page.click('[data-testid="submit-listing"]');
  await page.waitForSelector('[data-testid="listing-success-message"]');

  return {
    id: `test-room-${Date.now()}`,
    title: await page.locator('[data-testid="listing-title"]').inputValue(),
  };
}

export const test = baseTest.extend;
