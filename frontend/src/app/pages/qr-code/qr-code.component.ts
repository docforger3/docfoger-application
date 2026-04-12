import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { QRCodeComponent as QrCodeLibComponent } from 'angularx-qrcode';

type QrDataType = 'url' | 'text' | 'vcard';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, QrCodeLibComponent],
  template: `
    <div class="tools-page">
      <!-- Navbar / Header -->
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <a routerLink="/" class="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </a>
          <span class="toolbar-title">QR Code <span class="accent">Generator</span></span>
        </div>
      </div>

      <div class="workspace">
        <div class="panel form-panel">
          <div class="panel-header">
            <h3>QR Data Type</h3>
          </div>
          
          <div class="data-type-tabs">
            <button class="type-btn" [class.active]="dataType === 'url'" (click)="setDataType('url')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              URL
            </button>
            <button class="type-btn" [class.active]="dataType === 'text'" (click)="setDataType('text')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
              </svg>
              Text
            </button>
            <button class="type-btn" [class.active]="dataType === 'vcard'" (click)="setDataType('vcard')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Contact (vCard)
            </button>
          </div>

          <div class="form-content">
            <!-- URL Input -->
            <div *ngIf="dataType === 'url'" class="animate-fade-in">
              <div class="input-group">
                <label>Website URL</label>
                <input type="text" [(ngModel)]="url" placeholder="https://example.com" class="field">
              </div>
            </div>

            <!-- Text Input -->
            <div *ngIf="dataType === 'text'" class="animate-fade-in">
              <div class="input-group">
                <label>Plain Text</label>
                <textarea [(ngModel)]="text" placeholder="Enter your message here..." class="field text-area"></textarea>
              </div>
            </div>

            <!-- vCard Input -->
            <div *ngIf="dataType === 'vcard'" class="animate-fade-in vcard-grid">
              <div class="input-group full-width"><label>Full Name</label><input type="text" [(ngModel)]="vcardName" placeholder="e.g. John Doe" class="field"></div>
              <div class="input-group"><label>Phone</label><input type="text" [(ngModel)]="vcardPhone" placeholder="+1 234 567 8900" class="field"></div>
              <div class="input-group"><label>Email</label><input type="email" [(ngModel)]="vcardEmail" placeholder="john@example.com" class="field"></div>
              <div class="input-group full-width"><label>Company</label><input type="text" [(ngModel)]="vcardOrg" placeholder="Company Name" class="field"></div>
              <div class="input-group"><label>Job Title</label><input type="text" [(ngModel)]="vcardTitle" placeholder="Software Engineer" class="field"></div>
              <div class="input-group"><label>Website</label><input type="text" [(ngModel)]="vcardUrl" placeholder="https://example.com" class="field"></div>
            </div>
            
            <div class="divider"></div>
            <h4 class="mt-4 mb-3">Customization</h4>
            
            <div class="customization-grid">
              <div class="input-group">
                <label>Foreground Color</label>
                <div class="color-picker-wrapper">
                  <input type="color" [(ngModel)]="colorDark" class="color-input">
                  <span class="color-code">{{ colorDark }}</span>
                </div>
              </div>
              <div class="input-group">
                <label>Background Color</label>
                <div class="color-picker-wrapper">
                  <input type="color" [(ngModel)]="colorLight" class="color-input">
                  <span class="color-code">{{ colorLight }}</span>
                </div>
              </div>
              <div class="input-group">
                <label>Size (px)</label>
                <input type="range" [min]="100" [max]="500" [step]="10" [(ngModel)]="qrSize" class="range-input">
                <div class="range-value">{{ qrSize }} x {{ qrSize }}</div>
              </div>
              <div class="input-group">
                <label>Error Correction</label>
                <select [(ngModel)]="errorCorrection" class="select-input">
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quarter (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Area -->
        <div class="panel preview-panel">
          <div class="panel-header">
            <h3>Live Preview</h3>
            <button class="action-btn download-btn" (click)="downloadQR()" [disabled]="!getQrData()">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                 <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
               </svg>
               Download PNG
            </button>
          </div>
          
          <div class="preview-container" [style.background]="colorLight">
            <div class="qr-wrapper" *ngIf="getQrData(); else emptyState" #qrWrapper>
              <qrcode 
                [qrdata]="getQrData()" 
                [width]="qrSize" 
                [colorDark]="colorDark" 
                [colorLight]="colorLight" 
                [margin]="2" 
                [errorCorrectionLevel]="errorCorrection"
                elementType="canvas">
              </qrcode>
            </div>
            <ng-template #emptyState>
              <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="opacity: 0.3; margin-bottom: 12px;">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/>
                </svg>
                <p>Fill in the form to generate your QR Code</p>
              </div>
            </ng-template>
          </div>
          
          <div class="preview-footer">
            <div class="data-preview">
              <strong>Raw Data:</strong> {{ getQrData() || 'Empty' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: calc(100vh - 80px); overflow: hidden; }

    .tools-page { display: flex; flex-direction: column; height: 100%; background: #0a0e1a; }

    /* ===== Toolbar ===== */
    .editor-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 24px; height: 56px;
      background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--glass-border); flex-shrink: 0;
    }
    .toolbar-left { display: flex; align-items: center; gap: 12px; }
    
    .back-btn {
      width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary); transition: all 0.2s; text-decoration: none;
    }
    .back-btn:hover { color: var(--text-primary); background: rgba(148,163,184,0.1); }
    .toolbar-title { font-weight: 700; font-size: 1.15rem; }
    .accent { background: linear-gradient(135deg, #10b981, #059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

    /* ===== Workspace ===== */
    .workspace { display: flex; flex: 1; overflow: hidden; padding: 24px; gap: 24px; }

    .panel {
      display: flex; flex-direction: column; flex: 1;
      background: rgba(15, 23, 42, 0.5); border: 1px solid var(--glass-border); border-radius: 12px;
      overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .form-panel { flex: 1.2; overflow-y: auto; }
    .preview-panel { flex: 0.8; }
    
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);
    }
    .panel-header h3 { font-size: 0.95rem; font-weight: 600; margin: 0; color: var(--text-primary); letter-spacing: 0.5px; text-transform: uppercase; }

    /* ===== Tabs ===== */
    .data-type-tabs { display: flex; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.1); }
    .type-btn {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px;
      background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--text-secondary); cursor: pointer;
      font-family: inherit; font-size: 0.85rem; font-weight: 500; transition: all 0.2s;
    }
    .type-btn:hover { color: var(--text-primary); background: rgba(255,255,255,0.03); }
    .type-btn.active { color: #10b981; border-bottom-color: #10b981; background: rgba(16, 185, 129, 0.05); }

    /* ===== Form Content ===== */
    .form-content { padding: 24px; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

    h4 { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 16px; margin-top: 24px; }
    .mt-4 { margin-top: 24px; }
    .mb-3 { margin-bottom: 16px; }
    
    .divider { height: 1px; background: var(--glass-border); margin: 30px 0; }

    .vcard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .customization-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .full-width { grid-column: span 2; }

    .input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .vcard-grid .input-group, .customization-grid .input-group { margin-bottom: 0; }
    .input-group label { font-size: 0.8rem; font-weight: 500; color: var(--text-muted); }
    
    .field, .select-input {
      width: 100%; padding: 12px 14px; border: 1px solid var(--glass-border); border-radius: 8px;
      background: rgba(0,0,0,0.25); color: var(--text-primary); font-family: inherit; font-size: 0.9rem; outline: none; transition: all 0.2s;
    }
    .field:focus, .select-input:focus { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15); background: rgba(0,0,0,0.4); }
    .text-area { min-height: 120px; resize: vertical; }

    /* Color Picker */
    .color-picker-wrapper {
      display: flex; align-items: center; gap: 12px; padding: 6px 12px 6px 6px;
      border: 1px solid var(--glass-border); border-radius: 8px; background: rgba(0,0,0,0.25);
    }
    .color-input { width: 36px; height: 36px; border: none; border-radius: 6px; cursor: pointer; background: transparent; padding: 0; }
    .color-input::-webkit-color-swatch-wrapper { padding: 0; }
    .color-input::-webkit-color-swatch { border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; }
    .color-code { font-family: 'Consolas', monospace; font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; }

    /* Range Slider */
    .range-input { -webkit-appearance: none; width: 100%; height: 6px; border-radius: 3px; background: rgba(148,163,184,0.15); outline: none; cursor: pointer; margin-top: 8px; }
    .range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #10b981; cursor: pointer; border: 3px solid rgba(15,23,42,0.8); transition: transform 0.1s; }
    .range-input::-webkit-slider-thumb:hover { transform: scale(1.15); }
    .range-value { font-size: 0.8rem; color: var(--text-secondary); margin-top: 8px; font-variant-numeric: tabular-nums; }

    /* ===== Preview Area ===== */
    .preview-container {
      flex: 1; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;
      min-height: 300px;
    }
    
    .qr-wrapper {
      padding: 24px; background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); animation: popIn 0.5s forwards;
    }
    @keyframes popIn { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }

    .empty-state { text-align: center; color: var(--text-muted); padding: 40px; }
    .empty-state p { font-size: 0.9rem; margin-top: 10px; }

    .preview-footer {
      padding: 16px 20px; border-top: 1px solid var(--glass-border); background: rgba(0,0,0,0.3);
    }
    .data-preview {
      font-size: 0.8rem; color: var(--text-secondary); font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .data-preview strong { color: var(--text-muted); }

    .action-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 16px;
      border: none; border-radius: 8px; font-family: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .download-btn { background: linear-gradient(135deg, #10b981, #059669); color: white; }
    .download-btn:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transform: translateY(-1px); }
    .download-btn:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }

    @media (max-width: 1024px) {
      .workspace { 
        flex-direction: column; 
        overflow: visible; 
        height: auto; 
      }
      .panel { min-height: 400px; flex: none; }
    }
    @media (max-width: 768px) {
      :host { height: auto; overflow: visible; }
      .tools-page { height: auto; }
      .editor-toolbar {
        padding: 12px 16px;
        height: auto;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: space-between;
      }
      .toolbar-left { flex: none; }
      .toolbar-title { font-size: 1rem; }
    }
    @media (max-width: 600px) {
      .vcard-grid, .customization-grid { grid-template-columns: 1fr; }
      .full-width { grid-column: auto; }
      .workspace { padding: 12px; gap: 12px; }
      .panel-header { padding: 12px 16px; }
      .download-btn { padding: 8px 12px; font-size: 0.8rem; }
    }
  `]
})
export class QrCodeComponent {
  @ViewChild('qrWrapper') qrWrapper!: ElementRef;

