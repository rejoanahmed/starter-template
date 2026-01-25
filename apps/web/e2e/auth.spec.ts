import { expect, test } from "@playwright/test";
import { TEST_ORG_ID, TEST_TEAM_ID } from "./utils/seed-org";

// Runs in "authenticated" project only (playwright.config.ts testMatch).

test("any user can access home page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Spotfinder/);
});

test("authenticated user with active org is redirected to org home", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveURL(new RegExp(`/org/${TEST_ORG_ID}`));
  await expect(page.getByRole("heading", { name: /my issues/i })).toBeVisible();
});

test("My Issues page shows empty state or table", async ({ page }) => {
  await page.goto(`/org/${TEST_ORG_ID}`);

  await expect(page.getByRole("heading", { name: /my issues/i })).toBeVisible();
  await expect(page.getByText(/no issues assigned|title/i)).toBeVisible();
});

test("Board page shows columns", async ({ page }) => {
  await page.goto(`/org/${TEST_ORG_ID}/team/${TEST_TEAM_ID}/board`);

  await expect(page.getByRole("heading", { name: /board/i })).toBeVisible();
  await expect(page.getByText(/todo/i)).toBeVisible();
  await expect(page.getByText(/in progress/i)).toBeVisible();
  await expect(page.getByText(/done/i)).toBeVisible();
});

test("Team Issues page shows New issue and table", async ({ page }) => {
  await page.goto(`/org/${TEST_ORG_ID}/team/${TEST_TEAM_ID}/issues`);

  await expect(
    page.getByRole("heading", { name: /team issues/i })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /new issue/i })).toBeVisible();
});

test("can create issue from Team Issues page", async ({ page }) => {
  await page.goto(`/org/${TEST_ORG_ID}/team/${TEST_TEAM_ID}/issues`);

  await page.getByRole("button", { name: /new issue/i }).click();
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: /new issue/i })
  ).toBeVisible();

  await page
    .getByRole("dialog")
    .getByPlaceholder(/title/i)
    .fill("E2E test issue");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /create issue/i })
    .click();

  await expect(page.getByText(/issue created/i)).toBeVisible();
});
