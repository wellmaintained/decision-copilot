export type SupportingMaterialMimeType = 
  | 'application/vnd.google-apps.document'
  | 'text/html'
  | 'application/pdf'
  | 'application/vnd.google-apps.spreadsheet'
  | 'application/vnd.google-apps.presentation';

export interface SupportingMaterial {
  mimeType: SupportingMaterialMimeType;
  title: string;
  url: string;
}

export class SupportingMaterialValidator {
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static getMimeType(url: string): SupportingMaterialMimeType {
    if (url.includes('docs.google.com')) {
      if (url.includes('/document/')) {
        return 'application/vnd.google-apps.document';
      } else if (url.includes('/spreadsheets/')) {
        return 'application/vnd.google-apps.spreadsheet';
      } else if (url.includes('/presentation/')) {
        return 'application/vnd.google-apps.presentation';
      }
    }
    return 'text/html';
  }

  static validate(material: SupportingMaterial): string[] {
    const errors: string[] = [];
    
    if (!material.title.trim()) {
      errors.push('Title is required');
    }
    
    if (!this.validateUrl(material.url)) {
      errors.push('Invalid URL format');
    }
    
    return errors;
  }
}

export class SupportingMaterialFactory {
  static create(title: string, url: string): SupportingMaterial {
    return {
      title: title.trim(),
      url: url.trim(),
      mimeType: SupportingMaterialValidator.getMimeType(url)
    };
  }
} 