import * as React from "react"
import { cn } from "./../utils"
// import { DecisionWorkflowStepsSequence } from "./@/lib/domain/Decision"
const DecisionWorkflowStepsSequence: Array<{label: string; icon: React.ComponentType}> = []; // Placeholder

export function WorkflowProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex gap-1 items-center">
      {DecisionWorkflowStepsSequence.map((step: {label: string; icon: React.ComponentType}, index: number) => {
        const StepIcon = step.icon
        const isCompleted = currentStep > index + 1
        const isActive = index + 1 === currentStep

        return (
          <div
            key={step.label}
            className={cn(
              "relative group",
              isCompleted || isActive ? "text-primary" : "text-muted-foreground/40"
            )}
          >
            <StepIcon />
            <div className="absolute hidden group-hover:block bg-popover text-popover-foreground rounded px-2 py-1 text-xs -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-md">
              {step.label}
            </div>
          </div>
        )
      })}
    </div>
  )
} 