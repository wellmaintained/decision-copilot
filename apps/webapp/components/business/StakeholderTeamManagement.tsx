'use client'

import { useState } from 'react'
import { useTeamHierarchy } from '@/hooks/useTeamHierarchy'
import { useStakeholders } from '@/hooks/useStakeholders'
import { useStakeholderTeams } from '@/hooks/useStakeholderTeams'
import { Stakeholder } from '@decision-copilot/domain'
import { TeamHierarchyNode } from '@decision-copilot/domain'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'

interface StakeholderTeamManagementProps {
  organisationId: string
}

export function StakeholderTeamManagement({ organisationId }: StakeholderTeamManagementProps) {
  const { hierarchy, loading: hierarchyLoading } = useTeamHierarchy(organisationId)
  const { stakeholders, loading: stakeholdersLoading } = useStakeholders()
  const { stakeholderTeams, addStakeholderTeam, removeStakeholderTeam, loading: teamsLoading } = useStakeholderTeams()
  
  const [expandedTeams, setExpandedTeams] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null)
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
  
  // Filter stakeholders based on search query
  const filteredStakeholders = stakeholders.filter(stakeholder => 
    stakeholder.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stakeholder.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const loading = hierarchyLoading || stakeholdersLoading || teamsLoading
  
  if (loading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>
  }
  
  if (!hierarchy) {
    return <div className="p-4">No team hierarchy found</div>
  }
  
  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    )
  }
  
  // Get all teams a stakeholder belongs to
  const getTeamsForStakeholder = (stakeholderId: string): string[] => {
    return stakeholderTeams
      .filter(st => st.stakeholderId === stakeholderId)
      .map(st => st.teamId)
  }
  
  // Handle adding a stakeholder to teams
  const handleAddStakeholderToTeams = async () => {
    if (!selectedStakeholder) return
    
    try {
      // Get current team assignments
      const currentTeamIds = getTeamsForStakeholder(selectedStakeholder.id)
      
      // Teams to add
      const teamsToAdd = selectedTeamIds.filter(teamId => !currentTeamIds.includes(teamId))
      
      // Teams to remove
      const teamsToRemove = currentTeamIds.filter(teamId => !selectedTeamIds.includes(teamId))
      
      // Add stakeholder to new teams
      for (const teamId of teamsToAdd) {
        await addStakeholderTeam({
          stakeholderId: selectedStakeholder.id,
          teamId,
          organisationId
        })
      }
      
      // Remove stakeholder from teams they should no longer be in
      for (const teamId of teamsToRemove) {
        await removeStakeholderTeam(selectedStakeholder.id, teamId)
      }
      
      // Reset state
      setSelectedStakeholder(null)
      setSelectedTeamIds([])
      setIsAddDialogOpen(false)
    } catch (err) {
      console.error('Error updating stakeholder teams:', err)
      alert(`Failed to update stakeholder teams: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  
  // Open dialog to edit stakeholder team assignments
  const openEditDialog = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder)
    setSelectedTeamIds(getTeamsForStakeholder(stakeholder.id))
    setIsAddDialogOpen(true)
  }
  
  // Toggle team selection in the dialog
  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeamIds(prev => 
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    )
  }
  
  // Render team hierarchy in the dialog
  const renderTeamHierarchy = (teamId: string, team: TeamHierarchyNode, level: number) => {
    const isExpanded = expandedTeams.includes(teamId)
    const hasChildren = Object.keys(team.children).length > 0
    
    return (
      <div key={teamId} className="mb-1">
        <div 
          className="flex items-center py-2 px-2 hover:bg-gray-100 rounded"
          style={{ marginLeft: level * 20 }}
        >
          <div 
            className="mr-2 cursor-pointer"
            onClick={() => toggleTeam(teamId)}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            ) : (
              <span className="w-4"></span>
            )}
          </div>
          
          <Checkbox 
            id={`team-${teamId}`}
            checked={selectedTeamIds.includes(teamId)}
            onCheckedChange={() => toggleTeamSelection(teamId)}
            className="mr-2"
          />
          
          <Label htmlFor={`team-${teamId}`} className="flex-grow font-medium cursor-pointer">
            {team.name}
          </Label>
        </div>
        
        {isExpanded && (
          <div>
            {Object.entries(team.children).map(([childId, childTeam]) => 
              renderTeamHierarchy(childId, childTeam, level + 1)
            )}
          </div>
        )}
      </div>
    )
  }
  
  // Render stakeholder row with team information
  const renderStakeholderRow = (stakeholder: Stakeholder) => {
    const stakeholderTeamIds = getTeamsForStakeholder(stakeholder.id)
    const stakeholderTeamNames = stakeholderTeamIds
      .map(teamId => hierarchy.teams[teamId]?.name || 'Unknown Team')
      .join(', ')
    
    return (
      <TableRow key={stakeholder.id}>
        <TableCell>
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={stakeholder.photoURL} alt={stakeholder.displayName} />
              <AvatarFallback>{stakeholder.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{stakeholder.displayName}</div>
              <div className="text-sm text-gray-500">{stakeholder.email}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          {stakeholderTeamNames || <span className="text-gray-400">No teams assigned</span>}
        </TableCell>
        <TableCell>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => openEditDialog(stakeholder)}
          >
            Manage Teams
          </Button>
        </TableCell>
      </TableRow>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search stakeholders..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stakeholder</TableHead>
            <TableHead>Teams</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStakeholders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                No stakeholders found
              </TableCell>
            </TableRow>
          ) : (
            filteredStakeholders.map(renderStakeholderRow)
          )}
        </TableBody>
      </Table>
      
      {/* Dialog for managing stakeholder team assignments */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Team Assignments</DialogTitle>
            <DialogDescription>
              Select teams for this stakeholder
            </DialogDescription>
            {selectedStakeholder && (
              <div className="flex items-center space-x-3 mt-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedStakeholder.photoURL} alt={selectedStakeholder.displayName} />
                  <AvatarFallback>{selectedStakeholder.displayName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedStakeholder.displayName}</div>
                  <div className="text-sm text-gray-500">{selectedStakeholder.email}</div>
                </div>
              </div>
            )}
          </DialogHeader>
          
          <div className="py-4">
            <Label className="mb-2 block">Select teams for this stakeholder:</Label>
            <div className="h-[300px] border rounded-md p-2 overflow-auto">
              {Object.entries(hierarchy.teams)
                .filter(([, team]) => team.parentId === null)
                .map(([teamId, team]) => renderTeamHierarchy(teamId, team, 0))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStakeholderToTeams}>
              Save Assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 