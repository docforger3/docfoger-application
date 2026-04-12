import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdsenseBannerComponent } from '../../../components/adsense-banner/adsense-banner.component';
import emailjs from '@emailjs/browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="info-page animate-fade-in">
      <div class="container">
        <div class="contact-grid">
          <!-- Contact Info -->
          <div class="contact-info">
            <h1 class="info-title">Get in <span class="gradient-text">Touch</span></h1>
            <p class="contact-subtitle">Have a question or feedback? We'd love to hear from you. Our team typically responds within 24 hours.</p>
            
            <div class="info-items">
              <div class="info-item">
                <div class="icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <div>
                  <h3>Email Support</h3>
                  <p>support&#64;docforge.com</p>
                </div>
              </div>

              <div class="info-item">
                <div class="icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <div>
                  <h3>System Status</h3>
                  <p>All systems operational</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="contact-card">
            <form (ngSubmit)="onSubmit()" #contactForm="ngForm">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" name="name" [(ngModel)]="formData.name" placeholder="John Doe" required>
              </div>

              <div class="form-group">
                <label>Email Address</label>
                <input type="email" name="email" [(ngModel)]="formData.email" placeholder="john&#64;example.com" required>
              </div>

              <div class="form-group">
                <label>Message</label>
                <textarea name="message" [(ngModel)]="formData.message" rows="5" placeholder="How can we help?" required></textarea>
              </div>

              <div *ngIf="statusMessage" [class.error-msg]="isError" [class.success-msg]="!isError" class="status-msg animate-fade-in">
                {{ statusMessage }}
              </div>

              <button type="submit" class="btn-primary" [disabled]="!contactForm.form.valid || isSending">
                <span *ngIf="!isSending">Send Message</span>
                <span *ngIf="isSending">Sending...</span>
                <svg *ngIf="!isSending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .info-page {
      padding: 60px 0 100px;
      min-height: calc(100vh - 80px);
      background: var(--bg-primary);
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
    }
    .info-title {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 20px;
      letter-spacing: -1.5px;
    }
    .contact-subtitle {
      font-size: 1.15rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 40px;
    }
    .info-items {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .icon-box {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      background: rgba(6, 182, 212, 0.08);
      border: 1px solid rgba(6, 182, 212, 0.15);
      color: var(--accent-cyan);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-box svg { width: 24px; height: 24px; }
    .info-item h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    .info-item p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .contact-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-xl);
      padding: 40px;
      box-shadow: var(--shadow-2xl);
    }
    .form-group {
      margin-bottom: 24px;
    }
    .form-group label {
      display: block;
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: white;
      font-family: inherit;
      transition: all 0.3s ease;
    }
    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: var(--accent-cyan);
      box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
    }
    .btn-primary {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px;
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
      border: none;
      border-radius: 10px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(6, 182, 212, 0.2);
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .status-msg {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 0.9rem;
      text-align: center;
    }
    .success-msg {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
    .error-msg {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    .gradient-text {
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    @media (max-width: 900px) {
      .contact-grid { grid-template-columns: 1fr; gap: 40px; }
      .info-title { font-size: 2.5rem; }
    }
  `]
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    message: ''
  };

  // Status message handling
  statusMessage = '';
  isError = false;
  isSending = false;

  onSubmit() {
    this.isSending = true;
    this.statusMessage = 'Sending your message...';
    
    // IMPORTANT: THESE ARE PLACEHOLDERS. 
    // The user needs to replace these with their actual EmailJS keys.
    const serviceID = 'service_g1jslek';
    const templateID = 'template_riyujta';
    const publicKey = 'j3wERBlscJ3fLpZ2s';

    const templateParams = {
      from_name: this.formData.name,
      from_email: this.formData.email,
      user_name: this.formData.name,    // Alias for common templates
      user_email: this.formData.email,  // Alias for common templates
      name: this.formData.name,        // Alias for simple templates
      email: this.formData.email,       // Alias for simple templates
      reply_to: this.formData.email,    // Standard EmailJS reply-to field
      message: this.formData.message,
      to_email: 'docforger3&#64;gmail.com'
    };

    emailjs.send(serviceID, templateID, templateParams, publicKey)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        this.statusMessage = 'Thank you! Your message has been sent successfully.';
        this.isError = false;
        this.isSending = false;
        this.formData = { name: '', email: '', message: '' };
      }, (err) => {
        console.log('FAILED...', err);
        this.statusMessage = 'Oops! Failed to send message. Please try again later or email us directly.';
        this.isError = true;
        this.isSending = false;
      });
  }
}
