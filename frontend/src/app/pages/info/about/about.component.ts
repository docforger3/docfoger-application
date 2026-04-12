import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="info-page animate-fade-in">
      <div class="container">
        <div class="info-card">
          <h1 class="info-title">About <span class="gradient-text">DocForge</span></h1>
          <p class="tagline">Simplifying Your Digital Workflow</p>

          <div class="info-content">
            <section>
              <h2>Our Mission</h2>
              <p>At DocForge, we believe that powerful document tools should be accessible to everyone, without the complexity or high costs of enterprise software. Our mission is to provide a comprehensive, fast, and secure toolkit that lives entirely in your browser.</p>
            </section>

            <section>
              <h2>What We Build</h2>
              <p>We've combined dozens of utilities into a single, seamless dashboard. Whether you need to build a professional resume, design an invitation, convert a PDF to Word, or generate a QR code, DocForge has you covered.</p>
            </section>

            <section>
              <h2>Technology & Security</h2>
              <p>DocForge is built with modern web technologies (Angular 18, Spring Boot) to ensure speed and reliability. We prioritize your security by performing most operations locally on your machine, ensuring your sensitive documents never stay on a server longer than necessary.</p>
            </section>

            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">50+</span>
                <span class="stat-label">Tools</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">Instant</span>
                <span class="stat-label">Processing</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">100%</span>
                <span class="stat-label">Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .info-page {
      padding: 40px 0 80px;
      min-height: calc(100vh - 80px);
      background: var(--bg-primary);
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .info-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-xl);
      padding: 60px;
      box-shadow: var(--shadow-xl);
    }
    .info-title {
      font-size: 2.85rem;
      font-weight: 800;
      margin-bottom: 8px;
      letter-spacing: -1px;
    }
    .tagline {
      color: var(--accent-cyan);
      font-size: 1.1rem;
      font-weight: 500;
      margin-bottom: 40px;
    }
    .info-content h2 {
      color: var(--text-primary);
      font-size: 1.4rem;
      font-weight: 600;
      margin: 32px 0 16px;
    }
    .info-content p {
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 16px;
      font-size: 1.05rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 50px;
      padding-top: 40px;
      border-top: 1px solid var(--glass-border);
    }
    .stat-item {
      text-align: center;
    }
    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .stat-label {
      color: var(--text-muted);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .gradient-text {
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    @media (max-width: 768px) {
      .info-card { padding: 30px; }
      .info-title { font-size: 2rem; }
      .stats-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AboutComponent {}