  dataType: QrDataType = 'url';

  // State data
  url = 'https://docforge.com';
  text = '';
  
  vcardName = '';
  vcardPhone = '';
  vcardEmail = '';
  vcardOrg = '';
  vcardTitle = '';
  vcardUrl = '';

  // Options
  colorDark = '#0a0e1a';
  colorLight = '#ffffff';
  qrSize = 250;
  errorCorrection: 'L'|'M'|'Q'|'H' = 'M';

  setDataType(type: QrDataType): void {
    this.dataType = type;
  }

  getQrData(): string {
    switch(this.dataType) {
      case 'url':
        return this.url.trim();
      case 'text':
        return this.text.trim();
      case 'vcard':
        if (!this.vcardName && !this.vcardPhone && !this.vcardEmail) return '';
        
        let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
        if (this.vcardName) vcard += `FN:${this.vcardName}\n`;
        if (this.vcardPhone) vcard += `TEL:${this.vcardPhone}\n`;
        if (this.vcardEmail) vcard += `EMAIL:${this.vcardEmail}\n`;
        if (this.vcardOrg) vcard += `ORG:${this.vcardOrg}\n`;
        if (this.vcardTitle) vcard += `TITLE:${this.vcardTitle}\n`;
        if (this.vcardUrl) vcard += `URL:${this.vcardUrl}\n`;
        vcard += 'END:VCARD';
        
        return vcard;
      default:
        return '';
    }
  }

  downloadQR(): void {
    if (!this.getQrData()) return;
    
    // Find the canvas generated by angularx-qrcode
    setTimeout(() => {
      if (this.qrWrapper && this.qrWrapper.nativeElement) {
        const canvas = this.qrWrapper.nativeElement.querySelector('canvas');
        if (canvas) {
          const image = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = image;
          link.download = `qr-code-${this.dataType}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    }, 100);
  }
}
