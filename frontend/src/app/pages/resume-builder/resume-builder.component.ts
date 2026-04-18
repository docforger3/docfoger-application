import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdsenseBannerComponent } from '../../components/adsense-banner/adsense-banner.component';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Experience {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  location: string;
  graduationDate: string;
}

interface Skill {
  name: string;
}

interface ResumeData {
  personal: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
}

@Component({
  selector: 'app-resume-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdsenseBannerComponent],
  template: `
    <div class="tools-page">
      <!-- Top Toolbar -->
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <a routerLink="/" class="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </a>
          <span class="toolbar-title">Resume <span class="accent">Builder</span></span>
        </div>
        
        <div class="toolbar-center">
          <!-- Template Selector -->
          <div class="style-group">
            <span class="toolbar-label">Template:</span>
            <select [(ngModel)]="currentTemplate" class="select-field">
              <optgroup label="Creative & Visual">
                <option value="modern">Modern</option>
                <option value="minimalist">Minimalist</option>
                <option value="professional">Professional</option>
                <option value="creative">Creative</option>
                <option value="executive">Executive</option>
              </optgroup>
              <optgroup label="ATS-Friendly (Single Column)">
                <option value="ats-standard">ATS Standard</option>
                <option value="ats-classic">ATS Classic</option>
                <option value="ats-corporate">ATS Corporate</option>
                <option value="ats-academic">ATS Academic</option>
                <option value="ats-clean">ATS Clean</option>
                <option value="ats-compact">ATS Compact</option>
                <option value="ats-bold">ATS Bold</option>
                <option value="ats-elegant">ATS Elegant</option>
                <option value="ats-minimalist">ATS Minimalist</option>
                <option value="ats-modern">ATS Modern</option>
              </optgroup>
            </select>
          </div>
          
          <!-- Font Selector -->
          <div class="style-group">
            <span class="toolbar-label">Font:</span>
            <select [(ngModel)]="currentFont" class="select-field">
              <optgroup label="Sans-Serif">
                <option value="'Inter', sans-serif">Inter</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Outfit', sans-serif">Outfit</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
                <option value="'Lato', sans-serif">Lato</option>
                <option value="'Montserrat', sans-serif">Montserrat</option>
                <option value="'Oswald', sans-serif">Oswald</option>
              </optgroup>
              <optgroup label="Serif">
                <option value="'Lora', serif">Lora</option>
                <option value="'Playfair Display', serif">Playfair Display</option>
                <option value="'Merriweather', serif">Merriweather</option>
                <option value="'Cormorant Garamond', serif">Cormorant Garamond</option>
              </optgroup>
              <optgroup label="Monospace">
                <option value="'Fira Code', monospace">Fira Code</option>
              </optgroup>
            </select>
          </div>

          <!-- Base Font Size -->
          <div class="style-group">
             <span class="toolbar-label">Size:</span>
             <select [(ngModel)]="baseFontSize" class="select-field" style="width: 70px;">
                <option [value]="12">12</option>
                <option [value]="14">14</option>
                <option [value]="15">15</option>
                <option [value]="16">16</option>
                <option [value]="18">18</option>
             </select>
          </div>

          <!-- Line Spacing -->
          <div class="style-group">
             <span class="toolbar-label">Spacing:</span>
             <select [(ngModel)]="lineSpacing" class="select-field" style="width: 80px;">
                <option [value]="1.2">Compact</option>
                <option [value]="1.5">Normal</option>
                <option [value]="1.8">Relaxed</option>
             </select>
          </div>
          
          <!-- Color Selector -->
          <div class="style-group">
            <span class="toolbar-label">Accent:</span>
            <input type="color" [(ngModel)]="currentColor" class="color-picker">
          </div>
        </div>

        <div class="toolbar-right">
          <button class="action-btn primary" (click)="downloadPdf()" [disabled]="isGenerating">
            <svg *ngIf="!isGenerating" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span *ngIf="isGenerating" class="spinner-small"></span>
            {{ isGenerating ? 'Generating...' : 'Download PDF' }}
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

      <!-- Main Workspace -->
      <div class="workspace">
        
        <!-- Left Sidebar: Form Editor -->
        <div class="sidebar panel-scroll" [class.mobile-hidden]="mobileView !== 'edit'">
          
          <!-- Accordion 1: Personal -->
          <div class="accordion-item" [class.active]="activeTab === 'personal'">
            <div class="accordion-header" (click)="toggleAccordion('personal')">
              <span class="acc-title">Personal Details</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
            <div class="accordion-body" *ngIf="activeTab === 'personal'">
               <div class="form-grid">
                  <div class="input-block full-width">
                    <label>Full Name</label>
                    <input type="text" [(ngModel)]="resumeData.personal.fullName" class="field">
                  </div>
                  <div class="input-block full-width">
                    <label>Job Title</label>
                    <input type="text" [(ngModel)]="resumeData.personal.jobTitle" class="field">
                  </div>
                  <div class="input-block">
                    <label>Email</label>
                    <input type="email" [(ngModel)]="resumeData.personal.email" class="field">
                  </div>
                  <div class="input-block">
                    <label>Phone</label>
                    <input type="text" [(ngModel)]="resumeData.personal.phone" class="field">
                  </div>
                  <div class="input-block">
                    <label>Location</label>
                    <input type="text" [(ngModel)]="resumeData.personal.location" class="field">
                  </div>
                  <div class="input-block">
                    <label>LinkedIn (opt)</label>
                    <input type="text" [(ngModel)]="resumeData.personal.linkedin" class="field">
                  </div>
                  <div class="input-block full-width">
                    <label>Website / Portfolio (opt)</label>
                    <input type="text" [(ngModel)]="resumeData.personal.website" class="field">
                  </div>
               </div>
            </div>
          </div>

          <!-- Accordion 2: Summary -->
          <div class="accordion-item" [class.active]="activeTab === 'summary'">
            <div class="accordion-header" (click)="toggleAccordion('summary')">
              <span class="acc-title">Professional Summary</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
            <div class="accordion-body" *ngIf="activeTab === 'summary'">
               <div class="input-block full-width">
                 <textarea [(ngModel)]="resumeData.summary" class="field textarea-large" placeholder="A brief summary of your professional background and goals..."></textarea>
               </div>
            </div>
          </div>

          <!-- Accordion 3: Experience -->
          <div class="accordion-item" [class.active]="activeTab === 'experience'">
            <div class="accordion-header" (click)="toggleAccordion('experience')">
              <span class="acc-title">Work Experience</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
            <div class="accordion-body" *ngIf="activeTab === 'experience'">
               
               <div class="dynamic-list-item" *ngFor="let exp of resumeData.experience; let i = index">
                  <div class="item-header">
                    <h4>Experience #{{ i + 1 }}</h4>
                    <button class="icon-btn-small delete" (click)="removeExperience(i)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                      </svg>
                    </button>
                  </div>
                  <div class="form-grid">
                    <div class="input-block full-width">
                      <label>Job Title</label>
                      <input type="text" [(ngModel)]="exp.title" class="field">
                    </div>
                    <div class="input-block">
                      <label>Company</label>
                      <input type="text" [(ngModel)]="exp.company" class="field">
                    </div>
                    <div class="input-block">
                      <label>Location</label>
                      <input type="text" [(ngModel)]="exp.location" class="field">
                    </div>
                    <div class="input-block">
                      <label>Start Date</label>
                      <input type="text" placeholder="e.g. May 2021" [(ngModel)]="exp.startDate" class="field">
                    </div>
                    <div class="input-block">
                      <label>End Date</label>
                      <input type="text" placeholder="e.g. Present" [(ngModel)]="exp.endDate" class="field">
                    </div>
                    <div class="input-block full-width">
                      <label>Description</label>
                      <textarea [(ngModel)]="exp.description" class="field textarea-medium"></textarea>
                    </div>
                  </div>
               </div>
               
               <button class="add-btn" (click)="addExperience()">+ Add Experience</button>
            </div>
          </div>

          <!-- Accordion 4: Education -->
          <div class="accordion-item" [class.active]="activeTab === 'education'">
            <div class="accordion-header" (click)="toggleAccordion('education')">
              <span class="acc-title">Education</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
            <div class="accordion-body" *ngIf="activeTab === 'education'">
               <div class="dynamic-list-item" *ngFor="let edu of resumeData.education; let i = index">
                  <div class="item-header">
                    <h4>Education #{{ i + 1 }}</h4>
                    <button class="icon-btn-small delete" (click)="removeEducation(i)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                      </svg>
                    </button>
                  </div>
                  <div class="form-grid">
                    <div class="input-block full-width">
                      <label>Degree / Major</label>
                      <input type="text" [(ngModel)]="edu.degree" class="field">
                    </div>
                    <div class="input-block full-width">
                      <label>Institution</label>
                      <input type="text" [(ngModel)]="edu.institution" class="field">
                    </div>
                    <div class="input-block">
                      <label>Location</label>
                      <input type="text" [(ngModel)]="edu.location" class="field">
                    </div>
                    <div class="input-block">
                      <label>Grad. Date</label>
                      <input type="text" placeholder="e.g. 2024" [(ngModel)]="edu.graduationDate" class="field">
                    </div>
                  </div>
               </div>
               <button class="add-btn" (click)="addEducation()">+ Add Education</button>
            </div>
          </div>

          <!-- Accordion 5: Skills -->
          <div class="accordion-item" [class.active]="activeTab === 'skills'">
            <div class="accordion-header" (click)="toggleAccordion('skills')">
              <span class="acc-title">Skills</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
            <div class="accordion-body" *ngIf="activeTab === 'skills'">
               <div class="skills-grid">
                 <div class="skill-tag" *ngFor="let skill of resumeData.skills; let i = index">
                   <input type="text" [(ngModel)]="skill.name" class="skill-input">
                   <button class="remove-skill" (click)="removeSkill(i)">×</button>
                 </div>
               </div>
               <button class="add-btn mt-10" (click)="addSkill()">+ Add Skill</button>
            </div>
          </div>

        </div>

        <!-- Right Main View: Live Canvas Preview -->
        <div class="canvas-panel" [class.mobile-hidden]="mobileView !== 'preview'">
          <div class="canvas-wrapper">
             <div class="a4-page" #a4Page 
                  [style.transform]="'scale(' + zoom + ')'"
                  [style.font-family]="currentFont"
                  [style.font-size.px]="baseFontSize"
                  [style.line-height]="lineSpacing"
                  [className]="'a4-page ' + currentTemplate">
                 
                 <!-- Template 1: Modern -->
                 <div *ngIf="currentTemplate === 'modern'" class="tmpl-modern">
                    <div class="sidebar" [style.background-color]="currentColor">
                       <h1 class="tmpl-name">{{ resumeData.personal.fullName }}</h1>
                       <h3 class="tmpl-job">{{ resumeData.personal.jobTitle }}</h3>
                       
                       <div class="tmpl-contact-box mt-30">
                          <div class="contact-item" *ngIf="resumeData.personal.email">
                             <span class="c-val">{{ resumeData.personal.email }}</span>
                          </div>
                          <div class="contact-item" *ngIf="resumeData.personal.phone">
                             <span class="c-val">{{ resumeData.personal.phone }}</span>
                          </div>
                          <div class="contact-item" *ngIf="resumeData.personal.location">
                             <span class="c-val">{{ resumeData.personal.location }}</span>
                          </div>
                          <div class="contact-item" *ngIf="resumeData.personal.website">
                             <span class="c-val">{{ resumeData.personal.website }}</span>
                          </div>
                          <div class="contact-item" *ngIf="resumeData.personal.linkedin">
                             <span class="c-val">{{ resumeData.personal.linkedin }}</span>
                          </div>
                       </div>

                       <div class="tmpl-section-side mt-30">
                         <h4 class="tmpl-section-title-side">SKILLS</h4>
                         <ul class="skills-list">
                            <li *ngFor="let s of resumeData.skills">{{ s.name }}</li>
                         </ul>
                       </div>
                    </div>
                    <div class="main-content">
                       <div class="tmpl-section mt-10" *ngIf="resumeData.summary">
                          <h4 class="tmpl-section-title" [style.color]="currentColor">PROFILE</h4>
                          <p class="tmpl-text">{{ resumeData.summary }}</p>
                       </div>

                       <div class="tmpl-section mt-20" *ngIf="resumeData.experience.length > 0">
                          <h4 class="tmpl-section-title" [style.color]="currentColor">EXPERIENCE</h4>
                          <div class="exp-item" *ngFor="let exp of resumeData.experience">
                             <div class="exp-header">
                               <span class="exp-title">{{ exp.title }}</span>
                               <span class="exp-date">{{ exp.startDate }} - {{ exp.endDate }}</span>
                             </div>
                             <div class="exp-company">{{ exp.company }} <span *ngIf="exp.location">| {{ exp.location }}</span></div>
                             <p class="tmpl-text mt-5">{{ exp.description }}</p>
                          </div>
                       </div>

                       <div class="tmpl-section mt-20" *ngIf="resumeData.education.length > 0">
                          <h4 class="tmpl-section-title" [style.color]="currentColor">EDUCATION</h4>
                          <div class="edu-item" *ngFor="let edu of resumeData.education">
                             <div class="exp-header">
                               <span class="exp-title">{{ edu.degree }}</span>
                               <span class="exp-date">{{ edu.graduationDate }}</span>
                             </div>
                             <div class="exp-company">{{ edu.institution }} <span *ngIf="edu.location">| {{ edu.location }}</span></div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <!-- Template 2: Minimalist -->
                 <div *ngIf="currentTemplate === 'minimalist'" class="tmpl-minimalist">
                    <div class="header-center">
                       <h1 class="tmpl-name-min">{{ resumeData.personal.fullName }}</h1>
                       <h3 class="tmpl-job-min" [style.color]="currentColor">{{ resumeData.personal.jobTitle }}</h3>
                       <div class="contact-row">
                         <span *ngIf="resumeData.personal.email">{{ resumeData.personal.email }}</span>
                         <span *ngIf="resumeData.personal.phone">{{ resumeData.personal.phone }}</span>
                         <span *ngIf="resumeData.personal.location">{{ resumeData.personal.location }}</span>
                         <span *ngIf="resumeData.personal.website">{{ resumeData.personal.website }}</span>
                         <span *ngIf="resumeData.personal.linkedin">{{ resumeData.personal.linkedin }}</span>
                       </div>
                    </div>

                    <div class="tmpl-section mt-20" *ngIf="resumeData.summary">
                       <p class="tmpl-text center">{{ resumeData.summary }}</p>
                    </div>

                    <div class="tmpl-section mt-20" *ngIf="resumeData.experience.length > 0">
                       <h4 class="tmpl-section-title-min" [style.border-bottom-color]="currentColor">EXPERIENCE</h4>
                       <div class="exp-item-min" *ngFor="let exp of resumeData.experience">
                          <div class="exp-header-min">
                            <span class="exp-title-min">{{ exp.title }}</span>
                            <span class="exp-company-min">{{ exp.company }}, {{ exp.location }}</span>
                          </div>
                          <span class="exp-date-min">{{ exp.startDate }} - {{ exp.endDate }}</span>
                          <p class="tmpl-text mt-5">{{ exp.description }}</p>
                       </div>
                    </div>

                    <div class="tmpl-section mt-20" *ngIf="resumeData.education.length > 0">
                       <h4 class="tmpl-section-title-min" [style.border-bottom-color]="currentColor">EDUCATION</h4>
                       <div class="edu-item-min" *ngFor="let edu of resumeData.education">
                          <div class="exp-header-min">
                            <span class="exp-title-min">{{ edu.degree }}</span>
                            <span class="exp-company-min">{{ edu.institution }}, {{ edu.location }}</span>
                          </div>
                          <span class="exp-date-min">{{ edu.graduationDate }}</span>
                       </div>
                    </div>

                    <div class="tmpl-section mt-20" *ngIf="resumeData.skills.length > 0">
                       <h4 class="tmpl-section-title-min" [style.border-bottom-color]="currentColor">SKILLS</h4>
                       <p class="tmpl-text">
                         <span *ngFor="let s of resumeData.skills; let last = last">{{ s.name }}{{ last ? '' : ', ' }}</span>
                       </p>
                    </div>
                 </div>

                 <!-- Template 3: Professional -->
                 <div *ngIf="currentTemplate === 'professional'" class="tmpl-professional">
                    <div class="header-prof" [style.border-top-color]="currentColor">
                       <div class="prof-left">
                          <h1 class="tmpl-name-prof" [style.color]="currentColor">{{ resumeData.personal.fullName }}</h1>
                          <h3 class="tmpl-job-prof">{{ resumeData.personal.jobTitle }}</h3>
                       </div>
                       <div class="prof-right">
                          <div *ngIf="resumeData.personal.email">{{ resumeData.personal.email }}</div>
                          <div *ngIf="resumeData.personal.phone">{{ resumeData.personal.phone }}</div>
                          <div *ngIf="resumeData.personal.location">{{ resumeData.personal.location }}</div>
                          <div *ngIf="resumeData.personal.linkedin">{{ resumeData.personal.linkedin }}</div>
                       </div>
                    </div>

                    <div class="tmpl-section mt-20" *ngIf="resumeData.summary">
                       <h4 class="tmpl-section-title-prof" [style.color]="currentColor">SUMMARY</h4>
                       <p class="tmpl-text">{{ resumeData.summary }}</p>
                    </div>

                    <div class="tmpl-section mt-20" *ngIf="resumeData.experience.length > 0">
                       <h4 class="tmpl-section-title-prof" [style.color]="currentColor">PROFESSIONAL EXPERIENCE</h4>
                       <div class="exp-item-prof" *ngFor="let exp of resumeData.experience">
                          <div class="exp-header-prof">
                            <span class="exp-company-prof">{{ exp.company }}</span>
                            <span class="exp-location-prof">{{ exp.location }}</span>
                          </div>
                          <div class="exp-subheader-prof">
                            <span class="exp-title-prof">{{ exp.title }}</span>
                            <span class="exp-date-prof">{{ exp.startDate }} - {{ exp.endDate }}</span>
                          </div>
                          <p class="tmpl-text mt-5">{{ exp.description }}</p>
                       </div>
                    </div>

                    <div class="tmpl-section mt-20" *ngIf="resumeData.education.length > 0">
                       <h4 class="tmpl-section-title-prof" [style.color]="currentColor">EDUCATION</h4>
                       <div class="edu-item-prof" *ngFor="let edu of resumeData.education">
                          <div class="exp-header-prof">
                            <span class="exp-company-prof">{{ edu.institution }}</span>
                            <span class="exp-location-prof">{{ edu.location }}</span>
                          </div>
                          <div class="exp-subheader-prof">
                            <span class="exp-title-prof">{{ edu.degree }}</span>
                            <span class="exp-date-prof">{{ edu.graduationDate }}</span>
                          </div>
                       </div>
                    </div>

                    <div class="tmpl-section mt-20" *ngIf="resumeData.skills.length > 0">
                       <h4 class="tmpl-section-title-prof" [style.color]="currentColor">SKILLS</h4>
                       <div class="skills-flex">
                          <div class="skill-badge-prof" *ngFor="let s of resumeData.skills" [style.background]="currentColor">{{ s.name }}</div>
                       </div>
                    </div>
                 </div>

                 <!-- Template 4: Creative -->
                 <div *ngIf="currentTemplate === 'creative'" class="tmpl-creative">
                    <div class="c-header" [style.background]="currentColor">
                       <h1 class="tmpl-name-c">{{ resumeData.personal.fullName }}</h1>
                       <h3 class="tmpl-job-c">{{ resumeData.personal.jobTitle }}</h3>
                    </div>
                    
                    <div class="c-body">
                       <div class="c-left">
                          <div class="tmpl-section-c mt-10">
                            <h4 class="tmpl-section-title-c" [style.color]="currentColor">CONTACT</h4>
                            <div class="contact-item" *ngIf="resumeData.personal.phone">{{ resumeData.personal.phone }}</div>
                            <div class="contact-item" *ngIf="resumeData.personal.email">{{ resumeData.personal.email }}</div>
                            <div class="contact-item" *ngIf="resumeData.personal.location">{{ resumeData.personal.location }}</div>
                            <div class="contact-item" *ngIf="resumeData.personal.linkedin">{{ resumeData.personal.linkedin }}</div>
                          </div>

                          <div class="tmpl-section-c mt-20" *ngIf="resumeData.skills.length > 0">
                            <h4 class="tmpl-section-title-c" [style.color]="currentColor">EXPERTISE</h4>
                            <ul class="skills-list-c">
                               <li *ngFor="let s of resumeData.skills">
                                 <span class="bullet" [style.background]="currentColor"></span>
                                 {{ s.name }}
                               </li>
                            </ul>
                          </div>

                          <div class="tmpl-section-c mt-20" *ngIf="resumeData.education.length > 0">
                            <h4 class="tmpl-section-title-c" [style.color]="currentColor">EDUCATION</h4>
                            <div class="edu-item-c" *ngFor="let edu of resumeData.education">
                               <div class="exp-date-c">{{ edu.graduationDate }}</div>
                               <div class="exp-title-c">{{ edu.degree }}</div>
                               <div class="exp-company-c">{{ edu.institution }}</div>
                            </div>
                          </div>
                       </div>
                       
                       <div class="c-right">
                          <div class="tmpl-section mt-10" *ngIf="resumeData.summary">
                             <h4 class="tmpl-section-title-c" [style.color]="currentColor">PROFILE</h4>
                             <p class="tmpl-text">{{ resumeData.summary }}</p>
                          </div>
                          
                          <div class="tmpl-section mt-20" *ngIf="resumeData.experience.length > 0">
                             <h4 class="tmpl-section-title-c" [style.color]="currentColor">WORK EXPERIENCE</h4>
                             <div class="exp-item-c" *ngFor="let exp of resumeData.experience">
                                <div class="c-exp-head">
                                  <span class="exp-title-c">{{ exp.title }}</span>
                                  <span class="exp-date-c" [style.color]="currentColor">{{ exp.startDate }} - {{ exp.endDate }}</span>
                                </div>
                                <div class="exp-company-c">{{ exp.company }}</div>
                                <p class="tmpl-text mt-5">{{ exp.description }}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <!-- Template 5: Executive -->
                 <div *ngIf="currentTemplate === 'executive'" class="tmpl-executive">
                    <div class="header-e">
                       <h1 class="tmpl-name-e">{{ resumeData.personal.fullName }}</h1>
                       <div class="contact-row-e" [style.color]="currentColor">
                          <span *ngIf="resumeData.personal.email">{{ resumeData.personal.email }}</span>
                          <span *ngIf="resumeData.personal.phone">{{ resumeData.personal.phone }}</span>
                          <span *ngIf="resumeData.personal.location">{{ resumeData.personal.location }}</span>
                          <span *ngIf="resumeData.personal.linkedin">{{ resumeData.personal.linkedin }}</span>
                       </div>
                    </div>

                    <div class="tmpl-section-e mt-20" *ngIf="resumeData.summary">
                       <h4 class="tmpl-section-title-e" [style.background]="currentColor">EXECUTIVE SUMMARY</h4>
                       <p class="tmpl-text">{{ resumeData.summary }}</p>
                    </div>

                    <div class="tmpl-section-e mt-20" *ngIf="resumeData.experience.length > 0">
                       <h4 class="tmpl-section-title-e" [style.background]="currentColor">PROFESSIONAL EXPERIENCE</h4>
                       <div class="exp-item-e" *ngFor="let exp of resumeData.experience">
                          <div class="e-exp-top">
                             <span class="exp-company-e">{{ exp.company }}</span>
                             <span class="exp-date-e">{{ exp.startDate }} - {{ exp.endDate }}</span>
                          </div>
                          <div class="e-exp-mid">
                             <span class="exp-title-e">{{ exp.title }}</span>
                             <span class="exp-location-e">{{ exp.location }}</span>
                          </div>
                          <p class="tmpl-text mt-5">{{ exp.description }}</p>
                       </div>
                    </div>

                    <div class="tmpl-section-e mt-20" *ngIf="resumeData.education.length > 0">
                       <h4 class="tmpl-section-title-e" [style.background]="currentColor">EDUCATION & CREDENTIALS</h4>
                       <div class="edu-item-e" *ngFor="let edu of resumeData.education">
                          <div class="e-exp-top">
                             <span class="exp-company-e">{{ edu.institution }}</span>
                             <span class="exp-date-e">{{ edu.graduationDate }}</span>
                          </div>
                          <div class="e-exp-mid">
                             <span class="exp-title-e">{{ edu.degree }}</span>
                             <span class="exp-location-e">{{ edu.location }}</span>
                          </div>
                       </div>
                    </div>

                    <div class="tmpl-section-e mt-20" *ngIf="resumeData.skills.length > 0">
                       <h4 class="tmpl-section-title-e" [style.background]="currentColor">CORE COMPETENCIES</h4>
                       <ul class="skills-list-e">
                          <li *ngFor="let s of resumeData.skills">{{ s.name }}</li>
                       </ul>
                    </div>
                 </div>

                 <!-- UNIVERSAL ATS TEMPLATES (10 Skins) -->
                 <div *ngIf="currentTemplate.startsWith('ats-')" class="tmpl-universal-ats">
                    <div class="ats-header">
                       <h1 class="ats-name" [style.color]="currentColor">{{ resumeData.personal.fullName }}</h1>
                       <h3 class="ats-job">{{ resumeData.personal.jobTitle }}</h3>
                       <div class="ats-contact">
                          <span *ngIf="resumeData.personal.email">{{ resumeData.personal.email }}</span>
                          <span *ngIf="resumeData.personal.phone">{{ resumeData.personal.phone }}</span>
                          <span *ngIf="resumeData.personal.location">{{ resumeData.personal.location }}</span>
                          <span *ngIf="resumeData.personal.linkedin">{{ resumeData.personal.linkedin }}</span>
                          <span *ngIf="resumeData.personal.website">{{ resumeData.personal.website }}</span>
                       </div>
                    </div>

                    <div class="ats-section" *ngIf="resumeData.summary">
                       <h2 class="ats-section-title" [style.color]="currentColor">Professional Summary</h2>
                       <p class="ats-text">{{ resumeData.summary }}</p>
                    </div>

                    <div class="ats-section" *ngIf="resumeData.experience.length > 0">
                       <h2 class="ats-section-title" [style.color]="currentColor">Experience</h2>
                       <div class="ats-item" *ngFor="let exp of resumeData.experience">
                          <div class="ats-item-header">
                             <div class="ats-item-title">
                                <span class="ats-role">{{ exp.title }}</span>
                                <span class="ats-company">{{ exp.company }}</span>
                                <span class="ats-location" *ngIf="exp.location">, {{ exp.location }}</span>
                             </div>
                             <div class="ats-item-date">{{ exp.startDate }} - {{ exp.endDate }}</div>
                          </div>
                          <div class="ats-text ats-desc">{{ exp.description }}</div>
                       </div>
                    </div>

                    <div class="ats-section" *ngIf="resumeData.education.length > 0">
                       <h2 class="ats-section-title" [style.color]="currentColor">Education</h2>
                       <div class="ats-item" *ngFor="let edu of resumeData.education">
                          <div class="ats-item-header">
                             <div class="ats-item-title">
                                <span class="ats-degree">{{ edu.degree }}</span>
                                <span class="ats-institution">{{ edu.institution }}</span>
                                <span class="ats-location" *ngIf="edu.location">, {{ edu.location }}</span>
                             </div>
                             <div class="ats-item-date">{{ edu.graduationDate }}</div>
                          </div>
                       </div>
                    </div>

                    <div class="ats-section" *ngIf="resumeData.skills.length > 0">
                       <h2 class="ats-section-title" [style.color]="currentColor">Skills</h2>
                       <ul class="ats-skills-list">
                          <li *ngFor="let s of resumeData.skills">{{ s.name }}</li>
                       </ul>
                    </div>
                 </div>

             </div>
          </div>
        </div>
      </div>
      
      <!-- Sticky Bottom Ad -->
      <div class="sticky-ad-footer" id="builder-ad-footer">
        <app-adsense-banner slotId="8888888888" margin="0" format="horizontal" responsive="true"></app-adsense-banner>
      </div>
    </div>
  `,
  styles: [`    :host { display: block; height: calc(100vh - 80px); overflow: hidden; background: transparent; font-family: 'Inter', sans-serif; color: var(--text-primary); }
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
    .toolbar-center { flex: 1; justify-content: center; gap: 32px; }
    
    .back-btn {
      width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      color: var(--text-muted); transition: all 0.2s; text-decoration: none; border: 1px solid transparent;
    }
    .back-btn:hover { color: var(--accent-cyan); background: rgba(6, 182, 212, 0.1); border-color: var(--glass-border); }
    .toolbar-title { font-weight: 700; font-size: 1.15rem; color: var(--text-primary); }
    .accent { color: var(--accent-purple); }

    .style-group { display: flex; align-items: center; gap: 8px; }
    .toolbar-label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }
    .select-field {
      padding: 6px 12px; border: 1px solid var(--glass-border); border-radius: 6px; font-family: inherit; font-size: 0.9rem;
      background: var(--bg-input); outline: none; cursor: pointer; transition: all 0.2s; color: var(--text-primary);
    }
    .select-field:hover { border-color: var(--text-secondary); }
    .select-field:focus { border-color: var(--accent-purple); box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2); }
    
    .color-picker {
      width: 32px; height: 32px; padding: 0; border: 1px solid var(--glass-border); border-radius: 6px; cursor: pointer;
      background: none; overflow: hidden;
    }
    .color-picker::-webkit-color-swatch-wrapper { padding: 0; }
    .color-picker::-webkit-color-swatch { border: none; border-radius: 5px; }

    .action-btn {
      display: flex; align-items: center; gap: 8px; padding: 8px 16px; font-size: 0.9rem; font-weight: 600;
      border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s;
    }
    .action-btn.primary { background: var(--gradient-primary); color: white; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3); }
    .action-btn.primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--shadow-glow-purple); }
    .action-btn.primary:disabled { opacity: 0.7; cursor: wait; }
    
    .spinner-small { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }

    /* ===== Workspace ===== */
    .workspace { display: flex; flex: 1; overflow: hidden; }

    /* ===== Sidebar Form ===== */
    .sidebar.panel-scroll {
      width: 380px; background: var(--bg-card); backdrop-filter: var(--glass-blur); border-right: 1px solid var(--glass-border); overflow-y: auto; overflow-x: hidden;
      flex-shrink: 0; display: flex; flex-direction: column;
    }
    
    .accordion-item { border-bottom: 1px solid var(--glass-border); }
    .accordion-header {
      padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;
      transition: background 0.2s; user-select: none;
    }
    .accordion-header:hover { background: rgba(148, 163, 184, 0.05); }
    .accordion-item.active .accordion-header { background: rgba(148, 163, 184, 0.1); border-bottom: 1px dashed var(--glass-border); }
    .accordion-item.active .accordion-header svg { transform: rotate(180deg); }
    .acc-title { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); }
    
    .accordion-body { padding: 24px; background: transparent; animation: slideDown 0.3s ease; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .input-block { display: flex; flex-direction: column; gap: 6px; }
    .input-block.full-width { grid-column: span 2; }
    .input-block label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
    
    .field {
      padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: 6px; font-family: inherit; font-size: 0.9rem;
      background: var(--bg-input); outline: none; transition: all 0.2s; color: var(--text-primary); width: 100%; box-sizing: border-box;
    }
    .field:focus { border-color: var(--accent-purple); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1); }
    .textarea-large { min-height: 120px; resize: vertical; }
    .textarea-medium { min-height: 80px; resize: vertical; }

    .dynamic-list-item { background: var(--bg-input); border: 1px solid var(--glass-border); border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .item-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .item-header h4 { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin: 0; }
    .icon-btn-small.delete { width: 28px; height: 28px; border-radius: 6px; border: none; background: rgba(239,68,68,0.1); color: var(--accent-red); cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .icon-btn-small.delete:hover { background: rgba(239,68,68,0.2); }

    .add-btn {
      width: 100%; padding: 10px; background: transparent; border: 1px dashed var(--text-muted); border-radius: 6px;
      color: var(--text-secondary); font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
    }
    .add-btn:hover { border-color: var(--accent-purple); color: var(--accent-purple); background: rgba(139, 92, 246, 0.05); }

    .skills-grid { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill-tag { display: flex; align-items: center; background: var(--bg-input); border: 1px solid var(--glass-border); border-radius: 6px; overflow: hidden; }
    .skill-input { border: none; background: transparent; padding: 6px 10px; width: 100px; font-size: 0.85rem; outline: none; color: var(--text-primary); }
    .remove-skill { width: 26px; border: none; background: rgba(239,68,68,0.15); color: var(--accent-red); cursor: pointer; font-weight: bold; }
    .remove-skill:hover { background: rgba(239,68,68,0.3); }
    .mt-10 { margin-top: 10px; }
    .mt-20 { margin-top: 20px; }
    .mt-30 { margin-top: 30px; }
    .mt-5 { margin-top: 5px; }

    /* ===== Mobile Tab Bar ===== */
    .mobile-tab-bar {
      display: none;
      flex-shrink: 0;
      background: var(--bg-card);
      border-bottom: 1px solid var(--glass-border);
      padding: 8px 16px;
      gap: 8px;
    }
    .mobile-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px;
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mobile-tab.active {
      background: rgba(139, 92, 246, 0.15);
      border-color: var(--accent-purple);
      color: var(--accent-purple);
    }

    /* ===== Canvas Area ===== */
    .canvas-panel {
      flex: 1; position: relative; background: transparent; overflow: auto; display: flex; flex-direction: column;
    }
    
    .zoom-controls {
      position: sticky; top: 16px; left: 50%; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 12px;
      background: var(--bg-card); backdrop-filter: var(--glass-blur); padding: 6px 12px; border-radius: 20px; box-shadow: var(--shadow-md); z-index: 20; border: 1px solid var(--glass-border);
    }
    .zoom-controls span { font-size: 0.85rem; font-weight: 600; width: 40px; text-align: center; color: var(--text-primary); }
    .zoom-btn { width: 26px; height: 26px; border-radius: 50%; border: 1px solid var(--glass-border); background: var(--bg-input); color: var(--text-primary); cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; }
    .zoom-btn:hover { background: rgba(148, 163, 184, 0.15); }

    .canvas-wrapper {
       padding: 24px; min-height: 100%; display: flex; justify-content: center; align-items: flex-start;
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
        justify-content: flex-start;
        padding: 12px 0;
        margin-top: 8px;
        border-top: 1px dashed var(--glass-border);
        flex-wrap: wrap;
        gap: 12px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .style-group { flex-shrink: 0; }
      .select-field { font-size: 0.82rem; padding: 6px 8px; }
      .toolbar-label { display: none; }
      .toolbar-title { font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      .mobile-tab-bar { display: flex; }

      .workspace {
        flex-direction: column;
        overflow: visible;
        height: auto;
      }

      .sidebar.panel-scroll {
        width: 100%;
        height: auto;
        max-height: 70vh;
        border-right: none;
        border-bottom: 1px solid var(--glass-border);
        overflow-y: auto;
      }

      .canvas-panel {
        height: auto;
        min-height: 60vh;
        overflow: visible;
      }

      .canvas-wrapper {
        padding: 10px;
        justify-content: center;
      }

      .a4-page {
        width: 100%;
        min-width: unset;
        transform: none !important;
        box-shadow: var(--shadow-md);
      }
    }

    @media (max-width: 480px) {
      .editor-toolbar { padding: 6px 10px; }
      .action-btn { padding: 6px 10px; font-size: 0.75rem; gap: 4px; }
      .action-btn svg { width: 14px; height: 14px; }
      .toolbar-title { font-size: 0.9rem; }
      .accordion-header { padding: 14px 16px; }
      .accordion-body { padding: 16px; }
      .form-grid { grid-template-columns: 1fr; }
      .input-block.full-width { grid-column: span 1; }
      .toolbar-center { gap: 8px; }
      .select-field { font-size: 0.75rem; max-width: 90px; }
      .color-picker { width: 28px; height: 28px; }
    }

    /* A4 PAGE SPECIFICATIONS (210mm x 297mm) */
    .a4-page {
       width: 210mm; /* strictly proportional */
       min-height: 297mm;
       background: white;
       box-shadow: 0 10px 30px rgba(0,0,0,0.15);
       transform-origin: top center;
       overflow: hidden; box-sizing: border-box;
       transition: transform 0.2s ease;
    }

    /* TEMPLATE 1: MODERN */
    .tmpl-modern { display: flex; height: 100%; width: 100%; }
    .tmpl-modern .sidebar { width: 33%; padding: 40px 25px; color: white; }
    .tmpl-modern .main-content { width: 67%; padding: 40px 35px; background: white; color: #333;}
    .tmpl-name { font-size: 2.2rem; font-weight: 800; line-height: 1.1; margin: 0; text-transform: uppercase; }
    .tmpl-job { font-size: 1.1rem; font-weight: 500; margin: 8px 0 0; opacity: 0.9; }
    .contact-item { display: flex; align-items: center; padding: 6px 0; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.2); }
    .contact-item:last-child { border-bottom: none; }
    .tmpl-section-title-side { font-size: 1rem; font-weight: 700; letter-spacing: 1px; border-bottom: 2px solid white; padding-bottom: 4px; margin-bottom: 15px; }
    .skills-list { list-style: none; padding: 0; margin: 0; font-size: 0.9rem; line-height: 1.8; }
    
    .tmpl-modern .tmpl-section-title { font-size: 1.4rem; font-weight: 800; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin: 0 0 15px 0; text-transform: uppercase;}
    .tmpl-text { font-size: 0.9rem; line-height: 1.6; margin: 0; color: #4b5563; }
    .exp-item { margin-bottom: 18px; }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
    .exp-title { font-size: 1.1rem; font-weight: 700; color: #111827; }
    .exp-date { font-size: 0.85rem; font-weight: 600; color: #6b7280; }
    .exp-company { font-size: 0.95rem; font-weight: 600; color: #374151; font-style: italic; }

    /* TEMPLATE 2: MINIMALIST */
    .tmpl-minimalist { padding: 50px 60px; height: 100%; width: 100%; color: #222; }
    .header-center { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px;}
    .tmpl-name-min { font-size: 2.8rem; font-weight: 400; margin: 0; letter-spacing: 2px; }
    .tmpl-job-min { font-size: 1.2rem; font-weight: 400; margin: 5px 0 15px; letter-spacing: 1px; text-transform: uppercase; }
    .contact-row { display: flex; justify-content: center; flex-wrap: wrap; gap: 15px; font-size: 0.85rem; color: #555; }
    .center { text-align: center; }
    .tmpl-section-title-min { font-size: 1.1rem; font-weight: 600; letter-spacing: 1px; border-bottom: 1px solid #000; padding-bottom: 4px; margin: 0 0 15px 0; text-transform: uppercase; }
    .exp-item-min { margin-bottom: 15px; }
    .exp-header-min { display: flex; justify-content: space-between; align-items: baseline; }
    .exp-title-min { font-size: 1.05rem; font-weight: 600; }
    .exp-company-min { font-size: 0.9rem; font-style: italic; }
    .exp-date-min { font-size: 0.85rem; color: #666; display: block; margin-top: 2px; }

    /* TEMPLATE 3: PROFESSIONAL */
    .tmpl-professional { padding: 45px 50px; height: 100%; width: 100%; color: #333; }
    .header-prof { border-top: 8px solid #000; padding-top: 30px; display: flex; justify-content: space-between; margin-bottom: 30px;}
    .prof-left { flex: 1; }
    .prof-right { text-align: right; font-size: 0.85rem; line-height: 1.6; color: #555; }
    .tmpl-name-prof { font-size: 2.4rem; font-weight: 700; margin: 0; }
    .tmpl-job-prof { font-size: 1.1rem; color: #666; margin: 5px 0 0; }
    .tmpl-section-title-prof { font-size: 1.1rem; font-weight: 700; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin: 0 0 15px 0; text-transform: uppercase; }
    .exp-item-prof { margin-bottom: 15px; }
    .exp-header-prof { display: flex; justify-content: space-between; font-weight: 700; font-size: 1rem; }
    .exp-subheader-prof { display: flex; justify-content: space-between; font-size: 0.9rem; color: #555; font-style: italic; margin-bottom: 4px; }
    .skills-flex { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-badge-prof { color: white; padding: 4px 12px; border-radius: 4px; font-size: 0.85em; font-weight: 600; }

    /* TEMPLATE 4: CREATIVE */
    .tmpl-creative { height: 100%; width: 100%; display: flex; flex-direction: column; color: #333; }
    .c-header { padding: 50px 60px; color: white; border-bottom-left-radius: 60px; }
    .tmpl-name-c { font-size: 3em; font-weight: 800; margin: 0; line-height: 1; }
    .tmpl-job-c { font-size: 1.2em; font-weight: 600; margin: 10px 0 0; opacity: 0.9; text-transform: uppercase; letter-spacing: 2px; }
    .c-body { display: flex; flex: 1; padding: 40px 60px; gap: 40px; }
    .c-left { width: 30%; border-right: 1px solid #e5e7eb; padding-right: 30px; }
    .c-right { width: 70%; }
    .tmpl-section-title-c { font-size: 1.2em; font-weight: 800; text-transform: uppercase; margin: 0 0 15px 0; letter-spacing: 1px; }
    .skills-list-c { list-style: none; padding: 0; margin: 0; }
    .skills-list-c li { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-weight: 500; font-size: 0.95em; }
    .bullet { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .exp-item-c { margin-bottom: 25px; }
    .c-exp-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .exp-title-c { font-size: 1.15em; font-weight: 800; }
    .exp-date-c { font-size: 0.85em; font-weight: 700; text-transform: uppercase;}
    .exp-company-c { font-size: 1em; font-weight: 600; color: #555; }
    .edu-item-c { margin-bottom: 15px; }

    /* TEMPLATE 5: EXECUTIVE */
    .tmpl-executive { padding: 50px 60px; height: 100%; width: 100%; color: #222; }
    .header-e { text-align: center; margin-bottom: 25px; }
    .tmpl-name-e { font-size: 2.2em; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
    .contact-row-e { display: flex; justify-content: center; flex-wrap: wrap; gap: 15px; font-size: 0.9em; font-weight: 600; margin-top: 10px; }
    .tmpl-section-title-e { font-size: 1.05em; font-weight: 700; color: white; padding: 6px 12px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px; }
    .exp-item-e { margin-bottom: 20px; }
    .e-exp-top { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 4px; }
    .exp-company-e { font-size: 1.1em; font-weight: 800; }
    .exp-date-e { font-size: 0.9em; font-weight: 600; }
    .e-exp-mid { display: flex; justify-content: space-between; font-style: italic; font-size: 0.95em; color: #444; }
    .skills-list-e { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; padding: 0 15px; margin: 0; }
    .skills-list-e li { list-style-type: square; font-size: 0.95em; }

    /* ===== UNIVERSAL ATS DOM CLASSES ===== */
    .tmpl-universal-ats { padding: 40px 50px; height: 100%; width: 100%; color: #000; display:flex; flex-direction:column; gap:16px;}
    .ats-header { margin-bottom: 20px; }
    .ats-name { font-size: 2.5em; font-weight: 700; margin: 0; line-height: 1.1; }
    .ats-job { font-size: 1.2em; margin: 5px 0 10px; font-weight: 600; color: #444; }
    .ats-contact { display: flex; flex-wrap: wrap; gap: 10px; font-size: 0.9em; color: #333; }
    .ats-contact span:not(:last-child)::after { content: " | "; margin-left: 10px; color: #999; }
    .ats-section { margin-bottom: 20px; }
    .ats-section-title { font-size: 1.2em; font-weight: 700; margin: 0 0 10px 0; border-bottom: 1px solid #ccc; padding-bottom: 4px; text-transform: uppercase; }
    .ats-text { font-size: 0.95em; line-height: 1.5; margin: 0; color: #222; }
    .ats-item { margin-bottom: 15px; }
    .ats-item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
    .ats-item-title { font-size: 1.05em; }
    .ats-role, .ats-degree { font-weight: 700; }
    .ats-company, .ats-institution { font-weight: 600; font-style: italic; margin-left: 6px;}
    .ats-location { color: #555; }
    .ats-item-date { font-weight: 600; font-size: 0.9em; white-space: nowrap; }
    .ats-desc { margin-top: 4px; white-space: pre-line; }
    .ats-skills-list { display: flex; flex-wrap: wrap; gap: 8px 24px; padding: 0; margin: 0 0 0 16px; font-size: 0.95em; }

    /* ATS: STANDARD */
    .a4-page.ats-standard .tmpl-universal-ats { font-family: 'Times New Roman', Times, serif; }
    .a4-page.ats-standard .ats-header { text-align: center; border-bottom: 2px solid; padding-bottom: 10px; }
    .a4-page.ats-standard .ats-contact { justify-content: center; }

    /* ATS: CLASSIC */
    .a4-page.ats-classic .ats-name { font-family: 'Georgia', serif; font-size: 2.8em; text-align: center;}
    .a4-page.ats-classic .ats-job { text-align: center; }
    .a4-page.ats-classic .ats-contact { justify-content: center; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 8px 0; margin-top: 10px; }
    .a4-page.ats-classic .ats-contact span:not(:last-child)::after { content: " • "; }

    /* ATS: CORPORATE */
    .a4-page.ats-corporate .ats-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid; padding-bottom: 15px;}
    .a4-page.ats-corporate .ats-contact { flex-direction: column; text-align: right; gap: 4px; }
    .a4-page.ats-corporate .ats-contact span:not(:last-child)::after { content: ""; }
    .a4-page.ats-corporate .ats-section-title { font-weight: 800; }

    /* ATS: ACADEMIC */
    .a4-page.ats-academic .ats-header { text-align: center; margin-bottom: 30px;}
    .a4-page.ats-academic .ats-name { text-transform: uppercase; letter-spacing: 2px; }
    .a4-page.ats-academic .ats-job { display: none; }
    .a4-page.ats-academic .ats-section-title { text-align: center; border: none; font-weight: bold; background: rgba(0,0,0,0.05); padding: 5px; }
    .a4-page.ats-academic .ats-contact { justify-content: center; }

    /* ATS: CLEAN */
    .a4-page.ats-clean .tmpl-universal-ats { padding: 50px 60px; font-family: 'Arial', sans-serif;}
    .a4-page.ats-clean .ats-section-title { border: none; text-transform: uppercase; font-size: 1.1em; letter-spacing: 1px; margin-bottom: 15px;}
    .a4-page.ats-clean .ats-item { background: rgba(0,0,0,0.02); padding: 15px; border-radius: 8px; border-left: 4px solid; }

    /* ATS: COMPACT */
    .a4-page.ats-compact .tmpl-universal-ats { padding: 25px 30px; gap: 8px; }
    .a4-page.ats-compact .ats-section { margin-bottom: 10px; }
    .a4-page.ats-compact .ats-item { margin-bottom: 8px; }
    .a4-page.ats-compact .ats-text { line-height: 1.3; font-size: 0.85em; }

    /* ATS: BOLD */
    .a4-page.ats-bold .ats-name { font-weight: 900; font-size: 3.5em; letter-spacing: -1px; }
    .a4-page.ats-bold .ats-section-title { border-bottom: 4px solid; padding-bottom: 0; display: inline-block; }
    .a4-page.ats-bold .ats-role, .a4-page.ats-bold .ats-degree { font-weight: 900; }

    /* ATS: ELEGANT */
    .a4-page.ats-elegant .tmpl-universal-ats { font-family: 'Garamond', serif; color: #333; }
    .a4-page.ats-elegant .ats-name { font-style: italic; font-weight: normal; font-size: 3em; }
    .a4-page.ats-elegant .ats-section-title { font-style: italic; border-bottom-style: dotted; font-weight: normal;}

    /* ATS: MINIMALIST */
    .a4-page.ats-minimalist .ats-header { margin-bottom: 40px; }
    .a4-page.ats-minimalist .ats-name { font-weight: 300; }
    .a4-page.ats-minimalist .ats-section-title { border: none; margin-bottom: 5px; opacity: 0.5; font-size: 0.9em; letter-spacing: 2px;}

    /* ATS: MODERN */
    .a4-page.ats-modern .ats-item-header { flex-direction: column; align-items: flex-start; }
    .a4-page.ats-modern .ats-item-date { color: #888; font-size: 0.8em; margin-bottom: 4px; }
    .a4-page.ats-modern .ats-company::before { content: "— "; }
  `]
})
export class ResumeBuilderComponent {
  Math = Math;
  @ViewChild('a4Page') a4PageRef!: ElementRef;

