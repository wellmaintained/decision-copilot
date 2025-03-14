'use client'

import * as React from 'react'
import { Bold, Italic, Heading2, Quote, List, ListOrdered, Link2, Image, Eye, Columns, Maximize2, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Textarea } from '@/components/ui/textarea'

const tools = [
  { icon: Bold, tooltip: 'Bold' },
  { icon: Italic, tooltip: 'Italic' },
  { icon: Heading2, tooltip: 'Heading' },
  { icon: Quote, tooltip: 'Quote' },
  { icon: List, tooltip: 'Bullet list' },
  { icon: ListOrdered, tooltip: 'Numbered list' },
  { icon: Link2, tooltip: 'Link' },
  { icon: Image, tooltip: 'Image' },
  { icon: Eye, tooltip: 'Preview' },
  { icon: Columns, tooltip: 'Side by side' },
  { icon: Maximize2, tooltip: 'Fullscreen' },
  { icon: HelpCircle, tooltip: 'Help' },
]

interface EditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
}

export function Editor({ content, onChange, className = '' }: EditorProps) {
  return (
    <Card className={`min-h-[300px] ${className}`}>
      <div className="flex items-center gap-1 border-b p-2">
        <TooltipProvider>
          {tools.map((Tool, index) => (
            <React.Fragment key={Tool.tooltip}>
              {index === 6 && <Separator orientation="vertical" className="mx-1 h-6" />}
              {index === 8 && <Separator orientation="vertical" className="mx-1 h-6" />}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Tool.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{Tool.tooltip}</TooltipContent>
              </Tooltip>
            </React.Fragment>
          ))}
        </TooltipProvider>
      </div>
      <Textarea
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        className="min-h-[200px] border-none focus-visible:ring-0"
        placeholder="Start writing..."
      />
    </Card>
  )
}

