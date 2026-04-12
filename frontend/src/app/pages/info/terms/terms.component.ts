import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="info-page animate-fade-in">
      <div class="container">
        <div class="info-card">
          <h1 class="info-title">Terms of <span class="gradient-text">Use</span></h1>
          <p class="last-updated">Last Updated: April 2026</p>

          <div class="info-content">
            <section>
              <h2>1. Agreement to Terms</h2>
              <p>By accessing our website at DocForge.com, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
            </section>

            <section>
              <h2>2. Use License</h2>
              <p>DocForge provides a suite of tools for personal and commercial document processing. You are granted a non-exclusive, non-transferable license to use the tools as intended through the website interface.</p>
            </section>

            <section>
              <h2>3. Prohibited Uses</h2>
              <p>You may not use our service for any illegal purposes or to upload malware. You are solely responsible for the content of the documents you process using our tools.</p>
            </section>

            <section>
              <h2>4. Disclaimer</h2>
              <p>The materials on DocForge's website are provided on an 'as is' basis. DocForge makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.</p>
            </section>

            <section>
              <h2>5. Limitations</h2>
              <p>In no event shall DocForge or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the tools on DocForge.</p>
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
export class TermsComponent {}
