"use client";

import {
  CreditCardIcon,
  Logout01Icon,
  Notification01Icon,
  SparklesIcon,
  UnfoldMoreIcon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@starter/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@starter/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@starter/ui/components/sidebar";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { authClient } from "@web/lib/auth-client";

const SPACES = /\s+/;

function initials(
  name: string | null | undefined,
  email: string | null | undefined
): string {
  if (name?.trim()) {
    const parts = name.trim().split(SPACES);
    if (parts.length >= 2) {
      const last = parts.at(-1);
      return (parts[0][0] + (last?.[0] ?? "")).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email?.trim()) return email.slice(0, 2).toUpperCase();
  return "??";
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await authClient.signOut();
    await queryClient.invalidateQueries({ queryKey: ["session"] });
    router.invalidate();
    router.navigate({ to: "/", reloadDocument: true });
  };

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Link
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-12 w-full items-center gap-2 rounded-lg p-2 text-left text-sm outline-none transition-[width,height,padding] focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:p-0"
            search={{ redirect: "/" }}
            to="/login"
          >
            Sign in
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const displayName = user.name ?? user.email ?? "User";
  const image = (user.image ?? "").trim() || undefined;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(props) => (
              <SidebarMenuButton
                {...props}
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                size="lg"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage alt={displayName} src={image} />
                  <AvatarFallback className="rounded-lg">
                    {initials(user.name, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{user.email ?? ""}</span>
                </div>
                <HugeiconsIcon
                  className="ml-auto size-4"
                  icon={UnfoldMoreIcon}
                  strokeWidth={2}
                />
              </SidebarMenuButton>
            )}
          />
          <DropdownMenuContent
            align="end"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage alt={displayName} src={image} />
                    <AvatarFallback className="rounded-lg">
                      {initials(user.name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs">{user.email ?? ""}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link
                  className="flex w-full items-center gap-2 outline-none"
                  to="/"
                >
                  <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} />
                  Upgrade to Pro
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link
                  className="flex w-full items-center gap-2 outline-none"
                  to="/"
                >
                  <HugeiconsIcon icon={User02Icon} strokeWidth={2} />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  className="flex w-full items-center gap-2 outline-none"
                  to="/"
                >
                  <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  className="flex w-full items-center gap-2 outline-none"
                  to="/"
                >
                  <HugeiconsIcon icon={Notification01Icon} strokeWidth={2} />
                  Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
