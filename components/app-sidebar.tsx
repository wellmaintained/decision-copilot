"use client"

import * as React from "react"
import {
  FolderKanban,
  Users2,
} from "lucide-react"
import { usePathname } from 'next/navigation'

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { OrganisationSwitcher, useOrganisation } from "@/components/organisation-switcher"
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
  const { selectedOrganisation } = useOrganisation();
  const pathname = usePathname();

  // Create user data object from authenticated user
  const userData = user ? {
    name: user.displayName || 'Anonymous',
    email: user.email || '',
    avatar: user.photoURL || '',
  } : null;

  if (!userData) return null;

  // Extract current team ID from URL
  const teamMatch = pathname?.match(/\/team\/([^/]+)/);
  const currentTeamId = teamMatch ? teamMatch[1] : null;

  // Create navigation data from selected team's projects
  const navData = {
    navMain: selectedOrganisation?.teams.map(team => ({
      title: team.name,
      url: `/organisation/${selectedOrganisation.id}/team/${team.id}`,
      icon: Users2,
      isActive: team.id === currentTeamId,
      items: team.projects.map(project => ({
        title: project.name,
        url: `/organisation/${selectedOrganisation.id}/team/${team.id}/project/${project.id}`,
        icon: FolderKanban,
      })),
    })) || [],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganisationSwitcher />
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

