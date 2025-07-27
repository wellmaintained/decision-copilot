import { DecisionWorkflowStepsSequence } from "@decision-copilot/domain/Decision"
import { cn } from "@decision-copilot/ui"
import { Search, Users, Target, CheckCircle, Send } from "lucide-react"
import * as React from "react"

// Icon mapping for workflow steps
const STEP_ICONS = {
  identify: Search,
  stakeholders: Users,
  method: Target,
  choose: CheckCircle,
  publish: Send,
} as const;

export function WorkflowProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex gap-1 items-center">
      {DecisionWorkflowStepsSequence.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = currentStep > stepNumber
        const isActive = stepNumber === currentStep
        const StepIcon = STEP_ICONS[step.key as keyof typeof STEP_ICONS] || Search

        return (
          <div
            key={step.label}
            className={cn(
              "relative group",
              isCompleted || isActive ? "text-primary" : "text-muted-foreground/40"
            )}
          >
            <div className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center",
              isCompleted ? "bg-primary text-primary-foreground" : 
              isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}>
              <StepIcon className="h-3 w-3" />
            </div>
            <div className="absolute hidden group-hover:block bg-popover text-popover-foreground rounded px-2 py-1 text-xs -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-md">
              {step.label}
            </div>
          </div>
        )
      })}
    </div>
  )
} 