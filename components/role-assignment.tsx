"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Decision, DecisionStakeholderRole } from "@/lib/domain/Decision"
import { useStakeholders } from "@/hooks/useStakeholders"
import { useDecision } from "@/hooks/useDecisions"
import { StakeholderWithRole } from "@/lib/domain/stakeholdersRepository"

interface RoleAssignmentProps {
  decision: Decision
}

export function RoleAssignment({ decision }: RoleAssignmentProps) {
  const { getStakeholdersForDecision, loading: stakeholdersLoading } = useStakeholders()
  const { updateStakeholders } = useDecision(decision.id)
  const [stakeholdersWithRoles, setStakeholdersWithRoles] = useState<StakeholderWithRole[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStakeholders = async () => {
      const stakeholders = await getStakeholdersForDecision(decision)
      setStakeholdersWithRoles(stakeholders)
      setLoading(false)
    }
    loadStakeholders()
  }, [decision, getStakeholdersForDecision])

  if (stakeholdersLoading || loading) {
    return <div>Loading stakeholders...</div>
  }

  const handleRoleChange = (stakeholderId: string, role: DecisionStakeholderRole["role"]) => {
    const updatedStakeholders = decision.stakeholders.map(s => ({
      stakeholder_id: s.stakeholder_id,
      role: s.stakeholder_id === stakeholderId ? role : s.role
    }))
    updateStakeholders(updatedStakeholders)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Assign roles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          {stakeholdersWithRoles.map((stakeholder) => (
            <div
              key={stakeholder.id}
              className="flex items-center justify-between border-b p-5 last:border-0"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={stakeholder.photoURL} alt={stakeholder.displayName} />
                  <AvatarFallback>{stakeholder.displayName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{stakeholder.displayName}</span>
              </div>
              <RadioGroup
                defaultValue={stakeholder.role}
                onValueChange={(value) => handleRoleChange(stakeholder.id, value as DecisionStakeholderRole["role"])}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2.5">
                  <RadioGroupItem value="decider" id={`${stakeholder.id}-decider`} className="h-5 w-5" />
                  <Label htmlFor={`${stakeholder.id}-decider`} className="text-sm">Decider</Label>
                </div>
                <div className="flex items-center space-x-2.5">
                  <RadioGroupItem value="advisor" id={`${stakeholder.id}-advisor`} className="h-5 w-5" />
                  <Label htmlFor={`${stakeholder.id}-advisor`} className="text-sm">Advisor</Label>
                </div>
                <div className="flex items-center space-x-2.5">
                  <RadioGroupItem value="observer" id={`${stakeholder.id}-observer`} className="h-5 w-5" />
                  <Label htmlFor={`${stakeholder.id}-observer`} className="text-sm">Observer</Label>
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

