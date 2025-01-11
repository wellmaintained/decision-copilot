"use client"

import * as React from "react"
import {
  BookOpen,
  Cpu,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"

// This is sample data for navigation
const data = {
  navMain: [
    {
      title: "DecisionCopilot Core",
      url: "/dashboard/project-decisions",
      icon: Cpu,
      isActive: true,
      items: [
        {
          title: "Frontend",
          url: "/dashboard/project-decisions",
        },
        {
          title: "Backend",
          url: "/dashboard/project-decisions",
        },
        {
          title: "Development environment",
          url: "/dashboard/project-decisions",
        },
      ],
    },
    {
      title: "Business Development",
      url: "/dashboard/project-decisions",
      icon: BookOpen,
      items: [
        {
          title: "Private Beta",
          url: "/dashboard/project-decisions",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

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
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

