"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RoleAssignment } from "@/components/role-assignment"
import { DecisionMethodCard } from "@/components/decision-method-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { useParams } from 'next/navigation'
import { useDecisions } from "@/hooks/useDecisions"
import { useStakeholderTeams } from "@/hooks/useStakeholderTeams"
import { useOrganisations } from "@/hooks/useOrganisations"
import { DecisionMethod } from "@/lib/domain/Decision"

export default function DecisionProcess() {
  const params = useParams()
  const decisionId = params.id as string
  const projectId = params.projectId as string
  const teamId = params.teamId as string
  const organisationId = params.organisationId as string

  const { decisions, loading: decisionsLoading, error: decisionsError, updateDecisionMethod } = useDecisions()
  const { stakeholderTeams, loading: stakeholderTeamsLoading } = useStakeholderTeams()
  const { organisations, loading: organisationsLoading } = useOrganisations()

  const [selectedMethod, setSelectedMethod] = useState<DecisionMethod>("consent")

  const decision = decisions?.find(d => d.id === decisionId)

  useEffect(() => {
    if (decision?.decisionMethod) {
      setSelectedMethod(decision.decisionMethod as DecisionMethod)
    }
  }, [decision?.decisionMethod])

  if (decisionsLoading || stakeholderTeamsLoading || organisationsLoading) {
    return <div>Loading...</div>
  }

  if (decisionsError) {
    return <div>Error: {decisionsError.message}</div>
  }

  if (!decision) {
    return <div>Decision not found</div>
  }

  const handleMethodSelect = (method: DecisionMethod) => {
    setSelectedMethod(method)
    updateDecisionMethod(decision, method)
  }

  return (
    <>
      <RoleAssignment decision={decision} />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">Decision making method</CardTitle>
          <CardDescription className="text-sm">
            Given the assigned roles assigned; one of the following methods could be used:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <DecisionMethodCard
              title="Autocratic"
              description="A single decider makes a choice and informs all stakeholders"
              speedValue={90}
              buyInValue={10}
              isSelected={selectedMethod === "autocratic"}
              onSelect={() => handleMethodSelect("autocratic")}
            />
            <DecisionMethodCard
              title="Consent"
              description="The proposal is selected if no one has a strong/reasoned objection"
              speedValue={80}
              buyInValue={90}
              isSelected={selectedMethod === "consent"}
              onSelect={() => handleMethodSelect("consent")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button size="lg" asChild>
          <Link href={`/organisation/${organisationId}/team/${teamId}/project/${projectId}/decision/${decisionId}/decide`}>
            Next
          </Link>
        </Button>
      </div>
    </>
  )
}