  activeTab = 'personal';
  zoom = 0.8;
  isGenerating = false;
  mobileView = 'edit';

  currentTemplate = 'modern';
  currentFont = "'Inter', sans-serif";
  currentColor = '#38bdf8'; // Default cyan-like accent
  baseFontSize = 14;
  lineSpacing = 1.5;

  constructor() {}

  toggleAccordion(tab: string) {
    this.activeTab = this.activeTab === tab ? '' : tab;
  }

  resumeData: ResumeData = {
    personal: {
      fullName: 'John Doe',
      jobTitle: 'Senior Software Engineer',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/johndoe',
      website: 'johndoe.dev'
    },
    summary: 'Dedicated and solutions-oriented software engineer with over 6 years of experience designing, developing, and maintaining high-performance web applications. Adept at leveraging modern frameworks (Angular, React, Spring Boot) to drive architectural improvements and scale architectures globally.',
    experience: [
      {
        company: 'TechCorp Solutions',
        title: 'Senior Frontend Engineer',
        location: 'San Francisco, CA',
        startDate: 'Jan 2021',
        endDate: 'Present',
        description: 'Spearheaded the migration of a legacy dashboard to Angular 17, reducing load times by 40%. Mentored junior developers and instituted comprehensive front-end testing using Cypress.'
      },
      {
        company: 'Innovatech Inc.',
        title: 'Full Stack Developer',
        location: 'Austin, TX',
        startDate: 'Jun 2018',
        endDate: 'Dec 2020',
        description: 'Developed scalable RESTful APIs utilizing Spring Boot and PostgreSQL. Integrated Stripe payment gateways seamlessly into the e-commerce flagship application.'
      }
    ],
    education: [
      {
        institution: 'University of California, Berkeley',
        degree: 'B.S. Computer Science',
        location: 'Berkeley, CA',
        graduationDate: 'May 2018'
      }
    ],
    skills: [
      { name: 'Angular' },
      { name: 'TypeScript' },
      { name: 'Java / Spring Boot' },
      { name: 'React.js' },
      { name: 'Node.js' },
      { name: 'PostgreSQL' },
      { name: 'Docker / Kubernetes' }
    ]
  };

