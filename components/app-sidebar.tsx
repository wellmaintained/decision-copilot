"use client"

import * as React from "react"
import {
  Sparkles,
  ListTodo,
  ShieldAlert
} from "lucide-react"
import { useParams } from 'next/navigation'
import Link from 'next/link'

import { NavUser } from "./nav-user"
import { OrganisationSwitcher, useOrganisation } from "@/components/organisation-switcher"
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
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"

// List of admin emails for fallback if useAuth doesn't provide isAdmin
const ADMIN_EMAILS = [
  'admin@example.com',
  'david@wellmaintained.dev',
  // Add more admin emails as needed
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const auth = useAuth();
  const { user } = auth;
  const { selectedOrganisation } = useOrganisation();
  const params = useParams();
  const organisationId = params.organisationId as string;
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Check if user is admin (either from hook or fallback)
  const isAdmin = 'isAdmin' in auth
    ? auth.isAdmin
    : user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  // Create user data object from authenticated user
  const userData = user ? {
    name: user.displayName || 'Anonymous',
    email: user.email || '',
    avatar: user.photoURL || '',
  } : null;

  if (!userData) return null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganisationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {selectedOrganisation && (
          <SidebarGroup>
            <SidebarGroupLabel>{selectedOrganisation.name}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Decisions" asChild>
                  <Link href={`/organisation/${organisationId}`} className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent transition-colors ${isCollapsed ? 'justify-center' : 'w-full'}`}>
                    <ListTodo className="h-4 w-4" />
                    {!isCollapsed && <span>Decision list</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="New decision" asChild>
                  <Link href={`/organisation/${organisationId}/decision/create`} className={`flex items-center gap-2 px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-700 transition-colors ${isCollapsed ? 'justify-center' : 'w-fit'}`}>
                    <Sparkles className="h-4 w-4" />
                    {!isCollapsed && <span>New decision</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {/* Admin section - only visible to admins */}
            {isAdmin && (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Admin Dashboard" asChild>
                    <Link href="/admin" className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent transition-colors ${isCollapsed ? 'justify-center' : 'w-full'}`}>
                      <ShieldAlert className="h-4 w-4" />
                      {!isCollapsed && <span>Admin Dashboard</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

