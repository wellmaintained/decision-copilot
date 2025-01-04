'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Editor } from '@/components/editor'
import WorkflowProgress from '@/components/workflow-progress'

interface Option {
  id: number
  text: string
}

interface Criterion {
  id: number
  text: string
}

export default function DecidePage() {
  const [options, setOptions] = useState<Option[]>([
    { id: 1, text: 'Firebase' },
    { id: 2, text: 'Python Flask' },
    { id: 3, text: 'Supabase' },
    { id: 4, text: '.NET' }
  ])

  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: 1, text: 'It should be easy to host' },
    { id: 2, text: 'It should be well supported' }
  ])

  const addOption = () => {
    const newId = options.length > 0 ? Math.max(...options.map(o => o.id)) + 1 : 1
    setOptions([...options, { id: newId, text: '' }])
  }

  const addCriterion = () => {
    const newId = criteria.length > 0 ? Math.max(...criteria.map(c => c.id)) + 1 : 1
    setCriteria([...criteria, { id: newId, text: '' }])
  }

  const deleteOption = (id: number) => {
    setOptions(options.filter(o => o.id !== id))
  }

  const deleteCriterion = (id: number) => {
    setCriteria(criteria.filter(c => c.id !== id))
  }

  return (
    <div className="container grid grid-cols-1 md:grid-cols-[1fr,300px] gap-6 py-6">
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold">Decide</h1>
        
        <Card className="p-6 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl text-muted-foreground">Options</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={addOption}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add option</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="space-y-2">
              {options.map((option, index) => (
                <Card key={option.id} className="flex items-center p-4">
                  <span className="text-muted-foreground mr-4">{index + 1}</span>
                  <span className="flex-1">{option.text}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => deleteOption(option.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl text-muted-foreground">Criteria</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={addCriterion}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add criterion</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="space-y-2">
              {criteria.map((criterion, index) => (
                <Card key={criterion.id} className="flex items-center p-4">
                  <span className="text-muted-foreground mr-4">{index + 1}</span>
                  <span className="flex-1">{criterion.text}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => deleteCriterion(criterion.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl text-muted-foreground">Decision</h2>
            <Editor />
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <Button size="lg" asChild>
            <Link href="/dashboard/decision/view">
              Publish
            </Link>
          </Button>
        </div>
      </div>

      <div className="hidden md:block">
        <WorkflowProgress currentStep={4} />
      </div>
    </div>
  )
}

