"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Building2 } from 'lucide-react'
import { Team } from '@/lib/domain/Team'
import { useOrganisation } from '@/hooks/useOrganisation'
import { useRouter, usePathname } from 'next/navigation'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type TeamContextType = {
  selectedTeam: Team | null;
  setSelectedTeam: (team: Team) => void;
}

export const TeamContext = React.createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { organisation } = useOrganisation()
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null)

  // Extract team ID from URL path and set selected team
  React.useEffect(() => {
    if (pathname && organisation) {
      const match = pathname.match(/\/team\/([^/]+)/)
      const teamIdFromUrl = match ? match[1] : null
      if (teamIdFromUrl) {
        const teamFromUrl = organisation.teams.find(t => t.id === teamIdFromUrl)
        if (teamFromUrl && (!selectedTeam || selectedTeam.id !== teamFromUrl.id)) {
          setSelectedTeam(teamFromUrl)
        }
      } else if (organisation.teams.length > 0 && !selectedTeam) {
        // If no team in URL, select first team and update URL
        const firstTeam = organisation.teams[0]
        setSelectedTeam(firstTeam)
        router.push(`/organisation/${organisation.id}/team/${firstTeam.id}`)
      }
    }
  }, [pathname, organisation, selectedTeam, router])

  const handleTeamSelect = React.useCallback((team: Team) => {
    setSelectedTeam(team)
    if (organisation) {
      router.push(`/organisation/${organisation.id}/team/${team.id}`)
    }
  }, [organisation, router])

  const value = React.useMemo(() => ({
    selectedTeam,
    setSelectedTeam: handleTeamSelect
  }), [selectedTeam, handleTeamSelect])

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = React.useContext(TeamContext)
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const { organisation, loading } = useOrganisation()
  const { selectedTeam, setSelectedTeam } = useTeam()

  if (loading || !organisation) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {selectedTeam?.name || organisation.name}
                </span>
                <span className="truncate text-xs">{organisation.teams.length} teams</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {organisation.teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                className="gap-2 p-2"
                onClick={() => setSelectedTeam(team)}
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Building2 className="size-4 shrink-0" />
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

