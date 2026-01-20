import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@web/components/ui/alert-dialog";
import { Button } from "@web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@web/components/ui/card";
import { authClient } from "@web/lib/auth-client";
import {
  checkStripeStatus,
  createStripeAccount,
  createStripeConnectLink,
  deleteStripeAccount,
} from "@web/services/stripe";
import {
  CheckCircle2,
  ExternalLink,
  Mail,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/host/account")({
  component: AccountPage,
});

function AccountPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: stripeStatus } = useQuery({
    queryKey: ["stripe-status"],
    queryFn: checkStripeStatus,
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteStripeAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stripe-status"] });
      toast.success("Stripe account deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete Stripe account"
      );
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  const handleStripeConnect = () => {
    setIsConnecting(true);
    (async () => {
      try {
        if (stripeStatus?.stripeAccountId) {
          const { url } = await createStripeConnectLink(
            stripeStatus.stripeAccountId
          );
          window.location.href = url;
        } else {
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
    })();
  };

  const handleDeleteAccount = () => {
    setIsDeleting(true);
    deleteAccountMutation.mutate();
  };

  const isStripeComplete =
    stripeStatus?.hasAccount &&
    stripeStatus?.chargesEnabled &&
    stripeStatus?.payoutsEnabled;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-gray-600">
          Manage your account information and payment settings
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Account Information
          </CardTitle>
          <CardDescription>Your personal account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {user?.image && (
              <Image
                alt={user.name || "User"}
                className="size-16 rounded-full object-cover"
                height={64}
                src={user.image}
                width={64}
              />
            )}
            <div className="flex-1">
              <div className="font-semibold text-lg">
                {user?.name || "No name"}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="size-4" />
                <span>{user?.email || "No email"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Connect Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isStripeComplete ? (
              <CheckCircle2 className="size-5 text-green-600" />
            ) : (
              <XCircle className="size-5 text-amber-600" />
            )}
            Stripe Connect
          </CardTitle>
          <CardDescription>
            Payment processing account for receiving payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Account Status</span>
              <span
                className={`text-sm font-medium ${
                  isStripeComplete ? "text-green-600" : "text-amber-600"
                }`}
              >
                {isStripeComplete ? "Active" : "Incomplete"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Account ID</span>
              <span className="text-sm font-mono text-gray-900">
                {stripeStatus?.stripeAccountId || "Not set up"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Charges Enabled</span>
              {stripeStatus?.chargesEnabled ? (
                <CheckCircle2 className="size-4 text-green-600" />
              ) : (
                <XCircle className="size-4 text-gray-400" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payouts Enabled</span>
              {stripeStatus?.payoutsEnabled ? (
                <CheckCircle2 className="size-4 text-green-600" />
              ) : (
                <XCircle className="size-4 text-gray-400" />
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {!isStripeComplete && (
              <Button
                className="flex-1"
                disabled={isConnecting}
                onClick={handleStripeConnect}
                variant="default"
              >
                <ExternalLink className="mr-2 size-4" />
                {isConnecting
                  ? "Connecting..."
                  : stripeStatus?.hasAccount
                    ? "Complete Setup"
                    : "Set Up Stripe"}
              </Button>
            )}
            {stripeStatus?.hasAccount && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="flex-1"
                    disabled={isDeleting}
                    variant="destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Stripe Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete your Stripe account? This
                      will disconnect it from your account and you'll need to
                      set it up again. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={handleDeleteAccount}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
