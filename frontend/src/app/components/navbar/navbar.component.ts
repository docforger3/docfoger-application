import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar" id="main-navbar">
      <div class="navbar-inner container">
        <a routerLink="/" class="navbar-brand" id="brand-link">
          <div class="brand-icon">
            <svg viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#06b6d4"/>
                  <stop offset="100%" style="stop-color:#8b5cf6"/>
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#brandGrad)" opacity="0.15"/>
              <path d="M10 8h8l4 4v12a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z" stroke="url(#brandGrad)" stroke-width="1.5" fill="none"/>
              <path d="M18 8v4h4" stroke="url(#brandGrad)" stroke-width="1.5" fill="none"/>
              <path d="M12 17h8M12 20h5" stroke="url(#brandGrad)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="brand-text">Doc<span class="accent">Forge</span></span>
        </a>

        <div class="navbar-links" [class.open]="menuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link" id="nav-dashboard" (click)="closeMenu()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Dashboard
          </a>
          <a routerLink="/converter" routerLinkActive="active" class="nav-link" id="nav-converter" (click)="closeMenu()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
              <path d="M16 3h5v5"/><path d="m21 3-7 7"/><path d="M8 21H3v-5"/><path d="m3 21 7-7"/>
            </svg>
            Converter
          </a>
          <a routerLink="/resume-builder" routerLinkActive="active" class="nav-link" (click)="closeMenu()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            Resume
          </a>
          <a routerLink="/invoice-generator" routerLinkActive="active" class="nav-link" (click)="closeMenu()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
            Invoice
          </a>
          <a routerLink="/emi-calculator" routerLinkActive="active" class="nav-link" (click)="closeMenu()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
              <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>
            </svg>
            EMI
          </a>
        </div>

        <div class="navbar-actions">
          <div class="status-indicator" id="server-status">
            <span class="status-dot online"></span>
            <span class="status-text">Online</span>
          </div>
          <button class="hamburger" (click)="toggleMenu()" [class.active]="menuOpen" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <!-- Mobile overlay -->
      <div class="mobile-overlay" [class.visible]="menuOpen" (click)="closeMenu()"></div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 72px;
      background: rgba(10, 14, 26, 0.95);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(148, 163, 184, 0.06);
    }

    .navbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      gap: 32px;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--text-primary);
      transition: opacity 0.2s;
      flex-shrink: 0;
    }

    .navbar-brand:hover {
      opacity: 0.9;
      color: var(--text-primary);
    }

    .brand-icon {
      width: 36px;
      height: 36px;
    }

    .brand-icon svg {
      width: 100%;
      height: 100%;
    }

    .brand-text {
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .accent {
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .navbar-links {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 10px;
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.88rem;
      text-decoration: none;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .nav-link:hover {
      color: var(--text-primary);
      background: rgba(148, 163, 184, 0.08);
    }

    .nav-link.active {
      color: var(--accent-cyan);
      background: rgba(6, 182, 212, 0.1);
    }

    .nav-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 20px;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.15);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      animation: pulse 2s ease-in-out infinite;
    }

    .status-text {
      font-size: 0.78rem;
      font-weight: 500;
      color: #10b981;
    }

    /* Hamburger Button */
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 36px;
      height: 36px;
      background: rgba(148, 163, 184, 0.08);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      cursor: pointer;
      padding: 7px;
    }

    .hamburger span {
      display: block;
      height: 2px;
      background: var(--text-secondary);
      border-radius: 2px;
      transition: all 0.3s ease;
      transform-origin: center;
    }

    .hamburger.active span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    .hamburger.active span:nth-child(2) {
      opacity: 0;
      transform: scaleX(0);
    }
    .hamburger.active span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    /* Mobile overlay */
    .mobile-overlay {
      display: none;
      position: fixed;
      top: 72px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 999;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .mobile-overlay.visible {
      display: block;
      opacity: 1;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
      50% { opacity: 0.8; box-shadow: 0 0 0 4px rgba(16,185,129,0); }
    }

    /* ===== MOBILE STYLES ===== */
    @media (max-width: 768px) {
      .status-indicator { display: none; }
      .hamburger { display: flex; }

      .mobile-overlay { display: block; pointer-events: none; }
      .mobile-overlay.visible { pointer-events: all; }

      .navbar-links {
        position: fixed;
        top: 72px;
        left: 0;
        right: 0;
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
        padding: 12px 16px 20px;
        background: rgba(10, 14, 26, 0.98);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--glass-border);
        z-index: 990;
        
        /* Fix for overlapping: use opacity and small transform instead of huge translate */
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      }

      .navbar-links.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .nav-link {
        padding: 14px 16px;
        font-size: 0.95rem;
        border-radius: 10px;
        border: 1px solid transparent;
      }

      .nav-link:hover {
        border-color: var(--glass-border);
      }

      .nav-link.active {
        border-color: rgba(6, 182, 212, 0.2);
      }

      .navbar-inner { gap: 0; }
    }

    @media (max-width: 480px) {
      .brand-text { font-size: 1.15rem; }
    }
  `]
})
export class NavbarComponent {
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}
