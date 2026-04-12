import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdsenseBannerComponent } from '../../components/adsense-banner/adsense-banner.component';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface InvitationData {
  auspiciousHeader: string;
  title: string;
  honorees: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  rsvpDate: string;
  rsvpContact: string;
  message: string;
}

@Component({
  selector: 'app-invitation-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdsenseBannerComponent],
  template: `
    <div class="tools-page">
      <!-- Toolbar -->
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <a routerLink="/" class="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </a>
          <span class="toolbar-title">Invitation <span class="accent">Builder</span></span>
        </div>
        
        <div class="toolbar-center">
          <div class="style-group">
            <span class="toolbar-label">THEME</span>
            <select class="select-field" [(ngModel)]="currentTemplate">
              <option value="wedding">Wedding Elegance</option>
              <option value="engagement">Romantic Engagement</option>
              <option value="indian-wedding">Indian Wedding (Vivah)</option>
              <option value="haldi">Haldi / Mehndi Ceremony</option>
              <option value="housewarming">Cozy Housewarming</option>
              <option value="griha-pravesh">Griha Pravesh</option>
              <option value="party">Vibrant Party</option>
            </select>
          </div>
        </div>

        <div class="toolbar-right">
          <button class="action-btn secondary" (click)="downloadImage()" [disabled]="isGenerating">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            Export PNG
          </button>
          <button class="action-btn primary" (click)="downloadPdf()" [disabled]="isGenerating">
            <svg *ngIf="!isGenerating" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <div *ngIf="isGenerating" class="spinner-small"></div>
            {{ isGenerating ? 'Generating...' : 'Export PDF' }}
          </button>
        </div>
      </div>

      <!-- Mobile Tab Toggle -->
      <div class="mobile-tab-bar">
        <button class="mobile-tab" [class.active]="mobileView === 'edit'" (click)="mobileView = 'edit'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
        <button class="mobile-tab" [class.active]="mobileView === 'preview'" (click)="mobileView = 'preview'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Preview
        </button>
      </div>

      <div class="workspace">
        
        <!-- Sidebar Controls -->
        <div class="sidebar" [class.mobile-hidden]="mobileView !== 'edit'">
          <div class="sidebar-header">
            <h3>Event Details</h3>
          </div>
          
          <div class="sidebar-content">
            <div class="form-group block" *ngIf="currentTemplate === 'indian-wedding' || currentTemplate === 'griha-pravesh'">
              <label>Auspicious Header</label>
              <input type="text" [(ngModel)]="data.auspiciousHeader" class="field" placeholder="e.g. ॥ Shree Ganeshay Namah ॥">
            </div>

            <div class="form-group block">
              <label>Event Title</label>
              <input type="text" [(ngModel)]="data.title" class="field" placeholder="e.g. You are Invited!">
            </div>

            <div class="form-group block">
              <label>Honorees / Hosts</label>
              <textarea [(ngModel)]="data.honorees" class="field textarea-small" placeholder="Names of the bride/groom, birthday person, etc."></textarea>
            </div>

            <div class="form-group">
              <label>Date</label>
              <input type="text" [(ngModel)]="data.date" class="field" placeholder="e.g. Saturday, October 14th">
            </div>

            <div class="form-group">
              <label>Time</label>
              <input type="text" [(ngModel)]="data.time" class="field" placeholder="e.g. 5:00 PM">
            </div>

            <div class="form-group block">
              <label>Venue Name</label>
              <input type="text" [(ngModel)]="data.venueName" class="field" placeholder="e.g. The Grand Hotel">
            </div>

            <div class="form-group block">
              <label>Location / Address</label>
              <textarea [(ngModel)]="data.venueAddress" class="field textarea-small" placeholder="Line 1&#10;Line 2&#10;City, Postal Code"></textarea>
            </div>

            <div class="form-group block">
              <label>Additional Message / Dress Code</label>
              <textarea [(ngModel)]="data.message" class="field textarea-small" placeholder="Any extra information for guests..."></textarea>
            </div>

            <div class="form-group">
              <label>RSVP By</label>
              <input type="text" [(ngModel)]="data.rsvpDate" class="field" placeholder="e.g. September 1st">
            </div>
            
            <div class="form-group">
              <label>RSVP Contact</label>
              <input type="text" [(ngModel)]="data.rsvpContact" class="field" placeholder="Phone or Email">
            </div>
          </div>
        </div>

        <!-- Canvas Area -->
        <div class="canvas-panel" [class.mobile-hidden]="mobileView !== 'preview'">
          <div class="canvas-wrapper">
             
             <!-- THE INVITATION CARD (5x7 aspect ratio simulation -> 500x700 mapping) -->
             <div class="invitation-card" #cardRef
                  [style.transform]="'scale(' + zoom + ')'"
                  [className]="'invitation-card ' + currentTemplate"
                  id="invitation-document">
                
                <!-- TEMPLATE 1: WEDDING -->
                <div *ngIf="currentTemplate === 'wedding'" class="tmpl-wedding">
                   <div class="floral-deco top"></div>
                   <h2 class="title">{{ data.title || 'Please join us for the wedding of' }}</h2>
                   <h1 class="honorees">{{ data.honorees || 'Eleanor & James' }}</h1>
                   
                   <div class="event-time">
                      <p>{{ data.date || 'Saturday, October 14th, 2026' }}</p>
                      <p>at {{ data.time || 'Four o\\'clock in the afternoon' }}</p>
                   </div>
                   
                   <div class="event-venue">
                      <h3>{{ data.venueName || 'The Botanical Gardens' }}</h3>
                      <p>{{ data.venueAddress || '123 Magnolia Lane, Spring City' }}</p>
                   </div>
                   
                   <p class="message" *ngIf="data.message">{{ data.message }}</p>

                   <div class="rsvp-block" *ngIf="data.rsvpDate || data.rsvpContact">
                      <p>RSVP</p>
                      <span *ngIf="data.rsvpDate">Kindly respond by {{ data.rsvpDate }}</span>
                      <span *ngIf="data.rsvpContact"><br>{{ data.rsvpContact }}</span>
                   </div>
                   <div class="floral-deco bottom"></div>
                </div>

                <!-- TEMPLATE 2: ENGAGEMENT -->
                <div *ngIf="currentTemplate === 'engagement'" class="tmpl-engagement">
                   <div class="ring-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="9" cy="9" r="6"/> <circle cx="15" cy="15" r="6"/>
                      </svg>
                   </div>
                   <p class="pre-title">{{ data.title || 'WE\\'RE ENGAGED!' }}</p>
                   <h1 class="honorees">{{ data.honorees || 'SARAH AND MICHAEL' }}</h1>
                   <div class="line-divider"></div>
                   <p class="sub-invite">Join us to celebrate our engagement</p>
                   
                   <div class="details-box">
                      <p class="date">{{ data.date || 'October 24th' }} <span class="dot">•</span> {{ data.time || '7:00 PM' }}</p>
                      <p class="venue">{{ data.venueName || 'Downtown Loft Events' }}</p>
                      <p class="address">{{ data.venueAddress || '420 Main St, Suite 5' }}</p>
                   </div>
                   
                   <p class="custom-msg" *ngIf="data.message">{{ data.message }}</p>
                   
                   <div class="rsvp" *ngIf="data.rsvpDate || data.rsvpContact">
                      <p>RSVP format</p>
                      <span>by {{ data.rsvpDate || 'Oct 1st' }} • {{ data.rsvpContact || '555-0192' }}</span>
                   </div>
                </div>

                <!-- TEMPLATE 3: HOUSEWARMING -->
                <div *ngIf="currentTemplate === 'housewarming'" class="tmpl-house">
                   <div class="header-banner">
                      <svg class="house-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      <h2 class="title">{{ data.title || 'Housewarming Party!' }}</h2>
                   </div>
                   
                   <div class="content-body">
                      <p class="intro">Please join</p>
                      <h1 class="honorees">{{ data.honorees || 'The Williams Family' }}</h1>
                      <p class="intro">in celebrating their new home</p>

                      <div class="card-details">
                         <div class="icon-row">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            <span>{{ data.date || 'Saturday, Nov 12' }} at {{ data.time || '2:00 PM' }}</span>
                         </div>
                         <div class="icon-row">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            <span>{{ data.venueAddress || '123 New Beginnings Way' }}</span>
                         </div>
                      </div>

                      <p class="warm-msg" *ngIf="data.message">{{ data.message }}</p>
                   </div>
                   
                   <div class="rsvp-footer" *ngIf="data.rsvpDate || data.rsvpContact">
                      <p>Please RSVP to {{ data.rsvpContact || 'Emily' }} by {{ data.rsvpDate || 'Nov 1st' }}</p>
                   </div>
                </div>

                <!-- TEMPLATE 4: PARTY -->
                <div *ngIf="currentTemplate === 'party'" class="tmpl-party">
                   <div class="confetti top-left"></div>
                   <div class="confetti top-right"></div>
                   
                   <div class="party-content">
                     <p class="letsparty">{{ data.title || 'YOU\\'RE INVITED TO A PARTY' }}</p>
                     
                     <div class="honorees-box">
                        <small>CELEBRATING</small>
                        <h1 class="honorees">{{ data.honorees || 'ALEX\\'S 30TH BIRTHDAY' }}</h1>
                     </div>

                     <div class="neon-grid">
                        <div class="grid-cell">
                           <h3>WHEN</h3>
                           <p>{{ data.date || 'SATURDAY, JULY 10' }}</p>
                           <p>{{ data.time || '8:00 PM - LATE' }}</p>
                        </div>
                        <div class="grid-cell">
                           <h3>WHERE</h3>
                           <p><strong>{{ data.venueName || 'THE NEON BAR' }}</strong></p>
                           <p>{{ data.venueAddress || '199 DOWNTOWN AVE' }}</p>
                        </div>
                     </div>

                     <p class="vibrant-msg" *ngIf="data.message">{{ data.message }}</p>

                     <div class="neon-rsvp" *ngIf="data.rsvpDate || data.rsvpContact">
                        <span>RSVP TO {{ data.rsvpContact || 'ALEX' }} BY {{ data.rsvpDate || 'JULY 1ST' }}</span>
                     </div>
                   </div>
                </div>

                <!-- TEMPLATE 5: INDIAN WEDDING -->
                <div *ngIf="currentTemplate === 'indian-wedding'" class="tmpl-indian-wedding">
                   <div class="mandala-top"></div>
                   <h2 class="auspicious-text">{{ data.auspiciousHeader || '॥ Shree Ganeshay Namah ॥' }}</h2>
                   <h3 class="invite-line">{{ data.title || 'Please join us for the auspicious occasion of the marriage of' }}</h3>
                   
                   <h1 class="honorees">{{ data.honorees || 'Rohit & Priya' }}</h1>
                   
                   <div class="ceremony-details">
                      <p><strong>{{ data.date || 'Sunday, 15th December 2026' }}</strong></p>
                      <p>Mahurat: {{ data.time || '10:00 AM onwards' }}</p>
                   </div>
                   
                   <div class="event-venue">
                      <h3>{{ data.venueName || 'The Royal Palace Grounds' }}</h3>
                      <p>{{ data.venueAddress || 'MG Road, Heritage City' }}</p>
                   </div>
                   
                   <p class="custom-msg" *ngIf="data.message">{{ data.message }}</p>
                   
                   <div class="rsvp-footer" *ngIf="data.rsvpDate || data.rsvpContact">
                      <p>With Best Compliments From</p>
                      <span>{{ data.rsvpContact || 'Sharma Family' }}</span>
                   </div>
                   <div class="mandala-bottom"></div>
                </div>

                <!-- TEMPLATE 6: HALDI / MEHNDI -->
                <div *ngIf="currentTemplate === 'haldi'" class="tmpl-haldi">
                   <div class="marigold-border"></div>
                   <div class="haldi-content">
                     <h2 class="title">{{ data.title || 'Mehndi & Haldi Ceremony' }}</h2>
                     <p class="invite-text">Let the colors of joy fill the air as we celebrate!</p>
                     
                     <h1 class="honorees">{{ data.honorees || 'Neha\'s Haldi' }}</h1>
                     
                     <div class="festive-box">
                        <p class="date-time">{{ data.date || '14th December 2026' }} | {{ data.time || '11:00 AM' }}</p>
                        <p class="venue-name">{{ data.venueName || 'The Jasmine Courtyard' }}</p>
                        <p class="venue-address">{{ data.venueAddress || 'Sector 5, Green Park' }}</p>
                     </div>
                     
                     <p class="custom-msg" *ngIf="data.message">{{ data.message }}</p>
                     
                     <div class="dress-code" *ngIf="data.rsvpContact">
                        <strong>RSVP / Contact:</strong> {{ data.rsvpContact || '+91 9876543210' }}
                     </div>
                   </div>
                   <div class="marigold-border bottom"></div>
                </div>

                <!-- TEMPLATE 7: GRIHA PRAVESH -->
                <div *ngIf="currentTemplate === 'griha-pravesh'" class="tmpl-griha-pravesh">
                   <div class="toran-header"></div>
                   
                   <h2 class="auspicious-text">{{ data.auspiciousHeader || '॥ Om Shri Ganeshaya Namah ॥' }}</h2>
                   <h1 class="title">{{ data.title || 'Griha Pravesh' }}</h1>
                   
                   <div class="intro-block">
                      <p>We cordially invite you and your family to step into our new world.</p>
                      <h2 class="honorees">{{ data.honorees || 'The Gupta Family' }}</h2>
                   </div>
                   
                   <div class="details-grid">
                      <div class="detail-item">
                         <span class="label">DATE & TIME</span>
                         <p>{{ data.date || 'Thursday, 10th October' }}<br>{{ data.time || 'Pooja: 9:00 AM | Lunch: 1:00 PM' }}</p>
                      </div>
                      <div class="detail-item">
                         <span class="label">NEW RESIDENCE</span>
                         <p><strong>{{ data.venueName || 'Aashirwad Villa' }}</strong><br>{{ data.venueAddress || 'Plot No 21, Sunrise Avenue' }}</p>
                      </div>
                   </div>
                   
                   <p class="custom-msg" *ngIf="data.message">{{ data.message }}</p>
                   
                   <p class="rsvp">Awaiting your gracious presence,<br><strong>{{ data.rsvpContact || 'Gupta Parivar' }}</strong></p>
                </div>

             </div>
          </div>
        </div>
      </div>
      
      <!-- Sticky Bottom Ad -->
      <div class="sticky-ad-footer" id="builder-ad-footer">
        <app-adsense-banner slotId="5555555555" margin="0" format="horizontal" responsive="true"></app-adsense-banner>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: calc(100vh - 80px); overflow: hidden; background: transparent; font-family: 'Inter', sans-serif; color: var(--text-primary); }
    
    .tools-page { display: flex; flex-direction: column; height: 100%; position: relative; }
    
    .sticky-ad-footer {
      width: 100%;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(12px);
      border-top: 1px solid var(--glass-border);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 100;
      padding: 4px 0;
    }

    /* ===== Toolbar ===== */
    .editor-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 24px; height: 60px;
      background: var(--bg-card); backdrop-filter: var(--glass-blur);
      border-bottom: 1px solid var(--glass-border); flex-shrink: 0; box-shadow: var(--shadow-sm); z-index: 10;
    }
    .toolbar-left, .toolbar-center, .toolbar-right { display: flex; align-items: center; gap: 16px; }
    .toolbar-center { flex: 1; justify-content: center; gap: 24px; }
    
    .back-btn {
      width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      color: var(--text-muted); transition: all 0.2s; text-decoration: none; border: 1px solid transparent;
    }
    .back-btn:hover { color: var(--accent-cyan); background: rgba(6, 182, 212, 0.1); border-color: var(--glass-border); }
    .toolbar-title { font-weight: 700; font-size: 1.15rem; color: var(--text-primary); }
    .accent { color: var(--accent-purple); }

    .style-group { display: flex; align-items: center; gap: 8px; }
    .toolbar-label { font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; }
    .select-field {
      padding: 6px 12px; border: 1px solid var(--glass-border); border-radius: 6px; font-family: inherit; font-size: 0.9rem;
      background: var(--bg-input); outline: none; cursor: pointer; transition: all 0.2s; font-weight: 500; color: var(--text-primary);
    }
    .select-field:focus { border-color: var(--accent-purple); box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2); }

    .action-btn {
      display: flex; align-items: center; gap: 8px; padding: 8px 16px; font-size: 0.9rem; font-weight: 600;
      border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s;
    }
    .action-btn.primary { background: var(--gradient-primary); color: white; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3); }
    .action-btn.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--shadow-glow-purple); }
    .action-btn.secondary { background: var(--bg-elevated); color: var(--text-primary); border: 1px solid var(--glass-border); }
    .action-btn.secondary:hover { background: rgba(148, 163, 184, 0.15); border-color: var(--border-hover); }
    .action-btn:disabled { opacity: 0.7; cursor: wait; }
    .spinner-small { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ===== Workspace ===== */
    .workspace { display: flex; flex: 1; overflow: hidden; background: transparent; }

    /* ===== Sidebar Form ===== */
    .sidebar {
      width: 340px; background: var(--bg-card); backdrop-filter: var(--glass-blur); border-right: 1px solid var(--glass-border); display: flex; flex-direction: column; z-index: 5;
    }
    .sidebar-header {
      padding: 16px 24px; border-bottom: 1px solid var(--glass-border); background: rgba(30, 41, 59, 0.3);
    }
    .sidebar-header h3 { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    
    .sidebar-content {
      flex: 1; overflow-y: auto; padding: 20px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-content: start;
    }
    .sidebar-content::-webkit-scrollbar { width: 6px; }
    .sidebar-content::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }

    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.block { grid-column: span 2; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
    
    .field {
      padding: 10px; border: 1px solid var(--glass-border); border-radius: 6px; font-family: inherit; font-size: 0.9rem;
      background: var(--bg-input); outline: none; transition: all 0.2s; color: var(--text-primary); width: 100%; box-sizing: border-box;
    }
    .field:focus { border-color: var(--accent-purple); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }
    .textarea-small { min-height: 50px; resize: vertical; }

    /* ===== Canvas Area ===== */
    .canvas-panel {
      flex: 1; position: relative; background: transparent; overflow: auto; display: flex; flex-direction: column;
    }
    
    .zoom-controls {
      position: sticky; top: 16px; left: 50%; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 12px;
      background: var(--bg-card); backdrop-filter: var(--glass-blur); padding: 6px 12px; border-radius: 20px; box-shadow: var(--shadow-md); z-index: 20; border: 1px solid var(--glass-border);
    }
    .zoom-controls span { font-size: 0.85rem; font-weight: 700; width: 40px; text-align: center; color: var(--text-primary); }
    .zoom-btn { width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--glass-border); background: var(--bg-input); color: var(--text-primary); cursor: pointer; font-weight: bold; }
    .zoom-btn:hover { background: rgba(148, 163, 184, 0.15); }

    .canvas-wrapper { padding: 32px; min-height: 100%; display: flex; justify-content: center; align-items: flex-start; }

    /* ===== Mobile Tab Bar ===== */
    .mobile-tab-bar {
      display: none; flex-shrink: 0;
      background: var(--bg-card); border-bottom: 1px solid var(--glass-border);
      padding: 8px 16px; gap: 8px;
    }
    .mobile-tab {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 10px; border: 1px solid var(--glass-border); border-radius: 8px;
      background: transparent; color: var(--text-secondary); font-size: 0.9rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .mobile-tab.active {
      background: rgba(139, 92, 246, 0.12); border-color: var(--accent-purple); color: var(--accent-purple);
    }
    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .mobile-hidden { display: none !important; }
      :host { height: auto; overflow: visible; }
      .tools-page { height: auto; }
      .editor-toolbar {
        padding: 12px 16px;
        height: auto;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      .toolbar-left { flex: 1; min-width: 0; }
      .toolbar-right { flex: none; display: flex; align-items: center; gap: 8px; }
      
      .toolbar-center {
        flex: 0 0 100%;
        order: 3;
        justify-content: center;
        padding-top: 10px;
        margin-top: 8px;
        border-top: 1px dashed var(--glass-border);
      }
      .toolbar-label { display: none; }
      .toolbar-title { font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .mobile-tab-bar { display: flex; }
      .workspace { flex-direction: column; overflow: visible; height: auto; }
      .sidebar {
        width: 100%; height: auto; max-height: 70vh;
        border-right: none; border-bottom: 1px solid var(--glass-border); overflow-y: auto;
      }
      .sidebar-content { grid-template-columns: 1fr; }
      .form-group.block { grid-column: span 1; }
      .canvas-panel { height: auto; min-height: 60vh; overflow: visible; }
      .canvas-wrapper { padding: 16px; justify-content: flex-start; }
      .invitation-card {
        width: 100% !important;
        min-width: unset;
        transform: none !important;
      }
    }
    @media (max-width: 480px) {
      .editor-toolbar { padding: 6px 10px; }
      .action-btn { padding: 8px 12px; font-size: 0.82rem; }
      .sidebar-header { padding: 12px 16px; }
      .sidebar-content { padding: 12px 16px; }
    }

    /* INVITATION CONTAINER (ratio 5:7) -> Base 500x700 mapping */
    .invitation-card {
       width: 500px;
       min-height: 700px;
       display: flex;
       flex-direction: column;
       background: white;
       box-shadow: 0 20px 40px rgba(0,0,0,0.2);
       transform-origin: top center;
       box-sizing: border-box;
       transition: transform 0.2s ease;
       position: relative;
    }
    .invitation-card * {
       min-width: 0;
       max-width: 100%;
    }
    .invitation-card p, .invitation-card h1, .invitation-card h2, .invitation-card h3, .invitation-card span {
       white-space: pre-line;
       word-wrap: break-word;
       overflow-wrap: break-word;
       word-break: break-word;
    }
    .invitation-card > div {
       flex: 1;
       width: 100%;
       height: auto !important;
    }


    /* =========================================
       TEMPLATE 1: WEDDING ELEGANCE
       ========================================= */
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Great+Vibes&display=swap');

    .wedding {
      background: #fffdfa;
      border: 10px solid #f6f1ea;
    }
    .tmpl-wedding {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100%; padding: 40px; text-align: center; color: #4a4a4a;
      font-family: 'Playfair Display', serif;
    }
    .tmpl-wedding .floral-deco {
      width: 80px; height: 40px; background: rgba(189, 161, 105, 0.4); border-radius: 50% 50% 0 0; margin-bottom: 20px;
    }
    .tmpl-wedding .floral-deco.bottom { margin-top: 20px; margin-bottom: 0; border-radius: 0 0 50% 50%; }
    .tmpl-wedding .title { font-size: 1.1rem; font-style: italic; color: #6b6b6b; font-weight: 400; margin-bottom: 30px; letter-spacing: 1px; }
    .tmpl-wedding .honorees { font-family: 'Great Vibes', cursive; font-size: 3.5rem; color: #bda169; line-height: 1.1; margin-bottom: 30px; padding: 0 20px; }
    .tmpl-wedding .event-time { font-size: 1rem; margin-bottom: 30px; line-height: 1.8; color: #5a5a5a; letter-spacing: 1px; }
    .tmpl-wedding .event-time p { margin: 0; }
    .tmpl-wedding .event-venue { margin-bottom: 30px; }
    .tmpl-wedding .event-venue h3 { font-size: 1.2rem; font-weight: 600; margin: 0 0 8px 0; color: #333; }
    .tmpl-wedding .event-venue p { font-size: 0.95rem; margin: 0; color: #6b6b6b; font-style: italic; }
    .tmpl-wedding .message { font-size: 0.9rem; margin-bottom: 30px; color: #555; max-width: 80%; line-height: 1.5; }
    .tmpl-wedding .rsvp-block { font-size: 0.85rem; border-top: 1px solid #e0e0e0; padding-top: 20px; color: #888; text-transform: uppercase; letter-spacing: 2px; }
    .tmpl-wedding .rsvp-block p { margin: 0 0 5px 0; font-weight: 600; color: #666; }


    /* =========================================
       TEMPLATE 2: ROMANTIC ENGAGEMENT
       ========================================= */
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&display=swap');

    .engagement {
      background: linear-gradient(135deg, #1f1b24 0%, #291d24 100%);
      color: #fff;
      font-family: 'Montserrat', sans-serif;
    }
    .tmpl-engagement {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100%; padding: 50px; text-align: center;
    }
    .tmpl-engagement .ring-icon { color: #f472b6; margin-bottom: 20px; width: 60px; height: 60px; }
    .tmpl-engagement .pre-title { font-size: 0.9rem; letter-spacing: 4px; color: #fbcfe8; margin-bottom: 15px; font-weight: 300; }
    .tmpl-engagement .honorees { font-size: 2.2rem; font-weight: 600; margin-bottom: 20px; color: #fff; letter-spacing: 2px; line-height: 1.3;}
    .tmpl-engagement .line-divider { width: 50px; height: 2px; background: #f472b6; margin: 15px auto 25px; }
    .tmpl-engagement .sub-invite { font-size: 1rem; color: #e2e8f0; font-style: italic; margin-bottom: 40px; }
    .tmpl-engagement .details-box { background: rgba(255,255,255,0.05); padding: 30px; border-radius: 12px; border: 1px solid rgba(244, 114, 182, 0.2); width: 100%; margin-bottom: 30px; }
    .tmpl-engagement .details-box p { margin: 0; line-height: 1.6; }
    .tmpl-engagement .details-box .date { font-weight: 600; font-size: 1.1rem; color: #f472b6; margin-bottom: 15px; letter-spacing: 1px; }
    .tmpl-engagement .details-box .venue { font-size: 1.1rem; color: #fff; }
    .tmpl-engagement .details-box .address { font-size: 0.9rem; color: #cbd5e1; margin-top: 5px; }
    .tmpl-engagement .custom-msg { font-size: 0.9rem; color: #cbd5e1; margin-bottom: 30px; line-height: 1.5; }
    .tmpl-engagement .rsvp { font-size: 0.8rem; color: #94a3b8; letter-spacing: 1px; }
    .tmpl-engagement .rsvp p { margin: 0 0 4px 0; color: #fbcfe8; }

    /* =========================================
       TEMPLATE 3: COZY HOUSEWARMING
       ========================================= */
    .housewarming {
      background: #faf7f2;
      font-family: 'Georgia', serif;
      color: #4a4036;
      border: 8px solid #c8b398;
      border-radius: 16px;
    }
    .tmpl-house {
      display: flex; flex-direction: column; align-items: stretch;
      height: 100%; padding: 40px; text-align: center;
    }
    .tmpl-house .header-banner { background: #c8b398; color: white; padding: 20px; border-radius: 8px; margin-bottom: 40px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .tmpl-house .house-icon { width: 40px; height: 40px; }
    .tmpl-house .header-banner .title { margin: 0; font-size: 1.8rem; font-weight: normal; font-style: italic; letter-spacing: 1px;}
    
    .tmpl-house .content-body { flex: 1; display:flex; flex-direction:column; justify-content:center; }
    .tmpl-house .intro { font-size: 1.1rem; color: #8a7b6a; margin: 0; font-style: italic; }
    .tmpl-house .honorees { font-size: 2.8rem; color: #4a4036; margin: 15px 0; font-family: 'Playfair Display', serif;}
    
    .tmpl-house .card-details { margin: 40px 0; display: flex; flex-direction: column; gap: 15px; align-items: center; }
    .tmpl-house .icon-row { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; color: #5a4f44; }
    .tmpl-house .icon-row svg { width: 22px; height: 22px; color: #c8b398; }
    
    .tmpl-house .warm-msg { font-size: 1rem; line-height: 1.6; color: #6b5c4d; background: #fff; padding: 20px; border-radius: 8px; border: 1px dashed #d9ccbe; }
    .tmpl-house .rsvp-footer { margin-top: auto; padding-top: 20px; border-top: 2px solid #edecd/8; font-size: 0.95rem; color: #8a7b6a; font-style: italic; }


    /* =========================================
       TEMPLATE 4: VIBRANT PARTY
       ========================================= */
    .party {
      background: #0f172a;
      color: white;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }
    .tmpl-party {
      position: relative; height: 100%; padding: 40px; display: flex; flex-direction: column; justify-content: center;
      background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
    }
    .tmpl-party .confetti { position: absolute; width: 150px; height: 150px; background: radial-gradient(circle, #f43f5e 10%, transparent 10%), radial-gradient(circle, #3b82f6 10%, transparent 10%), radial-gradient(circle, #10b981 10%, transparent 10%); background-size: 30px 30px; background-position: 0 0, 15px 15px, 0 15px; opacity: 0.4; }
    .tmpl-party .top-left { top: -20px; left: -20px; }
    .tmpl-party .top-right { top: -20px; right: -20px; transform: rotate(45deg); }
    
    .tmpl-party .party-content { position: relative; z-index: 2; text-align: center; }
    .tmpl-party .letsparty { font-size: 1.2rem; font-weight: 800; color: #3b82f6; letter-spacing: 3px; margin-bottom: 20px; }
    
    .tmpl-party .honorees-box { background: #f8fafc; color: #0f172a; padding: 30px 20px; transform: rotate(-2deg); margin-bottom: 40px; box-shadow: 10px 10px 0px #3b82f6; }
    .tmpl-party .honorees-box small { font-weight: 800; color: #64748b; letter-spacing: 2px; }
    .tmpl-party .honorees-box .honorees { font-size: 2.5rem; font-weight: 900; margin: 10px 0 0 0; text-transform: uppercase; line-height: 1.1; }
    
    .tmpl-party .neon-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; text-align: left; }
    .tmpl-party .grid-cell { background: rgba(59, 130, 246, 0.1); padding: 20px; border-left: 4px solid #3b82f6; }
    .tmpl-party .grid-cell h3 { margin: 0 0 10px 0; font-size: 0.9rem; color: #94a3b8; letter-spacing: 2px; }
    .tmpl-party .grid-cell p { margin: 0 0 5px 0; font-weight: 600; font-size: 1.1rem; text-transform: uppercase; color: #e2e8f0; }
    
    .tmpl-party .vibrant-msg { font-size: 1.2rem; font-weight: 500; font-style: italic; color: #f1f5f9; margin-bottom: 40px; }
    .tmpl-party .neon-rsvp { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; font-weight: 800; color: #3b82f6; letter-spacing: 2px; }

    /* =========================================
       TEMPLATE 5: INDIAN WEDDING (VIVAH)
       ========================================= */
    .indian-wedding {
      background: #4a0404;
      color: #fce8bc;
      font-family: 'Georgia', serif;
      border: 12px double #fce8bc;
    }
    .tmpl-indian-wedding {
      display: flex; flex-direction: column; align-items: center; justify-content: space-between;
      height: 100%; padding: 30px; text-align: center;
    }
    .tmpl-indian-wedding .mandala-top, .tmpl-indian-wedding .mandala-bottom {
      width: 100px; height: 50px;
      background: radial-gradient(circle at bottom center, transparent 30%, #fce8bc 30%, #fce8bc 35%, transparent 35%, transparent 45%, #fce8bc 45%, #fce8bc 50%, transparent 50%);
    }
    .tmpl-indian-wedding .mandala-bottom { transform: rotate(180deg); }
    .tmpl-indian-wedding .auspicious-text { font-size: 1.1rem; color: #ffb84d; margin-bottom: 20px; font-weight: bold; }
    .tmpl-indian-wedding .invite-line { font-size: 1rem; font-style: italic; font-weight: normal; margin-bottom: 15px; color: #fce8bc; }
    .tmpl-indian-wedding .honorees { font-size: 3.2rem; font-family: 'Great Vibes', 'Playfair Display', cursive; color: #ffb84d; margin: 0 0 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); line-height: 1.1; }
    .tmpl-indian-wedding .ceremony-details { font-size: 1.1rem; margin-bottom: 25px; }
    .tmpl-indian-wedding .ceremony-details p { margin: 5px 0; }
    .tmpl-indian-wedding .event-venue { background: rgba(252, 232, 188, 0.1); padding: 15px; border-radius: 8px; width: 80%; border: 1px solid rgba(252, 232, 188, 0.3); margin-bottom: 20px;}
    .tmpl-indian-wedding .event-venue h3 { margin: 0 0 5px 0; font-size: 1.2rem; color: #ffb84d; }
    .tmpl-indian-wedding .event-venue p { margin: 0; font-size: 0.95rem; }
    .tmpl-indian-wedding .custom-msg { font-style: italic; font-size: 0.95rem; color: #eccf9d; }
    .tmpl-indian-wedding .rsvp-footer { font-size: 0.9rem; margin-top: auto; padding-top: 10px; }
    .tmpl-indian-wedding .rsvp-footer span { display: block; font-size: 1.1rem; font-weight: bold; color: #ffb84d; margin-top: 5px; }

    /* =========================================
       TEMPLATE 6: HALDI / MEHNDI
       ========================================= */
    .haldi {
      background: radial-gradient(ellipse at top, #fff3b0 0%, #ffcf54 100%);
      color: #8c3b00;
      font-family: 'Montserrat', sans-serif;
    }
    .tmpl-haldi { display: flex; flex-direction: column; height: 100%; position: relative; }
    .tmpl-haldi .marigold-border { height: 40px; background: repeating-linear-gradient(45deg, #f9a03f, #f9a03f 10px, #f7d059 10px, #f7d059 20px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .tmpl-haldi .marigold-border.bottom { position: absolute; bottom: 0; width: 100%; box-shadow: 0 -4px 6px rgba(0,0,0,0.1); }
    .tmpl-haldi .haldi-content { padding: 40px; text-align: center; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: url('data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="1" fill="%23d67f00" opacity="0.3"/></svg>') repeat; }
    .tmpl-haldi .title { font-size: 2.2rem; font-weight: 800; color: #d64900; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px; }
    .tmpl-haldi .invite-text { font-size: 1rem; font-style: italic; margin-bottom: 30px; }
    .tmpl-haldi .honorees { font-size: 3.5rem; font-family: 'Great Vibes', cursive; color: #a12b00; margin: 0 0 30px 0; line-height: 1; }
    .tmpl-haldi .festive-box { background: rgba(255, 255, 255, 0.4); padding: 25px; border-radius: 15px; border: 2px dashed #d64900; width: 90%; margin-bottom: 25px; }
    .tmpl-haldi .date-time { font-weight: bold; font-size: 1.1rem; color: #c43a00; margin: 0 0 10px 0; }
    .tmpl-haldi .venue-name { font-size: 1.1rem; font-weight: bold; margin: 0 0 5px 0; }
    .tmpl-haldi .venue-address { font-size: 0.95rem; margin: 0; }
    .tmpl-haldi .custom-msg { font-size: 1rem; font-weight: 500; margin-bottom: 20px; }
    .tmpl-haldi .dress-code { background: #d64900; color: #fff; padding: 10px 20px; border-radius: 20px; font-size: 0.9rem; }

    /* =========================================
       TEMPLATE 7: GRIHA PRAVESH
       ========================================= */
    .griha-pravesh {
      background: #fbf8f1;
      color: #2c4c3b;
      font-family: 'Playfair Display', serif;
      border: 8px solid #d4af37;
    }
    .tmpl-griha-pravesh { padding: 40px; text-align: center; display: flex; flex-direction: column; justify-content: center; height: 100%; position: relative; }
    .tmpl-griha-pravesh .toran-header { position: absolute; top: 0; left: 0; width: 100%; height: 50px; background: repeating-linear-gradient(90deg, #4caf50, #4caf50 20px, #ff9800 20px, #ff9800 40px); opacity: 0.8; clip-path: polygon(0 0, 100% 0, 100% 50%, 95% 100%, 90% 50%, 85% 100%, 80% 50%, 75% 100%, 70% 50%, 65% 100%, 60% 50%, 55% 100%, 50% 50%, 45% 100%, 40% 50%, 35% 100%, 30% 50%, 25% 100%, 20% 50%, 15% 100%, 10% 50%, 5% 100%, 0 50%); }
    .tmpl-griha-pravesh .auspicious-text { font-size: 1.2rem; color: #d4af37; margin: 40px 0 20px; font-weight: bold; }
    .tmpl-griha-pravesh .title { font-size: 3rem; color: #1e3629; margin: 0 0 30px; letter-spacing: 2px; }
    .tmpl-griha-pravesh .intro-block { font-style: italic; font-size: 1.1rem; margin-bottom: 30px; }
    .tmpl-griha-pravesh .honorees { font-size: 2.2rem; font-weight: bold; color: #d4af37; margin: 15px 0 0; font-style: normal; }
    .tmpl-griha-pravesh .details-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 30px; }
    .tmpl-griha-pravesh .detail-item { background: rgba(212, 175, 55, 0.1); padding: 20px; border-top: 3px solid #d4af37; text-align: left; }
    .tmpl-griha-pravesh .label { font-size: 0.85rem; font-family: 'Inter', sans-serif; font-weight: bold; color: #6b8e23; letter-spacing: 1px; display: block; margin-bottom: 8px; }
    .tmpl-griha-pravesh .detail-item p { margin: 0; line-height: 1.6; font-size: 1.05rem; }
    .tmpl-griha-pravesh .custom-msg { font-size: 1rem; font-style: italic; margin-bottom: 30px; color: #555; }
    .tmpl-griha-pravesh .rsvp { margin-top: auto; font-size: 1.1rem; }

  `]
})
export class InvitationBuilderComponent {
  Math = Math;
  @ViewChild('cardRef') cardRef!: ElementRef;

