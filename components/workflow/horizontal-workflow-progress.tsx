'use client'

import React, { useMemo, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { ChevronRight } from 'lucide-react'
import { 
  DecisionWorkflowSteps, 
  DecisionWorkflowStep, 
  DecisionWorkflowStepKey,
  DecisionWorkflowStepsSequence,
  WorkflowNavigator,
  StepRoles,
} from '@/lib/domain/Decision'
import { cn } from "@/lib/utils"

const WORKFLOW_CONFIG = {
  STEP_SIZE: {
    ICON: 'h-12 w-12',
    ARROW: 'w-5 h-5',
  },
  COLORS: {
    ACTIVE: 'bg-primary text-primary-foreground',
    INACTIVE: 'bg-muted text-muted-foreground',
    COMPLETED: 'bg-primary text-primary-foreground',
    DISABLED: 'bg-muted text-muted-foreground cursor-not-allowed',
  },
} as const;

interface HorizontalWorkflowProgressProps {
  currentStep?: DecisionWorkflowStep;
  onStepClick?: (step: DecisionWorkflowStep) => void;
  allowFutureSteps?: boolean;
  showRoles?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function HorizontalWorkflowProgress({ 
  currentStep = DecisionWorkflowSteps.IDENTIFY,
  onStepClick,
  allowFutureSteps = false,
  showRoles = true,
  className,
  size = 'md',
}: HorizontalWorkflowProgressProps) {
  const currentStepIndex = useMemo(() => 
    WorkflowNavigator.getStepIndex(currentStep),
    [currentStep]
  );

  const getStepSize = useCallback((size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'lg':
        return 'h-16 w-16';
      default:
        return WORKFLOW_CONFIG.STEP_SIZE.ICON;
    }
  }, []);

  const renderStep = useCallback((step: DecisionWorkflowStep, index: number) => {
    const isActive = step.key === currentStep.key;
    const isCompleted = index < currentStepIndex;
    const isClickable = onStepClick && (allowFutureSteps || isCompleted || isActive);
    const role = StepRoles[step.key.toUpperCase() as DecisionWorkflowStepKey];
    const stepSize = getStepSize(size);

    return (
      <React.Fragment key={step.key}>
        {/* Step circle with icon and role */}
        <div className="flex flex-col items-center gap-2">
          {showRoles && (
            <div
              className={cn(
                "inline-flex justify-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
                isCompleted || isActive
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {role}
            </div>
          )}
          <button
            onClick={() => isClickable && onStepClick?.(step)}
            className={cn(
              "relative flex items-center justify-center rounded-full border-2 transition-colors",
              stepSize,
              isClickable && "cursor-pointer hover:bg-primary/90",
              isCompleted || isActive
                ? WORKFLOW_CONFIG.COLORS.COMPLETED
                : WORKFLOW_CONFIG.COLORS.INACTIVE,
              !isClickable && WORKFLOW_CONFIG.COLORS.DISABLED
            )}
            disabled={!isClickable}
            aria-current={isActive ? 'step' : undefined}
            aria-label={`${step.label} step, ${isCompleted ? 'completed' : isActive ? 'current' : 'upcoming'}`}
          >
            <step.icon className="w-5 h-5" aria-hidden="true" />
          </button>
          <span 
            className={cn(
              "text-sm font-medium",
              isCompleted || isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {step.label}
          </span>
        </div>
        
        {/* Connector line with arrow */}
        {!WorkflowNavigator.isLastStep(step) && (
          <div className="flex-1 flex items-center">
            <div 
              className={cn(
                "h-0.5 flex-1",
                isCompleted ? "bg-primary" : "bg-muted"
              )}
              role="presentation"
            />
            <ChevronRight 
              className={cn(
                WORKFLOW_CONFIG.STEP_SIZE.ARROW,
                "shrink-0",
                isCompleted ? "text-primary" : "text-muted"
              )}
              aria-hidden="true"
            />
          </div>
        )}
      </React.Fragment>
    );
  }, [currentStep, currentStepIndex, onStepClick, allowFutureSteps, showRoles, size, getStepSize]);

  return (
    <Card className={cn("p-8", className)}>
      <div className="flex items-center justify-between" role="progressbar" aria-valuemin={0} aria-valuemax={DecisionWorkflowStepsSequence.length} aria-valuenow={currentStepIndex + 1}>
        {DecisionWorkflowStepsSequence.map(renderStep)}
      </div>
    </Card>
  )
} 