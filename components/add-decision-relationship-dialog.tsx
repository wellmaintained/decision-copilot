import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjectDecisions } from '@/hooks/useProjectDecisions'
import { Decision } from '@/lib/domain/Decision'
import { SelectedDecisionDetails } from '@/hooks/useDecisionRelationships'

interface AddDecisionRelationshipDialogProps {
  onAdd: (details: SelectedDecisionDetails) => Promise<void>
  relationshipDescription: string
  children?: React.ReactNode
}

export function AddDecisionRelationshipDialog({ onAdd, relationshipDescription, children }: AddDecisionRelationshipDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedDecisionId, setSelectedDecisionId] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const { decisions } = useProjectDecisions()

  const resetForm = () => {
    setSelectedDecisionId('')
    setErrors([])
    setIsSubmitting(false)
    setComboboxOpen(false)
  }

  const handleAddRelationship = async () => {
    try {
      setIsSubmitting(true)
      setErrors([])

      if (!selectedDecisionId) {
        setErrors(['Please select a decision'])
        return
      }

      const selectedDecision = decisions?.find((d: Decision) => d.id === selectedDecisionId)
      if (!selectedDecision) {
        setErrors(['Selected decision not found'])
        return
      }

      const selectedDecisionDetails: SelectedDecisionDetails = {
        toDecisionId: selectedDecision.id,
        organisationId: selectedDecision.organisationId,
      }

      await onAdd(selectedDecisionDetails);

      resetForm()
      setOpen(false)
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'An unexpected error occurred'])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) {
        resetForm()
      }
    }}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">Add Related Decision</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Select {relationshipDescription} decision</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label>Decision</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="justify-between w-full"
                >
                  <span className="truncate">
                    {selectedDecisionId ? (
                      decisions?.find((d: Decision) => d.id === selectedDecisionId)?.title
                    ) : (
                      "Select decision..."
                    )}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50 flex-none" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-0">
                <Command>
                  <CommandInput placeholder="Search decisions..." />
                  <CommandEmpty>No decision found.</CommandEmpty>
                  <CommandGroup>
                    {decisions?.map((decision: Decision) => (
                      <CommandItem
                        key={decision.id}
                        value={decision.title}
                        onSelect={() => {
                          setSelectedDecisionId(decision.id)
                          setComboboxOpen(false)
                        }}
                        className="flex items-center gap-2"
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 flex-none",
                            selectedDecisionId === decision.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="truncate">{decision.title}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddRelationship}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : `Add ${relationshipDescription} Decision`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 