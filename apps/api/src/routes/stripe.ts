import type { AppBindings } from "@api/lib/types";
import { eq, user as userTable } from "@starter/db";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

// Regex patterns for URL validation
const localhostPattern = /localhost|127\.0\.0\.1|0\.0\.0\.0/;
const trailingSlashPattern = /\/+$/;

const stripeRouter = new Hono<AppBindings>()

  .post("/create-account", async (c) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      throw new HTTPException(500, { message: "Stripe not configured" });
    }

    // Use BETTER_AUTH_URL as base URL, fallback to request origin if not available
    // Stripe requires a valid URL format for business_profile.url
    // Note: Stripe validates that the URL is accessible, so localhost URLs will fail
    let baseUrl: string;

    try {
      const authUrl = c.env.BETTER_AUTH_URL;
      const requestOrigin = new URL(c.req.url).origin;

      // Prefer BETTER_AUTH_URL, but validate it's not localhost
      if (authUrl && !localhostPattern.test(authUrl)) {
        const urlObj = new URL(authUrl);
        baseUrl = `${urlObj.protocol}//${urlObj.host}`;
      } else if (requestOrigin && !localhostPattern.test(requestOrigin)) {
        baseUrl = requestOrigin;
      } else {
        // Use fallback for local development - Stripe will reject localhost URLs
        baseUrl = "https://spotfinderce.com";
      }
    } catch (error) {
      console.error("[STRIPE] Error constructing base URL:", error);
      // Fallback to a placeholder URL if neither is valid
      baseUrl = "https://spotfinderce.com";
    }

    // Construct the business profile URL - Stripe requires a valid, accessible URL
    // Use just the base URL without path, as Stripe validates the URL is accessible
    // Ensure it's a clean string without any extra characters
    let businessUrl: string;
    try {
      // Validate and normalize the URL one more time
      const urlObj = new URL(baseUrl);
      businessUrl = `${urlObj.protocol}//${urlObj.host}`;
      // Remove any trailing slashes
      businessUrl = businessUrl.replace(trailingSlashPattern, "");
    } catch {
      businessUrl = "https://spotfinderce.com";
    }

    console.log("[STRIPE] Creating account with business URL:", businessUrl);
    console.log(
      "[STRIPE] URL type:",
      typeof businessUrl,
      "Length:",
      businessUrl.length
    );

    try {
      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(STRIPE_SECRET_KEY);

      const account = await stripe.accounts.create({
        type: "express",
        country: "HK",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        business_profile: {
          url: businessUrl,
          mcc: "7011",
        },
      });

      const db = c.get("db");

      await db
        .update(userTable)
        .set({
          stripeAccountId: account.id,
          chargesEnabled: false,
          payoutsEnabled: false,
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, user.id));

      // Get web app URL for redirects (web app runs on port 3000, API on 3001)
      let webAppUrl: string;
      if (c.env.WEB_APP_URL) {
        webAppUrl = c.env.WEB_APP_URL;
      } else {
        // Fallback: try to derive from CORS_ORIGINS or use localhost:3000
        const corsOrigins =
          c.env.CORS_ORIGINS?.split(",").map((o) => o.trim()) || [];
        const webOrigin = corsOrigins.find(
          (origin) => origin.includes(":3000") || origin.includes("localhost")
        );
        webAppUrl = webOrigin || "http://localhost:3000";
      }

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${webAppUrl}/host/listings`,
        return_url: `${webAppUrl}/host/listings?onboarding=complete`,
        type: "account_onboarding",
        collect: "eventually_due",
      });

      return c.json({
        accountId: account.id,
        url: accountLink.url,
      });
    } catch (error) {
      console.error("[STRIPE] Error creating account:", error);

      // Check for specific Stripe errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        // Platform profile not completed error
        if (
          errorMessage.includes("complete your platform profile") ||
          errorMessage.includes("platform profile to use connect")
        ) {
          throw new HTTPException(400, {
            message:
              "Stripe platform profile not completed. Please complete the platform questionnaire in your Stripe Dashboard: https://dashboard.stripe.com/connect/accounts/overview",
          });
        }

        // Log detailed error info if available
        if ("raw" in error) {
          const stripeError = error as {
            raw?: { param?: string; message?: string; code?: string };
          };
          console.error("[STRIPE] Stripe error details:", {
            param: stripeError.raw?.param,
            message: stripeError.raw?.message,
            code: stripeError.raw?.code,
            businessUrl,
          });
        }
      }

      throw new HTTPException(500, {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create Stripe Connect account",
      });
    }
  })

  .post("/get-onboarding-link", async (c) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      throw new HTTPException(500, { message: "Stripe not configured" });
    }

    const { stripeAccountId } = await c.req.json();

    if (!stripeAccountId) {
      throw new HTTPException(400, { message: "Stripe account ID required" });
    }

    // Use BETTER_AUTH_URL as base URL, fallback to request origin if not available
    let baseUrl: string;
    try {
      baseUrl = c.env.BETTER_AUTH_URL || new URL(c.req.url).origin;
      // Ensure it's a valid URL
      new URL(baseUrl);
    } catch {
      // Fallback to a placeholder URL if neither is valid
      baseUrl = "https://spotfinder.app";
    }

    try {
      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(STRIPE_SECRET_KEY);
      const account = await stripe.accounts.retrieve(stripeAccountId);

      if (!account || ("deleted" in account && account.deleted)) {
        throw new HTTPException(404, { message: "Stripe account not found" });
      }

      // Get web app URL for redirects (web app runs on port 3000, API on 3001)
      let webAppUrl: string;
      if (c.env.WEB_APP_URL) {
        webAppUrl = c.env.WEB_APP_URL;
      } else {
        // Fallback: try to derive from CORS_ORIGINS or use localhost:3000
        const corsOrigins =
          c.env.CORS_ORIGINS?.split(",").map((o) => o.trim()) || [];
        const webOrigin = corsOrigins.find(
          (origin) => origin.includes(":3000") || origin.includes("localhost")
        );
        webAppUrl = webOrigin || "http://localhost:3000";
      }

      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${webAppUrl}/host/listings`,
        return_url: `${webAppUrl}/host/listings?onboarding=complete`,
        type: "account_onboarding",
        collect: "eventually_due",
      });

      return c.json({
        url: accountLink.url,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      });
    } catch (error) {
      console.error("[STRIPE] Error getting onboarding link:", error);
      throw new HTTPException(500, {
        message: "Failed to get onboarding link",
      });
    }
  })

  .post("/webhook", async (c) => {
    console.log("[STRIPE WEBHOOK] Webhook received");

    const STRIPE_WEBHOOK_SECRET = c.env.STRIPE_WEBHOOK_SECRET;
    const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error("[STRIPE WEBHOOK] STRIPE_WEBHOOK_SECRET not configured");
      throw new HTTPException(500, {
        message: "Stripe webhook secret not configured",
      });
    }

    const body = await c.req.text();
    const sig = c.req.header("stripe-signature");

    console.log("[STRIPE WEBHOOK] Headers:", {
      hasSignature: !!sig,
      signatureLength: sig?.length || 0,
      bodyLength: body.length,
    });

    if (!sig) {
      console.error("[STRIPE WEBHOOK] Missing stripe-signature header");
      return c.json({ error: "No signature" }, 400);
    }

    try {
      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(STRIPE_SECRET_KEY);

      // Try multiple secrets: primary (snapshot), then slim (thin/account events)
      // In production, Stripe may provide separate secrets for different event types
      const STRIPE_WEBHOOK_SECRET_SLIM = c.env.STRIPE_WEBHOOK_SECRET_SLIM;
      const secretsToTry = [
        STRIPE_WEBHOOK_SECRET,
        ...(STRIPE_WEBHOOK_SECRET_SLIM ? [STRIPE_WEBHOOK_SECRET_SLIM] : []),
      ];

      // Use constructEventAsync for Cloudflare Workers (async crypto required)
      let event: Awaited<
        ReturnType<typeof stripe.webhooks.constructEventAsync>
      > | null = null;
      let lastError: Error | null = null;

      for (const secret of secretsToTry) {
        try {
          event = await stripe.webhooks.constructEventAsync(body, sig, secret);
          console.log(
            `[STRIPE WEBHOOK] Signature verified with ${secret === STRIPE_WEBHOOK_SECRET ? "primary" : "slim"} secret`
          );
          break;
        } catch (sigError) {
          lastError =
            sigError instanceof Error ? sigError : new Error(String(sigError));
          // Try next secret
        }
      }

      if (!event) {
        console.error(
          "[STRIPE WEBHOOK] Signature verification failed with all secrets:",
          lastError
        );
        if (lastError instanceof Error) {
          console.error("[STRIPE WEBHOOK] Last error:", lastError.message);
        }
        return c.json({ error: "Invalid signature" }, 400);
      }

      const db = c.get("db");

      // Log the event type for debugging
      console.log("[STRIPE WEBHOOK] Received event:", event.type);

      switch (event.type) {
        case "account.updated": {
          const account = event.data.object;

          if (!account.id) {
            console.warn(
              "[STRIPE WEBHOOK] Account updated event missing account ID"
            );
            return c.json({ received: true });
          }

          // Find the user with this Stripe account
          const user = await db.query.user.findFirst({
            where: eq(userTable.stripeAccountId, account.id),
          });

          if (!user) {
            console.warn(
              `[STRIPE WEBHOOK] Account updated for unknown account: ${account.id}`
            );
            return c.json({ received: true });
          }

          // Update database with latest status
          await db
            .update(userTable)
            .set({
              chargesEnabled: account.charges_enabled ?? false,
              payoutsEnabled: account.payouts_enabled ?? false,
              updatedAt: new Date(),
            })
            .where(eq(userTable.stripeAccountId, account.id));

          // Log detailed status for debugging
          const isFullyOnboarded =
            account.charges_enabled && account.payouts_enabled;
          const detailsSubmitted =
            "details_submitted" in account
              ? account.details_submitted
              : undefined;

          console.log("[STRIPE WEBHOOK] Account updated:", {
            accountId: account.id,
            userId: user.id,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            detailsSubmitted,
            fullyOnboarded: isFullyOnboarded,
            requirements:
              "requirements" in account
                ? {
                    currentlyDue:
                      account.requirements?.currently_due?.length || 0,
                    eventuallyDue:
                      account.requirements?.eventually_due?.length || 0,
                    pastDue: account.requirements?.past_due?.length || 0,
                  }
                : undefined,
          });

          break;
        }

        case "checkout.session.completed": {
          const session = event.data.object;
          console.log("[STRIPE WEBHOOK] Checkout completed:", session.id);

          const { stripeAccountId } = await c.req.json();

          await db
            .update(userTable)
            .set({
              chargesEnabled: true,
              payoutsEnabled: true,
              updatedAt: new Date(),
            })
            .where(eq(userTable.stripeAccountId, stripeAccountId));

          break;
        }

        case "account.application.deauthorized": {
          const accountId = (event as { account?: string }).account;

          if (!accountId) {
            console.warn(
              "[STRIPE WEBHOOK] Account deauthorized event missing account ID"
            );
            return c.json({ received: true });
          }

          await db
            .update(userTable)
            .set({
              stripeAccountId: null,
              chargesEnabled: false,
              payoutsEnabled: false,
              updatedAt: new Date(),
            })
            .where(eq(userTable.stripeAccountId, accountId));

          console.log("[STRIPE WEBHOOK] Account deauthorized:", accountId);
          break;
        }

        case "account.application.authorized": {
          // Account was authorized/connected - just log it
          const accountId = (event as { account?: string }).account;
          console.log("[STRIPE WEBHOOK] Account authorized:", accountId);
          // Status will be updated by account.updated event
          break;
        }

        default:
          console.log("[STRIPE WEBHOOK] Unhandled event type:", event.type);
      }

      return c.json({ received: true });
    } catch (error) {
      console.error("[STRIPE WEBHOOK] Error processing webhook:", error);
      if (error instanceof Error) {
        console.error("[STRIPE WEBHOOK] Error message:", error.message);
        console.error("[STRIPE WEBHOOK] Error stack:", error.stack);
      }
      // Return 200 to Stripe even on error to prevent retries for known issues
      // Log the error for debugging
      return c.json(
        {
          error: "Webhook processing failed",
          message: error instanceof Error ? error.message : String(error),
        },
        200
      );
    }
  })

  .get("/account-status", async (c) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = c.get("db");

    const userWithStripe = await db.query.user.findFirst({
      where: eq(userTable.id, user.id),
    });

    const chargesEnabled = userWithStripe?.chargesEnabled ?? false;
    const payoutsEnabled = userWithStripe?.payoutsEnabled ?? false;
    const hasAccount = !!userWithStripe?.stripeAccountId;

    return c.json({
      hasAccount,
      chargesEnabled,
      payoutsEnabled,
      stripeAccountId: userWithStripe?.stripeAccountId,
    });
  })

  .delete("/account", async (c) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const db = c.get("db");
    const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;

    if (!STRIPE_SECRET_KEY) {
      throw new HTTPException(500, { message: "Stripe not configured" });
    }

    // Get user's current Stripe account
    const userWithStripe = await db.query.user.findFirst({
      where: eq(userTable.id, user.id),
    });

    if (!userWithStripe?.stripeAccountId) {
      return c.json({ message: "No Stripe account to delete" });
    }

    const accountId = userWithStripe.stripeAccountId;

    try {
      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(STRIPE_SECRET_KEY);

      // Delete the account (this will also deauthorize it)
      // Note: In test mode, accounts can be deleted. In live mode, you'd typically deauthorize instead.
      try {
        await stripe.accounts.del(accountId);
        console.log(`[STRIPE] Deleted account: ${accountId}`);
      } catch (stripeError) {
        // If account doesn't exist or already deleted, that's fine
        console.log(
          "[STRIPE] Account deletion result:",
          stripeError instanceof Error
            ? stripeError.message
            : String(stripeError)
        );
      }
    } catch (error) {
      console.error("[STRIPE] Error deleting account:", error);
      // Continue to clear from database even if Stripe deletion fails
    }

    // Clear from database
    await db
      .update(userTable)
      .set({
        stripeAccountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, user.id));

    console.log(
      "[STRIPE] Cleared Stripe account from database for user:",
      user.id
    );

    return c.json({
      message: "Stripe account deleted and cleared",
      accountId,
    });
  });

export default stripeRouter;
