import { Component, HostListener, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, GoogleUser } from '../../services/auth.service';

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

          <!-- Mobile-only: Sign in link inside hamburger menu -->
          <div class="mobile-auth-section" *ngIf="!user">
            <button class="mobile-signin-btn" (click)="handleSignIn(); closeMenu()">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>
          <div class="mobile-auth-section" *ngIf="user">
            <div class="mobile-user-info">
              <img [src]="user.picture" [alt]="user.name" class="mobile-user-avatar" referrerpolicy="no-referrer" />
              <div class="mobile-user-details">
                <span class="mobile-user-name">{{ user.givenName }}</span>
                <span class="mobile-user-email">{{ user.email }}</span>
              </div>
            </div>
            <button class="mobile-signout-btn" (click)="handleSignOut(); closeMenu()">Sign Out</button>
          </div>
        </div>

        <div class="navbar-actions">
          <!-- Desktop: Sign In button or User avatar -->
          <button class="google-signin-btn" *ngIf="!user" (click)="handleSignIn()" id="btn-google-signin">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign In
          </button>

          <!-- Signed-in user avatar + dropdown -->
          <div class="user-profile-wrapper" *ngIf="user">
            <button class="user-avatar-btn" (click)="toggleProfileMenu($event)" id="btn-user-avatar">
              <img [src]="user.picture" [alt]="user.name" class="user-avatar-img" referrerpolicy="no-referrer" />
              <span class="avatar-ring"></span>
            </button>

            <div class="profile-dropdown" [class.open]="profileMenuOpen">
              <div class="pd-header">
                <img [src]="user.picture" [alt]="user.name" class="pd-avatar" referrerpolicy="no-referrer" />
                <div class="pd-info">
                  <span class="pd-name">{{ user.name }}</span>
                  <span class="pd-email">{{ user.email }}</span>
                </div>
              </div>
              <div class="pd-divider"></div>
              <button class="pd-signout" (click)="handleSignOut()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </div>
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

    /* ===== Google Sign In Button ===== */
    .google-signin-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      border-radius: 22px;
      border: 1px solid rgba(148,163,184,0.15);
      background: rgba(255,255,255,0.04);
      color: var(--text-primary);
      font-size: 0.82rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.25s ease;
      white-space: nowrap;
    }
    .google-signin-btn:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(6,182,212,0.3);
      box-shadow: 0 0 16px rgba(6,182,212,0.08);
      transform: translateY(-1px);
    }
    .google-signin-btn:active {
      transform: translateY(0);
    }

    /* ===== User Avatar Button ===== */
    .user-profile-wrapper {
      position: relative;
    }

    .user-avatar-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0;
      transition: transform 0.2s;
    }
    .user-avatar-btn:hover { transform: scale(1.08); }

    .user-avatar-img {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      object-fit: cover;
      display: block;
    }

    .avatar-ring {
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 2px solid transparent;
      background: linear-gradient(135deg, #06b6d4, #8b5cf6) border-box;
      -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    /* ===== Profile Dropdown ===== */
    .profile-dropdown {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      width: 280px;
      background: rgba(15,20,35,0.96);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(148,163,184,0.1);
      border-radius: 16px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px) scale(0.96);
      transition: all 0.2s ease;
      z-index: 2000;
      overflow: hidden;
    }
    .profile-dropdown.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    .pd-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 18px 16px;
    }

    .pd-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      border: 2px solid rgba(6,182,212,0.25);
    }

    .pd-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .pd-name {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pd-email {
      font-size: 0.76rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }

    .pd-divider {
      height: 1px;
      background: rgba(148,163,184,0.08);
      margin: 0 14px;
    }

    .pd-signout {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 14px 18px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pd-signout:hover {
      color: #ef4444;
      background: rgba(239,68,68,0.06);
    }

    /* ===== Mobile auth inside hamburger ===== */
    .mobile-auth-section {
      display: none;
      margin-top: 12px;
      padding-top: 14px;
      border-top: 1px solid rgba(148,163,184,0.08);
    }

    .mobile-signin-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px solid rgba(148,163,184,0.12);
      background: rgba(255,255,255,0.04);
      color: var(--text-primary);
      font-size: 0.92rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mobile-signin-btn:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(6,182,212,0.3);
    }

    .mobile-user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }

    .mobile-user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(6,182,212,0.3);
    }

    .mobile-user-details {
      display: flex;
      flex-direction: column;
    }

    .mobile-user-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .mobile-user-email {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .mobile-signout-btn {
      width: 100%;
      padding: 12px 16px;
      border-radius: 10px;
      border: 1px solid rgba(239,68,68,0.2);
      background: rgba(239,68,68,0.06);
      color: #ef4444;
      font-size: 0.85rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mobile-signout-btn:hover { background: rgba(239,68,68,0.12); }

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
      /* Sign In + Avatar visible in top-right on mobile (compact) */
      .google-signin-btn {
        padding: 6px 12px;
        font-size: 0.76rem;
        border-radius: 18px;
        gap: 6px;
      }
      .google-signin-btn svg { width: 14px; height: 14px; }
      .user-profile-wrapper { display: block; }
      .user-avatar-btn { width: 34px; height: 34px; }
      .user-avatar-img { width: 32px; height: 32px; }
      .avatar-ring { inset: -2px; border-width: 1.5px; }
      .hamburger { display: flex; }
      .mobile-auth-section { display: none !important; }

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
  profileMenuOpen = false;
  user: GoogleUser | null = null;

  constructor(private authService: AuthService) {
    this.authService.user$.subscribe(u => this.user = u);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.profileMenuOpen = false;
  }

  closeMenu() {
    this.menuOpen = false;
    this.profileMenuOpen = false;
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  handleSignIn() {
    this.authService.signIn();
  }

  handleSignOut() {
    this.authService.signOut();
    this.profileMenuOpen = false;
  }

  /** Close profile dropdown when clicking anywhere outside */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.profileMenuOpen) {
      this.profileMenuOpen = false;
    }
  }
}
