'use client'

import { useParams } from 'next/navigation'
import { useDecision } from '@/hooks/useDecisions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Editor } from '@/components/editor'
import { DecisionItemList } from '@/components/decision-item-list'
import { SupportingMaterialsList } from '@/components/supporting-materials-list'
import { DecisionRelationshipsList } from '@/components/decision-relationships-list'

export default function DecidePage() {
  const params = useParams()
  const decisionId = params.id as string
  const projectId = params.projectId as string
  const teamId = params.teamId as string
  const organisationId = params.organisationId as string

  const {
    decision,
    loading: decisionsLoading,
    error: decisionsError,
    updateDecisionOptions,
    updateDecisionCriteria,
    updateDecisionContent,
    addSupportingMaterial,
    removeSupportingMaterial,
  } = useDecision(decisionId, organisationId, teamId, projectId)

  if (decisionsLoading) {
    return <div>Loading...</div>
  }

  if (decisionsError) {
    return <div>Error: {decisionsError.message}</div>
  }

  if (!decision) {
    return <div>Decision not found</div>
  }

  const handleAddOption = (option: string) => {
    const newOptions = [...decision.options.filter(o => o !== ""), option]
    updateDecisionOptions(newOptions)
  }

  const handleUpdateOption = (index: number, option: string) => {
    const newOptions = [...decision.options]
    newOptions[index] = option
    updateDecisionOptions(newOptions)
  }

  const handleDeleteOption = (index: number) => {
    const newOptions = decision.options.filter((_, i) => i !== index)
    updateDecisionOptions(newOptions)
  }

  const handleAddCriterion = (criterion: string) => {
    const newCriteria = [...decision.criteria.filter(c => c !== ""), criterion]
    updateDecisionCriteria(newCriteria)
  }

  const handleUpdateCriterion = (index: number, criterion: string) => {
    const newCriteria = [...decision.criteria]
    newCriteria[index] = criterion
    updateDecisionCriteria(newCriteria)
  }

  const handleDeleteCriterion = (index: number) => {
    const newCriteria = decision.criteria.filter((_, i) => i !== index)
    updateDecisionCriteria(newCriteria)
  }

  return (
    <>
      <h1 className="text-3xl font-semibold">Decide</h1>
      
      <Card className="p-6 space-y-8">

        <DecisionRelationshipsList
          relationshipType="blocked_by"
          fromDecision={decision}
          title="Blocked By Decision(s)"
        />

        <DecisionItemList
          title="Options"
          items={decision.options}
          onAdd={handleAddOption}
          onUpdate={handleUpdateOption}
          onDelete={handleDeleteOption}
          placeholder="Enter new option"
        />

        <DecisionItemList
          title="Criteria"
          items={decision.criteria}
          onAdd={handleAddCriterion}
          onUpdate={handleUpdateCriterion}
          onDelete={handleDeleteCriterion}
          placeholder="Enter new criterion"
        />

        <div className="space-y-4">
          <h2 className="text-xl text-muted-foreground">Decision</h2>
          <Editor 
            content={decision.decision || ""}
            onChange={(content) => updateDecisionContent(content)}
          />
        </div>

        <SupportingMaterialsList 
          materials={decision.supportingMaterials} 
          onAdd={addSupportingMaterial}
          onRemove={removeSupportingMaterial}
        />
      </Card>

      <div className="flex justify-end pt-4">
        <Button size="lg" asChild>
          <Link href={`/organisation/${organisationId}/team/${teamId}/project/${projectId}/decision/${decisionId}/view`}>
            Publish
          </Link>
        </Button>
      </div>
    </>
  )
}

