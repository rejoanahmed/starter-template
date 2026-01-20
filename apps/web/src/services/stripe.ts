import { api } from "@web/lib/api-client";

export async function createStripeAccount() {
  const res = await api.api.stripe["create-account"].$post();
  if (!res.ok) {
    const error = (await res.json()) as { message?: string };
    throw new Error(error.message || "Failed to create Stripe account");
  }

  return (await res.json()) as { accountId: string; url: string };
}

export async function createStripeConnectLink(accountId: string) {
  const res = await api.api.stripe["get-onboarding-link"].$post({
    json: { stripeAccountId: accountId },
  });
  if (!res.ok) {
    const error = (await res.json()) as { message?: string };
    throw new Error(error.message || "Failed to create Stripe Connect link");
  }

  return (await res.json()) as { url: string };
}

export async function checkStripeStatus() {
  const res = await api.api.stripe["account-status"].$get();
  if (!res.ok) {
    const error = (await res.json()) as { message?: string };
    throw new Error(error.message || "Failed to check Stripe status");
  }

  return (await res.json()) as {
    hasAccount: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    stripeAccountId?: string | null;
  };
}

export async function deleteStripeAccount() {
  const res = await api.api.stripe.account.$delete();
  if (!res.ok) {
    const error = (await res.json()) as { message?: string };
    throw new Error(error.message || "Failed to delete Stripe account");
  }

  return (await res.json()) as { message: string; accountId: string };
}
