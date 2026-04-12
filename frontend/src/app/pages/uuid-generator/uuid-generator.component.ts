import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface UuidHistory {
  id: string;
  version: string;
  timestamp: Date;
}

@Component({
  selector: 'app-uuid-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
          <span class="toolbar-title">UUID <span class="accent">Generator</span></span>
        </div>
      </div>

      <div class="workspace">
        <div class="panel main-panel">
          <div class="panel-header">
            <h3>Generate UUID v4</h3>
            <div class="panel-actions">
              <button class="tool-btn" (click)="clearHistory()" title="Clear History">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Clear
              </button>
            </div>
          </div>
          
          <div class="generator-content">
            <div class="hero-generator">
              <div class="uuid-display" (click)="copyLatestUuid()">
                <div class="uuid-text" [ngClass]="{'flash': isFlashing}">{{ latestUuid }}</div>
                <div class="copy-overlay" [ngClass]="{'show-success': showSuccess}">
                  <svg *ngIf="!showSuccess" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <svg *ngIf="showSuccess" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" width="24" height="24">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  <span>{{ showSuccess ? 'Copied!' : 'Click to Copy' }}</span>
                </div>
              </div>
              
              <div class="controls-row">
                <div class="input-group inline">
                  <label>Quantity</label>
                  <input type="number" [(ngModel)]="bulkCount" min="1" max="1000" class="field small-field">
                </div>
                <button class="action-btn primary" (click)="generateUuid()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/><path d="M18 5 12 11"/><path d="M12 5h6v6"/>
                  </svg>
                  Generate {{ bulkCount > 1 ? bulkCount + ' UUIDs' : 'UUID' }}
                </button>
              </div>
            </div>

            <div class="divider"></div>
            
            <div class="history-section">
              <div class="history-header">
                <h4>Generated History ({{ history.length }})</h4>
                <button class="icon-btn text-cyan" (click)="copyAll()" *ngIf="history.length > 0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy All
                </button>
              </div>
              
              <div class="history-list" *ngIf="history.length > 0">
                <div class="history-item animate-fade-in" *ngFor="let item of history">
                  <div class="item-meta">
                    <span class="meta-time">{{ item.timestamp | date:'HH:mm:ss' }}</span>
                    <span class="meta-version">{{ item.version }}</span>
                  </div>
                  <div class="item-uuid">{{ item.id }}</div>
                  <button class="icon-btn-small" (click)="copySpecific(item.id)" title="Copy">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="empty-state" *ngIf="history.length === 0">
                No UUIDs generated yet.
              </div>
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
    .toolbar-left { display: flex; align-items: center; gap: 12px; flex: 1; }
    
    .back-btn {
      width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary); transition: all 0.2s; text-decoration: none;
    }
    .back-btn:hover { color: var(--text-primary); background: rgba(148,163,184,0.1); }
    .toolbar-title { font-weight: 700; font-size: 1.15rem; }
    .accent { background: linear-gradient(135deg, #06b6d4, #0891b2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

    .tool-btn {
      display: flex; align-items: center; gap: 6px; padding: 6px 14px; border: 1px solid var(--border-color); border-radius: 8px;
      background: transparent; color: var(--text-secondary); cursor: pointer; font-family: inherit; font-size: 0.82rem; font-weight: 500; transition: all 0.2s;
    }
    .tool-btn:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); }

    /* ===== Workspace ===== */
    .workspace { display: flex; flex: 1; justify-content: center; overflow: hidden; padding: 24px; }

    .panel {
      display: flex; flex-direction: column; width: 100%; max-width: 800px;
      background: rgba(15, 23, 42, 0.5); border: 1px solid var(--glass-border); border-radius: 12px;
      overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);
    }
    .panel-header h3 { font-size: 0.95rem; font-weight: 600; margin: 0; color: var(--text-primary); letter-spacing: 0.5px; text-transform: uppercase; }

    /* ===== Content Area ===== */
    .generator-content { flex: 1; display: flex; flex-direction: column; padding: 32px 40px; overflow-y: auto; }
    
    .hero-generator { display: flex; flex-direction: column; align-items: center; gap: 32px; }

    .uuid-display {
      position: relative; width: 100%; border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 16px;
      background: rgba(6, 182, 212, 0.05); padding: 40px 20px; text-align: center; cursor: pointer;
      overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .uuid-display:hover { background: rgba(6, 182, 212, 0.1); border-color: rgba(6, 182, 212, 0.5); box-shadow: 0 0 40px rgba(6, 182, 212, 0.15); transform: translateY(-2px); }
    .uuid-display:hover .copy-overlay { opacity: 1; backdrop-filter: blur(4px); }
    
    .uuid-text { font-family: 'Consolas', 'Monaco', monospace; font-size: 1.8rem; font-weight: 500; color: #06b6d4; letter-spacing: 1px; word-break: break-all; transition: opacity 0.2s; }
    .uuid-text.flash { opacity: 0.3; }

    .copy-overlay {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
      background: rgba(15, 23, 42, 0.8); color: white; font-weight: 600; opacity: 0; transition: all 0.2s;
    }
    .copy-overlay.show-success { opacity: 1; background: rgba(15, 23, 42, 0.9); }
    .copy-overlay.show-success span { color: #06b6d4; }

    .controls-row { display: flex; align-items: center; gap: 20px; }
    
    .input-group.inline { display: flex; align-items: center; gap: 12px; margin: 0; }
    .input-group label { font-size: 0.85rem; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    
    .field {
      padding: 12px 14px; border: 1px solid var(--glass-border); border-radius: 8px;
      background: rgba(0,0,0,0.25); color: var(--text-primary); font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color 0.2s;
    }
    .field:focus { border-color: #06b6d4; }
    .small-field { width: 80px; text-align: center; }

    .action-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 24px;
      border: none; border-radius: 8px; font-family: inherit; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .action-btn.primary { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.2); }
    .action-btn.primary:hover { box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4); transform: translateY(-2px); }
    
    .divider { height: 1px; background: var(--glass-border); margin: 40px 0; width: 100%; }

    /* ===== History Section ===== */
    .history-section { display: flex; flex-direction: column; flex: 1; }
    
    .history-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    h4 { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin: 0; }
    
    .text-cyan { color: #06b6d4 !important; }
    .icon-btn { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: transparent; border: 1px solid transparent; border-radius: 6px; color: var(--text-secondary); cursor: pointer; font-size: 0.8rem; font-weight: 500; transition: all 0.2s; font-family: inherit; }
    .icon-btn:hover { background: rgba(6, 182, 212, 0.1); border-color: rgba(6, 182, 212, 0.2); }

    .history-list { display: flex; flex-direction: column; gap: 10px; }
    .history-item {
      display: flex; align-items: center; justify-content: space-between; padding: 12px 16px;
      background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; transition: all 0.2s;
    }
    .history-item:hover { border-color: rgba(6, 182, 212, 0.3); background: rgba(0,0,0,0.3); }
    
    .item-meta { display: flex; flex-direction: column; gap: 4px; width: 80px; }
    .meta-time { font-size: 0.75rem; color: var(--text-muted); }
    .meta-version { font-size: 0.7rem; padding: 2px 6px; background: rgba(6, 182, 212, 0.1); color: #06b6d4; border-radius: 4px; display: inline-block; width: max-content; }
    
    .item-uuid { flex: 1; font-family: 'Consolas', 'Monaco', monospace; font-size: 0.95rem; color: var(--text-secondary); letter-spacing: 0.5px; text-align: center; }
    
    .icon-btn-small { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; border-radius: 6px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
    .icon-btn-small:hover { color: #06b6d4; background: rgba(6, 182, 212, 0.1); }

    .empty-state { padding: 40px; text-align: center; color: var(--text-muted); font-size: 0.9rem; border: 1px dashed var(--glass-border); border-radius: 12px; }

    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 600px) {
      .generator-content { padding: 24px 20px; }
      .uuid-text { font-size: 1.2rem; }
      .controls-row { flex-direction: column; width: 100%; }
      .input-group.inline { width: 100%; justify-content: space-between; }
      .action-btn { width: 100%; }
      .history-item { flex-direction: column; gap: 12px; align-items: flex-start; }
      .item-uuid { font-size: 0.85rem; text-align: left; }
      .icon-btn-small { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); }
      .history-item { position: relative; }
    }
  `]
})
export class UuidGeneratorComponent implements OnInit {
  latestUuid: string = '';
  history: UuidHistory[] = [];
  bulkCount: number = 1;

  isFlashing = false;
  showSuccess = false;

  ngOnInit() {
    this.generateUuid();
  }

  generateUuid() {
    // Flash animation trigger
    this.isFlashing = true;
    setTimeout(() => this.isFlashing = false, 150);

    const count = Math.min(Math.max(1, this.bulkCount), 1000);
    const newItems: UuidHistory[] = [];
    
    for (let i = 0; i < count; i++) {
      const id = window.crypto.randomUUID();
      newItems.push({
        id,
        version: 'v4',
        timestamp: new Date()
      });
    }

    // Unshift adds to the beginning
    this.history.unshift(...newItems);
    this.latestUuid = this.history[0].id;
  }

  clearHistory() {
    this.history = [];
    this.generateUuid(); // generate a fresh one
  }

  copyLatestUuid() {
    if (!this.latestUuid) return;
    this.copyToClipboard(this.latestUuid);
    
    this.showSuccess = true;
    setTimeout(() => this.showSuccess = false, 1500);
  }

  copySpecific(uuid: string) {
    this.copyToClipboard(uuid);
  }

  copyAll() {
    if (this.history.length === 0) return;
    const allUuids = this.history.map(item => item.id).join('\n');
    this.copyToClipboard(allUuids);
  }

  private copyToClipboard(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy: ', err);
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
}
