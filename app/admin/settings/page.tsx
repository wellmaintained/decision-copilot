'use client'

import { useState } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useOrganisation } from '@/hooks/useOrganisation'
import { StakeholderManagement } from '@/components/StakeholderManagement'
import { StakeholderTeamManagement } from '@/components/StakeholderTeamManagement'
import { TeamHierarchyManagement } from '@/components/TeamHierarchyManagement'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AdminSettingsPage() {
  const { loading: authLoading, error: authError, isAdmin } = useAdminAuth()
  const { loading: orgLoading, error: orgError, organisation } = useOrganisation()
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  if (authLoading || orgLoading) {
    return <div>Loading...</div>
  }

  if (authError) {
    return <div className="text-destructive">Authentication error: {authError.message}</div>
  }

  if (orgError) {
    return <div className="text-destructive">Organisation error: {orgError.message}</div>
  }

  if (!isAdmin || !organisation) {
    return null // useAdminAuth will handle redirection
  }

  const availableOrgs = [organisation] // In the future, this could be a list of orgs the admin has access to

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        
        <Select
          value={selectedOrgId || organisation.id}
          onValueChange={setSelectedOrgId}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select organisation" />
          </SelectTrigger>
          <SelectContent>
            {availableOrgs.map(org => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="stakeholders">
        <TabsList>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="teams">Team Assignments</TabsTrigger>
          <TabsTrigger value="hierarchy">Team Hierarchy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stakeholders">
          <StakeholderManagement organisationId={selectedOrgId || organisation.id} />
        </TabsContent>
        
        <TabsContent value="teams">
          <StakeholderTeamManagement organisationId={selectedOrgId || organisation.id} />
        </TabsContent>
        
        <TabsContent value="hierarchy">
          <TeamHierarchyManagement organisationId={selectedOrgId || organisation.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 