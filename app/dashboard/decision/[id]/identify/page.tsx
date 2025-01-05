'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Bold, Italic, Heading, Quote, List, ListOrdered, Link as LinkIcon, Image, Eye, Book, Maximize, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Stakeholder {
  id: string
  name: string
  role: string
  avatar: string
  selected?: boolean
}

const stakeholders: Stakeholder[] = [
  { id: '1', name: 'David Laing', role: 'Engineer', avatar: '/placeholder.svg' },
  { id: '2', name: 'Scott Muc', role: 'Architect', avatar: '/placeholder.svg' },
  { id: '3', name: 'Ramon Rubio', role: 'Developer', avatar: '/placeholder.svg' },
  { id: '4', name: 'Wendy Laing', role: 'Manager', avatar: '/placeholder.svg' },
  { id: '5', name: 'Corey Innis', role: 'Designer', avatar: '/placeholder.svg' },
  { id: '6', name: 'Odélia Porto', role: 'Product', avatar: '/placeholder.svg' },
  { id: '7', name: 'Ana Leclerc', role: 'Engineer', avatar: '/placeholder.svg' },
  { id: '8', name: 'Nalan Erçetin', role: 'Developer', avatar: '/placeholder.svg' },
  { id: '9', name: 'Becki Hyde', role: 'Designer', avatar: '/placeholder.svg' },
  { id: '10', name: 'Stella Glatz', role: 'Manager', avatar: '/placeholder.svg' },
  { id: '11', name: 'David Laing', role: 'Product', avatar: '/placeholder.svg' },
]

export default function DecisionIdentityPage() {
  const params = useParams()
  const decisionId = params.id as string
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>([])

  return (
    <>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Identify the Decision</h1>
        <p className="text-lg text-muted-foreground">
          Capture information about the decision being made and who is involved
        </p>
      </div>

      <Card className="p-8 space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base text-muted-foreground">Title</Label>
            <Input 
              id="title"
              placeholder="What decision needs to be made?"
              defaultValue="Which backend should be used?"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base text-muted-foreground">Details</Label>
            <div className="border rounded-md">
              <div className="flex items-center gap-1 p-2 border-b">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Heading className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-2" />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Quote className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-2" />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Image className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-2" />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Book className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Maximize className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
              <textarea 
                className="w-full p-4 min-h-[200px] bg-background resize-none focus:outline-none"
                defaultValue="The app will need to store its data somewhere.

Ideally this will be low cost & low maintenance."
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base text-muted-foreground">Cost</Label>
              <span className="text-sm text-muted-foreground">- how much will it cost (in effort, time or money) to implement?</span>
            </div>
            <RadioGroup defaultValue="medium" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="cost-low" className="h-5 w-5" />
                <Label htmlFor="cost-low">Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="cost-medium" className="h-5 w-5" />
                <Label htmlFor="cost-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="cost-high" className="h-5 w-5" />
                <Label htmlFor="cost-high">High</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base text-muted-foreground">Reversibility</Label>
              <span className="text-sm text-muted-foreground">- like choosing a</span>
            </div>
            <RadioGroup defaultValue="hat" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hat" id="rev-hat" className="h-5 w-5" />
                <Label htmlFor="rev-hat">Hat</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="haircut" id="rev-haircut" className="h-5 w-5" />
                <Label htmlFor="rev-haircut">Haircut</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tattoo" id="rev-tattoo" className="h-5 w-5" />
                <Label htmlFor="rev-tattoo">Tattoo</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Label className="text-base text-muted-foreground">Stakeholders</Label>
              <span className="text-sm text-muted-foreground">- who has an interest in - or is impacted by - this decision?</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {stakeholders.map((stakeholder) => (
                <div key={stakeholder.id} className="flex items-center space-x-3">
                  <Checkbox 
                    id={`stakeholder-${stakeholder.id}`}
                    checked={selectedStakeholders.includes(stakeholder.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStakeholders([...selectedStakeholders, stakeholder.id])
                      } else {
                        setSelectedStakeholders(selectedStakeholders.filter(id => id !== stakeholder.id))
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <img
                      src={stakeholder.avatar}
                      alt={stakeholder.name}
                      className="rounded-full w-8 h-8"
                    />
                    <Label 
                      htmlFor={`stakeholder-${stakeholder.id}`}
                      className="text-sm font-normal"
                    >
                      {stakeholder.name}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end pt-4">
        <Button size="lg" asChild>
          <Link href={`/dashboard/decision/${decisionId}/process`}>
            Next
          </Link>
        </Button>
      </div>
    </>
  )
}

