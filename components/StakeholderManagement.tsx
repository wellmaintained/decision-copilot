'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Stakeholder } from '@/lib/domain/Stakeholder'
import { useStakeholders } from '@/hooks/useStakeholders'
import { useTeamHierarchy } from '@/hooks/useTeamHierarchy'
import { useStakeholderTeams } from '@/hooks/useStakeholderTeams'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Pencil, Trash2, UserPlus, ChevronDown, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ControllerRenderProps } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { TeamHierarchyNode } from '@/lib/domain/TeamHierarchy'

interface StakeholderFormData {
  displayName: string
  email: string
  photoURL?: string
}

interface StakeholderManagementProps {
  organisationId: string
}

export function StakeholderManagement({ organisationId }: StakeholderManagementProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null)
  const [expandedTeams, setExpandedTeams] = useState<string[]>([])
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
  const { stakeholders, addStakeholder, updateStakeholder, removeStakeholder, loading, error } = useStakeholders()
  const { hierarchy, loading: hierarchyLoading } = useTeamHierarchy(organisationId)
  const { stakeholderTeams, addStakeholderTeam, removeStakeholderTeam, loading: teamsLoading } = useStakeholderTeams()

  const form = useForm<StakeholderFormData>({
    defaultValues: {
      displayName: '',
      email: '',
      photoURL: '',
    },
  })

  useEffect(() => {
    if (editingStakeholder) {
      form.reset({
        displayName: editingStakeholder.displayName,
        email: editingStakeholder.email,
        photoURL: editingStakeholder.photoURL,
      })
    } else {
      form.reset({
        displayName: '',
        email: '',
        photoURL: '',
      })
    }
  }, [editingStakeholder, form])

  const onSubmit = async (data: StakeholderFormData) => {
    try {
      if (editingStakeholder) {
        await updateStakeholder({
          ...editingStakeholder,
          ...data,
        })
      } else {
        await addStakeholder({
          ...data,
          id: '', // The repository will generate an ID
        })
      }
      setIsOpen(false)
      setEditingStakeholder(null)
      form.reset()
    } catch (error) {
      console.error('Error managing stakeholder:', error)
    }
  }

  const handleDelete = async (stakeholder: Stakeholder) => {
    if (confirm('Are you sure you want to delete this stakeholder?')) {
      try {
        await removeStakeholder(stakeholder.id)
      } catch (error) {
        console.error('Error deleting stakeholder:', error)
      }
    }
  }

  // Get all teams a stakeholder belongs to
  const getTeamsForStakeholder = (stakeholderId: string): string[] => {
    return stakeholderTeams
      .filter(st => st.stakeholderId === stakeholderId)
      .map(st => st.teamId)
  }

  // Handle adding a stakeholder to teams
  const handleUpdateStakeholderTeams = async () => {
    if (!editingStakeholder) return
    
    try {
      // Get current team assignments
      const currentTeamIds = getTeamsForStakeholder(editingStakeholder.id)
      
      // Teams to add
      const teamsToAdd = selectedTeamIds.filter(teamId => !currentTeamIds.includes(teamId))
      
      // Teams to remove
      const teamsToRemove = currentTeamIds.filter(teamId => !selectedTeamIds.includes(teamId))
      
      // Add stakeholder to new teams
      for (const teamId of teamsToAdd) {
        await addStakeholderTeam({
          stakeholderId: editingStakeholder.id,
          teamId,
          organisationId
        })
      }
      
      // Remove stakeholder from teams they should no longer be in
      for (const teamId of teamsToRemove) {
        await removeStakeholderTeam(editingStakeholder.id, teamId)
      }
      
      setIsTeamDialogOpen(false)
    } catch (err) {
      console.error('Error updating team assignments:', err)
    }
  }

  // Open dialog to edit stakeholder team assignments
  const openTeamDialog = (stakeholder: Stakeholder) => {
    setEditingStakeholder(stakeholder)
    setSelectedTeamIds(getTeamsForStakeholder(stakeholder.id))
    setIsTeamDialogOpen(true)
  }

  // Toggle team selection in the dialog
  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeamIds(prev => 
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    )
  }

  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev => 
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

  if (loading || hierarchyLoading || teamsLoading) {
    return <div className="flex items-center justify-center min-h-[200px]">Loading stakeholders...</div>
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-destructive">
        Error loading stakeholders: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingStakeholder(null)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Stakeholder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStakeholder ? 'Edit' : 'Add'} Stakeholder</DialogTitle>
              <DialogDescription>
                {editingStakeholder
                  ? 'Edit the stakeholder details below'
                  : 'Add a new stakeholder to your organization'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  rules={{ required: 'Display name is required' }}
                  render={({ field }: { field: ControllerRenderProps<StakeholderFormData, 'displayName'> }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email',
                    },
                  }}
                  render={({ field }: { field: ControllerRenderProps<StakeholderFormData, 'email'> }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="photoURL"
                  render={({ field }: { field: ControllerRenderProps<StakeholderFormData, 'photoURL'> }) => (
                    <FormItem>
                      <FormLabel>Photo URL (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">
                    {editingStakeholder ? 'Update' : 'Create'} Stakeholder
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stakeholder</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stakeholders.map((stakeholder) => {
              const stakeholderTeamIds = getTeamsForStakeholder(stakeholder.id)
              const stakeholderTeamNames = stakeholderTeamIds
                .map(teamId => hierarchy?.teams[teamId]?.name || 'Unknown Team')
                .join(', ')

              return (
                <TableRow key={stakeholder.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={stakeholder.photoURL} />
                        <AvatarFallback>
                          {stakeholder.displayName
                            ? stakeholder.displayName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                            : "👤"}
                        </AvatarFallback>
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingStakeholder(stakeholder)
                          setIsOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(stakeholder)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTeamDialog(stakeholder)}
                      >
                        Manage Teams
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {stakeholders.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No stakeholders found. Add your first stakeholder to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog for managing stakeholder team assignments */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Teams for {editingStakeholder?.displayName}</DialogTitle>
            <DialogDescription>
              Select the teams this stakeholder should be a member of
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {hierarchy && Object.entries(hierarchy.teams).map(([teamId, team]) => {
              if (!team.parentId) {
                return renderTeamHierarchy(teamId, team, 0)
              }
              return null
            })}
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateStakeholderTeams}>
              Update Team Assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 