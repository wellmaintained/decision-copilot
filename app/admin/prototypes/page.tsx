'use client'

import React, { useState } from 'react'
import HorizontalWorkflowProgress from './horizontal-workflow-progress'
import { DecisionWorkflowSteps, DecisionWorkflowStep, WorkflowNavigator } from '@/lib/domain/Decision'

export default function PrototypesPage() {
  const [currentStep, setCurrentStep] = useState<DecisionWorkflowStep>(DecisionWorkflowSteps.IDENTIFY)

  const goToPreviousStep = () => {
    const previousStep = WorkflowNavigator.getPreviousStep(currentStep);
    if (previousStep) {
      setCurrentStep(previousStep);
    }
  };

  const goToNextStep = () => {
    const nextStep = WorkflowNavigator.getNextStep(currentStep);
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Horizontal Workflow Progress Prototype</h1>
        <p className="text-muted-foreground">
          Click on completed steps or the current step to navigate between sections.
          Future steps are disabled until reached.
        </p>
      </div>

      <HorizontalWorkflowProgress 
        currentStep={currentStep}
        onStepClick={setCurrentStep}
      />

      <div className="flex justify-between">
        <button
          onClick={goToPreviousStep}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          disabled={WorkflowNavigator.isFirstStep(currentStep)}
        >
          Previous Step
        </button>
        <button
          onClick={goToNextStep}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          disabled={WorkflowNavigator.isLastStep(currentStep)}
        >
          Next Step
        </button>
      </div>
    </div>
  )
} 