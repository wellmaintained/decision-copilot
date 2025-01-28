import { Button } from '@/components/ui/button'
import { SupportingMaterial } from '@/lib/domain/Decision'
import { FileText, Globe, X, Plus } from 'lucide-react'
import { AddSupportingMaterialDialog } from '@/components/add-supporting-material-dialog'

interface SupportingMaterialsListProps {
  materials: SupportingMaterial[]
  onAdd: (material: SupportingMaterial) => Promise<void>
  onRemove: (url: string) => Promise<void>
}

function getMaterialIcon(mimeType: string) {
  switch (mimeType) {
    case 'application/vnd.google-apps.document':
      return <FileText className="h-4 w-4" />
    default:
      return <Globe className="h-4 w-4" />
  }
}

export function SupportingMaterialsList({ materials, onAdd, onRemove }: SupportingMaterialsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl text-muted-foreground">Supporting Materials</h2>
        <AddSupportingMaterialDialog onAdd={onAdd}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </AddSupportingMaterialDialog>
      </div>
      <div className="space-y-2">
        {materials.map((material, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
            <div className="flex items-center gap-2">
              {getMaterialIcon(material.mimeType)}
              <a 
                href={material.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm hover:underline truncate"
              >
                {material.title}
              </a>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(material.url)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
} 
