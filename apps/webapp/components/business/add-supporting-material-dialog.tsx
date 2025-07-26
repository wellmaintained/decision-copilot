import { SupportingMaterial, SupportingMaterialFactory, SupportingMaterialValidator } from '@decision-copilot/domain'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AddSupportingMaterialDialogProps {
  onAdd: (material: SupportingMaterial) => Promise<void>
  children?: React.ReactNode
}

export function AddSupportingMaterialDialog({ onAdd, children }: AddSupportingMaterialDialogProps) {
  const [open, setOpen] = useState(false)
  const [newMaterialUrl, setNewMaterialUrl] = useState('')
  const [newMaterialTitle, setNewMaterialTitle] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setNewMaterialUrl('')
    setNewMaterialTitle('')
    setErrors([])
    setIsSubmitting(false)
  }

  const handleAddSupportingMaterial = async () => {
    try {
      setIsSubmitting(true)
      setErrors([])

      const material = SupportingMaterialFactory.create(newMaterialTitle, newMaterialUrl)
      const validationErrors = SupportingMaterialValidator.validate(material)

      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        return
      }

      await onAdd(material)
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
        {children || <Button variant="outline">Add Supporting Material</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Supporting Material</DialogTitle>
          <DialogDescription>
            Add a link to a document or webpage that supports this decision.
          </DialogDescription>
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
            <Label htmlFor="material-title">Title</Label>
            <Input
              id="material-title"
              placeholder="Enter title for the material"
              value={newMaterialTitle}
              onChange={(e) => setNewMaterialTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="material-url">URL</Label>
            <Input
              id="material-url"
              placeholder="Paste URL (e.g. Google Docs link)"
              value={newMaterialUrl}
              onChange={(e) => setNewMaterialUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSubmitting) {
                  handleAddSupportingMaterial()
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddSupportingMaterial}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Material'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
