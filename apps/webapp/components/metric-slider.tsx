"use client"

import { cn } from "@decision-copilot/ui"
import * as React from "react"

interface MetricSliderProps {
  label: string
  defaultValue?: number[]
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MetricSlider({ label, defaultValue = [0], max = 100, disabled, className }: MetricSliderProps) {
  const value = defaultValue[0] || 0
  const percentage = (value / max) * 100
  
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm text-muted-foreground">{label}</label>
        <span className="text-sm text-muted-foreground">{value}%</span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div 
          className="absolute h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

