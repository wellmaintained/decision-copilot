"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RoleAssignment } from "@/components/role-assignment"
import { DecisionMethodCard } from "@/components/decision-method-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { useParams } from 'next/navigation'
import { useDecision } from "@/hooks/useDecisions"
import { useStakeholders } from "@/hooks/useStakeholders"
import { DecisionMethod } from "@/lib/domain/Decision"

export default function DecisionProcess() {
  const params = useParams()
  const decisionId = params.id as string
  const organisationId = params.organisationId as string

  const { 
    decision, 
    loading: decisionsLoading, 
    error: decisionsError, 
    updateDecisionMethod 
  } = useDecision(decisionId, organisationId)
  const {
    loading: stakeholdersLoading,
  } = useStakeholders()

  const [selectedMethod, setSelectedMethod] = useState<DecisionMethod | null>(null)

  useEffect(() => {
    if (decision?.decisionMethod) {
      setSelectedMethod(decision.decisionMethod as DecisionMethod)
    }
  }, [decision])

  if (decisionsLoading || stakeholdersLoading) {
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
    updateDecisionMethod(method)
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
              title="Accountable Individual"
              description="A single decider makes a choice and informs all stakeholders"
              speedValue={90}
              buyInValue={10}
              isSelected={selectedMethod === "accountable_individual"}
              onSelect={() => handleMethodSelect("accountable_individual")}
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
          <Link href={`/organisation/${organisationId}/decision/${decisionId}/decide`}>
            Next
          </Link>
        </Button>
      </div>
    </>
  )
}

