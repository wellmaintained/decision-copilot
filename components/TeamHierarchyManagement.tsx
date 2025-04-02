import { useState } from 'react'
import { useTeamHierarchy } from '@/hooks/useTeamHierarchy'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronRight, Plus, Trash } from 'lucide-react'
import { TeamHierarchyNode } from '@/lib/domain/TeamHierarchy'

interface TeamHierarchyManagementProps {
  organisationId: string
}

export function TeamHierarchyManagement({ organisationId }: TeamHierarchyManagementProps) {
  const { hierarchy, loading, error, addTeam, removeTeam, updateTeam } = useTeamHierarchy(organisationId)
  const [expandedTeams, setExpandedTeams] = useState<string[]>([])
  const [newTeamName, setNewTeamName] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)

  if (loading) return <div>Loading team hierarchy...</div>
  if (error) return <div className="text-destructive">Error: {error.message}</div>

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
        name: newTeamName,
        parentId: selectedParentId,
        children: {}
      })
      setNewTeamName('')
      setSelectedParentId(null)
    } catch (err) {
      console.error('Failed to add team:', err)
    }
  }

  const handleRemoveTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to remove this team and all its children?')) return
    
    try {
      await removeTeam(teamId)
    } catch (err) {
      console.error('Failed to remove team:', err)
    }
  }

  const renderTeamNode = (teamId: string, team: TeamHierarchyNode, level: number) => {
    const isExpanded = expandedTeams.includes(teamId)
    const hasChildren = Object.keys(team.children || {}).length > 0

    return (
      <div key={teamId} className="border-l pl-4 ml-2 mt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleTeam(teamId)}
            className="p-1 hover:bg-accent rounded-sm"
            disabled={!hasChildren}
          >
            {hasChildren && (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
          </button>
          
          <Input
            value={team.name}
            onChange={(e) => updateTeam(teamId, { ...team, name: e.target.value })}
            className="h-8 w-48"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedParentId(teamId)}
            className="h-8 w-8"
          >
            <Plus size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveTeam(teamId)}
            className="h-8 w-8 text-destructive"
          >
            <Trash size={16} />
          </Button>
        </div>

        {isExpanded && Object.entries(team.children || {}).map(([childId, childTeam]) =>
          renderTeamNode(childId, childTeam, level + 1)
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Input
          placeholder="New team name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          className="w-48"
        />
        <Button onClick={handleAddTeam} disabled={!newTeamName.trim()}>
          Add {selectedParentId ? 'Child' : 'Root'} Team
        </Button>
      </div>

      <div className="mt-4">
        {hierarchy && Object.entries(hierarchy.teams)
          .filter(([, team]) => team.parentId === null)
          .map(([teamId, team]) => renderTeamNode(teamId, team, 0))}
      </div>
    </div>
  )
} 