"use client"

import * as React from "react"
import {
  Cpu,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher, useTeam } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { selectedTeam } = useTeam();

  // Create user data object from authenticated user
  const userData = user ? {
    name: user.displayName || 'Anonymous',
    email: user.email || '',
    avatar: user.photoURL || '',
  } : null;

  if (!userData) return null;

  // Create navigation data from selected team's projects
  const navData = {
    navMain: selectedTeam?.projects.map(project => ({
      title: project.name,
      url: `/dashboard/project-decisions/${project.id}`,
      icon: Cpu,
      items: [],
    })) || [],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

