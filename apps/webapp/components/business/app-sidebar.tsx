"use client";

import { Sparkles, ListTodo, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import * as React from "react";
import {
  OrganisationSwitcher,
  useOrganisation,
} from "@/components/business/organisation-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { NavUser } from "./nav-user";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, isAdmin } = useAuth();
  const { selectedOrganisation } = useOrganisation();
  const params = useParams();
  const organisationId = (params?.organisationId as string) || "";
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Create user data object from authenticated user
  const userData = user
    ? {
        name: user.displayName || "Anonymous",
        email: user.email || "",
        avatar: user.photoURL || "",
      }
    : null;

  if (!userData) return null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganisationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {selectedOrganisation && (
          <>
            {/* Organisation section */}
            <SidebarGroup>
              <SidebarGroupLabel>{selectedOrganisation.name}</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Decisions" asChild>
                    <Link
                      href={`/organisation/${organisationId}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent transition-colors ${isCollapsed ? "justify-center" : "w-full"}`}
                    >
                      <ListTodo className="h-4 w-4" />
                      {!isCollapsed && <span>Decision list</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="New decision" asChild>
                    <Link
                      href={`/organisation/${organisationId}/decision/create`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-700 transition-colors ${isCollapsed ? "justify-center" : "w-fit"}`}
                    >
                      <Sparkles className="h-4 w-4" />
                      {!isCollapsed && <span>New decision</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Admin section - only visible to admins */}
            {isAdmin && (
              <SidebarGroup>
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Teams" asChild>
                      <Link
                        href="/admin?tab=team-hierarchy"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent transition-colors ${isCollapsed ? "justify-center" : "w-full"}`}
                      >
                        <Users className="h-4 w-4" />
                        {!isCollapsed && <span>Teams</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
