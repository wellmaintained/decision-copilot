import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SupportingMaterial } from '@/lib/domain/Decision'
import { ReactNode } from 'react'

interface AddSupportingMaterialDialogProps {
  onAdd: (material: SupportingMaterial) => Promise<void>
  children?: ReactNode
}

export function AddSupportingMaterialDialog({ onAdd, children }: AddSupportingMaterialDialogProps) {
  const [open, setOpen] = useState(false)
  const [newMaterialUrl, setNewMaterialUrl] = useState('')
  const [newMaterialTitle, setNewMaterialTitle] = useState('')

  const handleAddSupportingMaterial = async () => {
    if (!newMaterialUrl || !newMaterialTitle) return

    const material: SupportingMaterial = {
      url: newMaterialUrl,
      title: newMaterialTitle,
      mimeType: newMaterialUrl.includes('docs.google.com') ? 'application/vnd.google-apps.document' : 'text/html',
    }

    await onAdd(material)
    setNewMaterialUrl('')
    setNewMaterialTitle('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                if (e.key === 'Enter') {
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
          <Button onClick={handleAddSupportingMaterial}>
            Add Material
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
