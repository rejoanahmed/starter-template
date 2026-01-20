# Stripe Webhooks Local Development Setup

## Prerequisites

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Or download from https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
   This will open your browser to authenticate with your Stripe account.

## Forwarding Webhooks to Local Server

### Option 1: Using Stripe CLI (Recommended)

1. Start your API server:
   ```bash
   cd apps/api
   bun run dev
   ```

2. In a separate terminal, forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```

3. The CLI will output a webhook signing secret that looks like:
   ```
   > Ready! Your webhook signing secret is whsec_xxxxx
   ```

4. **IMPORTANT**: Copy this secret and update your `.dev.vars` file:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```
   ⚠️ **The webhook secret from `stripe listen` is different from the one in Stripe Dashboard!**
   - Use the CLI secret (`whsec_...`) for local development
   - Use the Dashboard secret for production

5. **Production**: In production, Stripe may provide two webhook secrets:
   - **Snapshot secret** (for payment events) - use as `STRIPE_WEBHOOK_SECRET`
   - **Slim secret** (for account/Connect events) - use as `STRIPE_WEBHOOK_SECRET_SLIM` (optional)

   The webhook handler will automatically try both secrets if `STRIPE_WEBHOOK_SECRET_SLIM` is configured.

5. Restart your API server to pick up the new webhook secret.

6. You should now see webhooks being received. Check your API server logs for:
   ```
   [STRIPE WEBHOOK] Received event: account.updated
   [STRIPE WEBHOOK] Account updated: { ... }
   ```

### Option 2: Using the npm script (if added)

If we add a script to package.json, you can run:
```bash
cd apps/api
bun run stripe:listen
```

## Testing Webhooks

### Trigger test events

You can trigger test events from the Stripe CLI:

```bash
# Trigger account.updated event for a test account
stripe trigger account.updated

# Or trigger for a specific account ID
stripe trigger account.updated --account acct_xxxxx
```

### View webhook events

```bash
# View recent events
stripe events list

# View a specific event
stripe events retrieve evt_xxxxx
```

## Webhook Events We Listen To

- `account.updated` - Fires when Stripe Connect account status changes (onboarding, verification, etc.)
- `account.application.deauthorized` - Fires when a connected account is disconnected
- `checkout.session.completed` - Fires when a checkout session is completed

## Troubleshooting

### Webhook not received

1. Make sure your API server is running on port 3001
2. Check that `stripe listen` is running and forwarding to the correct URL
3. Verify the webhook secret in `.dev.vars` matches what Stripe CLI shows
4. Check API server logs for webhook errors

### Webhook signature verification fails

- Make sure you're using the webhook secret from `stripe listen` (starts with `whsec_`)
- Don't use the webhook secret from Stripe Dashboard (that's for production)
- Restart your API server after updating `.dev.vars`

### Testing with real Stripe Connect accounts

When testing with real accounts created through your app:
1. Use Stripe test mode (test API keys)
2. The webhook will be forwarded automatically by `stripe listen`
3. Check your API server logs to see the webhook being processed

## Production Setup

For production, you'll need to:
1. Set up a webhook endpoint in Stripe Dashboard
2. Point it to your production API URL: `https://your-api-domain.com/api/stripe/webhook`
3. Use the webhook signing secret from Stripe Dashboard (not from CLI)
4. Add it to your production environment variables
