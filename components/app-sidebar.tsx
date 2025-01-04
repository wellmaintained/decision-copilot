"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Cpu,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Development",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Marketing",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Finance",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "DecisionCopilot Core",
      url: "#",
      icon: Cpu,
      isActive: true,
      items: [
        {
          title: "Frontend",
          url: "#",
        },
        {
          title: "Backend",
          url: "#",
        },
        {
          title: "Development environment",
          url: "#",
        },
      ],
    },
    {
      title: "Business Development",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Private Beta",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

