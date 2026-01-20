import type { Page } from "@playwright/test";

export async function navigateToCreateListing(page: Page) {
  await page.goto("/host/create-listing");
}
