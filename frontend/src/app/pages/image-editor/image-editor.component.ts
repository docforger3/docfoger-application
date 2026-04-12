import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type ToolType = 'select' | 'crop' | 'draw' | 'text' | 'eraser';

interface HistoryState {
  imageData: ImageData;
  label: string;
}

@Component({
  selector: 'app-image-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="editor-page" id="image-editor-page">
      <!-- Top Toolbar -->
      <div class="editor-toolbar" id="editor-toolbar">
        <div class="toolbar-left">
          <a routerLink="/" class="back-btn" id="btn-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </a>
          <span class="toolbar-title">Image <span class="accent">Editor</span></span>
          <span class="file-name" *ngIf="fileName">{{ fileName }}</span>
        </div>

        <div class="toolbar-center">
          <!-- Undo/Redo -->
          <button class="tool-btn" (click)="undo()" [disabled]="historyIndex <= 0" title="Undo" id="btn-undo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
            </svg>
          </button>
          <button class="tool-btn" (click)="redo()" [disabled]="historyIndex >= history.length - 1" title="Redo" id="btn-redo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>
            </svg>
          </button>

          <div class="toolbar-divider"></div>

          <!-- Zoom -->
          <button class="tool-btn" (click)="zoomOut()" title="Zoom Out" id="btn-zoom-out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/>
            </svg>
          </button>
          <span class="zoom-label">{{ Math.round(zoom * 100) }}%</span>
          <button class="tool-btn" (click)="zoomIn()" title="Zoom In" id="btn-zoom-in">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>
            </svg>
          </button>
          <button class="tool-btn" (click)="resetZoom()" title="Fit to Screen" id="btn-zoom-fit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/>
            </svg>
          </button>
        </div>

        <div class="toolbar-right">
          <button class="tool-btn" (click)="resetImage()" title="Reset" id="btn-reset" [disabled]="!hasImage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
            </svg>
          </button>
          <button class="export-btn" (click)="exportImage()" [disabled]="!hasImage" id="btn-export">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      <div class="editor-body">
        <!-- Left Sidebar: Tools -->
        <div class="sidebar left-sidebar" id="tools-sidebar">
          <div class="sidebar-section">
            <div class="sidebar-label">Tools</div>
            <button class="sidebar-btn" [class.active]="activeTool === 'select'" (click)="setTool('select')" title="Select" id="tool-select">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/>
              </svg>
              <span>Select</span>
            </button>
            <button class="sidebar-btn" [class.active]="activeTool === 'crop'" (click)="setTool('crop')" title="Crop" id="tool-crop">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>
              </svg>
              <span>Crop</span>
            </button>
            <button class="sidebar-btn" [class.active]="activeTool === 'draw'" (click)="setTool('draw')" title="Draw" id="tool-draw">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/>
                <circle cx="11" cy="11" r="2"/>
              </svg>
              <span>Draw</span>
            </button>
            <button class="sidebar-btn" [class.active]="activeTool === 'text'" (click)="setTool('text')" title="Text" id="tool-text">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
              </svg>
              <span>Text</span>
            </button>
            <button class="sidebar-btn" [class.active]="activeTool === 'eraser'" (click)="setTool('eraser')" title="Eraser" id="tool-eraser">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/>
                <path d="M22 21H7"/><path d="m5 11 9 9"/>
              </svg>
              <span>Eraser</span>
            </button>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-label">Transform</div>
            <button class="sidebar-btn" (click)="rotateLeft()" title="Rotate Left" id="tool-rotate-left" [disabled]="!hasImage">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M2.5 2v6h6"/><path d="M2.5 8a10 10 0 1 1 3.44 6.56"/>
              </svg>
              <span>Rotate ↺</span>
            </button>
            <button class="sidebar-btn" (click)="rotateRight()" title="Rotate Right" id="tool-rotate-right" [disabled]="!hasImage">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M21.5 2v6h-6"/><path d="M21.5 8A10 10 0 1 0 18 14.56"/>
              </svg>
              <span>Rotate ↻</span>
            </button>
            <button class="sidebar-btn" (click)="flipH()" title="Flip Horizontal" id="tool-flip-h" [disabled]="!hasImage">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/>
                <path d="M12 20V4"/>
              </svg>
              <span>Flip H</span>
            </button>
            <button class="sidebar-btn" (click)="flipV()" title="Flip Vertical" id="tool-flip-v" [disabled]="!hasImage">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3"/><path d="M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/>
                <path d="M4 12h16"/>
              </svg>
              <span>Flip V</span>
            </button>
          </div>

          <!-- Draw/Text options -->
          <div class="sidebar-section" *ngIf="activeTool === 'draw' || activeTool === 'eraser'">
            <div class="sidebar-label">Brush</div>
            <div class="control-row">
              <label>Size</label>
              <input type="range" [min]="1" [max]="50" [(ngModel)]="brushSize" class="range-input">
              <span class="range-value">{{ brushSize }}px</span>
            </div>
            <div class="control-row" *ngIf="activeTool === 'draw'">
              <label>Color</label>
              <input type="color" [(ngModel)]="drawColor" class="color-input" id="draw-color">
            </div>
          </div>

          <div class="sidebar-section" *ngIf="activeTool === 'text'">
            <div class="sidebar-label">Text Options</div>
            <input type="text" [(ngModel)]="textInput" placeholder="Enter text..." class="text-field" id="text-input">
            <div class="control-row">
              <label>Size</label>
              <input type="range" [min]="12" [max]="120" [(ngModel)]="textSize" class="range-input">
              <span class="range-value">{{ textSize }}px</span>
            </div>
            <div class="control-row">
              <label>Color</label>
              <input type="color" [(ngModel)]="textColor" class="color-input" id="text-color">
            </div>
            <div class="control-row">
              <label>Bold</label>
              <button class="toggle-btn" [class.active]="textBold" (click)="textBold = !textBold">B</button>
            </div>
          </div>
        </div>

        <!-- Canvas Area -->
        <div class="canvas-area" id="canvas-area">
          <!-- Upload State -->
          <div class="upload-prompt" *ngIf="!hasImage" (click)="uploadInput.click()"
               (dragover)="onDragOver($event)" (dragleave)="isDragOver=false" (drop)="onDrop($event)"
               [class.dragover]="isDragOver" id="image-upload-zone">
            <input #uploadInput type="file" accept="image/*" (change)="onFileSelected($event)" hidden id="image-file-input">
            <div class="upload-icon">
              <svg viewBox="0 0 64 64" fill="none" width="64" height="64">
                <rect x="8" y="8" width="48" height="48" rx="12" stroke="url(#edGrad)" stroke-width="1.5" stroke-dasharray="6 4" fill="none"/>
                <defs><linearGradient id="edGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ec4899"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient></defs>
                <path d="M32 44V24M24 30l8-8 8 8" stroke="url(#edGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Drop your image here</h3>
            <p>or click to browse</p>
            <span class="format-hint">PNG, JPG, JPEG, GIF, WebP, BMP</span>
          </div>

          <!-- Canvas -->
          <div class="canvas-wrapper" *ngIf="hasImage" [style.transform]="'scale(' + zoom + ')'" id="canvas-wrapper">
            <canvas #mainCanvas
                    (mousedown)="onCanvasMouseDown($event)"
                    (mousemove)="onCanvasMouseMove($event)"
                    (mouseup)="onCanvasMouseUp($event)"
                    (mouseleave)="onCanvasMouseUp($event)"
                    id="main-canvas">
            </canvas>
            <!-- Crop overlay -->
            <div class="crop-overlay" *ngIf="activeTool === 'crop' && isCropping"
                 [style.left.px]="cropRect.x" [style.top.px]="cropRect.y"
                 [style.width.px]="cropRect.w" [style.height.px]="cropRect.h">
              <button class="crop-apply-btn" (click)="applyCrop()" id="btn-apply-crop">✓ Apply</button>
              <button class="crop-cancel-btn" (click)="cancelCrop()" id="btn-cancel-crop">✕</button>
            </div>
          </div>
        </div>

        <!-- Right Sidebar: Adjustments & Filters -->
        <div class="sidebar right-sidebar" id="adjustments-sidebar">
          <div class="sidebar-section">
            <div class="sidebar-label">Adjustments</div>
            <div class="control-row">
              <label>Brightness</label>
              <input type="range" [min]="-100" [max]="100" [(ngModel)]="brightness" (input)="applyAdjustments()" class="range-input" id="adj-brightness">
              <span class="range-value">{{ brightness }}</span>
            </div>
            <div class="control-row">
              <label>Contrast</label>
              <input type="range" [min]="-100" [max]="100" [(ngModel)]="contrast" (input)="applyAdjustments()" class="range-input" id="adj-contrast">
              <span class="range-value">{{ contrast }}</span>
            </div>
            <div class="control-row">
              <label>Saturation</label>
              <input type="range" [min]="-100" [max]="100" [(ngModel)]="saturation" (input)="applyAdjustments()" class="range-input" id="adj-saturation">
              <span class="range-value">{{ saturation }}</span>
            </div>
            <div class="control-row">
              <label>Opacity</label>
              <input type="range" [min]="0" [max]="100" [(ngModel)]="opacity" (input)="applyAdjustments()" class="range-input" id="adj-opacity">
              <span class="range-value">{{ opacity }}%</span>
            </div>
            <button class="reset-adj-btn" (click)="resetAdjustments()" id="btn-reset-adj">Reset Adjustments</button>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-label">Filters</div>
            <div class="filters-grid">
              <button class="filter-btn" [class.active]="activeFilter === 'none'" (click)="applyFilter('none')" id="filter-none">
                <span class="filter-preview original"></span>
                <span>Original</span>
              </button>
              <button class="filter-btn" [class.active]="activeFilter === 'grayscale'" (click)="applyFilter('grayscale')" id="filter-grayscale">
                <span class="filter-preview grayscale"></span>
                <span>Grayscale</span>
              </button>
              <button class="filter-btn" [class.active]="activeFilter === 'sepia'" (click)="applyFilter('sepia')" id="filter-sepia">
                <span class="filter-preview sepia"></span>
                <span>Sepia</span>
              </button>
              <button class="filter-btn" [class.active]="activeFilter === 'invert'" (click)="applyFilter('invert')" id="filter-invert">
                <span class="filter-preview invert"></span>
                <span>Invert</span>
              </button>
              <button class="filter-btn" [class.active]="activeFilter === 'blur'" (click)="applyFilter('blur')" id="filter-blur">
                <span class="filter-preview blur"></span>
                <span>Blur</span>
              </button>
              <button class="filter-btn" [class.active]="activeFilter === 'vintage'" (click)="applyFilter('vintage')" id="filter-vintage">
                <span class="filter-preview vintage"></span>
                <span>Vintage</span>
              </button>
              <button class="filter-btn" [class.active]="activeFilter === 'cool'" (click)="applyFilter('cool')" id="filter-cool">
                <span class="filter-preview cool"></span>
                <span>Cool</span>
              </button>
              <button class="filter-btn" [class.active]="activeFilter === 'warm'" (click)="applyFilter('warm')" id="filter-warm">
                <span class="filter-preview warm"></span>
                <span>Warm</span>
              </button>
            </div>
          </div>

          <div class="sidebar-section" *ngIf="hasImage">
            <div class="sidebar-label">Resize</div>
            <div class="control-row">
              <label>Width</label>
              <input type="number" [(ngModel)]="resizeW" class="num-input" id="resize-w">
            </div>
            <div class="control-row">
              <label>Height</label>
              <input type="number" [(ngModel)]="resizeH" class="num-input" id="resize-h">
            </div>
            <div class="control-row">
              <label>Lock Ratio</label>
              <button class="toggle-btn" [class.active]="lockAspect" (click)="lockAspect = !lockAspect" id="btn-lock-ratio">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </button>
            </div>
            <button class="apply-btn" (click)="applyResize()" id="btn-apply-resize">Apply Resize</button>
          </div>

          <div class="sidebar-section" *ngIf="hasImage">
            <div class="sidebar-label">Export</div>
            <div class="control-row">
              <label>Format</label>
              <select [(ngModel)]="exportFormat" class="select-input" id="export-format">
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div class="control-row" *ngIf="exportFormat === 'jpeg' || exportFormat === 'webp'">
              <label>Quality</label>
              <input type="range" [min]="10" [max]="100" [(ngModel)]="exportQuality" class="range-input">
              <span class="range-value">{{ exportQuality }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: calc(100vh - 80px); overflow: hidden; }

    .editor-page { display: flex; flex-direction: column; height: 100%; }

    /* ===== Toolbar ===== */
    .editor-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 16px; height: 52px;
      background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--glass-border); flex-shrink: 0; z-index: 10;
    }
    .toolbar-left, .toolbar-center, .toolbar-right { display: flex; align-items: center; gap: 8px; }
    .back-btn {
      width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary); transition: all 0.2s; text-decoration: none;
    }
    .back-btn:hover { color: var(--text-primary); background: rgba(148,163,184,0.1); }
    .toolbar-title { font-weight: 700; font-size: 1.1rem; }
    .accent { background: linear-gradient(135deg, #ec4899, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .file-name { font-size: 0.78rem; color: var(--text-muted); padding: 3px 10px; background: rgba(148,163,184,0.08); border-radius: 6px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .tool-btn {
      width: 34px; height: 34px; border: none; border-radius: 8px; background: transparent;
      color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; font-family: inherit;
    }
    .tool-btn:hover:not(:disabled) { color: var(--text-primary); background: rgba(148,163,184,0.1); }
    .tool-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .toolbar-divider { width: 1px; height: 24px; background: var(--border-color); margin: 0 4px; }
    .zoom-label { font-size: 0.78rem; color: var(--text-muted); font-weight: 500; min-width: 40px; text-align: center; }

    .export-btn {
      display: flex; align-items: center; gap: 6px; padding: 6px 16px; border: none; border-radius: 8px;
      background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; font-weight: 600; font-size: 0.82rem;
      cursor: pointer; font-family: inherit; transition: all 0.2s;
    }
    .export-btn:hover:not(:disabled) { box-shadow: 0 0 20px rgba(236,72,153,0.3); transform: translateY(-1px); }
    .export-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ===== Body Layout ===== */
    .editor-body { display: flex; flex: 1; overflow: hidden; }

    /* ===== Sidebars ===== */
    .sidebar {
      width: 220px; flex-shrink: 0; overflow-y: auto; padding: 12px;
      background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px);
      border-color: var(--glass-border); scrollbar-width: thin;
    }
    .left-sidebar { border-right: 1px solid var(--glass-border); }
    .right-sidebar { border-left: 1px solid var(--glass-border); width: 240px; }

    .sidebar-section { margin-bottom: 20px; }
    .sidebar-label { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; padding: 0 4px; }

    .sidebar-btn {
      display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px; border: none;
      border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer;
      font-family: inherit; font-size: 0.82rem; font-weight: 500; transition: all 0.15s;
    }
    .sidebar-btn:hover:not(:disabled) { color: var(--text-primary); background: rgba(148,163,184,0.08); }
    .sidebar-btn.active { color: #ec4899; background: rgba(236,72,153,0.1); }
    .sidebar-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .sidebar-btn span { white-space: nowrap; }

    .control-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding: 0 4px; }
    .control-row label { font-size: 0.78rem; color: var(--text-muted); min-width: 52px; flex-shrink: 0; }
    .range-input { flex: 1; -webkit-appearance: none; height: 4px; border-radius: 2px; background: rgba(148,163,184,0.15); outline: none; cursor: pointer; }
    .range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #ec4899; cursor: pointer; border: 2px solid rgba(15,23,42,0.8); }
    .range-value { font-size: 0.72rem; color: var(--text-muted); min-width: 32px; text-align: right; font-variant-numeric: tabular-nums; }

    .color-input { width: 28px; height: 28px; border: 2px solid var(--border-color); border-radius: 6px; cursor: pointer; background: transparent; padding: 0; }
    .color-input::-webkit-color-swatch-wrapper { padding: 2px; }
    .color-input::-webkit-color-swatch { border: none; border-radius: 3px; }

    .text-field {
      width: 100%; padding: 8px 10px; border: 1px solid var(--border-color); border-radius: 8px;
      background: var(--bg-input); color: var(--text-primary); font-family: inherit; font-size: 0.85rem;
      outline: none; margin-bottom: 8px; transition: border-color 0.2s;
    }
    .text-field:focus { border-color: #ec4899; }

    .num-input {
      width: 70px; padding: 5px 8px; border: 1px solid var(--border-color); border-radius: 6px;
      background: var(--bg-input); color: var(--text-primary); font-family: inherit; font-size: 0.82rem;
      outline: none; text-align: center;
    }
    .num-input:focus { border-color: #ec4899; }

    .select-input {
      flex: 1; padding: 5px 8px; border: 1px solid var(--border-color); border-radius: 6px;
      background: var(--bg-input); color: var(--text-primary); font-family: inherit; font-size: 0.82rem;
      outline: none; cursor: pointer;
    }

    .toggle-btn {
      width: 30px; height: 30px; border: 1px solid var(--border-color); border-radius: 6px;
      background: transparent; color: var(--text-secondary); cursor: pointer; font-weight: 700;
      font-family: inherit; font-size: 0.85rem; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    .toggle-btn.active { background: rgba(236,72,153,0.15); border-color: #ec4899; color: #ec4899; }

    .apply-btn, .reset-adj-btn {
      width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 8px;
      background: rgba(236,72,153,0.08); color: #ec4899; cursor: pointer; font-family: inherit;
      font-size: 0.82rem; font-weight: 500; transition: all 0.2s; margin-top: 4px;
    }
    .apply-btn:hover, .reset-adj-btn:hover { background: rgba(236,72,153,0.15); }

    /* ===== Filters ===== */
    .filters-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .filter-btn {
      display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px;
      border: 1px solid var(--glass-border); border-radius: 8px; background: transparent;
      color: var(--text-muted); cursor: pointer; font-family: inherit; font-size: 0.7rem;
      font-weight: 500; transition: all 0.2s;
    }
    .filter-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
    .filter-btn.active { border-color: #ec4899; color: #ec4899; background: rgba(236,72,153,0.06); }

    .filter-preview {
      width: 40px; height: 28px; border-radius: 4px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    }
    .filter-preview.grayscale { filter: grayscale(1); }
    .filter-preview.sepia { filter: sepia(1); }
    .filter-preview.invert { filter: invert(1); }
    .filter-preview.blur { filter: blur(2px); }
    .filter-preview.vintage { filter: sepia(0.4) contrast(1.2) brightness(0.9); }
    .filter-preview.cool { filter: saturate(0.8) hue-rotate(20deg) brightness(1.1); }
    .filter-preview.warm { filter: saturate(1.3) hue-rotate(-10deg) brightness(1.05); }

    /* ===== Canvas Area ===== */
    .canvas-area {
      flex: 1; display: flex; align-items: center; justify-content: center; overflow: auto;
      background: #0c0f1a;
      background-image: repeating-conic-gradient(rgba(255,255,255,0.02) 0% 25%, transparent 0% 50%);
      background-size: 20px 20px;
      position: relative;
    }

    .upload-prompt {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 12px; padding: 60px; cursor: pointer;
      border: 2px dashed rgba(148,163,184,0.15); border-radius: 24px;
      transition: all 0.3s; max-width: 400px;
    }
    .upload-prompt:hover, .upload-prompt.dragover {
      border-color: rgba(236,72,153,0.4); background: rgba(236,72,153,0.03);
    }
    .upload-prompt h3 { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
    .upload-prompt p { color: var(--text-secondary); font-size: 0.9rem; }
    .format-hint { font-size: 0.75rem; color: var(--text-muted); padding: 4px 12px; background: rgba(148,163,184,0.06); border-radius: 6px; }

    .canvas-wrapper {
      position: relative; display: inline-block;
      box-shadow: 0 0 40px rgba(0,0,0,0.5); transition: transform 0.15s ease;
      transform-origin: center center;
    }
    canvas { display: block; cursor: crosshair; }

    .crop-overlay {
      position: absolute; border: 2px dashed #ec4899;
      background: rgba(236,72,153,0.08); pointer-events: none;
    }
    .crop-apply-btn, .crop-cancel-btn {
      position: absolute; bottom: -36px; padding: 4px 14px; border: none; border-radius: 6px;
      font-size: 0.78rem; font-weight: 600; cursor: pointer; pointer-events: auto; font-family: inherit;
    }
    .crop-apply-btn { right: 36px; background: #10b981; color: white; }
    .crop-cancel-btn { right: 0; background: rgba(239,68,68,0.8); color: white; }

    /* ===== Responsive ===== */
    @media (max-width: 1024px) {
      .left-sidebar { width: 180px; }
      .right-sidebar { width: 200px; }
    }
    @media (max-width: 768px) {
      :host { height: auto; overflow: visible; }
      .editor-page { height: auto; min-height: 100vh; overflow: visible; }
      .editor-toolbar {
        padding: 12px;
        height: auto;
        flex-wrap: wrap;
        gap: 12px;
      }
      .toolbar-left { flex: 1; order: 1; min-width: auto; }
      .toolbar-right { flex: none; order: 2; }
      
      .toolbar-center {
        flex: 0 0 100%;
        order: 3;
        justify-content: center;
        padding-top: 10px;
        border-top: 1px dashed var(--glass-border);
      }
      
      .editor-body { flex-direction: column; height: auto; overflow: visible; }
      
      .sidebar { 
        width: 100% !important; 
        flex-direction: row !important; 
        overflow-x: auto; 
        overflow-y: hidden; 
        height: auto; 
        max-height: 160px; 
        border: none !important; 
        flex-wrap: nowrap;
        padding: 8px 12px;
        background: rgba(15, 23, 42, 0.9);
        backdrop-filter: blur(10px);
        z-index: 10;
      }
      .left-sidebar { 
        border-bottom: 1px solid var(--glass-border) !important;
        position: sticky;
        top: 0;
      }
      .right-sidebar { 
        order: 3; /* Move below canvas */
        border-top: 1px solid var(--glass-border) !important;
        position: sticky;
        bottom: 0;
        max-height: 180px;
      }

      .sidebar-section { 
        margin-bottom: 0; 
        display: flex; 
        gap: 8px; 
        align-items: center; 
        flex-shrink: 0; 
        padding: 4px 12px;
        border-right: 1px solid rgba(255,255,255,0.05);
      }
      .sidebar-label { font-size: 0.65rem; margin-bottom: 4px; opacity: 0.7; }
      
      .sidebar-btn {
        flex-direction: column;
        padding: 8px;
        min-width: 64px;
        height: 60px;
        font-size: 0.7rem;
        gap: 4px;
      }
      .sidebar-btn svg { width: 18px; height: 18px; }
      .sidebar-btn span { font-size: 0.65rem; }

      .canvas-area { 
        min-height: 350px; 
        padding: 15px; 
        flex: 1;
        order: 2;
        background: #050810;
        overflow: visible;
      }
      
      .filters-grid { 
        display: flex; 
        flex-direction: row; 
        gap: 8px; 
        padding: 4px 0;
      }
      .filter-btn {
        flex: 0 0 70px;
        padding: 4px;
      }
      .filter-preview { width: 45px; height: 45px; }
      .filter-name { font-size: 0.65rem; margin-top: 4px; }

      .control-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        min-width: 120px;
      }
      .range-input { width: 100px; }
      .range-value { font-size: 0.7rem; }
    }
    @media (max-width: 480px) {
      .toolbar-title { font-size: 0.95rem; }
      .zoom-label { min-width: 34px; font-size: 0.7rem; }
      .export-btn { padding: 6px 12px; font-size: 0.75rem; }
      .sidebar-btn { min-width: 56px; }
    }
  `]
})
export class ImageEditorComponent implements AfterViewInit {
  @ViewChild('mainCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  Math = Math;

  // State
  hasImage = false;
  fileName = '';
  originalImage: HTMLImageElement | null = null;
  originalImageData: ImageData | null = null;

  // Tools
  activeTool: ToolType = 'select';
  isDrawing = false;
  lastX = 0;
  lastY = 0;

  // Draw
  brushSize = 5;
  drawColor = '#ffffff';

  // Text
  textInput = 'Hello World';
  textSize = 32;
  textColor = '#ffffff';
  textBold = false;

  // Crop
  isCropping = false;
  cropStart = { x: 0, y: 0 };
  cropRect = { x: 0, y: 0, w: 0, h: 0 };

  // Adjustments
  brightness = 0;
  contrast = 0;
  saturation = 0;
  opacity = 100;

  // Filter
  activeFilter = 'none';

  // Resize
  resizeW = 0;
  resizeH = 0;
  lockAspect = true;
  aspectRatio = 1;

  // Zoom
  zoom = 1;

  // History
  history: HistoryState[] = [];
  historyIndex = -1;

  // Drag
  isDragOver = false;

  // Export
  exportFormat = 'png';
  exportQuality = 92;

  private ctx!: CanvasRenderingContext2D;

  ngAfterViewInit(): void {
    // Canvas will be initialized when image is loaded
  }

  // ===== File Handling =====
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.loadImage(input.files[0]);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files?.length) this.loadImage(event.dataTransfer.files[0]);
  }

  loadImage(file: File): void {
    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.originalImage = img;
        this.hasImage = true;
        this.resetAdjustments();
        this.activeFilter = 'none';

        // Wait for the canvas to render
        setTimeout(() => this.initCanvas(img), 50);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  initCanvas(img: HTMLImageElement): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    this.ctx.drawImage(img, 0, 0);

    this.resizeW = img.naturalWidth;
    this.resizeH = img.naturalHeight;
    this.aspectRatio = img.naturalWidth / img.naturalHeight;

    // Save original
    this.originalImageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Reset history
    this.history = [];
    this.historyIndex = -1;
    this.saveHistory('Open Image');
    this.resetZoom();
  }

  // ===== Tools =====
  setTool(tool: ToolType): void {
    this.activeTool = tool;
    this.isCropping = false;
  }

  // ===== Canvas Events =====
  onCanvasMouseDown(event: MouseEvent): void {
    if (!this.hasImage) return;
    const { x, y } = this.getCanvasCoords(event);

    if (this.activeTool === 'draw' || this.activeTool === 'eraser') {
      this.isDrawing = true;
      this.lastX = x;
      this.lastY = y;
    } else if (this.activeTool === 'crop') {
      this.isCropping = true;
      this.cropStart = { x, y };
      this.cropRect = { x, y, w: 0, h: 0 };
    } else if (this.activeTool === 'text') {
      this.addText(x, y);
    }
  }

  onCanvasMouseMove(event: MouseEvent): void {
    if (!this.hasImage) return;
    const { x, y } = this.getCanvasCoords(event);

    if (this.isDrawing && (this.activeTool === 'draw' || this.activeTool === 'eraser')) {
      this.draw(x, y);
    } else if (this.isCropping && this.activeTool === 'crop') {
      this.cropRect = {
        x: Math.min(this.cropStart.x, x),
        y: Math.min(this.cropStart.y, y),
        w: Math.abs(x - this.cropStart.x),
        h: Math.abs(y - this.cropStart.y)
      };
    }
  }

  onCanvasMouseUp(event: MouseEvent): void {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.saveHistory(this.activeTool === 'eraser' ? 'Erase' : 'Draw');
    }
  }

  getCanvasCoords(event: MouseEvent): { x: number; y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  // ===== Drawing =====
  draw(x: number, y: number): void {
    this.ctx.lineWidth = this.brushSize;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (this.activeTool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = this.drawColor;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  // ===== Text =====
  addText(x: number, y: number): void {
    if (!this.textInput.trim()) return;
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = this.textColor;
    this.ctx.font = `${this.textBold ? 'bold ' : ''}${this.textSize}px Inter, Arial, sans-serif`;
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(this.textInput, x, y);
    this.saveHistory('Add Text');
  }

  // ===== Crop =====
  applyCrop(): void {
    if (this.cropRect.w < 5 || this.cropRect.h < 5) return;
    const canvas = this.canvasRef.nativeElement;
    const imageData = this.ctx.getImageData(this.cropRect.x, this.cropRect.y, this.cropRect.w, this.cropRect.h);

    canvas.width = this.cropRect.w;
    canvas.height = this.cropRect.h;
    this.ctx.putImageData(imageData, 0, 0);

    this.resizeW = canvas.width;
    this.resizeH = canvas.height;
    this.aspectRatio = canvas.width / canvas.height;
    this.isCropping = false;
    this.saveHistory('Crop');
  }

  cancelCrop(): void {
    this.isCropping = false;
  }

  // ===== Transform =====
  rotateLeft(): void { this.rotate(-90); }
  rotateRight(): void { this.rotate(90); }

  rotate(degrees: number): void {
    const canvas = this.canvasRef.nativeElement;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);

    canvas.width = tempCanvas.height;
    canvas.height = tempCanvas.width;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.save();
    this.ctx.translate(canvas.width / 2, canvas.height / 2);
    this.ctx.rotate((degrees * Math.PI) / 180);
    this.ctx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
    this.ctx.restore();

    this.resizeW = canvas.width;
    this.resizeH = canvas.height;
    this.aspectRatio = canvas.width / canvas.height;
    this.saveHistory('Rotate ' + degrees + '°');
  }

  flipH(): void {
    const canvas = this.canvasRef.nativeElement;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.save();
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(tempCanvas, -canvas.width, 0);
    this.ctx.restore();
    this.saveHistory('Flip Horizontal');
  }

  flipV(): void {
    const canvas = this.canvasRef.nativeElement;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.save();
    this.ctx.scale(1, -1);
    this.ctx.drawImage(tempCanvas, 0, -canvas.height);
    this.ctx.restore();
    this.saveHistory('Flip Vertical');
  }

  // ===== Adjustments =====
  applyAdjustments(): void {
    if (!this.originalImageData || !this.ctx) return;
    const canvas = this.canvasRef.nativeElement;

    // Start from the last history state (not original) for non-destructive preview
    const source = this.history.length > 0 ? this.history[this.historyIndex] : null;
    if (!source) return;

    const srcData = source.imageData;

    // Resize canvas if needed
    if (canvas.width !== srcData.width || canvas.height !== srcData.height) {
      canvas.width = srcData.width;
      canvas.height = srcData.height;
    }

    const imgData = new ImageData(new Uint8ClampedArray(srcData.data), srcData.width, srcData.height);
    const data = imgData.data;
    const bright = this.brightness / 100;
    const cont = (this.contrast + 100) / 100;
    const sat = (this.saturation + 100) / 100;
    const alpha = this.opacity / 100;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2];

      // Brightness
      r += bright * 255; g += bright * 255; b += bright * 255;

      // Contrast
      r = ((r / 255 - 0.5) * cont + 0.5) * 255;
      g = ((g / 255 - 0.5) * cont + 0.5) * 255;
      b = ((b / 255 - 0.5) * cont + 0.5) * 255;

      // Saturation
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      r = gray + sat * (r - gray);
      g = gray + sat * (g - gray);
      b = gray + sat * (b - gray);

      // Opacity
      data[i + 3] = data[i + 3] * alpha;

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    this.ctx.putImageData(imgData, 0, 0);
  }

  resetAdjustments(): void {
    this.brightness = 0;
    this.contrast = 0;
    this.saturation = 0;
    this.opacity = 100;
    if (this.hasImage && this.history.length > 0) {
      const canvas = this.canvasRef.nativeElement;
      const state = this.history[this.historyIndex];
      canvas.width = state.imageData.width;
      canvas.height = state.imageData.height;
      this.ctx.putImageData(state.imageData, 0, 0);
    }
  }

  // ===== Filters =====
  applyFilter(filter: string): void {
    this.activeFilter = filter;
    if (!this.hasImage || !this.originalImageData) return;

    // Restore from history first
    const state = this.history[this.historyIndex];
    const canvas = this.canvasRef.nativeElement;
    canvas.width = state.imageData.width;
    canvas.height = state.imageData.height;
    this.ctx.putImageData(state.imageData, 0, 0);

    if (filter === 'none') return;

    const imgData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2];

      switch (filter) {
        case 'grayscale':
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = data[i + 1] = data[i + 2] = gray;
          break;
        case 'sepia':
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
          break;
        case 'invert':
          data[i] = 255 - r; data[i + 1] = 255 - g; data[i + 2] = 255 - b;
          break;
        case 'vintage':
          data[i] = Math.min(255, r * 0.6 + g * 0.4 + 20);
          data[i + 1] = Math.min(255, g * 0.7 + 10);
          data[i + 2] = Math.min(255, b * 0.5 + 30);
          break;
        case 'cool':
          data[i] = Math.min(255, r * 0.9);
          data[i + 2] = Math.min(255, b * 1.2 + 10);
          break;
        case 'warm':
          data[i] = Math.min(255, r * 1.2 + 10);
          data[i + 2] = Math.min(255, b * 0.85);
          break;
        case 'blur':
          // Simple box blur (handled separately below)
          break;
      }
    }

    if (filter === 'blur') {
      this.applyBoxBlur(imgData, 3);
    }

    this.ctx.putImageData(imgData, 0, 0);
  }

  applyBoxBlur(imgData: ImageData, radius: number): void {
    const w = imgData.width, h = imgData.height;
    const src = new Uint8ClampedArray(imgData.data);
    const dst = imgData.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0, g = 0, b = 0, count = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = Math.min(w - 1, Math.max(0, x + dx));
            const ny = Math.min(h - 1, Math.max(0, y + dy));
            const idx = (ny * w + nx) * 4;
            r += src[idx]; g += src[idx + 1]; b += src[idx + 2];
            count++;
          }
        }
        const idx = (y * w + x) * 4;
        dst[idx] = r / count; dst[idx + 1] = g / count; dst[idx + 2] = b / count;
      }
    }
  }

  // ===== Resize =====
  applyResize(): void {
    if (this.resizeW < 1 || this.resizeH < 1) return;
    const canvas = this.canvasRef.nativeElement;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);

    canvas.width = this.resizeW;
    canvas.height = this.resizeH;
    this.ctx.drawImage(tempCanvas, 0, 0, this.resizeW, this.resizeH);

    this.aspectRatio = canvas.width / canvas.height;
    this.saveHistory('Resize to ' + this.resizeW + 'x' + this.resizeH);
  }

  // ===== Zoom =====
  zoomIn(): void { this.zoom = Math.min(5, this.zoom + 0.25); }
  zoomOut(): void { this.zoom = Math.max(0.1, this.zoom - 0.25); }
  resetZoom(): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const area = canvas.parentElement?.parentElement;
    if (!area) { this.zoom = 1; return; }
    const scaleX = (area.clientWidth - 80) / canvas.width;
    const scaleY = (area.clientHeight - 80) / canvas.height;
    this.zoom = Math.min(1, Math.min(scaleX, scaleY));
  }

  // ===== History =====
  saveHistory(label: string): void {
    const canvas = this.canvasRef.nativeElement;
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Remove future states
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push({ imageData, label });
    if (this.history.length > 30) this.history.shift();
    this.historyIndex = this.history.length - 1;
  }

  undo(): void {
    if (this.historyIndex <= 0) return;
    this.historyIndex--;
    this.restoreHistory();
  }

  redo(): void {
    if (this.historyIndex >= this.history.length - 1) return;
    this.historyIndex++;
    this.restoreHistory();
  }

  restoreHistory(): void {
    const state = this.history[this.historyIndex];
    const canvas = this.canvasRef.nativeElement;
    canvas.width = state.imageData.width;
    canvas.height = state.imageData.height;
    this.ctx.putImageData(state.imageData, 0, 0);

    this.resizeW = canvas.width;
    this.resizeH = canvas.height;
  }

  // ===== Reset =====
  resetImage(): void {
    if (!this.originalImage) return;
    this.initCanvas(this.originalImage);
    this.resetAdjustments();
    this.activeFilter = 'none';
  }

  // ===== Export =====
  exportImage(): void {
    const canvas = this.canvasRef.nativeElement;
    const mimeMap: { [k: string]: string } = {
      'png': 'image/png', 'jpeg': 'image/jpeg', 'webp': 'image/webp'
    };
    const mime = mimeMap[this.exportFormat] || 'image/png';
    const quality = this.exportQuality / 100;
    const dataUrl = canvas.toDataURL(mime, quality);

    const ext = this.exportFormat;
    const baseName = this.fileName ? this.fileName.replace(/\.[^.]+$/, '') : 'edited';
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${baseName}_edited.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
