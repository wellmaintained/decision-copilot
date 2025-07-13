import { Plus, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface DecisionItemListProps {
  title: string
  items: string[]
  onAdd: (item: string) => void
  onUpdate: (index: number, item: string) => void
  onDelete: (index: number) => void
  placeholder?: string
}

export function DecisionItemList({
  title,
  items,
  onAdd,
  onUpdate,
  onDelete,
  placeholder = "Enter new item"
}: DecisionItemListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState("")

  const handleAdd = () => {
    setEditingIndex(items.length)
    setEditText("")
    onAdd("")
  }

  const handleSave = (index: number) => {
    if (editText.trim()) {
      if (index === items.length - 1 && items[index] === "") {
        // If we're editing a newly added empty item
        onAdd(editText.trim())
      } else {
        // If we're editing an existing item
        onUpdate(index, editText.trim())
      }
      setEditingIndex(null)
      setEditText("")
    } else {
      handleCancel(index)
    }
  }

  const handleCancel = (index: number) => {
    if (index === items.length - 1 && items[index] === "") {
      // If we're canceling on a newly added empty item, remove it
      onDelete(index)
    }
    setEditingIndex(null)
    setEditText("")
  }

  const startEditing = (index: number, currentText: string) => {
    setEditingIndex(index)
    setEditText(currentText)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl text-muted-foreground">{title}</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add {title.toLowerCase()}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <Card key={index} className="flex items-center p-4">
            <span className="text-muted-foreground mr-4">{index + 1}</span>
            {editingIndex === index ? (
              <>
                <Input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave(index)
                    if (e.key === 'Escape') handleCancel(index)
                  }}
                  className="flex-1 mr-2"
                  placeholder={placeholder}
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => handleSave(index)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => handleCancel(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span 
                  className="flex-1 cursor-pointer hover:text-foreground"
                  onClick={() => startEditing(index, item)}
                >
                  {item || <span className="text-muted-foreground italic">Click to edit</span>}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => onDelete(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
} 