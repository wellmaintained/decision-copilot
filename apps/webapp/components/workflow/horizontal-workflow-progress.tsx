"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { ChevronRight, Search, Users, Target, CheckCircle, Send } from "lucide-react";
import {
  DecisionWorkflowSteps,
  DecisionWorkflowStep,
  DecisionWorkflowStepKey,
  DecisionWorkflowStepsSequence,
  WorkflowNavigator,
  StepRoles,
} from "@decision-copilot/domain/Decision";
import { cn } from "@decision-copilot/ui";

// Icon mapping for workflow steps
const STEP_ICONS = {
  identify: Search,
  stakeholders: Users,
  method: Target,
  choose: CheckCircle,
  publish: Send,
} as const;

interface HorizontalWorkflowProgressProps {
  currentStep?: DecisionWorkflowStep;
  onStepChange?: (step: DecisionWorkflowStep) => void;
  allowFutureSteps?: boolean;
  showRoles?: boolean;
  className?: string;
}

export default function HorizontalWorkflowProgress({
  currentStep = DecisionWorkflowSteps.IDENTIFY,
  onStepChange,
  allowFutureSteps = false,
  showRoles = true,
  className,
}: HorizontalWorkflowProgressProps) {
  const currentStepIndex = WorkflowNavigator.getStepIndex(currentStep);

  return (
    <Card className={cn("p-6", className)}>
      <div
        className="flex items-center justify-between"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={DecisionWorkflowStepsSequence.length}
        aria-valuenow={currentStepIndex + 1}
      >
        {DecisionWorkflowStepsSequence.map((step, index) => {
          const isActive = step.key === currentStep.key;
          const isCompleted = index < currentStepIndex;
          const isClickable =
            onStepChange && (allowFutureSteps || isCompleted || isActive);
          const role =
            StepRoles[step.key.toUpperCase() as DecisionWorkflowStepKey];
          const StepIcon = STEP_ICONS[step.key as keyof typeof STEP_ICONS] || Search;

          return (
            <React.Fragment key={step.key}>
              {/* Step with icon and label */}
              <div className="flex flex-col items-center gap-2">
                {showRoles && (
                  <div
                    className={cn(
                      "inline-flex justify-center rounded-full px-3 py-1 text-xs font-semibold",
                      isCompleted || isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {role}
                  </div>
                )}

                <button
                  onClick={() => isClickable && onStepChange?.(step)}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors",
                    isClickable && "cursor-pointer hover:bg-primary/90",
                    isCompleted || isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                    !isClickable && "cursor-not-allowed",
                  )}
                  disabled={!isClickable}
                  aria-current={isActive ? "step" : undefined}
                >
                  <StepIcon className="h-5 w-5" aria-hidden="true" />
                </button>

                <span
                  className={cn(
                    "text-sm font-medium",
                    isCompleted || isActive
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < DecisionWorkflowStepsSequence.length - 1 && (
                <div className="flex-1 flex items-center">
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isCompleted ? "bg-primary" : "bg-muted",
                    )}
                  />
                  <ChevronRight
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isCompleted ? "text-primary" : "text-muted",
                    )}
                    aria-hidden="true"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </Card>
  );
}
