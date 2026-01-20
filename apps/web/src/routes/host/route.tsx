import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { HostNavigation } from "@web/components/host/HostNavigation";
import { Button } from "@web/components/ui/button";
import {
  checkStripeStatus,
  createStripeAccount,
  createStripeConnectLink,
} from "@web/services/stripe";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/host")({
  beforeLoad({ context, location }) {
    // Check if user is authenticated
    if (!context.session) {
      throw redirect({
        to: "/login",
        search: { redirectUri: location.href },
      });
    }
    // TODO: Add additional checks here if needed
    // e.g., check if user has merchant/host profile, permissions, etc.
  },
  component: HostLayout,
});

function HostLayout() {
  const router = useRouterState();
  const navigate = useNavigate();
  const currentPath = router.location.pathname;
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: stripeStatus } = useQuery({
    queryKey: ["stripe-status"],
    queryFn: checkStripeStatus,
  });

  // Redirect /host to /host/today
  useEffect(() => {
    if (currentPath === "/host" || currentPath === "/host/") {
      navigate({ to: "/host/today", replace: true });
    }
  }, [currentPath, navigate]);

  const handleStripeConnect = async () => {
    try {
      setIsConnecting(true);

      if (stripeStatus?.stripeAccountId) {
        const { url } = await createStripeConnectLink(
          stripeStatus.stripeAccountId
        );
        window.location.href = url;
      } else {
        // No account, create one
        const { url } = await createStripeAccount();
        window.location.href = url;
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start Stripe Connect onboarding"
      );
      setIsConnecting(false);
    }
  };

  const needsStripeSetup = stripeStatus
    ? !(
        stripeStatus.hasAccount &&
        stripeStatus.chargesEnabled &&
        stripeStatus.payoutsEnabled
      )
    : true;

  return (
    <div className="min-h-screen bg-gray-50">
      <HostNavigation />
      {needsStripeSetup && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="text-amber-600 text-lg sm:text-xl shrink-0">
                  💰
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-amber-900 mb-1 text-sm sm:text-base">
                    {stripeStatus?.hasAccount
                      ? "Complete your Stripe Connect setup"
                      : "Set up Stripe Connect to receive payments"}
                  </div>
                  <p className="text-xs sm:text-sm text-amber-800">
                    {stripeStatus?.hasAccount
                      ? "Your Stripe account needs additional information to enable payments and payouts."
                      : "Connect your Stripe account to accept payments and receive payouts directly to your bank account."}
                  </p>
                </div>
              </div>
              <Button
                className="shrink-0 w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                disabled={isConnecting}
                onClick={handleStripeConnect}
                variant="default"
              >
                <ExternalLink className="mr-2 size-3 sm:size-4" />
                {isConnecting
                  ? "Connecting..."
                  : stripeStatus?.hasAccount
                    ? "Complete Setup"
                    : "Set Up Stripe"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
