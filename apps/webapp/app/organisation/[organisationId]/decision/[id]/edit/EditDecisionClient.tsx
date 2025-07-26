'use client'

import { DecisionWorkflowStep, DecisionWorkflowSteps } from '@decision-copilot/domain/Decision'
import { notFound, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useToast } from "@/components/ui/use-toast"
import HorizontalWorkflowProgress from '@/components/workflow/horizontal-workflow-progress'
import WorkflowAccordion from '@/components/workflow/WorkflowAccordion'
import { useDecision } from '@/hooks/useDecisions'

interface EditDecisionClientProps {
  organisationId: string
  id: string
}

export default function EditDecisionClient({ organisationId, id }: EditDecisionClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { decision, loading } = useDecision(id, organisationId)
  const [currentStep, setCurrentStep] = useState<DecisionWorkflowStep>(DecisionWorkflowSteps.IDENTIFY)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  useEffect(() => {
    if (decision && !initialLoadComplete) {
      setInitialLoadComplete(true)
      if (decision.isPublished()) {
        toast({
          title: "Decision is published",
          description: "This decision has been published and can no longer be edited.",
          variant: "default"
        })
        router.push(`/organisation/${organisationId}/decision/${id}/view`)
      } else if (decision.isSuperseded()) {
        const supersededByRelationship = decision.getSupersededByRelationship()
        toast({
          title: "Decision is superseded",
          description: `This decision has been superseded by "${supersededByRelationship?.targetDecisionTitle}" and can no longer be edited.`,
          variant: "default"
        })
        router.push(`/organisation/${organisationId}/decision/${id}/view`)
      }
    }
  }, [decision, organisationId, id, router, toast, initialLoadComplete])

  if (!organisationId || !id) {
    return notFound()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const handleStepChange = (nextStep: DecisionWorkflowStep) => {
    setCurrentStep(nextStep)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <HorizontalWorkflowProgress
          currentStep={currentStep}
          onStepChange={handleStepChange}
        />
      </div>
      <WorkflowAccordion
        organisationId={organisationId}
        decisionId={id}
        currentStep={currentStep}
        onStepChange={handleStepChange}
      />
    </div>
  )
} 