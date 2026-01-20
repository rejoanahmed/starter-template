import { expect, test } from "@playwright/test";

test("any user can access home page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Spotfinder/);
});

test("authenticated user has access to host routes", async ({ page }) => {
  await page.goto("/host/today");

  await expect(page.locator("h1")).toContainText("Today");
});
