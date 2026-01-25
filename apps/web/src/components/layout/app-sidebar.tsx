"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@starter/ui/components/sidebar";
import { NavMain } from "@web/components/layout/nav-main";
import { NavUser } from "@web/components/layout/nav-user";
import { OrgSwitcher } from "@web/components/layout/org-switcher";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-2">
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