  currentTemplate = 'wedding';
  zoom = 0.8;
  isGenerating = false;
  mobileView = 'edit';

  data: InvitationData = {
    auspiciousHeader: '',
    title: '',
    honorees: '',
    date: '',
    time: '',
    venueName: '',
    venueAddress: '',
    rsvpDate: '',
    rsvpContact: '',
    message: ''
  };

  setZoom(val: number) {
    this.zoom = Math.max(0.4, Math.min(val, 1.5));
  }

  async downloadImage() {
    if (this.isGenerating || !this.cardRef) return;
    this.isGenerating = true;

    const previousMobileView = this.mobileView;
    this.mobileView = 'preview';

    try {
      const previousZoom = this.zoom;
      this.zoom = 1; // reset zoom for accurate pixel capture
      await new Promise(r => setTimeout(r, 300));

      const canvas = await html2canvas(this.cardRef.nativeElement, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgData;
      a.download = `Invitation_${this.currentTemplate}.png`;
      a.click();

      this.zoom = previousZoom;
    } catch (err) {
      console.error(err);
      alert('PNG generation failed');
    } finally {
      this.isGenerating = false;
      this.mobileView = previousMobileView;
    }
  }

  async downloadPdf() {
    if (this.isGenerating || !this.cardRef) return;
    this.isGenerating = true;

    const previousMobileView = this.mobileView;
    this.mobileView = 'preview';

    try {
      const previousZoom = this.zoom;
      this.zoom = 1;
      await new Promise(r => setTimeout(r, 300)); 

      const canvas = await html2canvas(this.cardRef.nativeElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dynamic physical bounds reflecting organic DOM scaling
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const mmWidth = 130;
      const mmHeight = (canvasHeight / canvasWidth) * mmWidth;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [mmWidth, Math.max(180, mmHeight)] });
      
      pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight);
      pdf.save(`Invitation_${this.currentTemplate}.pdf`);

      this.zoom = previousZoom;
    } catch (err) {
      console.error(err);
      alert('PDF generation failed');
    } finally {
      this.isGenerating = false;
      this.mobileView = previousMobileView;
    }
  }
}
