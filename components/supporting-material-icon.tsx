import { FileText, Globe, FileSpreadsheet, Presentation } from 'lucide-react'
import { SupportingMaterialMimeType } from '@/lib/domain/SupportingMaterial'

interface SupportingMaterialIconProps {
  mimeType: SupportingMaterialMimeType
  className?: string
}

export function SupportingMaterialIcon({ mimeType, className = "h-4 w-4" }: SupportingMaterialIconProps) {
  switch (mimeType) {
    case 'application/vnd.google-apps.document':
      return <FileText className={className} />
    case 'application/vnd.google-apps.spreadsheet':
      return <FileSpreadsheet className={className} />
    case 'application/vnd.google-apps.presentation':
      return <Presentation className={className} />
    default:
      return <Globe className={className} />
  }
} 