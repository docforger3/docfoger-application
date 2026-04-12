import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer" id="main-footer">
      <div class="footer-glow"></div>
      <div class="footer-inner container">
        <div class="footer-top">
          <div class="footer-brand">
            <span class="brand-text">Doc<span class="accent">Forge</span></span>
            <p class="footer-desc">Your all-in-one document toolkit. Convert, design, calculate, and manage — all from a single premium platform.</p>
            <div class="social-icons">
              <a href="#" class="social-icon" aria-label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" class="social-icon" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" class="social-icon" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          <div class="footer-links">
            <div class="footer-column">
              <h4>Tools</h4>
              <ul>
                <li><a href="javascript:void(0)" routerLink="/converter">Document Converter</a></li>
                <li><a href="javascript:void(0)" routerLink="/invoice-generator">Invoice Generator</a></li>
                <li><a href="javascript:void(0)" routerLink="/resume-builder">Resume Builder</a></li>
                <li><a href="javascript:void(0)" routerLink="/invitation-builder">Invitation Builder</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h4>Utilities</h4>
              <ul>
                <li><a href="javascript:void(0)" routerLink="/emi-calculator">EMI Calculator</a></li>
                <li><a href="javascript:void(0)" routerLink="/qr-code">QR Code Generator</a></li>
                <li><a href="javascript:void(0)" routerLink="/text-tools">Text Tools</a></li>
                <li><a href="javascript:void(0)" routerLink="/image-editor">Image Editor</a></li>
              </ul>
            </div>
            <div class="footer-column">
              <h4>Platform</h4>
              <ul>
                <li><a href="javascript:void(0)" routerLink="/privacy">Privacy Policy</a></li>
                <li><a href="javascript:void(0)" routerLink="/terms">Terms of Use</a></li>
                <li><a href="javascript:void(0)" routerLink="/contact">Contact Us</a></li>
                <li><a href="javascript:void(0)" routerLink="/about">About</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} DocForge. Crafted with precision for modern workflows.</p>
          <p class="version-tag">v1.0 &middot; All rights reserved</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      position: relative;
      z-index: 9999;
      margin-top: 80px;
      border-top: 1px solid var(--glass-border);
      background: rgba(10, 14, 26, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      overflow: hidden;
    }

    .footer-glow {
      position: absolute;
      top: -60px;
      left: 50%;
      transform: translateX(-50%);
      width: 400px;
      height: 120px;
      background: radial-gradient(ellipse, rgba(6, 182, 212, 0.08), transparent 70%);
      pointer-events: none;
    }

    .footer-inner {
      padding: 52px 24px 28px;
      position: relative;
    }

    .footer-top {
      display: flex;
      justify-content: space-between;
      gap: 60px;
      margin-bottom: 36px;
    }

    .footer-brand {
      max-width: 320px;
      flex-shrink: 0;
    }

    .brand-text {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }

    .accent {
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .footer-desc {
      margin-top: 12px;
      color: var(--text-muted);
      font-size: 0.88rem;
      line-height: 1.6;
    }

    .social-icons {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }

    .social-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: rgba(148, 163, 184, 0.08);
      border: 1px solid var(--glass-border);
      color: var(--text-muted);
      transition: all 0.3s ease;
    }

    .social-icon:hover {
      background: rgba(6, 182, 212, 0.1);
      border-color: rgba(6, 182, 212, 0.3);
      color: var(--accent-cyan);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.15);
    }

    .footer-links {
      display: flex;
      gap: 56px;
    }

    .footer-column h4 {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }

    .footer-column ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-column li {
      color: var(--text-muted);
      font-size: 0.87rem;
      transition: color 0.2s;
    }

    .footer-column li:hover {
      color: var(--text-primary);
    }

    .footer-column li a {
      display: block;
      padding: 6px 0;
      color: inherit;
      text-decoration: none;
      cursor: pointer;
      position: relative;
      z-index: 10000;
      pointer-events: auto !important;
    }

    .footer-column li a:hover {
      color: var(--accent-cyan);
    }

    .footer-bottom {
      padding-top: 24px;
      border-top: 1px solid var(--glass-border);
      text-align: center;
    }

    .footer-bottom p {
      color: var(--text-muted);
      font-size: 0.82rem;
    }

    .version-tag {
      margin-top: 6px;
      font-size: 0.75rem !important;
      color: var(--text-muted);
      opacity: 0.5;
    }

    @media (max-width: 768px) {
      .footer-top {
        flex-direction: column;
        gap: 32px;
      }

      .footer-links {
        flex-direction: column;
        gap: 24px;
      }

      .footer-brand {
        max-width: 100%;
      }

      .footer-inner { padding: 36px 20px 24px; }
    }

    @media (max-width: 480px) {
      .footer-links { flex-direction: column; gap: 20px; }
      .footer-column h4 { font-size: 0.75rem; }
      .footer-column li { font-size: 0.83rem; }
      .brand-text { font-size: 1.2rem; }
      .footer-desc { font-size: 0.83rem; }
      .footer-bottom p { font-size: 0.78rem; }
      .footer-inner { padding: 28px 16px 20px; }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
