import * as React from "react"
import { cn } from "@/lib/utils"
import { DecisionWorkflowStep, DecisionWorkflowSteps } from "@/lib/domain/Decision"

export function WorkflowProgress({ currentStep }: { currentStep: DecisionWorkflowStep }) {
  return (
    <div className="flex gap-1 items-center">
      {DecisionWorkflowSteps.map((step, index) => {
        const StepIcon = step.icon
        const isCompleted = DecisionWorkflowSteps.indexOf(currentStep) > index
        const isActive = step === currentStep

        return (
          <div
            key={step.label}
            className={cn(
              "relative group",
              isCompleted || isActive ? "text-primary" : "text-muted-foreground/40"
            )}
          >
            <StepIcon className="h-4 w-4" />
            <div className="absolute hidden group-hover:block bg-popover text-popover-foreground rounded px-2 py-1 text-xs -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-md">
              {step.label}
            </div>
          </div>
        )
      })}
    </div>
  )
} 