import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import {
  ConversionService,
  ConversionHistory,
  ConversionType,
  CONVERSION_TYPES
} from '../../services/conversion.service';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="converter-page">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header animate-fade-in-up" id="converter-header">
          <a routerLink="/" class="back-link" id="back-to-dashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
            Back to Dashboard
          </a>
          <h1 class="page-title">Document <span class="gradient-text">Converter</span></h1>
          <p class="page-subtitle">Select a conversion type, upload your file, and download the result.</p>
        </div>

        <!-- Conversion Type Grid -->
        <div class="conversion-grid animate-fade-in-up delay-1" id="conversion-types">
          <button
            *ngFor="let ct of conversionTypes; let i = index"
            class="conversion-type-btn"
            [class.active]="selectedType?.type === ct.type"
            [style.--type-color]="ct.color"
            (click)="selectType(ct)"
            [id]="'conv-type-' + ct.type.toLowerCase()">
            <div class="type-icon" [innerHTML]="ct.icon"></div>
            <div class="type-info">
              <span class="type-label">{{ ct.label }}</span>
              <span class="type-desc">{{ ct.description }}</span>
            </div>
            <div class="type-check" *ngIf="selectedType?.type === ct.type">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
          </button>
        </div>

        <!-- Upload Section -->
        <div class="upload-section animate-fade-in-up delay-2" *ngIf="selectedType" id="upload-section">
          <div
            class="upload-zone"
            [class.dragover]="isDragOver"
            [class.has-file]="selectedFiles.length > 0"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            (click)="fileInput.click()"
            id="upload-zone">

            <input
              #fileInput
              type="file"
              [accept]="selectedType.acceptedFormats"
              [multiple]="selectedType.type === 'MERGE_PDF'"
              (change)="onFileSelected($event)"
              hidden
              id="file-input">

            <div class="upload-content" *ngIf="selectedFiles.length === 0">
              <div class="upload-icon">
                <svg viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="url(#uploadGrad)" stroke-width="1.5" stroke-dasharray="4 4" fill="none">
                    <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="30s" repeatCount="indefinite"/>
                  </circle>
                  <defs>
                    <linearGradient id="uploadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#06b6d4"/>
                      <stop offset="100%" style="stop-color:#8b5cf6"/>
                    </linearGradient>
                  </defs>
                  <path d="M24 32V20M18 24l6-6 6 6" stroke="url(#uploadGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3 class="upload-title">Drop your file here</h3>
              <p class="upload-hint">or click to browse</p>
              <p class="upload-formats">Accepts: {{ selectedType.acceptedFormats }}</p>
            </div>

            <div class="file-list-preview" *ngIf="selectedFiles.length > 0" (click)="$event.stopPropagation()">
              <div class="file-preview" *ngFor="let file of selectedFiles; let i = index">
                <div class="file-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
                    <path d="M14 2v6h6"/>
                  </svg>
                </div>
                <div class="file-details">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatSize(file.size) }}</span>
                </div>
                <button class="remove-file-btn" (click)="removeFile($event, i)" title="Remove file">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
              
              <button class="add-more-btn" *ngIf="selectedType.type === 'MERGE_PDF'" (click)="fileInput.click()">
                + Add Another File
              </button>
            </div>
          </div>

          <!-- Convert Button -->
          <button
            class="convert-btn btn-primary"
            [disabled]="selectedFiles.length === 0 || isConverting || (selectedType.type === 'MERGE_PDF' && selectedFiles.length < 2)"
            (click)="convert()"
            id="convert-btn">
            <span *ngIf="!isConverting" class="btn-content">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <path d="M16 3h5v5"/><path d="m21 3-7 7"/><path d="M8 21H3v-5"/><path d="m3 21 7-7"/>
              </svg>
              Convert to {{ selectedType.label.split(' → ')[1] }}
            </span>
            <span *ngIf="isConverting" class="btn-content">
              <span class="spinner"></span>
              Converting...
            </span>
          </button>

          <!-- Progress Bar -->
          <div class="progress-container" *ngIf="isConverting" id="progress-bar">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="progress"></div>
            </div>
            <span class="progress-text">{{ progress }}%</span>
          </div>

          <!-- Success Message -->
          <div class="result-card success" *ngIf="conversionSuccess" id="conversion-success">
            <div class="result-icon success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <path d="m9 11 3 3L22 4"/>
              </svg>
            </div>
            <div class="result-content">
              <h3>Conversion Successful!</h3>
              <p>Your file has been converted and downloaded.</p>
            </div>
          </div>

          <!-- Error Message -->
          <div class="result-card error" *ngIf="conversionError" id="conversion-error">
            <div class="result-icon error-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
                <circle cx="12" cy="12" r="10"/>
                <path d="m15 9-6 6"/><path d="m9 9 6 6"/>
              </svg>
            </div>
            <div class="result-content">
              <h3>Conversion Failed</h3>
              <p>{{ conversionError }}</p>
            </div>
          </div>
        </div>

        <!-- History Section -->
        <div class="history-section animate-fade-in-up delay-3" id="history-section">
          <div class="section-header">
            <h2 class="section-title">Conversion <span class="gradient-text">History</span></h2>
          </div>

          <div class="history-table-container" *ngIf="history.length > 0">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Original File</th>
                  <th>Converted To</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of paginatedHistory">
                  <td class="cell-file">{{ item.originalFileName }}</td>
                  <td class="cell-file">{{ item.convertedFileName }}</td>
                  <td>
                    <span class="type-badge" [style.--badge-color]="getTypeColor(item.conversionType)">
                      {{ formatType(item.conversionType) }}
                    </span>
                  </td>
                  <td class="cell-size">{{ formatSize(item.fileSize) }}</td>
                  <td>
                    <span class="status-badge" [class.success]="item.status === 'SUCCESS'" [class.failed]="item.status === 'FAILED'">
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="cell-date">{{ formatDate(item.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
            
            <!-- Pagination Controls -->
            <div class="pagination-controls" *ngIf="totalPages > 1">
              <button class="page-btn" [disabled]="currentPage === 1" (click)="prevPage()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Prev
              </button>
              <div class="page-numbers">
                <span class="current-page">Page {{ currentPage }} of {{ totalPages }}</span>
              </div>
              <button class="page-btn" [disabled]="currentPage === totalPages" (click)="nextPage()">
                Next
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>

          </div>

          <div class="empty-state" *ngIf="history.length === 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="48" height="48" class="empty-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/>
            </svg>
            <p>No conversions yet. Select a type above and upload a file to get started!</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .converter-page {
      padding: 32px 0 60px;
    }

    /* ===== Page Header ===== */
    .page-header {
      margin-bottom: 40px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 16px;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: var(--accent-cyan);
    }

    .page-title {
      font-size: 2.2rem;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    /* ===== Conversion Type Grid ===== */
    .conversion-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
      margin-bottom: 40px;
    }
    @media (max-width: 900px) {
      .conversion-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      }
    }
    @media (max-width: 600px) {
      .conversion-grid {
        grid-template-columns: 1fr;
      }
    }

    .conversion-type-btn {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 18px;
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      cursor: pointer;
      transition: all 0.25s ease;
      text-align: left;
      color: inherit;
      font-family: inherit;
      position: relative;
    }

    .conversion-type-btn:hover {
      border-color: var(--type-color, var(--border-hover));
      background: rgba(255,255,255,0.03);
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }

    .conversion-type-btn.active {
      border-color: var(--type-color, var(--accent-cyan));
      background: color-mix(in srgb, var(--type-color, var(--accent-cyan)) 8%, transparent);
      box-shadow: 0 0 20px color-mix(in srgb, var(--type-color, var(--accent-cyan)) 15%, transparent);
    }

    .type-icon {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      color: var(--type-color, var(--text-secondary));
    }

    .type-icon :deep(svg) {
      width: 100%;
      height: 100%;
    }

    .type-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .type-label {
      font-weight: 600;
      font-size: 0.92rem;
      color: var(--text-primary);
    }

    .type-desc {
      font-size: 0.78rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .type-check {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--type-color, var(--accent-cyan));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      animation: fadeIn 0.2s ease;
    }

    .type-check svg {
      width: 14px;
      height: 14px;
    }

    /* ===== Upload Section ===== */
    .upload-section {
      margin-bottom: 48px;
    }

    .upload-zone {
      border: 2px dashed var(--border-color);
      border-radius: var(--radius-xl);
      padding: 48px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: var(--glass-bg);
      margin-bottom: 20px;
    }

    .upload-zone:hover {
      border-color: var(--accent-cyan);
      background: rgba(6, 182, 212, 0.03);
    }

    .upload-zone.dragover {
      border-color: var(--accent-cyan);
      background: rgba(6, 182, 212, 0.06);
      box-shadow: var(--shadow-glow-cyan);
      transform: scale(1.01);
    }

    .upload-zone.has-file {
      border-style: solid;
      border-color: var(--border-hover);
      padding: 24px;
    }

    .upload-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 20px;
    }

    .upload-icon svg {
      width: 100%;
      height: 100%;
    }

    .upload-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text-primary);
    }

    .upload-hint {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 12px;
    }

    .upload-formats {
      color: var(--text-muted);
      font-size: 0.8rem;
      padding: 4px 14px;
      border-radius: 6px;
      background: rgba(148, 163, 184, 0.06);
      display: inline-block;
    }

    .file-preview {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .file-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(6, 182, 212, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-cyan);
      flex-shrink: 0;
    }

    .file-details {
      flex: 1;
      text-align: left;
    }

    .file-name {
      display: block;
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 400px;
    }

    .file-size {
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .remove-file-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      background: rgba(239, 68, 68, 0.1);
      color: var(--accent-red);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .remove-file-btn:hover {
      background: rgba(239, 68, 68, 0.2);
    }
    
    .file-list-preview {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }
    
    .add-more-btn {
      margin-top: 10px;
      align-self: center;
      background: transparent;
      border: 1px dashed var(--accent-cyan);
      color: var(--accent-cyan);
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .add-more-btn:hover {
      background: rgba(6, 182, 212, 0.1);
    }

    /* ===== Convert Button ===== */
    .convert-btn {
      width: 100%;
      padding: 16px;
      font-size: 1.05rem;
      border-radius: var(--radius-md);
    }

    .convert-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    /* ===== Progress Bar ===== */
    .progress-container {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: rgba(148, 163, 184, 0.1);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 3px;
      background: var(--gradient-primary);
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--accent-cyan);
      min-width: 40px;
      text-align: right;
    }

    /* ===== Result Cards ===== */
    .result-card {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 20px;
      padding: 20px 24px;
      border-radius: var(--radius-md);
      animation: fadeInUp 0.4s ease;
    }

    .result-card.success {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .result-card.error {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .result-icon {
      flex-shrink: 0;
    }

    .success-icon {
      color: var(--accent-green);
    }

    .error-icon {
      color: var(--accent-red);
    }

    .result-content h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .result-content p {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .result-card.success h3 { color: var(--accent-green); }
    .result-card.error h3 { color: var(--accent-red); }

    /* ===== History Section ===== */
    .history-section {
      margin-top: 20px;
    }

    .section-header {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.3px;
    }

    .history-table-container {
      border-radius: var(--radius-lg);
      border: 1px solid var(--glass-border);
      overflow: hidden;
      overflow-x: auto;
    }

    .history-table {
      width: 100%;
      border-collapse: collapse;
    }

    .history-table thead {
      background: rgba(30, 41, 59, 0.5);
    }

    .history-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .history-table td {
      padding: 14px 16px;
      font-size: 0.88rem;
      border-top: 1px solid var(--glass-border);
    }

    .history-table tbody tr {
      transition: background 0.2s;
    }

    .history-table tbody tr:hover {
      background: rgba(148, 163, 184, 0.04);
    }

    .cell-file {
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cell-size {
      color: var(--text-secondary);
    }

    .cell-date {
      color: var(--text-muted);
      white-space: nowrap;
      font-size: 0.82rem;
    }

    .type-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
      background: color-mix(in srgb, var(--badge-color, #64748b) 12%, transparent);
      color: var(--badge-color, #94a3b8);
      white-space: nowrap;
    }

    .status-badge {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .status-badge.success {
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
    }

    .status-badge.failed {
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: var(--text-muted);
    }

    .empty-icon {
      margin-bottom: 16px;
      opacity: 0.3;
    }

    .empty-state p {
      font-size: 0.92rem;
    }

    .pagination-controls {
      display: flex; justify-content: flex-end; align-items: center; gap: 16px;
      padding: 12px 16px; background: rgba(30, 41, 59, 0.3); border-top: 1px solid var(--glass-border);
    }
    .page-btn {
      display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--glass-border);
      border-radius: 6px; background: transparent; color: var(--text-primary); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .page-btn:hover:not(:disabled) { background: rgba(148, 163, 184, 0.1); border-color: rgba(255, 255, 255, 0.2); }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; border-color: transparent; }
    .current-page { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      .converter-page { padding: 16px 0 40px; }
      
      .page-title {
        font-size: 1.6rem;
      }
      .page-subtitle { font-size: 0.85rem; }

      .upload-zone {
        padding: 24px 16px;
      }

      .file-name {
        max-width: 160px;
      }

      .history-table th, .history-table td {
        padding: 10px 12px;
        font-size: 0.8rem;
      }

      .history-table-container {
        margin: 0 -15px;
        border-radius: 0;
        border-left: none;
        border-right: none;
      }
    }
  `]
})
export class ConverterComponent implements OnInit {
  conversionTypes = CONVERSION_TYPES;
  selectedType: ConversionType | null = null;
  selectedFiles: File[] = [];
  isDragOver = false;
  isConverting = false;
  progress = 0;
  conversionSuccess = false;
  conversionError: string | null = null;
  history: ConversionHistory[] = [];

  currentPage = 1;
  itemsPerPage = 5;

  constructor(private conversionService: ConversionService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  get paginatedHistory(): ConversionHistory[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.history.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.history.length / this.itemsPerPage));
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  selectType(type: ConversionType): void {
    this.selectedType = type;
    this.selectedFiles = [];
    this.resetResult();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      if (this.selectedType?.type === 'MERGE_PDF') {
        Array.from(files).forEach(f => this.handleFile(f));
      } else {
        this.selectedFiles = []; // replace if single doc
        this.handleFile(files[0]);
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (this.selectedType?.type === 'MERGE_PDF') {
        Array.from(input.files).forEach(f => this.handleFile(f));
      } else {
        this.selectedFiles = [];
        this.handleFile(input.files[0]);
      }
    }
    // reset input generic
    input.value = '';
  }

  handleFile(file: File): void {
    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      this.conversionError = 'File size exceeds 50MB limit.';
      return;
    }
    this.selectedFiles.push(file);
    this.resetResult();
  }

  removeFile(event: Event, index: number): void {
    event.stopPropagation();
    this.selectedFiles.splice(index, 1);
    this.resetResult();
  }

  convert(): void {
    if (this.selectedFiles.length === 0 || !this.selectedType) return;

    this.isConverting = true;
    this.progress = 0;
    this.resetResult();

    // Simulate initial progress
    const progressInterval = setInterval(() => {
      if (this.progress < 85) {
        this.progress += Math.random() * 15;
        if (this.progress > 85) this.progress = 85;
      }
    }, 300);

    this.conversionService.convert(this.selectedFiles, this.selectedType.type).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = event.total
            ? Math.round(50 * event.loaded / event.total)
            : 0;
          this.progress = percentDone;
        } else if (event instanceof HttpResponse) {
          clearInterval(progressInterval);
          this.progress = 100;

          // Trigger download
          const blob = event.body as Blob;
          const contentDisposition = event.headers.get('content-disposition');
          let fileName = this.selectedType!.label.replace(' → ', '_to_') + this.selectedType!.type.split('_').pop()?.toLowerCase();

          if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/);
            if (match) fileName = match[1];
          }

          this.downloadBlob(blob, fileName);

          setTimeout(() => {
            this.isConverting = false;
            this.conversionSuccess = true;
            this.loadHistory();
          }, 500);
        }
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isConverting = false;
        this.progress = 0;

        if (error.error instanceof Blob) {
          // Read error message from blob response
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorObj = JSON.parse(reader.result as string);
              this.conversionError = errorObj.message || 'Conversion failed. Please try again.';
            } catch {
              this.conversionError = 'Conversion failed. Please try again.';
            }
          };
          reader.readAsText(error.error);
        } else {
          this.conversionError = error.error?.message || 'Conversion failed. Please check your file and try again.';
        }
      }
    });
  }

  downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  loadHistory(): void {
    this.conversionService.getHistory().subscribe({
      next: (history) => this.history = history,
      error: () => this.history = []
    });
  }

  resetResult(): void {
    this.conversionSuccess = false;
    this.conversionError = null;
  }

  formatSize(bytes: number): string {
    return this.conversionService.formatFileSize(bytes);
  }

  formatType(type: string): string {
    return type.replace('_TO_', ' → ');
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  getTypeColor(type: string): string {
    const ct = this.conversionTypes.find(t => t.type === type);
    return ct?.color || '#64748b';
  }
}
