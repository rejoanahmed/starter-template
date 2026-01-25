"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@starter/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@starter/ui/components/sidebar";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { authClient } from "@web/lib/auth-client";

const linkClass =
  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sm outline-hidden [&>svg]:size-4 [&>svg]:shrink-0";

export function NavMain() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data } = useQuery({
    queryKey: ["teams", activeOrg?.id],
    queryFn: () =>
      authClient.organization.listTeams({
        query: { organizationId: activeOrg?.id },
      }),
    enabled: !!activeOrg?.id,
  });
  const teams = data?.data || [];
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Teams</SidebarGroupLabel>
      <SidebarMenu>
        {teams.map((team) => (
          <Collapsible
            className="group/collapsible"
            key={team.id}
            render={(props) => <SidebarMenuItem {...props} />}
          >
            <CollapsibleTrigger
              render={(p) => (
                <SidebarMenuButton {...p} tooltip={team.name}>
                  <span>{team.name}</span>
                  <HugeiconsIcon
                    className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                  />
                </SidebarMenuButton>
              )}
            />
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    render={(props) => (
                      <Link
                        {...props}
                        className={linkClass}
                        params={{ orgId: activeOrg?.id ?? "", teamId: team.id }}
                        search={{ search: "", status: "", priority: "" }}
                        to="/org/$orgId/team/$teamId/issues"
                      >
                        <span>All Issues</span>
                      </Link>
                    )}
                  />
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    render={(props) => (
                      <Link
                        {...props}
                        className={linkClass}
                        params={{ orgId: activeOrg?.id ?? "", teamId: team.id }}
                        to="/org/$orgId/team/$teamId/board"
                      >
                        <span>Board</span>
                      </Link>
                    )}
                  />
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
