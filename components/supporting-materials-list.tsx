import { Button } from '@/components/ui/button'
import { SupportingMaterial } from '@/lib/domain/SupportingMaterial'
import { X, Plus } from 'lucide-react'
import { AddSupportingMaterialDialog } from '@/components/add-supporting-material-dialog'
import { SupportingMaterialIcon } from '@/components/supporting-material-icon'

interface SupportingMaterialItemProps {
  material: SupportingMaterial
  onRemove: (url: string) => Promise<void>
  readOnly?: boolean
}

function SupportingMaterialItem({ material, onRemove, readOnly = false }: SupportingMaterialItemProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-muted rounded-md group">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SupportingMaterialIcon mimeType={material.mimeType} />
        <a 
          href={material.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm hover:underline truncate"
          title={material.title}
        >
          {material.title}
        </a>
      </div>
      {!readOnly && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(material.url)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove material"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

interface SupportingMaterialsListProps {
  materials: SupportingMaterial[]
  onAdd: (material: SupportingMaterial) => Promise<void>
  onRemove: (url: string) => Promise<void>
  readOnly?: boolean
}

export function SupportingMaterialsList({ materials, onAdd, onRemove, readOnly = false }: SupportingMaterialsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl text-muted-foreground">Supporting Materials</h2>
        {!readOnly && (
          <AddSupportingMaterialDialog onAdd={onAdd}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              title="Add supporting material"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </AddSupportingMaterialDialog>
        )}
      </div>
      <div className="space-y-2">
        {materials.map((material, index) => (
          <SupportingMaterialItem
            key={`${material.url}-${index}`}
            material={material}
            onRemove={onRemove}
            readOnly={readOnly}
          />
        ))}
        {materials.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No supporting materials added yet
          </p>
        )}
      </div>
    </div>
  )
} 
