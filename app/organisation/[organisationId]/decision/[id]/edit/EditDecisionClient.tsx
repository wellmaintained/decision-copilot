'use client'

import WorkflowAccordion from '@/components/workflow/WorkflowAccordion'
import { notFound } from 'next/navigation'
import { useState } from 'react'
import { DecisionWorkflowStep, DecisionWorkflowSteps } from '@/lib/domain/Decision'

interface EditDecisionClientProps {
  organisationId: string
  id: string
}

export default function EditDecisionClient({ organisationId, id }: EditDecisionClientProps) {
  const [currentStep, setCurrentStep] = useState<DecisionWorkflowStep>(DecisionWorkflowSteps.IDENTIFY)

  if (!organisationId || !id) {
    return notFound()
  }

  const handleStepChange = (nextStep: DecisionWorkflowStep) => {
    setCurrentStep(nextStep)
  }

  return (
    <div className="container mx-auto py-8">
      <WorkflowAccordion
        organisationId={organisationId}
        decisionId={id}
        currentStep={currentStep}
        onStepChange={handleStepChange}
      />
    </div>
  )
} 