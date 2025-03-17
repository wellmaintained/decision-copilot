'use client'

import React, { useState } from 'react'
import HorizontalWorkflowProgress from './horizontal-workflow-progress'
import WorkflowAccordion from './WorkflowAccordion'
import { DecisionWorkflowSteps, DecisionWorkflowStep, WorkflowNavigator } from '@/lib/domain/Decision'

export default function PrototypesPage() {
  const [currentStep, setCurrentStep] = useState<DecisionWorkflowStep>(DecisionWorkflowSteps.IDENTIFY)

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
      </div>

      <HorizontalWorkflowProgress 
        currentStep={currentStep}
        onStepClick={setCurrentStep}
        allowFutureSteps={false}
      />

      <WorkflowAccordion
        currentStep={currentStep}
        onStepComplete={handleStepComplete}
      />
    </div>
  )
} 