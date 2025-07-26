import { TeamHierarchyNode } from '@decision-copilot/domain'
import { ChevronDown, ChevronRight, Plus, Edit, Trash, MoveVertical } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTeamHierarchy } from '@/hooks/useTeamHierarchy'

interface TeamHierarchyTreeProps {
  organisationId: string
}

// Special value to represent "no parent" (root team)
const ROOT_TEAM_VALUE = "root_team_special_value"

export function TeamHierarchyTree({ organisationId }: TeamHierarchyTreeProps) {
  const { hierarchy, loading, error, addTeam, updateTeam, moveTeam, removeTeam } = useTeamHierarchy(organisationId)
  const [expandedTeams, setExpandedTeams] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamParentId, setNewTeamParentId] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Omit<TeamHierarchyNode, 'children'> | null>(null)
  const [moveToParentId, setMoveToParentId] = useState<string | null>(null)

  // Helper function to convert from UI select value to actual parentId
  const getParentId = (selectValue: string): string | null => {
    return selectValue === ROOT_TEAM_VALUE ? null : selectValue
  }

  if (loading) {
    return <div className="flex items-center justify-center p-4">Loading team hierarchy...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>
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

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return

    try {
      await addTeam({
        id: `team-${Date.now()}`,
        name: newTeamName.trim(),
        parentId: newTeamParentId
      })
      setNewTeamName('')
      setNewTeamParentId(null)
      setIsAddDialogOpen(false)
    } catch (err) {
      console.error('Error adding team:', err)
      alert(`Failed to add team: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const handleEditTeam = async () => {
    if (!selectedTeam || !selectedTeam.name.trim()) return

    try {
      await updateTeam(selectedTeam)
      setSelectedTeam(null)
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error('Error updating team:', err)
      alert(`Failed to update team: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const handleMoveTeam = async () => {
    if (!selectedTeam) return

    try {
      await moveTeam(selectedTeam.id, moveToParentId)
      setSelectedTeam(null)
      setMoveToParentId(null)
      setIsMoveDialogOpen(false)
    } catch (err) {
      console.error('Error moving team:', err)
      alert(`Failed to move team: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const handleRemoveTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to remove this team?')) return

    try {
      await removeTeam(teamId)
    } catch (err) {
      console.error('Error removing team:', err)
      alert(`Failed to remove team: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const openEditDialog = (team: TeamHierarchyNode) => {
    setSelectedTeam({
      id: team.id,
      name: team.name,
      parentId: team.parentId
    })
    setIsEditDialogOpen(true)
  }

  const openMoveDialog = (team: TeamHierarchyNode) => {
    setSelectedTeam({
      id: team.id,
      name: team.name,
      parentId: team.parentId
    })
    setMoveToParentId(team.parentId)
    setIsMoveDialogOpen(true)
  }

  // Get all teams as a flat array for select options
  const getAllTeams = (): TeamHierarchyNode[] => {
    return Object.values(hierarchy.teams)
  }

  // Render a single team node
  const renderTeamNode = (teamId: string, team: TeamHierarchyNode, level: number) => {
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
          
          <span className="flex-grow font-medium">{team.name}</span>
          
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => openEditDialog(team)}
              title="Edit team"
            >
              <Edit size={16} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => openMoveDialog(team)}
              title="Move team"
            >
              <MoveVertical size={16} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleRemoveTeam(team.id)}
              title="Remove team"
              disabled={hasChildren}
            >
              <Trash size={16} />
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <div>
            {Object.entries(team.children).map(([childId, childTeam]) => 
              renderTeamNode(childId, childTeam, level + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Teams</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Team
        </Button>
      </div>
      
      <div className="border rounded-md p-4">
        {Object.keys(hierarchy.teams).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No teams yet. Click &quot;Add Team&quot; to create your first team.
          </div>
        ) : (
          <div>
            {Object.entries(hierarchy.teams)
              .filter(([, team]) => team.parentId === null)
              .map(([teamId, team]) => renderTeamNode(teamId, team, 0))}
          </div>
        )}
      </div>
      
      {/* Add Team Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team</DialogTitle>
            <DialogDescription>
              Create a new team in your organization hierarchy.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parent-team">Parent Team (optional)</Label>
              <Select
                value={newTeamParentId ? newTeamParentId : ROOT_TEAM_VALUE}
                onValueChange={(value: string) => setNewTeamParentId(getParentId(value))}
              >
                <SelectTrigger id="parent-team">
                  <SelectValue placeholder="Select a parent team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROOT_TEAM_VALUE}>No Parent (Root Team)</SelectItem>
                  {getAllTeams().map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTeam}>
              Add Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update the team&apos;s information.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTeam && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-team-name">Team Name</Label>
                <Input
                  id="edit-team-name"
                  value={selectedTeam.name}
                  onChange={(e) => setSelectedTeam({ ...selectedTeam, name: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTeam}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Move Team Dialog */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Team</DialogTitle>
            <DialogDescription>
              Change the team&apos;s position in the hierarchy.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTeam && (
            <div className="space-y-4 py-4">
              <p>
                Moving: <strong>{selectedTeam.name}</strong>
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="move-parent-team">New Parent Team</Label>
                <Select
                  value={moveToParentId ? moveToParentId : ROOT_TEAM_VALUE}
                  onValueChange={(value: string) => setMoveToParentId(getParentId(value))}
                >
                  <SelectTrigger id="move-parent-team">
                    <SelectValue placeholder="Select a new parent team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ROOT_TEAM_VALUE}>No Parent (Root Team)</SelectItem>
                    {getAllTeams()
                      .filter(team => team.id !== selectedTeam.id)
                      .map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveTeam}>
              Move Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 