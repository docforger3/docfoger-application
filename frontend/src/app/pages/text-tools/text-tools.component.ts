import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import * as Diff from 'diff';

type ToolCategory = 'json' | 'case' | 'encode' | 'utils' | 'diff';

@Component({
  selector: 'app-text-tools',
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
          <span class="toolbar-title">Text <span class="accent">Tools</span></span>
        </div>
        <div class="toolbar-center tabs">
          <button class="tab-btn" [class.active]="activeCategory === 'json'" (click)="activeCategory = 'json'">JSON</button>
          <button class="tab-btn" [class.active]="activeCategory === 'diff'" (click)="activeCategory = 'diff'">Diff Checker</button>
          <button class="tab-btn" [class.active]="activeCategory === 'encode'" (click)="activeCategory = 'encode'">Encode/Decode</button>
          <button class="tab-btn" [class.active]="activeCategory === 'case'" (click)="activeCategory = 'case'">Case Conv</button>
          <button class="tab-btn" [class.active]="activeCategory === 'utils'" (click)="activeCategory = 'utils'">Text Utils</button>
        </div>
        <div class="toolbar-right">
          <button class="tool-btn danger" (click)="clearAll()" title="Clear Inputs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Clear
          </button>
        </div>
      </div>

      <div class="workspace">
        <ng-container *ngIf="activeCategory !== 'diff'">
          <!-- Input Area -->
          <div class="panel input-panel">
            <div class="panel-header">
              <h3>Input</h3>
              <div class="panel-actions">
                 <button class="icon-btn" (click)="paste()" title="Paste">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                     <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                   </svg>
                   Paste
                 </button>
              </div>
            </div>
            <textarea [(ngModel)]="inputText" (ngModelChange)="onInputChange()" placeholder="Type or paste your text/JSON here..." class="text-editor" spellcheck="false"></textarea>
            <div class="stats-bar">
              <span>{{ charCount }} characters</span>
              <span class="divider">•</span>
              <span>{{ wordCount }} words</span>
              <span class="divider">•</span>
              <span>{{ lineCount }} lines</span>
            </div>
          </div>
        </ng-container>

        <!-- Controls (Center) -->
        <div class="controls-panel">
          <div class="controls-header" (click)="isToolsPanelOpen = !isToolsPanelOpen">
            <span class="header-label">Tool Options</span>
            <div class="toggle-icon" [class.open]="isToolsPanelOpen">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          
          <div class="controls-content" [class.collapsed]="!isToolsPanelOpen">
            <!-- JSON Controls -->
            <ng-container *ngIf="activeCategory === 'json'">
              <h4>JSON Tools</h4>
              <div class="action-grid">
                <button class="action-btn" (click)="formatJson()">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
                   Format / Beautify
                </button>
                <button class="action-btn" (click)="minifyJson()">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16M12 4v16"/></svg>
                   Minify
                </button>
                <button class="action-btn" (click)="escapeJson()">Escape</button>
                <button class="action-btn" (click)="unescapeJson()">Unescape</button>
              </div>
              
              <div class="search-box mt-4">
                <h4>Search in Output</h4>
                <div class="search-input-wrapper">
                  <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="processSearch()" placeholder="Search text..." class="search-input">
                </div>
                <div class="search-results" *ngIf="searchQuery && activeCategory === 'json'">
                  Found <span class="accent">{{ searchMatchCount }}</span> matches.
                </div>
              </div>
            </ng-container>

            <!-- Case Controls -->
            <ng-container *ngIf="activeCategory === 'case'">
              <h4>Case Converter</h4>
              <div class="action-grid single-col">
                <button class="action-btn" (click)="changeCase('upper')">UPPERCASE</button>
                <button class="action-btn" (click)="changeCase('lower')">lowercase</button>
                <button class="action-btn" (click)="changeCase('title')">Title Case</button>
                <button class="action-btn" (click)="changeCase('camel')">camelCase</button>
                <button class="action-btn" (click)="changeCase('snake')">snake_case</button>
                <button class="action-btn" (click)="changeCase('kebab')">kebab-case</button>
              </div>
            </ng-container>

            <!-- Encoding Controls -->
            <ng-container *ngIf="activeCategory === 'encode'">
              <h4>Base64 Encoding</h4>
              <div class="action-grid">
                <button class="action-btn" (click)="base64Encode()">Encode to Base64</button>
                <button class="action-btn" (click)="base64Decode()">Decode Base64</button>
              </div>
              <h4 class="mt-4">URL Encoding</h4>
              <div class="action-grid">
                <button class="action-btn" (click)="urlEncode()">URL Encode</button>
                <button class="action-btn" (click)="urlDecode()">URL Decode</button>
              </div>
            </ng-container>

            <!-- Text Utils Controls -->
            <ng-container *ngIf="activeCategory === 'utils'">
              <h4>Text Utilities</h4>
              <div class="action-grid">
                <button class="action-btn" (click)="removeEmptyLines()">Remove Empty Lines</button>
                <button class="action-btn" (click)="removeDuplicates()">Remove Duplicates</button>
                <button class="action-btn" (click)="sortLinesAsc()">Sort Lines (A-Z)</button>
                <button class="action-btn" (click)="reverseText()">Reverse Text</button>
              </div>

              <div class="search-replace-box mt-4">
                <h4>Find & Replace</h4>
                <div class="input-group">
                  <input type="text" [(ngModel)]="findText" placeholder="Find..." class="field">
                </div>
                <div class="input-group">
                  <input type="text" [(ngModel)]="replaceText" placeholder="Replace with..." class="field">
                </div>
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="useRegex"> Use Regular Expressions
                </label>
                <button class="action-btn primary mt-2" (click)="applyReplace()">Replace All</button>
              </div>
            </ng-container>
          </div>
        </div>

        <ng-container *ngIf="activeCategory !== 'diff'">
          <!-- Output Area -->
          <div class="panel output-panel">
            <div class="panel-header">
              <h3>Output</h3>
              <div class="panel-actions">
                 <button class="icon-btn" (click)="copyOutput()" title="Copy to clipboard">
                   <svg *ngIf="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                     <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                   </svg>
                   <svg *ngIf="copied" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" width="16" height="16">
                     <path d="M20 6L9 17l-5-5"/>
                   </svg>
                   {{ copied ? 'Copied!' : 'Copy' }}
                 </button>
                 <button class="icon-btn" (click)="downloadOutput()" title="Download Text File">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                   </svg>
                 </button>
              </div>
            </div>
            
            <div class="output-container" [class.error-state]="hasError">
              <div class="error-banner" *ngIf="hasError">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {{ errorMessage }}
              </div>
              
              <!-- Highlighted output for search, or regular textarea if no search -->
              <div class="highlighted-output" *ngIf="searchQuery && activeCategory === 'json' && !hasError" [innerHTML]="highlightedOutput"></div>
              <textarea *ngIf="(!searchQuery || activeCategory !== 'json') && !hasError" readonly [value]="outputText" class="text-editor output-editor" spellcheck="false"></textarea>
            </div>
          </div>
        </ng-container>

        <!-- Diff Checker Area -->
        <ng-container *ngIf="activeCategory === 'diff'">
          <div class="diff-workspace">
            <div class="diff-inputs">
              <div class="panel">
                <div class="panel-header"><h3>Original Text</h3></div>
                <textarea [(ngModel)]="diffOriginal" placeholder="Paste original text here..." class="text-editor" spellcheck="false"></textarea>
              </div>
              <div class="panel">
                <div class="panel-header"><h3>Changed Text</h3></div>
                <textarea [(ngModel)]="diffChanged" placeholder="Paste changed text here..." class="text-editor" spellcheck="false"></textarea>
              </div>
            </div>
            <div class="diff-actions">
              <button class="action-btn primary" (click)="compareDiff()">Compare Differences</button>
            </div>
            <div class="panel diff-output">
              <div class="panel-header"><h3>Comparison Result</h3></div>
              <div class="highlighted-output" [innerHTML]="diffHtmlResult"></div>
            </div>
          </div>
        </ng-container>
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
    .toolbar-left, .toolbar-center, .toolbar-right { display: flex; align-items: center; gap: 12px; flex: 1; }
    .toolbar-center { justify-content: center; flex: 2; }
    .toolbar-right { justify-content: flex-end; }
    
    .back-btn {
      width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary); transition: all 0.2s; text-decoration: none;
    }
    .back-btn:hover { color: var(--text-primary); background: rgba(148,163,184,0.1); }
    .toolbar-title { font-weight: 700; font-size: 1.15rem; }
    .accent { background: linear-gradient(135deg, #f59e0b, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

    .tabs { display: flex; gap: 4px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); }
    .tab-btn {
      padding: 5px 12px; border: none; background: transparent; color: var(--text-muted); border-radius: 6px;
      font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .tab-btn:hover { color: var(--text-primary); }
    .tab-btn.active { background: rgba(245, 158, 11, 0.15); color: #f59e0b; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }

    .tool-btn {
      display: flex; align-items: center; gap: 6px; padding: 6px 14px; border: 1px solid var(--border-color); border-radius: 8px;
      background: transparent; color: var(--text-secondary); cursor: pointer; font-family: inherit; font-size: 0.82rem; font-weight: 500; transition: all 0.2s;
    }
    .tool-btn:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); }
    .tool-btn.danger:hover { color: #ef4444; border-color: rgba(239, 68, 68, 0.5); background: rgba(239, 68, 68, 0.1); }

    /* ===== Workspace ===== */
    .workspace { display: flex; flex: 1; overflow: hidden; padding: 20px; gap: 20px; }

    /* ===== Panels ===== */
    .panel {
      display: flex; flex-direction: column; flex: 1;
      background: rgba(15, 23, 42, 0.5); border: 1px solid var(--glass-border); border-radius: 12px;
      overflow: hidden;
    }
    
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-bottom: 1px solid var(--glass-border); background: rgba(0,0,0,0.2);
    }
    .panel-header h3 { font-size: 0.95rem; font-weight: 600; margin: 0; color: var(--text-primary); letter-spacing: 0.5px; text-transform: uppercase; }
    
    .panel-actions { display: flex; gap: 8px; }
    .icon-btn {
      display: flex; align-items: center; gap: 6px; padding: 4px 10px; border: 1px solid transparent; border-radius: 6px;
      background: transparent; color: var(--text-muted); cursor: pointer; font-family: inherit; font-size: 0.8rem; font-weight: 500; transition: all 0.2s;
    }
    .icon-btn:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); border-color: var(--glass-border); }

    .text-editor {
      flex: 1; width: 100%; padding: 16px; border: none; background: transparent; color: var(--text-primary);
      font-family: 'Consolas', 'Monaco', monospace; font-size: 0.9rem; line-height: 1.5; resize: none; outline: none;
    }
    .text-editor::-webkit-scrollbar { width: 8px; height: 8px; }
    .text-editor::-webkit-scrollbar-track { background: transparent; }
    .text-editor::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
    .text-editor::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
    
    .output-editor {  }

    .output-container {
      flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden;
    }
    .output-container.error-state { background: rgba(239, 68, 68, 0.03); }

    .highlighted-output {
      flex: 1; overflow: auto; padding: 16px; font-family: 'Consolas', 'Monaco', monospace; 
      font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; color: var(--text-primary);
    }
    ::ng-deep .search-highlight { background-color: rgba(245, 158, 11, 0.4); color: #fff; border-radius: 2px; padding: 0 2px; }

    .error-banner {
      display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: rgba(239, 68, 68, 0.1);
      border-bottom: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; font-size: 0.85rem; font-weight: 500;
    }

    .stats-bar {
      display: flex; align-items: center; gap: 12px; padding: 8px 16px; background: rgba(0,0,0,0.2);
      border-top: 1px solid var(--glass-border); color: var(--text-muted); font-size: 0.75rem;
    }
    .stats-bar .divider { color: var(--glass-border); }

    /* ===== Controls Panel ===== */
    .controls-panel {
      width: 250px; display: flex; flex-direction: column; overflow-y: auto; padding-right: 8px; gap: 0px;
    }
    .controls-panel::-webkit-scrollbar { width: 4px; }
    .controls-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

    .controls-header {
      display: none; align-items: center; justify-content: space-between;
      padding: 12px 16px; background: rgba(0,0,0,0.3); cursor: pointer;
      border-bottom: 1px solid var(--glass-border); user-select: none;
    }
    .controls-header:hover { background: rgba(255,255,255,0.03); }
    .header-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
    .toggle-icon { transition: transform 0.3s; color: var(--text-muted); }
    .toggle-icon.open { transform: rotate(180deg); color: #f59e0b; }

    .controls-content { padding-top: 24px; display: flex; flex-direction: column; gap: 24px; transition: all 0.3s ease; }
    .controls-content.collapsed { display: none; }

    h4 { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
    .mt-4 { margin-top: 24px; }
    .mt-2 { margin-top: 12px; }

    .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .action-grid.single-col { grid-template-columns: 1fr; }
    
    .action-btn {
      display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px;
      border: 1px solid var(--glass-border); border-radius: 8px; background: rgba(15, 23, 42, 0.4);
      color: var(--text-primary); cursor: pointer; font-family: inherit; font-size: 0.8rem; font-weight: 500; transition: all 0.2s;
    }
    .action-btn:hover { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3); color: #f59e0b; }
    .action-btn svg { width: 14px; height: 14px; opacity: 0.7; }
    .action-btn.primary { background: linear-gradient(135deg, #f59e0b, #f97316); border: none; color: white; }
    .action-btn.primary:hover { box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); transform: translateY(-1px); color: white;}

    /* ===== Search & Inputs ===== */
    .search-input-wrapper { position: relative; display: flex; align-items: center; }
    .search-icon { position: absolute; left: 10px; width: 14px; height: 14px; color: var(--text-muted); pointer-events: none; }
    .search-input {
      width: 100%; padding: 10px 10px 10px 32px; border: 1px solid var(--glass-border); border-radius: 8px;
      background: rgba(0,0,0,0.2); color: var(--text-primary); font-family: inherit; font-size: 0.85rem; outline: none; transition: border-color 0.2s;
    }
    .search-input:focus { border-color: #f59e0b; }
    .search-results { font-size: 0.75rem; color: var(--text-muted); margin-top: 8px; padding-left: 4px; }
    
    .input-group { margin-bottom: 10px; }
    .field {
      width: 100%; padding: 10px; border: 1px solid var(--glass-border); border-radius: 8px;
      background: rgba(0,0,0,0.2); color: var(--text-primary); font-family: inherit; font-size: 0.85rem; outline: none; transition: border-color 0.2s;
    }
    .field:focus { border-color: #f59e0b; }
    
    .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-secondary); cursor: pointer; }
    .checkbox-label input { accent-color: #f59e0b; }
    
    /* ===== Diff Checker ===== */
    .diff-workspace { display: flex; flex-direction: column; width: 100%; gap: 16px; flex: 1; min-height: 0; }
    .diff-inputs { display: flex; gap: 16px; flex: 1; min-height: 0; }
    .diff-actions { display: flex; justify-content: center; padding: 4px 0; }
    .diff-output { flex: 1; min-height: 0; }
    
    ::ng-deep .diff-added { background-color: rgba(16, 185, 129, 0.2); color: #34d399; }
    ::ng-deep .diff-removed { background-color: rgba(239, 68, 68, 0.2); color: #f87171; text-decoration: line-through; }
    ::ng-deep .diff-empty { color: var(--text-muted); font-style: italic; }

    @media (max-width: 1024px) {
      :host { height: auto; overflow: visible; }
      .tools-page { height: auto; min-height: 100vh; }
      .workspace { 
        flex-direction: column; 
        overflow: visible; 
        height: auto; 
        background: var(--bg-primary);
        padding: 12px;
        gap: 12px;
      }
      .panel { 
        min-height: 350px; 
        flex: none; 
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        overflow: visible;
      }
      .text-editor {
        min-height: 250px;
        flex: none;
      }
      .controls-panel { 
        width: 100%; 
        display: block;
        padding: 0; 
        background: rgba(15, 23, 42, 0.4);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        overflow: hidden;
      }
      .controls-header { display: flex; }
      .controls-content { padding: 20px 16px; gap: 20px; }
      .controls-content.collapsed { display: none; }
      
      .action-grid { 
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 12px;
      }
      .action-btn {
        padding: 12px 8px;
        font-size: 0.78rem;
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
        text-align: center;
        flex-direction: column;
        gap: 4px;
      }
      .action-btn svg { width: 16px; height: 16px; }
      .diff-inputs { flex-direction: column; min-height: auto; gap: 12px; }
      .diff-workspace { height: auto; }
    }

    @media (max-width: 480px) {
      .action-grid { gap: 8px; }
      .action-btn { font-size: 0.72rem; padding: 10px 4px; }
      .panel { min-height: 300px; }
      .text-editor { min-height: 200px; }
    }

    @media (max-width: 768px) {
      .editor-toolbar {
        padding: 12px;
        height: auto;
        flex-wrap: wrap;
        gap: 12px;
      }
      .toolbar-left { flex: 1; order: 1; min-width: auto; }
      .toolbar-right { flex: none; order: 2; }
      .toolbar-title { white-space: nowrap; }
      .toolbar-center.tabs {
        flex: 0 0 100%;
        order: 3;
        flex-wrap: wrap;
        background: transparent;
        border: none;
        padding: 0;
        gap: 6px;
        justify-content: flex-start;
      }
      .tab-btn {
        flex: 1 1 calc(50% - 6px);
        min-width: 80px;
        text-align: center;
        background: rgba(0,0,0,0.2);
        border: 1px solid rgba(255,255,255,0.1);
        padding: 6px 4px;
        font-size: 0.72rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tab-btn.active {
        box-shadow: none;
      }
    }
  `]
})
export class TextToolsComponent {
  activeCategory: ToolCategory = 'json';
  isToolsPanelOpen = true;

  // State
  inputText = '';
  outputText = '';
  hasError = false;
  errorMessage = '';
  copied = false;

  // Stats
  charCount = 0;
  wordCount = 0;
  lineCount = 0;

  // Search/Replace logic
  searchQuery = '';
  highlightedOutput = '';
  searchMatchCount = 0;

  findText = '';
  replaceText = '';
  useRegex = false;

  // Diff Checker logic
  diffOriginal = '';
  diffChanged = '';
  diffHtmlResult = '<div class="diff-empty">Enter text in both fields and click compare...</div>';

  // Lifecycle & Handlers
  onInputChange() {
    this.updateStats();
    if (this.inputText.trim() === '') {
      this.outputText = '';
      this.hasError = false;
      this.highlightedOutput = '';
      return;
    }
    
    // Auto process json if in json mode
    if (this.activeCategory === 'json') {
      // Don't auto format on every keystroke if it's invalid it's annoying, just check
    }
  }

  updateStats() {
    const text = this.inputText || '';
    this.charCount = text.length;
    this.wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    this.lineCount = text ? text.split(/\r\n|\r|\n/).length : 0;
  }

  clearAll() {
    this.inputText = '';
    this.outputText = '';
    this.hasError = false;
    this.searchQuery = '';
    this.highlightedOutput = '';
    
    this.diffOriginal = '';
    this.diffChanged = '';
    this.diffHtmlResult = '<div class="diff-empty">Enter text in both fields and click compare...</div>';
    
    this.updateStats();
  }

  async paste() {
    try {
      const text = await navigator.clipboard.readText();
      this.inputText = text;
      this.onInputChange();
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }

  copyOutput() {
    if (!this.outputText) return;
    navigator.clipboard.writeText(this.outputText).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }

  downloadOutput() {
    if (!this.outputText) return;
    const blob = new Blob([this.outputText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docforge-text-${new Date().getTime()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  setError(msg: string) {
    this.hasError = true;
    this.errorMessage = msg;
  }

  setSuccess(output: string) {
    this.hasError = false;
    this.errorMessage = '';
    this.outputText = output;
    if (this.activeCategory === 'json') {
      this.processSearch();
    }
  }

  // ===== JSON Tools =====
  formatJson() {
    if (!this.inputText.trim()) return;
    try {
      const parsed = JSON.parse(this.inputText);
      this.setSuccess(JSON.stringify(parsed, null, 2));
    } catch (e: any) {
      this.setError(`Invalid JSON: ${e.message}`);
    }
  }

  minifyJson() {
    if (!this.inputText.trim()) return;
    try {
      const parsed = JSON.parse(this.inputText);
      this.setSuccess(JSON.stringify(parsed));
    } catch (e: any) {
      this.setError(`Invalid JSON: ${e.message}`);
    }
  }

  escapeJson() {
    if (!this.inputText) return;
    const escaped = this.inputText
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    this.setSuccess(escaped);
  }

  unescapeJson() {
    if (!this.inputText) return;
    try {
      const unescaped = this.inputText
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t');
      this.setSuccess(unescaped);
    } catch (e: any) {
      this.setError(`Error unescaping: ${e.message}`);
    }
  }

  processSearch() {
    if (!this.searchQuery) {
      this.highlightedOutput = '';
      this.searchMatchCount = 0;
      return;
    }
    
    if (!this.outputText) return;

    try {
      // Escape HTML in the output to prevent injection when rendering innerHTML
      const escapedText = this.outputText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

      const escapedQuery = this.searchQuery.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      
      this.searchMatchCount = (escapedText.match(regex) || []).length;
      this.highlightedOutput = escapedText.replace(regex, '<span class="search-highlight">$1</span>');
    } catch (e) {
      this.highlightedOutput = this.outputText;
      this.searchMatchCount = 0;
    }
  }

  // ===== Case Tools =====
  changeCase(type: 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab') {
    if (!this.inputText) return;
    let result = '';
    const text = this.inputText;

    switch(type) {
      case 'upper': result = text.toUpperCase(); break;
      case 'lower': result = text.toLowerCase(); break;
      case 'title':
        result = text.toLowerCase().replace(/(?:^|\s|-|_)\w/g, match => match.toUpperCase());
        break;
      case 'camel':
        result = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
        break;
      case 'snake':
        result = text.replace(/\s+/g, '_').toLowerCase();
        break;
      case 'kebab':
        result = text.replace(/\s+/g, '-').toLowerCase();
        break;
    }
    this.setSuccess(result);
  }

  // ===== Encode/Decode Tools =====
  base64Encode() {
    if (!this.inputText) return;
    try {
      this.setSuccess(btoa(unescape(encodeURIComponent(this.inputText))));
    } catch(e: any) { this.setError(e.message); }
  }

  base64Decode() {
    if (!this.inputText) return;
    try {
      this.setSuccess(decodeURIComponent(escape(atob(this.inputText))));
    } catch(e: any) { this.setError('Invalid Base64 string'); }
  }

  urlEncode() {
    if (!this.inputText) return;
    this.setSuccess(encodeURIComponent(this.inputText));
  }

  urlDecode() {
    if (!this.inputText) return;
    try {
      this.setSuccess(decodeURIComponent(this.inputText));
    } catch(e: any) { this.setError('Invalid URL encoding'); }
  }

  // ===== Utils =====
  removeEmptyLines() {
    if (!this.inputText) return;
    this.setSuccess(this.inputText.replace(/^\s*[\r\n]/gm, ''));
  }

  removeDuplicates() {
    if (!this.inputText) return;
    const lines = this.inputText.split(/\r?\n/);
    const unique = [...new Set(lines)];
    this.setSuccess(unique.join('\n'));
  }

  sortLinesAsc() {
    if (!this.inputText) return;
    const lines = this.inputText.split(/\r?\n/);
    lines.sort((a, b) => a.localeCompare(b));
    this.setSuccess(lines.join('\n'));
  }

  reverseText() {
    if (!this.inputText) return;
    this.setSuccess(this.inputText.split('').reverse().join(''));
  }

  applyReplace() {
    if (!this.inputText) return;
    try {
      if (this.useRegex) {
        const regex = new RegExp(this.findText, 'g');
        this.setSuccess(this.inputText.replace(regex, this.replaceText));
      } else {
        // String replaceAll equivalent
        const escapedFind = this.findText.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        const regex = new RegExp(escapedFind, 'g');
        this.setSuccess(this.inputText.replace(regex, this.replaceText));
      }
    } catch (e: any) {
      this.setError(`Regex Error: ${e.message}`);
    }
  }

  // ===== Diff Checker =====
  compareDiff() {
    if (!this.diffOriginal && !this.diffChanged) {
      this.diffHtmlResult = '<div class="diff-empty">Enter text in both fields and click compare...</div>';
      return;
    }

    const differences = Diff.diffWordsWithSpace(this.diffOriginal, this.diffChanged);
    
    let html = '';
    differences.forEach(part => {
      // Escape HTML
      const escapedValue = part.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
        
      if (part.added) {
        html += `<span class="diff-added">${escapedValue}</span>`;
      } else if (part.removed) {
        html += `<span class="diff-removed">${escapedValue}</span>`;
      } else {
        html += `<span>${escapedValue}</span>`;
      }
    });

    this.diffHtmlResult = html || '<div class="diff-empty">No differences found. Text is identical.</div>';
  }
}
