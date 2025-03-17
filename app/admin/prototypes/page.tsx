'use client'

import React, { useState } from 'react'
import HorizontalWorkflowProgress from './horizontal-workflow-progress'
import WorkflowAccordion from './WorkflowAccordion'
import { DecisionWorkflowSteps, DecisionWorkflowStep, WorkflowNavigator } from '@/lib/domain/Decision'
import { useSearchParams } from 'next/navigation'

export default function PrototypesPage() {
  const [currentStep, setCurrentStep] = useState<DecisionWorkflowStep>(DecisionWorkflowSteps.IDENTIFY)
  const searchParams = useSearchParams()
  
  const organisationId = searchParams.get('organisationId') ?? '9HY1YTkOdqxOTFOMZe8r'
  const decisionId = searchParams.get('decisionId') ?? 'KRWdpmQTU2DRR76jrlC4'

  const handleStepComplete = (step: DecisionWorkflowStep) => {
    const nextStep = WorkflowNavigator.getNextStep(step)
    if (nextStep) {
      setCurrentStep(nextStep)
    }
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Decision Workflow Prototype</h1>
        <p className="text-muted-foreground">
          This prototype demonstrates the new single-page workflow design with a horizontal progress indicator
          and expandable sections for each step.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Using organisation: <code className="bg-muted px-1 py-0.5 rounded">{organisationId}</code>
          <br />
          Using decision: <code className="bg-muted px-1 py-0.5 rounded">{decisionId}</code>
        </p>
      </div>

      <HorizontalWorkflowProgress 
        currentStep={currentStep}
        onStepClick={setCurrentStep}
        allowFutureSteps={false}
      />

      <WorkflowAccordion
        currentStep={currentStep}
        onStepComplete={handleStepComplete}
        organisationId={organisationId}
        decisionId={decisionId}
      />
    </div>
  )
} 