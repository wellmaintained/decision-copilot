import React, { useState, useEffect } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { DecisionWorkflowStep, DecisionWorkflowStepsSequence, WorkflowNavigator } from '@/lib/domain/Decision'
import { cn } from '@/lib/utils'
import { CheckCircle2, ArrowRight, ChevronRight } from 'lucide-react'

interface WorkflowAccordionProps {
  currentStep: DecisionWorkflowStep
  onStepComplete?: (step: DecisionWorkflowStep) => void
  className?: string
}

export default function WorkflowAccordion({
  currentStep,
  onStepComplete,
  className
}: WorkflowAccordionProps) {
  const currentStepIndex = WorkflowNavigator.getStepIndex(currentStep)
  const [openStep, setOpenStep] = useState<string>(currentStep.key)

  // Update the open step when currentStep changes
  useEffect(() => {
    setOpenStep(currentStep.key)
  }, [currentStep])

  const renderStepContent = (step: DecisionWorkflowStep, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Click to view details
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{step.label} Content</h3>
        <p className="text-muted-foreground">
          This is placeholder content for the {step.label.toLowerCase()} step. 
          In the actual implementation, this will contain the specific form or content for this step.
        </p>
        {isCurrent && (
          <div className="flex justify-between items-center">
            <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${(currentStepIndex / (DecisionWorkflowStepsSequence.length - 1)) * 100}%` }}
              />
            </div>
            <button
              onClick={() => onStepComplete?.(step)}
              className="ml-4 px-4 py-2 bg-primary text-primary-foreground rounded-md inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
              aria-label={`Complete ${step.label} and proceed to next step`}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Accordion
      type="single"
      value={openStep}
      onValueChange={setOpenStep}
      className={cn("w-full space-y-2", className)}
      collapsible
    >
      {DecisionWorkflowStepsSequence.map((step, index) => {
        const isCompleted = index < currentStepIndex
        const isCurrent = step.key === currentStep.key
        const isDisabled = index > currentStepIndex

        return (
          <AccordionItem
            key={step.key}
            value={step.key}
            className={cn(
              "border rounded-lg transition-all duration-200",
              isDisabled && "opacity-50",
              isCurrent && "ring-2 ring-primary ring-offset-2",
              isCompleted && "bg-muted/10"
            )}
            disabled={isDisabled}
          >
            <AccordionTrigger 
              className="px-4 hover:no-underline"
              aria-label={`${step.label} step - ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
            >
              <div className="flex items-center gap-2">
                {isCurrent ? (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                ) : !isCompleted && (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                )}
                <step.icon className={cn(
                  "h-5 w-5",
                  isCurrent && "text-primary"
                )} />
                <span className={cn(
                  "font-medium",
                  isCurrent && "text-primary"
                )}>
                  {step.label}
                </span>
                {isCompleted && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              {renderStepContent(step, isCompleted, isCurrent)}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
} 