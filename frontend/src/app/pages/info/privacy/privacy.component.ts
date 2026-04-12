import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="info-page animate-fade-in">
      <div class="container">
        <div class="info-card">
          <h1 class="info-title">Privacy <span class="gradient-text">Policy</span></h1>
          <p class="last-updated">Last Updated: April 2026</p>

          <div class="info-content">
            <section>
              <h2>1. Introduction</h2>
              <p>Welcome to DocForge. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website.</p>
            </section>

            <section>
              <h2>2. Data We NOT Collect</h2>
              <p><strong>Private Document Processing:</strong> Unlike many other online tools, DocForge processes the majority of your documents directly in your browser. This means your files never leave your computer and are never seen by us.</p>
            </section>

            <section>
              <h2>3. Browser Storage</h2>
              <p>We may use local storage in your browser to save your preferences and temporary work (like resume drafts). This data remains on your device and is not synchronized to any server unless explicitly requested.</p>
            </section>

            <section>
              <h2>4. AdSense</h2>
              <p>We use Google AdSense to serve advertisements. Google may use cookies to serve ads based on your prior visits to our website or other websites.</p>
            </section>

            <section>
              <h2>5. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, you can contact us at support&#64;docforge.com.</p>
            </section>
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
    .last-updated {
      color: var(--text-muted);
      font-size: 0.9rem;
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
    .gradient-text {
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    @media (max-width: 768px) {
      .info-card { padding: 30px; }
      .info-title { font-size: 2rem; }
    }
  `]
})
export class PrivacyComponent {}
