"use client"


import { Stakeholder , StakeholderTeam, StakeholderTeamProps , Organisation } from "@decision-copilot/domain"
import { Check, X, Trash2 } from 'lucide-react'
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface StakeholderSectionProps {
  stakeholders: Stakeholder[]
  updateStakeholder: (stakeholder: Stakeholder) => Promise<void>
  removeStakeholder: (id: string) => Promise<void>
  stakeholderTeams: StakeholderTeam[]
  setStakeholderTeams: (teams: StakeholderTeam[]) => void
  organisations: Organisation[]
  addStakeholderTeam: (props: Omit<StakeholderTeamProps, 'id'>) => Promise<void>
  removeStakeholderTeam: (stakeholderId: string, teamId: string) => Promise<void>
}

export function StakeholderSection({
    stakeholders,
    updateStakeholder,
    removeStakeholder,
    stakeholderTeams,
    organisations,
    addStakeholderTeam,
    removeStakeholderTeam,
  }: StakeholderSectionProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingData, setEditingData] = useState({
      displayName: "",
      email: "",
      photoURL: "",
    })
  
    const handleSave = (id: string) => {
      updateStakeholder(Stakeholder.create({ id, ...editingData }))
      setEditingId(null)
    }
  
    const handleCancel = () => {
      setEditingId(null)
    }
  
    const handleDelete = (id: string) => {
      removeStakeholder(id)
    }
  
    return (
      <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stakeholder</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stakeholders.map((stakeholder) => {
                // TODO: Figure out how to filter out stakeholders from orgs that the current user doesn't have access to
                // in a way that doesn't filter out new stakeholders that haven't been assigned to any orgs yet
                if (stakeholder.id === "H8sSUM7RKwOreHsMDjhDgmbF7L23") return null; // H8sSUM7RKwOreHsMDjhDgmbF7L23 => Wendy Laing
                return (
                <TableRow key={stakeholder.id}>
                  <TableCell>
                    {editingId === stakeholder.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editingData.displayName}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              displayName: e.target.value,
                            })
                          }
                          placeholder="Display name"
                          autoFocus
                        />
                        <Input
                          value={editingData.email}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              email: e.target.value,
                            })
                          }
                          placeholder="Email"
                          type="email"
                        />
                        <Input
                          value={editingData.photoURL}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              photoURL: e.target.value,
                            })
                          }
                          placeholder="Photo URL"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-3 cursor-pointer hover:text-primary"
                        onClick={() => {
                          setEditingId(stakeholder.id)
                          setEditingData({
                            displayName: stakeholder.displayName || '',
                            email: stakeholder.email || '',
                            photoURL: stakeholder.photoURL || '',
                          })
                        }}
                      >
                        <Avatar>
                          <AvatarImage src={stakeholder.photoURL} />
                          <AvatarFallback>
                            {stakeholder.displayName
                              ? stakeholder.displayName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                              : "👤"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {stakeholder.displayName || "(Click to edit)"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {stakeholder.email}
                          </div>
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === stakeholder.id ? (
                      <div className="space-y-4">
                        {organisations.map((org) => {
                          const orgTeams = org.teams;
                          if (orgTeams.length === 0) return null;
                          
                          return (
                            <div key={org.id} className="space-y-2">
                              <div className="font-medium text-sm">{org.name}</div>
                              <div className="ml-4 space-y-1">
                                {orgTeams.map((team) => (
                                  <div key={team.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${stakeholder.id}-${team.id}`}
                                      checked={stakeholderTeams.some(
                                        st => st.stakeholderId === stakeholder.id && st.teamId === team.id
                                      )}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                            const newTeamAssignment = {
                                              stakeholderId: stakeholder.id,
                                              teamId: team.id,
                                              organisationId: team.organisation.id,
                                            }
                                            addStakeholderTeam(newTeamAssignment)
                                          } else {
                                            removeStakeholderTeam(stakeholder.id, team.id)
                                          }
                                      }}
                                    />
                                    <label
                                      htmlFor={`${stakeholder.id}-${team.id}`}
                                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {team.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {
                        organisations.map((org) => {
                          const orgTeams = stakeholderTeams
                            .filter(st => st.stakeholderId === stakeholder.id && st.organisationId === org.id)
                            .map(st => org.teams.find(t => t.id === st.teamId))
                            .filter((team): team is NonNullable<typeof team> => team !== undefined);
                            
                          if (orgTeams.length === 0) return null;
                          
                          return (
                            <div key={org.id} className="flex gap-2 items-center">
                              <span className="text-muted-foreground text-sm">{org.name}:</span>
                              <div className="flex flex-wrap gap-1">
                                {orgTeams.map((team) => (
                                  <div
                                    key={team.id}
                                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                                  >
                                    {team.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingId === stakeholder.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSave(stakeholder.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancel()}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(stakeholder.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                );
            })}
            </TableBody>
          </Table>
      </div>
    )
  }