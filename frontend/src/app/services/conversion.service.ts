import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PDFDocument } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import * as docx from 'docx';
import pptxgen from 'pptxgenjs';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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
  private LOCAL_HISTORY_KEY = 'docforge_history';

  constructor(private http: HttpClient) {}

  /**
   * Main entry point for conversion.
   * Checks if the conversion can be handled locally or needs the backend.
   */
  convert(files: File[], conversionType: string): Observable<HttpEvent<Blob>> {
    // List of types we handle locally
    const localTypes = [
      'MERGE_PDF', 
      'IMAGE_TO_PDF', 
      'TEXT_TO_PDF', 
      'PDF_TO_TEXT', 
      'PDF_TO_IMAGE',
      'WORD_TO_PDF',
      'EXCEL_TO_PDF',
      'HTML_TO_PDF',
      'COMPRESS_PDF',
      'PDF_TO_WORD',
      'PDF_TO_EXCEL',
      'PDF_TO_PPTX'
    ];

    if (localTypes.includes(conversionType)) {
      return this.handleLocalConversion(files, conversionType);
    }

    // Fallback to backend for complex office conversions (until implemented)
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
   * Handles conversions directly in the browser.
   */
  private handleLocalConversion(files: File[], type: string): Observable<HttpEvent<Blob>> {
    // Return an observable that mimics HttpEvent flow
    return from(this.processLocally(files, type)).pipe(
      map(blob => {
        // Record in local history
        this.saveToLocalHistory(files[0], type, blob.size);
        
        return new HttpResponse({ 
          body: blob,
          status: 200,
          statusText: 'OK'
        }) as HttpEvent<Blob>;
      }),
      catchError(err => {
        console.error('Local conversion error:', err);
        throw err;
      })
    );
  }

  private saveToLocalHistory(file: File, type: string, size: number) {
    const history = this.loadLocalHistory();
    const newEntry: ConversionHistory = {
      id: Date.now(),
      originalFileName: file.name,
      convertedFileName: file.name.split('.')[0] + '.' + type.split('_').pop()?.toLowerCase(),
      conversionType: type,
      fileSize: size,
      status: 'SUCCESS',
      errorMessage: null,
      createdAt: new Date().toISOString()
    };
    history.unshift(newEntry);
    localStorage.setItem(this.LOCAL_HISTORY_KEY, JSON.stringify(history.slice(0, 50))); // Keep last 50
  }

  private loadLocalHistory(): ConversionHistory[] {
    const saved = localStorage.getItem(this.LOCAL_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  private async processLocally(files: File[], type: string): Promise<Blob> {
    switch (type) {
      case 'MERGE_PDF':
        return await this.mergePdfs(files);
      case 'IMAGE_TO_PDF':
        return await this.imagesToPdf(files);
      case 'TEXT_TO_PDF':
        return await this.textToPdf(files);
      case 'PDF_TO_TEXT':
        return await this.pdfToText(files[0]);
      case 'PDF_TO_IMAGE':
        return await this.pdfToImage(files[0]);
      case 'WORD_TO_PDF':
        return await this.wordToPdf(files[0]);
      case 'EXCEL_TO_PDF':
        return await this.excelToPdf(files[0]);
      case 'HTML_TO_PDF':
        return await this.htmlToPdf(files[0]);
      case 'COMPRESS_PDF':
        return await this.compressPdf(files[0]);
      case 'PDF_TO_WORD':
        return await this.pdfToWord(files[0]);
      case 'PDF_TO_EXCEL':
        return await this.pdfToExcel(files[0]);
      case 'PDF_TO_PPTX':
        return await this.pdfToPptx(files[0]);
      default:
        throw new Error('Unsupported local conversion type');
    }
  }

  // --- Driver Implementations ---

  private async compressPdf(file: File): Promise<Blob> {
    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);
    // Simple compression: re-save with object streams enabled
    const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
    return new Blob([compressedBytes], { type: 'application/pdf' });
  }

  private async pdfToWord(file: File): Promise<Blob> {
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(bytes).promise;
    const sections: any[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item: any) => item.str).join(' ');
      
      sections.push({
        properties: {},
        children: [
          new docx.Paragraph({
            children: [new docx.TextRun(text)],
          }),
        ],
      });
    }

    const doc = new docx.Document({ sections });
    return await docx.Packer.toBlob(doc);
  }

  private async pdfToExcel(file: File): Promise<Blob> {
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(bytes).promise;
    const data: any[][] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const lines: string[] = [];
      let currentLine = '';
      let lastY = -1;

      for (const item of textContent.items as any[]) {
        if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
          lines.push(currentLine);
          currentLine = '';
        }
        currentLine += item.str + ' ';
        lastY = item.transform[5];
      }
      lines.push(currentLine);

      lines.forEach(line => {
        data.push(line.trim().split(/\s{2,}/)); // Split by multiple spaces as table column guess
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  private async pdfToPptx(file: File): Promise<Blob> {
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(bytes).promise;
    const pres = new pptxgen();

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const context = canvas.getContext('2d');

        // @ts-ignore
        await page.render({ canvasContext: context!, viewport, canvas }).promise;
        const dataUrl = canvas.toDataURL('image/png');

        const slide = pres.addSlide();
        slide.addImage({ data: dataUrl, x: 0, y: 0, w: '100%', h: '100%' });
    }

    const buffer = await pres.write({ outputType: 'arraybuffer' }) as Uint8Array;
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  }

  private async wordToPdf(file: File): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;
    return await this.generatePdfFromHtml(html, file.name.replace(/\.[^/.]+$/, '.pdf'));
  }

  private async excelToPdf(file: File): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const html = XLSX.utils.sheet_to_html(worksheet);
    return await this.generatePdfFromHtml(html, file.name.replace(/\.[^/.]+$/, '.pdf'));
  }

  private async htmlToPdf(file: File): Promise<Blob> {
    const html = await file.text();
    return await this.generatePdfFromHtml(html, file.name.replace(/\.[^/.]+$/, '.pdf'));
  }

  private async generatePdfFromHtml(html: string, fileName: string): Promise<Blob> {
    const element = document.createElement('div');
    element.innerHTML = html;
    element.style.padding = '40px';
    element.style.background = 'white';
    element.style.color = 'black';
    
    // Add some basic styling to make it look decent
    const style = document.createElement('style');
    style.innerHTML = `
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    `;
    element.appendChild(style);

    const opt = {
      margin: 1,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    return await (html2pdf as any)().from(element).set(opt).output('blob');
  }

  private async mergePdfs(files: File[]): Promise<Blob> {
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    const pdfBytes = await mergedPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  private async imagesToPdf(files: File[]): Promise<Blob> {
    const pdf = new jsPDF();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await this.readFileAsDataURL(file);
      
      if (i > 0) pdf.addPage();
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);
      
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }
    return pdf.output('blob');
  }

  private async textToPdf(files: File[]): Promise<Blob> {
    const pdf = new jsPDF();
    let y = 20;
    for (const file of files) {
      const text = await file.text();
      const lines = pdf.splitTextToSize(text, 180);
      pdf.text(lines, 15, y);
      y += lines.length * 7;
    }
    return pdf.output('blob');
  }

  private async pdfToText(file: File): Promise<Blob> {
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(bytes).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      fullText += strings.join(' ') + '\n\n';
    }
    
    return new Blob([fullText], { type: 'text/plain' });
  }

  private async pdfToImage(file: File): Promise<Blob> {
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(bytes).promise;
    const page = await pdf.getPage(1); // Default to first page for now
    
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // @ts-ignore
    await page.render({ canvasContext: context!, viewport, canvas }).promise;
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });
  }

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get recent conversion history.
   * Merges backend and frontend history.
   */
  getHistory(): Observable<ConversionHistory[]> {
    const local = this.loadLocalHistory();
    return this.http.get<ConversionHistory[]>(`${this.apiUrl}/conversions`).pipe(
      map(remote => [...local, ...remote]),
      catchError(() => of(local)) // Support offline/no-backend mode
    );
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