  setZoom(val: number) {
    this.zoom = Math.max(0.4, Math.min(val, 1.5));
  }

  addExperience() {
    this.resumeData.experience.push({ company: '', title: '', location: '', startDate: '', endDate: '', description: '' });
  }

  removeExperience(i: number) {
    this.resumeData.experience.splice(i, 1);
  }

  addEducation() {
    this.resumeData.education.push({ institution: '', degree: '', location: '', graduationDate: '' });
  }

  removeEducation(i: number) {
    this.resumeData.education.splice(i, 1);
  }

  addSkill() {
    this.resumeData.skills.push({ name: 'New Skill' });
  }

  removeSkill(i: number) {
    this.resumeData.skills.splice(i, 1);
  }

  async downloadPdf() {
    if (this.isGenerating || !this.a4PageRef) return;
    this.isGenerating = true;

    // Force canvas to be visible on mobile before capturing
    const previousMobileView = this.mobileView;
    this.mobileView = 'preview';

    try {
      // Temporarily set zoom to 1 to ensure highest export quality without scaling artifacts
      const previousZoom = this.zoom;
      this.zoom = 1;
      
      // Wait a moment for DOM to apply strict scaling and mobile visibility
      await new Promise(r => setTimeout(r, 200));

      const element = this.a4PageRef.nativeElement;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      
      // A4 settings (210 x 297 mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${this.resumeData.personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`);

      // Restore zoom
      this.zoom = previousZoom;

    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      this.isGenerating = false;
      this.mobileView = previousMobileView;
    }
  }
}
