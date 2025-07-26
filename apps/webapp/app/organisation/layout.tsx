'use client'

import { Building2, Users2, FolderKanban } from 'lucide-react'
import { usePathname , redirect } from 'next/navigation'
import { AppSidebar } from "@/components/business/app-sidebar"
import { useOrganisation, OrganisationProvider } from '@/components/business/organisation-switcher'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from '@/hooks/useAuth'

function BreadcrumbNav() {
  const { selectedOrganisation } = useOrganisation()
  const pathname = usePathname()

  // Extract project ID from URL if it exists
  const projectMatch = pathname?.match(/\/project\/([^/]+)/)
  const projectId = projectMatch ? projectMatch[1] : null
  const currentTeamMatch = pathname?.match(/\/team\/([^/]+)/)
  const currentTeamId = currentTeamMatch ? currentTeamMatch[1] : null
  const currentTeam = selectedOrganisation?.teams.find(t => t.id === currentTeamId)
  const currentProject = currentTeam?.projects.find(p => p.id === projectId)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/organisation" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {selectedOrganisation?.name || '...'}
          </BreadcrumbLink>
        </BreadcrumbItem>
        {currentTeam && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                href={`/organisation/${selectedOrganisation?.id}/team/${currentTeam.id}`}
                className="flex items-center gap-2"
              >
                <Users2 className="h-4 w-4" />
                {currentTeam?.name || '...'}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        {currentProject && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                {currentProject.name || '...'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) return <p>Loading...</p>;

  // If user is not logged in, redirect to login page
  if (!user) {
    redirect('/login');
    return null;
  }

  return (
    <SidebarProvider>
      <OrganisationProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <BreadcrumbNav />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </OrganisationProvider>
    </SidebarProvider>
  )
} 
