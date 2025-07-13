'use client'

import { AppSidebar } from "@/components/business/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from '@/hooks/useAuth'
import { OrganisationProvider } from '@/components/business/organisation-switcher'
import { redirect } from 'next/navigation'
import { Separator } from "@/components/ui/separator"

export default function AdminLayout({
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
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
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