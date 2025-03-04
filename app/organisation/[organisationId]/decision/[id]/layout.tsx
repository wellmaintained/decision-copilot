'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import WorkflowProgress from '@/components/workflow-progress'

export default function DecisionLayout({ 
  children 
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  
  const getCurrentStep = () => {
    if (pathname.endsWith('/identify')) return 1
    if (pathname.endsWith('/process')) return 2
    if (pathname.endsWith('/decide')) return 3
    if (pathname.endsWith('/view')) return 4
    return 1
  }

  const showWorkflowProgress = !pathname.endsWith('/view')

  return (
    <div className={`container ${showWorkflowProgress ? 'grid grid-cols-1 md:grid-cols-[1fr,300px]' : ''} gap-6 py-8`}>
      <div className="space-y-8">
        {children}
      </div>

      {showWorkflowProgress && (
        <div className="hidden md:block">
          <WorkflowProgress currentStep={getCurrentStep()} />
        </div>
      )}
    </div>
  )
} 