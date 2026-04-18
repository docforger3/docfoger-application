import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdsenseBannerComponent } from '../../components/adsense-banner/adsense-banner.component';
import { ConversionService, ConversionStats, ConversionHistory } from '../../services/conversion.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdsenseBannerComponent],
  template: `

    <!-- Hero Section -->
    <section class="hero animate-fade-in-up" id="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Multipurpose Toolkit
          </div>
          <h1 class="hero-title">
            Transform Your <span class="gradient-text">Documents</span><br>
            With One Click
          </h1>
          <p class="hero-subtitle">
            DocForge is your ultimate all-in-one productivity workspace. Effortlessly build professional resumes, 
            design stunning invitations, generate secure QR codes, and convert any file format—all in one place. 
            Designed for efficiency and 100% secure.
          </p>
          <div class="hero-actions">
            <a routerLink="/converter" class="btn-primary" id="hero-cta">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                <path d="M16 3h5v5"/><path d="m21 3-7 7"/><path d="M8 21H3v-5"/><path d="m3 21 7-7"/>
              </svg>
              Start Converting
            </a>
            <button class="btn-secondary" id="hero-learn-more" (click)="scrollToTools()">
              Explore Tools
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- AdSense Banner -->
    <div class="ad-break-large animate-fade-in-up">
      <div class="container">
        <app-adsense-banner slotId="1234567890" margin="10px 0 10px 0"></app-adsense-banner>
      </div>
    </div>
    
    <!-- Tools Section -->
    <section class="tools-section" id="tools-section">
      <div class="container">
        <div class="section-header animate-fade-in-up">
          <h2 class="section-title">Powerful <span class="gradient-text">Tools</span></h2>
          <p class="section-subtitle">Choose a toolkit to get started</p>
        </div>

        <div class="tools-grid">
          <!-- Document Converter Card -->
          <a routerLink="/converter" class="tool-card primary-card animate-fade-in-up delay-1" id="tool-converter">
            <div class="card-glow"></div>
            <div class="card-icon">
              <svg viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="convGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#06b6d4"/>
                    <stop offset="100%" style="stop-color:#8b5cf6"/>
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#convGrad)" opacity="0.12"/>
                <path d="M20 12h-4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V18l-6-6Z" stroke="url(#convGrad)" stroke-width="2" fill="none"/>
                <path d="M28 12v6h6" stroke="url(#convGrad)" stroke-width="2" fill="none"/>
                <path d="M18 25h12M18 29h8" stroke="url(#convGrad)" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="card-content">
              <h3 class="card-title">Document Converter</h3>
              <p class="card-desc">Convert, Merge, and Compress PDFs! Supports Word, Excel, PPTX, Images, HTML, and Text formats.</p>
              <div class="card-features" style="flex-wrap: wrap;">
                <span class="feature-tag">Merge & Compress</span>
                <span class="feature-tag">PDF ↔ Word</span>
                <span class="feature-tag">PDF ↔ Excel</span>
                <span class="feature-tag">PDF ↔ PPTX</span>
                <span class="feature-tag">HTML → PDF</span>
              </div>
            </div>
            <div class="card-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </a>

          <!-- Image Editor Card (Active) -->
          <a routerLink="/image-editor" class="tool-card editor-card animate-fade-in-up delay-2" id="tool-image-editor">
            <div class="card-glow editor-glow"></div>
            <div class="card-icon">
              <svg viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="editGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#ec4899"/>
                    <stop offset="100%" style="stop-color:#8b5cf6"/>
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#editGrad)" opacity="0.12"/>
                <rect x="12" y="12" width="24" height="24" rx="4" stroke="url(#editGrad)" stroke-width="2" fill="none"/>
                <circle cx="20" cy="20" r="3" stroke="url(#editGrad)" stroke-width="2" fill="none"/>
                <path d="M36 28l-6-6-14 14" stroke="url(#editGrad)" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <div class="card-content">
              <h3 class="card-title">Image Editor</h3>
              <p class="card-desc">Powerful Canvas-based editor with drawing, filters, adjustments, and more.</p>
              <div class="card-features">
                <span class="feature-tag pink">Crop & Resize</span>
                <span class="feature-tag pink">Draw & Text</span>
                <span class="feature-tag pink">Filters</span>
                <span class="feature-tag pink">Adjustments</span>
              </div>
            </div>
            <div class="card-arrow editor-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </a>

          <a routerLink="/qr-code" class="tool-card qr-card animate-fade-in-up delay-3" id="tool-qr-generator">
            <div class="card-glow qr-glow"></div>
            <div class="card-icon">
              <svg viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#10b981"/>
                    <stop offset="100%" style="stop-color:#059669"/>
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#qrGrad)" opacity="0.12"/>
                <rect x="12" y="12" width="10" height="10" rx="2" stroke="url(#qrGrad)" stroke-width="2" fill="none"/>
                <rect x="26" y="12" width="10" height="10" rx="2" stroke="url(#qrGrad)" stroke-width="2" fill="none"/>
                <rect x="12" y="26" width="10" height="10" rx="2" stroke="url(#qrGrad)" stroke-width="2" fill="none"/>
                <rect x="28" y="28" width="6" height="6" rx="1" stroke="url(#qrGrad)" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <div class="card-content">
              <h3 class="card-title">QR Code Generator</h3>
              <p class="card-desc">Generate customizable QR codes for URLs, text, and contacts.</p>
              <div class="card-features">
                <span class="feature-tag green">Customize</span>
                <span class="feature-tag green">vCards</span>
                <span class="feature-tag green">Export PNG</span>
              </div>
            </div>
            <div class="card-arrow qr-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </a>

          <a routerLink="/text-tools" class="tool-card text-card animate-fade-in-up delay-4" id="tool-text-tools">
            <div class="card-glow text-glow"></div>
            <div class="card-icon">
              <svg viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#f59e0b"/>
                    <stop offset="100%" style="stop-color:#f97316"/>
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#textGrad)" opacity="0.12"/>
                <path d="M16 14h16M24 14v20" stroke="url(#textGrad)" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M18 34h12" stroke="url(#textGrad)" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="card-content">
              <h3 class="card-title">Text Tools</h3>
              <p class="card-desc">Diff checker, JSON formatting, search, case converter, base64, and string manipulation.</p>
              <div class="card-features">
                <span class="feature-tag orange">Diff Checker</span>
                <span class="feature-tag orange">JSON Tools</span>
                <span class="feature-tag orange">Search/Replace</span>
              </div>
            </div>
            <div class="card-arrow text-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </a>

          <!-- UUID Generator Card -->
          <a routerLink="/uuid-generator" class="tool-card uuid-card animate-fade-in-up delay-5" id="tool-uuid-generator">
            <div class="card-glow uuid-glow"></div>
            <div class="card-icon">
              <svg viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="uuidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#06b6d4"/>
                    <stop offset="100%" style="stop-color:#0891b2"/>
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#uuidGrad)" opacity="0.12"/>
                <path d="M12 24h24M16 16v16M32 16v16M24 16v16" stroke="url(#uuidGrad)" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="card-content">
              <h3 class="card-title">UUID Generator</h3>
              <p class="card-desc">Generate random v4 UUIDs in bulk with one-click copy and history.</p>
              <div class="card-features">
                <span class="feature-tag cyan">v4 UUIDs</span>
                <span class="feature-tag cyan">Bulk Gen</span>
                <span class="feature-tag cyan">History</span>
              </div>
            </div>
            <div class="card-arrow uuid-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </a>

          <!-- Resume Builder Card -->
          <a routerLink="/resume-builder" class="tool-card resume-card animate-fade-in-up delay-6" id="tool-resume-builder">
            <div class="card-glow resume-glow"></div>
            <div class="card-icon">
              <svg viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="resumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#8b5cf6"/>
                    <stop offset="100%" style="stop-color:#3b82f6"/>
                  </linearGradient>
                </defs>
                <rect x="10" y="6" width="28" height="36" rx="4" fill="url(#resumeGrad)" opacity="0.12"/>
                <path d="M10 10a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v32a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V10Z" stroke="url(#resumeGrad)" stroke-width="2" fill="none"/>
                <path d="M16 16h8M16 22h16M16 28h16M16 34h10" stroke="url(#resumeGrad)" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="card-content">
              <h3 class="card-title">Resume Builder</h3>
              <p class="card-desc">Visually design and export beautiful resumes with Canva-like custom templates.</p>
              <div class="card-features">
                <span class="feature-tag purple">Live Preview</span>
                <span class="feature-tag purple">Templates</span>
                <span class="feature-tag purple">Export PDF</span>
              </div>
            </div>
            <div class="card-arrow resume-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </a>

          <!-- Invoice Generator Card -->
          <a routerLink="/invoice-generator" class="tool-card invoice-card animate-fade-in-up delay-7" id="tool-invoice-generator">
            <div class="card-glow invoice-glow"></div>
            <div class="card-icon">
              <svg viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="invGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#f59e0b"/>
                    <stop offset="100%" style="stop-color:#d97706"/>
                  </linearGradient>
                </defs>
                <rect x="8" y="6" width="32" height="36" rx="4" fill="url(#invGrad)" opacity="0.12"/>
                <path d="M14 14h20M14 20h20M14 26h12" stroke="url(#invGrad)" stroke-width="2.5" stroke-linecap="round"/>
                <rect x="8" y="6" width="32" height="36" rx="4" stroke="url(#invGrad)" stroke-width="2" fill="none"/>
                <circle cx="30" cy="32" r="4" fill="url(#invGrad)"/>
              </svg>
            </div>
            <div class="card-content">
              <h3 class="card-title">Invoice Generator</h3>
              <p class="card-desc">Generate professional invoices with multi-country tax logic and Canva-like editors.</p>
              <div class="card-features">
                <span class="feature-tag yellow">10 Templates</span>
                <span class="feature-tag yellow">Multi-Region Tax</span>
                <span class="feature-tag yellow">Export DOC/PDF</span>
              </div>
            </div>
            <div class="card-arrow invoice-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </a>

          <!-- Invitation Builder Card -->
          <a routerLink="/invitation-builder" class="tool-card invite-card animate-fade-in-up delay-8" id="tool-invitation-builder">
            <div class="card-glow invite-glow"></div>
            <div class="card-icon">
              <!-- A nice rose tint SVG envelope -->
              <svg viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="invtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#f43f5e"/>
                    <stop offset="100%" style="stop-color:#e11d48"/>
                  </linearGradient>
                </defs>
                <rect x="8" y="10" width="32" height="28" rx="4" fill="url(#invtGrad)" opacity="0.12"/>
                <path d="M8 14l16 10 16-10" stroke="url(#invtGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="8" y="10" width="32" height="28" rx="4" stroke="url(#invtGrad)" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <div class="card-content">
              <h3 class="card-title">Invitation Builder</h3>
              <p class="card-desc">Design beautiful custom invitations for Weddings, Parties, and Events.</p>
              <div class="card-features">
                <span class="feature-tag rose">Wedding</span>
                <span class="feature-tag rose">Engagement</span>
                <span class="feature-tag rose">Export PNG</span>
              </div>
            </div>
            <div class="card-arrow invite-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </a>

          <!-- EMI Calculator Card -->
          <a routerLink="/emi-calculator" class="tool-card emi-card animate-fade-in-up" id="tool-emi-calculator">
            <div class="card-glow emi-glow"></div>
            <div class="card-icon">
              <!-- A cool pie-chart/finance SVG -->
              <svg viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="emiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#10b981"/>
                    <stop offset="100%" style="stop-color:#059669"/>
                  </linearGradient>
                </defs>
                <rect x="8" y="10" width="32" height="28" rx="4" fill="url(#emiGrad)" opacity="0.12"/>
                <path d="M24 16v8l6 6" stroke="url(#emiGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="24" cy="24" r="14" stroke="url(#emiGrad)" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <div class="card-content">
              <h3 class="card-title">EMI Calculator</h3>
              <p class="card-desc">Calculate amortized loan installments instantly with robust financial analytics.</p>
              <div class="card-features">
                <span class="feature-tag emerald">Amortization</span>
                <span class="feature-tag emerald">Pie Charts</span>
              </div>
            </div>
            <div class="card-arrow emi-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </a>

          <!-- Bill Splitter Card -->
          <a routerLink="/split-expense" class="tool-card bill-card animate-fade-in-up" id="tool-bill-splitter">
            <div class="card-glow bill-glow"></div>
            <div class="card-icon">
              <svg viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="billGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#8b5cf6"/>
                    <stop offset="100%" style="stop-color:#d946ef"/>
                  </linearGradient>
                </defs>
                <rect x="8" y="10" width="32" height="28" rx="4" fill="url(#billGrad)" opacity="0.12"/>
                <!-- Dollar sign simplified -->
                <path d="M24 16v16M20 20h8a4 4 0 0 1 0 8h-8a4 4 0 0 0 0 8h8" stroke="url(#billGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="card-content">
              <h3 class="card-title">Split Expense App</h3>
              <p class="card-desc">Simplify group expenses and settlements with intelligent transaction minimization.</p>
              <div class="card-features">
                <span class="feature-tag purple">Minimized Settlement</span>
                <span class="feature-tag purple">Percentage Split</span>
              </div>
            </div>
            <div class="card-arrow bill-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </a>

          <!-- Loan Timeline Hacker Card -->
          <a routerLink="/loan-timeline" class="tool-card loan-card animate-fade-in-up" id="tool-loan-timeline">
            <div class="card-glow loan-glow"></div>
            <div class="card-icon">
              <svg viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="loanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#06b6d4"/>
                    <stop offset="100%" style="stop-color:#10b981"/>
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#loanGrad)" opacity="0.12"/>
                <!-- Clock base -->
                <circle cx="24" cy="24" r="14" stroke="url(#loanGrad)" stroke-width="2" fill="none"/>
                <path d="M24 16v8l5 5" stroke="url(#loanGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- Fast-forward arrows -->
                <path d="M36 18l4-4-4 4 4 0" stroke="url(#loanGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="card-content">
              <h3 class="card-title">Loan Timeline Hacker</h3>
              <p class="card-desc">Skip EMI years and save lakhs in interest. Find the exact monthly prepayment to end your loan early.</p>
              <div class="card-features">
                <span class="feature-tag teal">Skip EMI Years</span>
                <span class="feature-tag teal">Interest Saved</span>
                <span class="feature-tag teal">New Payoff Date</span>
              </div>
            </div>
            <div class="card-arrow loan-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </a>

        </div>
      </div>
    </section>


  `,
  styles: [`
    /* ===== Hero Section ===== */
    .hero {
      padding: 60px 0 20px;
      text-align: center;
    }

    .hero-content {
      max-width: 720px;
      margin: 0 auto;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 20px;
      background: rgba(6, 182, 212, 0.08);
      border: 1px solid rgba(6, 182, 212, 0.15);
      color: var(--accent-cyan);
      font-size: 0.82rem;
      font-weight: 500;
      margin-bottom: 24px;
    }

    .hero-title {
      font-size: 3.2rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 20px;
      letter-spacing: -1.5px;
    }

    .hero-subtitle {
      font-size: 1.1rem;
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 36px;
      max-width: 560px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    /* ===== Tools Section ===== */
    .tools-section {
      padding: 20px 0 60px;
    }

    .section-header {
      margin-bottom: 40px;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }

    .section-subtitle {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    /* ===== Tool Card ===== */
    .tool-card {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 28px;
      border-radius: var(--radius-lg);
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      transition: all 0.3s ease;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
    }

    .tool-card:hover {
      transform: translateY(-4px);
      border-color: var(--border-hover);
      box-shadow: var(--shadow-lg);
    }

    .primary-card {
      flex-direction: row;
      align-items: center;
      gap: 20px;
      cursor: pointer;
    }

    .primary-card:hover {
      border-color: rgba(6, 182, 212, 0.3);
      box-shadow: var(--shadow-glow-cyan);
    }

    .primary-card:hover .card-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    .card-glow {
      position: absolute;
      top: -50%;
      right: -30%;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.06), transparent 70%);
      pointer-events: none;
    }

    .card-icon {
      width: 56px;
      height: 56px;
      flex-shrink: 0;
    }

    .card-icon svg {
      width: 100%;
      height: 100%;
    }

    .card-content {
      flex: 1;
    }

    .card-title {
      font-size: 1.15rem;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--text-primary);
    }

    .card-desc {
      font-size: 0.88rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 14px;
    }

    .card-features {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .feature-tag {
      padding: 4px 10px;
      border-radius: 6px;
      background: rgba(6, 182, 212, 0.08);
      border: 1px solid rgba(6, 182, 212, 0.12);
      color: var(--accent-cyan);
      font-size: 0.75rem;
      font-weight: 500;
    }

    .card-arrow {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      color: var(--accent-cyan);
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s ease;
    }

    .card-arrow svg {
      width: 100%;
      height: 100%;
    }

    .coming-soon-card {
      opacity: 0.7;
      cursor: default;
    }

    .coming-soon-card:hover {
      transform: translateY(-2px);
      opacity: 0.85;
    }

    .coming-soon-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      background: rgba(148, 163, 184, 0.1);
      border: 1px solid rgba(148, 163, 184, 0.1);
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 500;
    }

    /* Editor Card */
    .editor-card {
      cursor: pointer;
      flex-direction: row;
      align-items: center;
      gap: 20px;
    }
    .editor-card:hover {
      border-color: rgba(236, 72, 153, 0.3);
      box-shadow: 0 0 30px rgba(236, 72, 153, 0.15);
    }
    .editor-card:hover .editor-arrow {
      opacity: 1;
      transform: translateX(0);
    }
    .editor-glow {
      position: absolute;
      top: -50%;
      right: -30%;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(236, 72, 153, 0.06), transparent 70%);
      pointer-events: none;
    }
    .editor-arrow {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      color: #ec4899;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s ease;
    }
    .editor-arrow svg { width: 100%; height: 100%; }

    .feature-tag.pink {
      background: rgba(236, 72, 153, 0.08);
      border-color: rgba(236, 72, 153, 0.12);
      color: #ec4899;
    }

    /* QR Code Card */
    .qr-card {
      cursor: pointer;
      flex-direction: row;
      align-items: center;
      gap: 20px;
    }
    .qr-card:hover {
      border-color: rgba(16, 185, 129, 0.3);
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.15);
    }
    .qr-card:hover .qr-arrow {
      opacity: 1;
      transform: translateX(0);
    }
    .qr-glow {
      position: absolute;
      top: -50%;
      right: -30%;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.06), transparent 70%);
      pointer-events: none;
    }
    .qr-arrow {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      color: #10b981;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s ease;
    }
    .qr-arrow svg { width: 100%; height: 100%; }

    .feature-tag.green {
      background: rgba(16, 185, 129, 0.08);
      border-color: rgba(16, 185, 129, 0.12);
      color: #10b981;
    }

    /* Text Tools Card */
    .text-card {
      cursor: pointer;
      flex-direction: row;
      align-items: center;
      gap: 20px;
    }
    .text-card:hover {
      border-color: rgba(245, 158, 11, 0.3);
      box-shadow: 0 0 30px rgba(245, 158, 11, 0.15);
    }
    .text-card:hover .text-arrow {
      opacity: 1;
      transform: translateX(0);
    }
    .text-glow {
      position: absolute;
      top: -50%;
      right: -30%;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.06), transparent 70%);
      pointer-events: none;
    }
    .text-arrow {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      color: #f59e0b;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s ease;
    }
    .text-arrow svg { width: 100%; height: 100%; }

    .feature-tag.orange {
      background: rgba(245, 158, 11, 0.08);
      border-color: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
    }

    /* UUID Generator Card */
    .uuid-card {
      cursor: pointer;
      flex-direction: row;
      align-items: center;
      gap: 20px;
    }
    .uuid-card:hover {
      border-color: rgba(6, 182, 212, 0.3);
      box-shadow: 0 0 30px rgba(6, 182, 212, 0.15);
    }
    .uuid-card:hover .uuid-arrow {
      opacity: 1;
      transform: translateX(0);
    }
    .uuid-glow {
      position: absolute;
      top: -50%;
      right: -30%;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.06), transparent 70%);
      pointer-events: none;
    }
    .uuid-arrow {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      color: #06b6d4;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s ease;
    }
    .uuid-arrow svg { width: 100%; height: 100%; }

    .feature-tag.cyan {
      background: rgba(6, 182, 212, 0.08);
      border-color: rgba(6, 182, 212, 0.12);
      color: #06b6d4;
    }

    /* Resume Builder Card */
    .resume-card {
      cursor: pointer;
      flex-direction: row;
      align-items: center;
      gap: 20px;
    }
    .resume-card:hover {
      border-color: rgba(139, 92, 246, 0.3);
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.15);
    }
    .resume-card:hover .resume-arrow {
      opacity: 1;
      transform: translateX(0);
    }
    .resume-glow {
      position: absolute;
      top: -50%;
      right: -30%;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.06), transparent 70%);
      pointer-events: none;
    }
    .resume-arrow {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      color: #8b5cf6;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s ease;
    }
    .resume-arrow svg { width: 100%; height: 100%; }

    .feature-tag.purple {
      background: rgba(139, 92, 246, 0.08);
      border-color: rgba(139, 92, 246, 0.12);
      color: #8b5cf6;
    }
    /* Invoice Generator Card */
    .invoice-card {
      cursor: pointer;
      flex-direction: row;
      align-items: center;
      gap: 20px;
    }
    .invoice-card:hover {
      border-color: rgba(245, 158, 11, 0.3);
      box-shadow: 0 0 30px rgba(245, 158, 11, 0.15);
    }
    .invoice-card:hover .invoice-arrow {
      opacity: 1;
      transform: translateX(0);
    }
    .invoice-glow {
      position: absolute;
      top: -50%;
      right: -30%;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.06), transparent 70%);
      pointer-events: none;
    }
    .invoice-arrow {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      color: #f59e0b;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s ease;
    }
    .invoice-arrow svg { width: 100%; height: 100%; }

    .feature-tag.yellow {
      background: rgba(245, 158, 11, 0.08);
      border-color: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
    }

    /* Invitation Card */
    .invite-card {
      cursor: pointer;
      flex-direction: row;
      align-items: center;
      gap: 20px;
    }
    .invite-card:hover {
      border-color: rgba(244, 63, 94, 0.3);
      box-shadow: 0 0 30px rgba(244, 63, 94, 0.15);
    }
    .invite-card:hover .invite-arrow {
      opacity: 1;
      transform: translateX(0);
    }
    .invite-glow {
      position: absolute;
      top: -50%;
      right: -30%;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(244, 63, 94, 0.06), transparent 70%);
      pointer-events: none;
    }
    .invite-arrow {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      color: #f43f5e;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s ease;
    }
    .invite-arrow svg { width: 100%; height: 100%; }

    .feature-tag.rose {
      background: rgba(244, 63, 94, 0.08);
      border-color: rgba(244, 63, 94, 0.12);
      color: #e11d48;
    }

    /* EMI specific hover map */
    .emi-card:hover {
      border-color: rgba(16, 185, 129, 0.3);
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.15);
    }
    .emi-card:hover .emi-arrow {
      opacity: 1;
      transform: translateX(0);
    }
    .emi-glow {
      position: absolute; top: -50%; right: -30%; width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.06), transparent 70%); pointer-events: none;
    }
    .emi-arrow {
      width: 36px; height: 36px; flex-shrink: 0; color: #10b981; opacity: 0; transform: translateX(-10px); transition: all 0.3s ease;
    }
    .emi-arrow svg { width: 100%; height: 100%; }
    .feature-tag.emerald {
      background: rgba(16, 185, 129, 0.08);
      border-color: rgba(16, 185, 129, 0.12);
      color: #059669;
    }

    /* Bill Splitter Card */
    .bill-card:hover {
      border-color: rgba(139, 92, 246, 0.3);
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.15);
    }
    .bill-card:hover .bill-arrow {
      opacity: 1;
      transform: translateX(0);
    }
    .bill-glow {
      position: absolute; top: -50%; right: -30%; width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.06), transparent 70%); pointer-events: none;
    }
    .bill-arrow {
      width: 36px; height: 36px; flex-shrink: 0; color: #8b5cf6; opacity: 0; transform: translateX(-10px); transition: all 0.3s ease;
    }
    .bill-arrow svg { width: 100%; height: 100%; }

    /* Loan Timeline Hacker Card */
    .loan-card:hover {
      border-color: rgba(6, 182, 212, 0.3);
      box-shadow: 0 0 30px rgba(6, 182, 212, 0.15);
    }
    .loan-card:hover .loan-arrow {
      opacity: 1;
      transform: translateX(0);
    }
    .loan-glow {
      position: absolute; top: -50%; right: -30%; width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.07), transparent 70%); pointer-events: none;
    }
    .loan-arrow {
      width: 36px; height: 36px; flex-shrink: 0; color: #06b6d4; opacity: 0; transform: translateX(-10px); transition: all 0.3s ease;
    }
    .loan-arrow svg { width: 100%; height: 100%; }
    .feature-tag.teal {
      background: rgba(6, 182, 212, 0.08);
      border-color: rgba(6, 182, 212, 0.15);
      color: #06b6d4;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .hero { padding: 40px 0 28px; }
      .hero-title { font-size: 2.2rem; letter-spacing: -1px; }
      .hero-subtitle { font-size: 0.95rem; margin-bottom: 28px; }
      .hero-actions { flex-direction: column; align-items: stretch; gap: 12px; padding: 0 16px; }
      .hero-actions .btn-primary,
      .hero-actions .btn-secondary { width: 100%; justify-content: center; }

      .tools-section { padding: 36px 0; }
      .section-header { margin-bottom: 28px; }
      .section-title { font-size: 1.6rem; }

      .tools-grid { grid-template-columns: 1fr; gap: 14px; }

      /* Make all horizontal row cards stack vertically on mobile */
      .primary-card,
      .editor-card,
      .qr-card,
      .text-card,
      .uuid-card,
      .resume-card,
      .invoice-card,
      .invite-card,
      .bill-card,
      .loan-card,
      .emi-card { flex-direction: column; align-items: flex-start; gap: 14px; }

      /* Always show arrows on mobile (no hover required) */
      .card-arrow, .editor-arrow, .qr-arrow, .text-arrow,
      .uuid-arrow, .resume-arrow, .invoice-arrow, .invite-arrow, .bill-arrow, .emi-arrow {
        opacity: 1;
        transform: translateX(0);
        margin-top: 4px;
      }

      .tool-card { padding: 20px; }
      .card-icon { width: 44px; height: 44px; }
    }

    @media (max-width: 480px) {
      .hero-title { font-size: 1.8rem; }
      .hero-badge { font-size: 0.76rem; padding: 5px 12px; }
      .hero-subtitle { font-size: 0.88rem; }
      .card-title { font-size: 1rem; }
      .card-desc { font-size: 0.83rem; }
      .feature-tag { font-size: 0.72rem; }
      .tool-card { padding: 16px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: ConversionStats | null = null;
  history: ConversionHistory[] = [];

  constructor(private conversionService: ConversionService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadHistory();
  }

  loadStats(): void {
    this.conversionService.getStats().subscribe({
      next: (stats) => this.stats = stats,
      error: () => {
        // Use defaults if backend is not available
        this.stats = {
          totalConversions: 0,
          successfulConversions: 0,
          failedConversions: 0,
          conversionsByType: {}
        };
      }
    });
  }

  loadHistory(): void {
    this.conversionService.getHistory().subscribe({
      next: (history) => this.history = history,
      error: () => this.history = []
    });
  }

  scrollToTools(): void {
    document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  formatType(type: string): string {
    return type.replace(/_/g, ' → ').replace('TO ', '');
  }

  formatSize(bytes: number): string {
    return this.conversionService.formatFileSize(bytes);
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'PDF_TO_WORD': '#3b82f6',
      'WORD_TO_PDF': '#8b5cf6',
      'PDF_TO_EXCEL': '#10b981',
      'EXCEL_TO_PDF': '#f59e0b',
      'IMAGE_TO_PDF': '#ec4899',
      'PDF_TO_IMAGE': '#06b6d4',
      'PDF_TO_TEXT': '#64748b',
      'TEXT_TO_PDF': '#a855f7'
    };
    return colors[type] || '#64748b';
  }
}
