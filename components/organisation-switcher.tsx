"use client"

import * as React from "react"
import { ChevronsUpDown, Building2 } from 'lucide-react'
import { Organisation } from '@/lib/domain/Organisation'
import { useOrganisations } from '@/hooks/useOrganisations'
import { useRouter, usePathname } from 'next/navigation'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type OrganisationContextType = {
  selectedOrganisation: Organisation | null;
  setSelectedOrganisation: (organisation: Organisation) => void;
}

export const OrganisationContext = React.createContext<OrganisationContextType | undefined>(undefined);

export function OrganisationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { organisations } = useOrganisations()
  const [selectedOrganisation, setSelectedOrganisation] = React.useState<Organisation | null>(null)

  // Set initial organisation from the URL path
  React.useEffect(() => {
    if (pathname && organisations) {
      const match = pathname.match(/\/organisation\/([^/]+)/)
      const orgIdFromUrl = match ? match[1] : null
      if (orgIdFromUrl && (!selectedOrganisation || selectedOrganisation.id !== orgIdFromUrl)) {
        setSelectedOrganisation(organisations.find(org => org.id === orgIdFromUrl) || null)
      }
    }
  }, [pathname, organisations, selectedOrganisation])

  const handleOrganisationSelect = React.useCallback((org: Organisation) => {
    setSelectedOrganisation(org)

    // Don't redirect if we're on the admin page
    const isAdminPage = pathname?.startsWith('/admin')
    if (!isAdminPage) {
      router.push(`/organisation/${org.id}`)
    }
  }, [router, pathname])

  const value = React.useMemo(() => ({
    selectedOrganisation,
    setSelectedOrganisation: handleOrganisationSelect
  }), [selectedOrganisation, handleOrganisationSelect])

  return (
    <OrganisationContext.Provider value={value}>
      {children}
    </OrganisationContext.Provider>
  )
}

export function useOrganisation() {
  const context = React.useContext(OrganisationContext)
  if (context === undefined) {
    throw new Error('useOrganisation must be used within an OrganisationProvider')
  }
  return context
}

export function OrganisationSwitcher() {
  const { isMobile } = useSidebar()
  const { organisations, loading } = useOrganisations()
  const { selectedOrganisation, setSelectedOrganisation } = useOrganisation()

  if (loading || !organisations) {
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
                  {selectedOrganisation?.name || "Select Organisation"}
                </span>
                <span className="truncate text-xs">beta</span>
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
              Organisations
            </DropdownMenuLabel>
            {organisations.map(organisation => (
              <DropdownMenuItem
                key={organisation.id}
                className="gap-2 p-2"
                onClick={() => setSelectedOrganisation(organisation)}
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Building2 className="size-4 shrink-0" />
                </div>
                {organisation.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

