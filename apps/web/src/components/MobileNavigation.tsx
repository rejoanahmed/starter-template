import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@web/components/ui/sheet";
import { authClient } from "@web/lib/auth-client";
import { cn } from "@web/lib/utils";
import {
  checkStripeStatus,
  createStripeAccount,
  createStripeConnectLink,
  deleteStripeAccount,
} from "@web/services/stripe";
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  Heart,
  Home,
  List,
  LogOut,
  Mail,
  MessageSquare,
  Search,
  Settings,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function MobileNavigation() {
  const { t } = useTranslation();
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const isHostRoute = currentPath.startsWith("/host");
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isAuthenticated = !!user;
  const [redirectUri, setRedirectUri] = useState("/");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const routerInstance = useRouter();

  const { data: stripeStatus } = useQuery({
    queryKey: ["stripe-status"],
    queryFn: checkStripeStatus,
    enabled: isAuthenticated,
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

  useEffect(() => {
    setRedirectUri(window?.location?.href);
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      routerInstance.invalidate();
      routerInstance.navigate({ to: "/", reloadDocument: true });
      setUserMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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

  const hasStripeAccount = !!stripeStatus?.hasAccount;
  const isStripeComplete =
    stripeStatus?.hasAccount &&
    stripeStatus?.chargesEnabled &&
    stripeStatus?.payoutsEnabled;

  const navItems = isHostRoute
    ? [
        { label: t("host.navigation.today"), path: "/host/today", icon: Home },
        {
          label: t("host.navigation.calendar"),
          path: "/host/calendar",
          icon: Calendar,
        },
        {
          label: t("host.navigation.listings"),
          path: "/host/listings",
          icon: List,
        },
        {
          label: t("host.navigation.messages"),
          path: "/host/messages",
          icon: MessageSquare,
        },
      ]
    : [
        { label: t("mobile.explore"), path: "/", icon: Search },
        { label: t("mobile.wishlists"), path: "/wishlists", icon: Heart },
      ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <Link
              className={cn(
                "flex flex-col items-center gap-1 transition-colors py-2 px-4",
                isActive ? "text-red-600" : "text-gray-600 hover:text-gray-900"
              )}
              key={item.path}
              to={item.path}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}

        {isAuthenticated ? (
          <Sheet onOpenChange={setUserMenuOpen} open={userMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors py-2 px-4"
                type="button"
              >
                {user?.image ? (
                  <Image
                    alt={user.name || "User"}
                    className="size-6 rounded-full object-cover"
                    height={24}
                    src={user.image}
                    width={24}
                  />
                ) : (
                  <User size={24} />
                )}
                <span className="text-xs font-medium">
                  {t("mobile.account")}
                </span>
              </button>
            </SheetTrigger>
            <SheetContent
              className="rounded-t-3xl max-h-[90vh] overflow-y-auto"
              side="bottom"
            >
              <SheetHeader>
                <SheetTitle className="text-left">
                  {user?.name || "Account"}
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-1 mt-6">
                {/* Account Information */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                  {user?.image ? (
                    <Image
                      alt={user.name || "User"}
                      className="size-12 rounded-full object-cover"
                      height={48}
                      src={user.image}
                      width={48}
                    />
                  ) : (
                    <div className="size-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="size-6 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">
                      {user?.name || "No name"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                      <Mail className="size-3 shrink-0" />
                      <span className="truncate">
                        {user?.email || "No email"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Settings Link */}
                <Link
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                  to="/account"
                >
                  <Settings size={20} />
                  <span>Account Settings</span>
                </Link>

                {/* Host-specific items */}
                {!isHostRoute && (
                  <Link
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                    to="/host/today"
                  >
                    <Home size={20} />
                    <span>Become a Host</span>
                  </Link>
                )}

                {/* Stripe Connect Section - Only show if user has or had a Stripe account */}
                {hasStripeAccount && (
                  <div className="border-t pt-3 mt-3">
                    <div className="px-3 py-2 mb-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        {isStripeComplete ? (
                          <CheckCircle2 className="size-4 text-green-600" />
                        ) : (
                          <XCircle className="size-4 text-amber-600" />
                        )}
                        <span>Stripe Connect</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {isStripeComplete ? "Active" : "Setup incomplete"}
                      </div>
                    </div>
                    {!isStripeComplete && (
                      <button
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors w-full text-left"
                        disabled={isConnecting}
                        onClick={handleStripeConnect}
                        type="button"
                      >
                        <ExternalLink size={20} />
                        <span>
                          {isConnecting
                            ? "Connecting..."
                            : stripeStatus?.hasAccount
                              ? "Complete Setup"
                              : "Set Up Stripe"}
                        </span>
                      </button>
                    )}
                    {stripeStatus?.hasAccount && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                            disabled={isDeleting}
                            type="button"
                          >
                            <Trash2 size={20} />
                            <span>
                              {isDeleting
                                ? "Deleting..."
                                : "Delete Stripe Account"}
                            </span>
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Stripe Account?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete your Stripe
                              account? This will disconnect it from your account
                              and you'll need to set it up again. This action
                              cannot be undone.
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
                )}

                {/* Logout */}
                <div className="border-t pt-3 mt-3">
                  <button
                    className="flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                    onClick={handleLogout}
                    type="button"
                  >
                    <LogOut size={20} />
                    <span>{t("header.logOut")}</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Link
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors py-2 px-4"
            search={{ redirectUri }}
            to="/login"
          >
            <User size={24} />
            <span className="text-xs font-medium">{t("mobile.logIn")}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
