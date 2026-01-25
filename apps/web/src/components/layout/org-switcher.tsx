"use client";

import { Add01Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@starter/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@starter/ui/components/sidebar";
import { useQuery } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import { authClient } from "@web/lib/auth-client";

export function OrgSwitcher() {
  const { data } = useQuery({
    queryKey: ["orgs"],
    queryFn: () => authClient.organization.list({}),
  });

  const { data: activeOrg } = authClient.useActiveOrganization();
  const orgs = data?.data || [];
  const { isMobile } = useSidebar();

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
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  {activeOrg?.logo ? (
                    <Image
                      alt={activeOrg?.name ?? ""}
                      className="size-4"
                      height={32}
                      src={activeOrg.logo}
                      width={32}
                    />
                  ) : (
                    <span className="text-sidebar-primary-foreground text-xs font-medium">
                      {(activeOrg?.name ?? "?").slice(0, 1)}
                    </span>
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeOrg?.name ?? ""}
                  </span>
                  <span className="truncate text-xs">Organization</span>
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
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Organizations
              </DropdownMenuLabel>
              {orgs.map((org, index) => (
                <DropdownMenuItem
                  className="gap-2 p-2"
                  key={org.id}
                  onClick={() =>
                    authClient.organization.setActive({
                      organizationId: org.id,
                    })
                  }
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    {org.logo ? (
                      <Image
                        alt={org.name}
                        className="size-4"
                        height={32}
                        src={org.logo}
                        width={32}
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs font-medium">
                        {(org.name ?? "?").slice(0, 1)}
                      </span>
                    )}
                  </div>
                  {org.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <HugeiconsIcon
                  className="size-4"
                  icon={Add01Icon}
                  strokeWidth={2}
                />
              </div>
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
