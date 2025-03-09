'use client'

import { useState, useEffect } from 'react'
import { TeamHierarchyTree } from '@/components/TeamHierarchyTree'
import { useAuth } from '@/hooks/useAuth'
import { redirect, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useOrganisation } from '@/components/organisation-switcher'

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth()
  const { selectedOrganisation } = useOrganisation()
  const [organisationId, setOrganisationId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<string>('team-hierarchy')

  useEffect(() => {
    if (selectedOrganisation) {
      setOrganisationId(selectedOrganisation.id)
    }
  }, [selectedOrganisation])

  // Set the active tab based on the URL parameter
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    redirect('/login')
    return null
  }

  // If user is not an admin, redirect to organization page
  if (!isAdmin) {
    redirect('/organisation')
    return null
  }

  if (!organisationId) {
    return <div className="flex items-center justify-center min-h-screen">Select an organization first</div>
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="team-hierarchy">Team Hierarchy</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="team-hierarchy">
          <Card>
            <CardHeader>
              <CardTitle>Team Hierarchy Management</CardTitle>
              <CardDescription>
                Manage the team structure for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamHierarchyTree organisationId={organisationId} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>User management functionality will be added soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Configure organization-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Settings functionality will be added soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 