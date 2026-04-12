import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ConversionHistory {
  id: number;
  originalFileName: string;
  convertedFileName: string;
  conversionType: string;
  fileSize: number;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

export interface ConversionStats {
  totalConversions: number;
  successfulConversions: number;
  failedConversions: number;
  conversionsByType: { [key: string]: number };
}

export interface ConversionType {
  type: string;
  label: string;
  description: string;
  icon: string;
  acceptedFormats: string;
  color: string;
}

export const CONVERSION_TYPES: ConversionType[] = [
  {
    type: 'PDF_TO_WORD',
    label: 'PDF → Word',
    description: 'Convert PDF documents to editable Word files',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`,
    acceptedFormats: '.pdf',
    color: '#3b82f6'
  },
  {
    type: 'WORD_TO_PDF',
    label: 'Word → PDF',
    description: 'Convert Word documents to PDF format',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/></svg>`,
    acceptedFormats: '.docx,.doc',
    color: '#8b5cf6'
  },
  {
    type: 'PDF_TO_EXCEL',
    label: 'PDF → Excel',
    description: 'Extract data from PDF into spreadsheets',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/></svg>`,
    acceptedFormats: '.pdf',
    color: '#10b981'
  },
  {
    type: 'EXCEL_TO_PDF',
    label: 'Excel → PDF',
    description: 'Convert spreadsheets to PDF documents',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/><path d="m15 15-6-6"/><path d="m9 15 6-6"/></svg>`,
    acceptedFormats: '.xlsx,.xls',
    color: '#f59e0b'
  },
  {
    type: 'IMAGE_TO_PDF',
    label: 'Image → PDF',
    description: 'Embed images into PDF documents',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
    acceptedFormats: '.png,.jpg,.jpeg,.gif,.bmp,.webp',
    color: '#ec4899'
  },
  {
    type: 'PDF_TO_IMAGE',
    label: 'PDF → Image',
    description: 'Render PDF pages as high-quality images',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="10" cy="13" r="2"/><path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22"/></svg>`,
    acceptedFormats: '.pdf',
    color: '#06b6d4'
  },
  {
    type: 'PDF_TO_TEXT',
    label: 'PDF → Text',
    description: 'Extract plain text content from PDFs',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M7 13h10"/><path d="M7 17h4"/></svg>`,
    acceptedFormats: '.pdf',
    color: '#64748b'
  },
  {
    type: 'TEXT_TO_PDF',
    label: 'Text → PDF',
    description: 'Convert plain text files to PDF format',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/><path d="M2 15h10"/><path d="m5 12-3 3 3 3"/></svg>`,
    acceptedFormats: '.txt,.text,.csv,.log,.md',
    color: '#a855f7'
  },
  {
    type: 'MERGE_PDF',
    label: 'Merge PDF',
    description: 'Combine multiple PDFs into one document',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/><path d="M9 11h6"/></svg>`,
    acceptedFormats: '.pdf',
    color: '#ef4444'
  },
  {
    type: 'COMPRESS_PDF',
    label: 'Compress PDF',
    description: 'Reduce the file size of PDF documents',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M9 15h6"/><path d="m9 15 3-3 3 3"/></svg>`,
    acceptedFormats: '.pdf',
    color: '#14b8a6'
  },
  {
    type: 'HTML_TO_PDF',
    label: 'HTML → PDF',
    description: 'Convert HTML pages into structured PDFs',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>`,
    acceptedFormats: '.html,.htm',
    color: '#eab308'
  },
  {
    type: 'PDF_TO_PPTX',
    label: 'PDF → PowerPoint',
    description: 'Export PDF pages to presentation slides',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h5"/><path d="M8 17h3"/></svg>`,
    acceptedFormats: '.pdf',
    color: '#d946ef'
  },
  {
    type: 'PPTX_TO_PDF',
    label: 'PowerPoint → PDF',
    description: 'Convert slides to PDF format',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="m15 15-6-6"/><path d="m9 15 6-6"/></svg>`,
    acceptedFormats: '.pptx,.ppt',
    color: '#f97316'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ConversionService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * Convert files to the specified format.
   * Returns the converted file as a Blob.
   */
  convert(files: File[], conversionType: string): Observable<HttpEvent<Blob>> {
    const formData = new FormData();
    files.forEach(f => formData.append('file', f));
    formData.append('conversionType', conversionType);

    const req = new HttpRequest('POST', `${this.apiUrl}/convert`, formData, {
      reportProgress: true,
      responseType: 'blob'
    });

    return this.http.request(req);
  }

  /**
   * Get recent conversion history.
   */
  getHistory(): Observable<ConversionHistory[]> {
    return this.http.get<ConversionHistory[]>(`${this.apiUrl}/conversions`);
  }

  /**
   * Get conversion statistics.
   */
  getStats(): Observable<ConversionStats> {
    return this.http.get<ConversionStats>(`${this.apiUrl}/conversions/stats`);
  }

  /**
   * Health check.
   */
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }

  /**
   * Format file size for display.
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format conversion type for display.
   */
  formatConversionType(type: string): string {
    return type.replace(/_/g, ' → ').replace('TO', '').replace('  ', ' ');
  }
}
