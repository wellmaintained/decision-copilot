import React from 'react'
import { Search, Settings, Lightbulb, Zap, BookOpen } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { cn } from "@decision-copilot/ui"

interface Step {
  title: string
  description: string
  role: 'Driver' | 'Decider'
  icon: React.ReactNode
  isCompleted?: boolean
}

export default function WorkflowProgress({ currentStep = 1 }) {
  const steps: Step[] = [
    {
      title: 'Identify the decision',
      description: 'Capture decision details',
      role: 'Driver',
      icon: <Search className="w-5 h-5" />,
    },
    {
      title: 'Select method',
      description: 'Assign roles & select a decision making method',
      role: 'Driver',
      icon: <Settings className="w-5 h-5" />,
    },
    {
      title: 'Generate options',
      description: 'Options are generated',
      role: 'Decider',
      icon: <Lightbulb className="w-5 h-5" />,
    },
    {
      title: 'Make a choice',
      description: 'Decider makes a choice',
      role: 'Decider',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      title: 'Publish',
      description: 'The decision is published for observers',
      role: 'Driver',
      icon: <BookOpen className="w-5 h-5" />,
    },
  ]

  return (
    <Card className="max-w-md p-8">
      <div className="relative">
        {steps.map((step, index) => {
          const isActive = index + 1 === currentStep
          const isCompleted = index + 1 < currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.title} className="relative flex gap-6 pb-12">
              {/* Vertical line */}
              {!isLast && (
                <div
                  className={`absolute left-6 top-12 h-full w-0.5 ${
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}

              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 shrink-0 flex h-12 w-12 items-center justify-center rounded-full border-2 aspect-square",
                  isCompleted || isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-muted"
                )}
              >
                <div className="w-5 h-5">
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2">
                <div
                  className={`inline-flex w-20 justify-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
                    isCompleted || isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.role}
                </div>
                <h3
                  className={`text-lg font-semibold ${
                    isCompleted || isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={
                    isCompleted || isActive
                      ? 'text-sm leading-relaxed text-muted-foreground'
                      : 'text-sm leading-relaxed text-muted-foreground/60'
                  }
                >
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
