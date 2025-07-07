'use client'

import { ReactNode } from 'react'

export default function DecisionLayout({ 
  children 
}: {
  children: ReactNode
}) {
  return (
    <div className="container py-8">
      <div className="space-y-8">
        {children}
      </div>
    </div>
  )
} 