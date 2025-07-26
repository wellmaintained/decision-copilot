'use client';

import { DecisionWorkflowStep, DecisionWorkflowStepKey, StepRoles } from '@decision-copilot/domain/Decision'
import { cn } from '@decision-copilot/ui'
import { ArrowDown, Search, Users, Target, CheckCircle, Send } from 'lucide-react'
import { STEP_DESCRIPTIONS, STYLE_CLASSES, StepKey } from './WorkflowAccordionConstants'

// Icon mapping for workflow steps
const STEP_ICONS = {
  identify: Search,
  stakeholders: Users,
  method: Target,
  choose: CheckCircle,
  publish: Send,
} as const

interface StepHeaderProps {
  step: DecisionWorkflowStep;
  isCurrent: boolean;
}

export function StepHeader({ step, isCurrent }: StepHeaderProps) {
  const StepIcon = STEP_ICONS[step.key as keyof typeof STEP_ICONS] || Search
  
  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex items-center gap-2">
        <StepIcon className={cn(
          STYLE_CLASSES.stepIcon.base,
          isCurrent && STYLE_CLASSES.stepIcon.current
        )} />
        <span className={cn(
          "text-base font-medium min-w-[100px] inline-block",
          isCurrent && "text-primary"
        )}>
          {step.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <RolePill role={StepRoles[step.key.toUpperCase() as DecisionWorkflowStepKey]} />
        <StepDescription stepKey={step.key as StepKey} />
      </div>
    </div>
  );
}

interface RolePillProps {
  role: 'Driver' | 'Decider';
}

export function RolePill({ role }: RolePillProps) {
  return (
    <div className={cn(
      "px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
      role === 'Driver' 
        ? "bg-blue-100 text-blue-700"
        : "bg-purple-100 text-purple-700"
    )}>
      {role}
    </div>
  );
}

interface StepDescriptionProps {
  stepKey: StepKey;
}

export function StepDescription({ stepKey }: StepDescriptionProps) {
  return (
    <span className="text-sm text-muted-foreground">
      {STEP_DESCRIPTIONS[stepKey]}
    </span>
  );
}

interface ProgressBarProps {
  currentStepIndex: number;
  totalSteps: number;
}

export function ProgressBar({ currentStepIndex, totalSteps }: ProgressBarProps) {
  return (
    <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
      <div 
        className="h-full bg-primary transition-all duration-500 ease-in-out"
        style={{ width: `${(currentStepIndex / (totalSteps - 1)) * 100}%` }}
      />
    </div>
  );
}

interface NextButtonProps {
  onComplete: () => void;
  stepLabel: string;
}

export function NextButton({ onComplete, stepLabel }: NextButtonProps) {
  if (typeof onComplete !== 'function') {
    return null;
  }

  return (
    <button
      onClick={() => {
        onComplete();
      }}
      className="mr-4 px-4 py-2 bg-primary text-primary-foreground rounded-md inline-flex items-center gap-2 hover:bg-primary/90 transition-colors hover:scale-105 active:scale-95"
      aria-label={`Complete ${stepLabel} and proceed to next step`}
    >
      Next
      <ArrowDown className="h-4 w-4" />
    </button>
  );
} 