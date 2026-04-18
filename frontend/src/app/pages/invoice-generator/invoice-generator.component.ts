import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdsenseBannerComponent } from '../../components/adsense-banner/adsense-banner.component';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { environment } from '../../../environments/environment';

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceConfig: {
    country: string;
    currencySymbol: string;
    taxName: string;
    taxRate: number;
    showTaxId: boolean;
    taxIdName: string;
    taxIdLabelSender: string;
    taxIdLabelRecipient: string;
  };
  details: {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
  };
  sender: {
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
  };
  recipient: {
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
  };
  items: LineItem[];
  totals: {
    subTotal: number;
    taxAmount: number;
    discount: number;
    total: number;
  };
  notes: string;
  paymentDetails: string;
}

@Component({
  selector: 'app-invoice-generator',
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
          <span class="toolbar-title">Invoice <span class="accent">Generator</span></span>
        </div>
        
        <div class="toolbar-center">
          <div class="style-group">
            <span class="toolbar-label">Billing Region:</span>
            <select [(ngModel)]="selectedCountry" (change)="onCountryChange()" class="select-field">
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="eu">European Union</option>
              <option value="in">India</option>
              <option value="au">Australia</option>
              <option value="ca">Canada</option>
            </select>
          </div>
          
          <div class="style-group">
            <span class="toolbar-label">Template:</span>
            <select [(ngModel)]="currentTemplate" class="select-field">
              <option value="standard">Standard</option>
              <option value="modern">Modern</option>
              <option value="minimalist">Minimalist</option>
              <option value="corporate">Corporate</option>
              <option value="creative">Creative</option>
              <option value="tech">Tech</option>
              <option value="freelancer">Freelancer</option>
              <option value="retail">Retail</option>
              <option value="service">Service</option>
              <option value="executive">Executive</option>
            </select>
          </div>
          
          <div class="style-group">
            <span class="toolbar-label">Accent:</span>
            <input type="color" [(ngModel)]="currentColor" class="color-picker">
          </div>
        </div>

        <div class="toolbar-right">
          <button *ngIf="env.enableWordExport" class="action-btn secondary" (click)="downloadWord()" [disabled]="isGenerating">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M4 4h16v16H4z"/><path d="M9 4v16"/><path d="M9 12h11"/>
            </svg>
            Export DOC
          </button>
          <button class="action-btn primary" (click)="downloadPdf()" [disabled]="isGenerating">
            <svg *ngIf="!isGenerating" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span *ngIf="isGenerating" class="spinner-small"></span>
            {{ isGenerating ? 'Rendering...' : 'Download PDF' }}
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
        
        <!-- Left Sidebar Form -->
        <div class="sidebar panel-scroll" [class.mobile-hidden]="mobileView !== 'edit'">
          
          <!-- General Details -->
          <div class="accordion-item" [class.active]="activeTab === 'general'">
            <div class="accordion-header" (click)="toggleAccordion('general')">
              <span class="acc-title">Invoice Details</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div class="accordion-body" *ngIf="activeTab === 'general'">
               <div class="form-grid">
                  <div class="input-block full-width">
                     <label>Invoice Number</label>
                     <input type="text" [(ngModel)]="invoice.details.invoiceNumber" class="field">
                  </div>
                  <div class="input-block">
                     <label>Issue Date</label>
                     <input type="date" [(ngModel)]="invoice.details.issueDate" class="field">
                  </div>
                  <div class="input-block">
                     <label>Due Date</label>
                     <input type="date" [(ngModel)]="invoice.details.dueDate" class="field">
                  </div>
               </div>
            </div>
          </div>

          <!-- Sender Details -->
          <div class="accordion-item" [class.active]="activeTab === 'sender'">
            <div class="accordion-header" (click)="toggleAccordion('sender')">
              <span class="acc-title">From (Your Details)</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div class="accordion-body" *ngIf="activeTab === 'sender'">
               <div class="form-grid">
                  <div class="input-block full-width">
                     <label>Your Name / Business Name</label>
                     <input type="text" [(ngModel)]="invoice.sender.name" class="field">
                  </div>
                  <div class="input-block">
                     <label>Email</label>
                     <input type="email" [(ngModel)]="invoice.sender.email" class="field">
                  </div>
                  <div class="input-block">
                     <label>Phone</label>
                     <input type="text" [(ngModel)]="invoice.sender.phone" class="field">
                  </div>
                  <div class="input-block full-width">
                     <label>Address</label>
                     <textarea [(ngModel)]="invoice.sender.address" class="field textarea-small"></textarea>
                  </div>
                  <div class="input-block full-width" *ngIf="invoice.invoiceConfig.showTaxId">
                     <label>{{ invoice.invoiceConfig.taxIdName }}</label>
                     <input type="text" [(ngModel)]="invoice.sender.taxId" class="field" [placeholder]="invoice.invoiceConfig.taxIdLabelSender">
                  </div>
               </div>
            </div>
          </div>

          <!-- Recipient Details -->
          <div class="accordion-item" [class.active]="activeTab === 'recipient'">
            <div class="accordion-header" (click)="toggleAccordion('recipient')">
              <span class="acc-title">To (Client Details)</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div class="accordion-body" *ngIf="activeTab === 'recipient'">
               <div class="form-grid">
                  <div class="input-block full-width">
                     <label>Client Name / Company</label>
                     <input type="text" [(ngModel)]="invoice.recipient.name" class="field">
                  </div>
                  <div class="input-block">
                     <label>Email</label>
                     <input type="email" [(ngModel)]="invoice.recipient.email" class="field">
                  </div>
                  <div class="input-block">
                     <label>Phone</label>
                     <input type="text" [(ngModel)]="invoice.recipient.phone" class="field">
                  </div>
                  <div class="input-block full-width">
                     <label>Address</label>
                     <textarea [(ngModel)]="invoice.recipient.address" class="field textarea-small"></textarea>
                  </div>
                  <div class="input-block full-width" *ngIf="invoice.invoiceConfig.showTaxId">
                     <label>Client {{ invoice.invoiceConfig.taxIdName }} (Optional)</label>
                     <input type="text" [(ngModel)]="invoice.recipient.taxId" class="field" [placeholder]="invoice.invoiceConfig.taxIdLabelRecipient">
                  </div>
               </div>
            </div>
          </div>

          <!-- Line Items -->
          <div class="accordion-item" [class.active]="activeTab === 'items'">
            <div class="accordion-header" (click)="toggleAccordion('items')">
              <span class="acc-title">Line Items</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div class="accordion-body" *ngIf="activeTab === 'items'">
               
               <div class="dynamic-list-item line-item-box" *ngFor="let item of invoice.items; let i = index">
                  <div class="item-header">
                     <h4>Item #{{ i + 1 }}</h4>
                     <button class="icon-btn-small delete" (click)="removeItem(i)">×</button>
                  </div>
                  <div class="form-grid">
                     <div class="input-block full-width">
                        <input type="text" [(ngModel)]="item.description" placeholder="Description/Service" class="field">
                     </div>
                     <div class="input-block qty-box">
                        <label>Qty/Hrs</label>
                        <input type="number" [(ngModel)]="item.quantity" class="field" (input)="recalculate()">
                     </div>
                     <div class="input-block rate-box">
                        <label>Rate</label>
                        <div class="input-prefix">
                          <span class="prefix">{{ invoice.invoiceConfig.currencySymbol }}</span>
                          <input type="number" [(ngModel)]="item.rate" class="field" (input)="recalculate()">
                        </div>
                     </div>
                  </div>
               </div>
               
               <button class="add-btn mt-5" (click)="addItem()">+ Add Item</button>
            </div>
          </div>

          <!-- Taxes & Discounts -->
          <div class="accordion-item" [class.active]="activeTab === 'financials'">
            <div class="accordion-header" (click)="toggleAccordion('financials')">
              <span class="acc-title">Taxes & Discounts</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div class="accordion-body" *ngIf="activeTab === 'financials'">
               <div class="form-grid">
                  <div class="input-block">
                     <label>{{ invoice.invoiceConfig.taxName }} Rate (%)</label>
                     <input type="number" [(ngModel)]="invoice.invoiceConfig.taxRate" class="field" (input)="recalculate()">
                  </div>
                  <div class="input-block">
                     <label>Discount Amount ({{ invoice.invoiceConfig.currencySymbol }})</label>
                     <input type="number" [(ngModel)]="invoice.totals.discount" class="field" (input)="recalculate()">
                  </div>
               </div>
               <div class="math-readout mt-20">
                  <div class="mr-row"><span>Subtotal:</span> <span>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.subTotal | number:'1.2-2' }}</span></div>
                  <div class="mr-row"><span>{{ invoice.invoiceConfig.taxName }}:</span> <span>+{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.taxAmount | number:'1.2-2' }}</span></div>
                  <div class="mr-row"><span>Discount:</span> <span>-{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.discount | number:'1.2-2' }}</span></div>
                  <div class="mr-row total"><span>Total:</span> <span>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.total | number:'1.2-2' }}</span></div>
               </div>
            </div>
          </div>

          <!-- Notes & Terms -->
          <div class="accordion-item" [class.active]="activeTab === 'notes'">
            <div class="accordion-header" (click)="toggleAccordion('notes')">
              <span class="acc-title">Notes & Terms</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div class="accordion-body" *ngIf="activeTab === 'notes'">
               <div class="input-block mb-15">
                  <label>Payment Instructions</label>
                  <textarea [(ngModel)]="invoice.paymentDetails" class="field textarea-medium" placeholder="Bank account info, payment link, routing numbers, etc."></textarea>
               </div>
               <div class="input-block">
                  <label>Additional Notes</label>
                  <textarea [(ngModel)]="invoice.notes" class="field textarea-medium" placeholder="Thank you for your business!"></textarea>
               </div>
            </div>
          </div>

        </div>

        <!-- Canvas Preview Floor -->
        <div class="canvas-panel" id="docxTarget" [class.mobile-hidden]="mobileView !== 'preview'">
          <div class="canvas-wrapper">
             <div class="a4-page" #a4Page 
                  [style.transform]="'scale(' + zoom + ')'"
                  [className]="'a4-page ' + currentTemplate"
                  id="invoice-document">
                 
                 <!-- Template 1: STANDARD -->
                 <div *ngIf="currentTemplate === 'standard'" class="tmpl-standard">
                    <div class="s-header">
                       <h1 class="invoice-title">INVOICE</h1>
                       <div class="company-head">
                          <h2>{{ invoice.sender.name }}</h2>
                          <div>{{ invoice.sender.address }}</div>
                          <div>{{ invoice.sender.email }} | {{ invoice.sender.phone }}</div>
                          <div *ngIf="invoice.invoiceConfig.showTaxId && invoice.sender.taxId">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.sender.taxId }}</div>
                       </div>
                    </div>
                    
                    <div class="s-meta-row">
                       <div class="bill-to">
                          <h3>Bill To:</h3>
                          <div><strong>{{ invoice.recipient.name }}</strong></div>
                          <div>{{ invoice.recipient.address }}</div>
                          <div>{{ invoice.recipient.email }}</div>
                          <div *ngIf="invoice.invoiceConfig.showTaxId && invoice.recipient.taxId" class="mt-5">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.recipient.taxId }}</div>
                       </div>
                       <div class="inv-table">
                          <div class="ir"><span>Invoice #:</span> <strong>{{ invoice.details.invoiceNumber }}</strong></div>
                          <div class="ir"><span>Date:</span> <span>{{ invoice.details.issueDate }}</span></div>
                          <div class="ir"><span>Due:</span> <span>{{ invoice.details.dueDate }}</span></div>
                       </div>
                    </div>

                    <table class="item-table standard-tbl">
                       <thead>
                         <tr>
                           <th>Description</th>
                           <th class="right">Qty</th>
                           <th class="right">Rate</th>
                           <th class="right">Amount</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr *ngFor="let item of invoice.items">
                           <td>{{ item.description }}</td>
                           <td class="right">{{ item.quantity }}</td>
                           <td class="right">{{ invoice.invoiceConfig.currencySymbol }}{{ item.rate | number:'1.2-2' }}</td>
                           <td class="right">{{ invoice.invoiceConfig.currencySymbol }}{{ item.amount | number:'1.2-2' }}</td>
                         </tr>
                       </tbody>
                    </table>

                    <div class="summary-box standard-sum">
                       <div class="sr"><span>Subtotal:</span> <span>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.subTotal | number:'1.2-2' }}</span></div>
                       <div class="sr" *ngIf="invoice.invoiceConfig.taxRate > 0"><span>{{ invoice.invoiceConfig.taxName }} ({{ invoice.invoiceConfig.taxRate }}%):</span> <span>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.taxAmount | number:'1.2-2' }}</span></div>
                       <div class="sr" *ngIf="invoice.totals.discount > 0"><span>Discount:</span> <span>-{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.discount | number:'1.2-2' }}</span></div>
                       <div class="sr total-row"><span>Total:</span> <span>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.total | number:'1.2-2' }}</span></div>
                    </div>

                    <div class="s-footer mt-30">
                       <h4 *ngIf="invoice.paymentDetails">Payment Instructions</h4>
                       <p class="whitespace-prewrap">{{ invoice.paymentDetails }}</p>
                       
                       <h4 class="mt-20" *ngIf="invoice.notes">Notes</h4>
                       <p class="whitespace-prewrap">{{ invoice.notes }}</p>
                    </div>
                 </div>

                 <!-- Template 2: MODERN -->
                 <div *ngIf="currentTemplate === 'modern'" class="tmpl-modern">
                    <div class="m-banner" [style.background]="currentColor">
                       <div class="m-banner-content">
                          <h1 class="invoice-title font-white">INVOICE</h1>
                          <div class="font-white opacity-80">{{ invoice.details.invoiceNumber }}</div>
                       </div>
                    </div>
                    
                    <div class="p-30">
                       <div class="m-double-split mb-30">
                          <div class="m-block">
                             <h4 [style.color]="currentColor">FROM</h4>
                             <h2>{{ invoice.sender.name }}</h2>
                             <p>{{ invoice.sender.address }}<br>{{ invoice.sender.email }}<br>{{ invoice.sender.phone }}</p>
                             <p *ngIf="invoice.invoiceConfig.showTaxId && invoice.sender.taxId" class="mt-5"><strong>{{ invoice.invoiceConfig.taxIdName }}:</strong> {{ invoice.sender.taxId }}</p>
                          </div>
                          <div class="m-block text-right">
                             <h4 [style.color]="currentColor">BILLED TO</h4>
                             <h2>{{ invoice.recipient.name }}</h2>
                             <p>{{ invoice.recipient.address }}<br>{{ invoice.recipient.email }}<br>{{ invoice.recipient.phone }}</p>
                          </div>
                       </div>

                       <div class="m-info-bar mb-30" [style.border-color]="currentColor">
                          <div><strong>Issued:</strong> {{ invoice.details.issueDate }}</div>
                          <div><strong>Due:</strong> {{ invoice.details.dueDate }}</div>
                       </div>

                       <table class="item-table modern-tbl">
                          <thead [style.background]="currentColor" class="font-white">
                            <tr>
                              <th>Description</th>
                              <th class="right">Qty</th>
                              <th class="right">Unit Price</th>
                              <th class="right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr *ngFor="let item of invoice.items">
                              <td>{{ item.description }}</td>
                              <td class="right">{{ item.quantity }}</td>
                              <td class="right">{{ invoice.invoiceConfig.currencySymbol }}{{ item.rate | number:'1.2-2' }}</td>
                              <td class="right">{{ invoice.invoiceConfig.currencySymbol }}{{ item.amount | number:'1.2-2' }}</td>
                            </tr>
                          </tbody>
                       </table>

                       <div class="summary-flex mt-30">
                          <div class="notes-flex block-accent">
                             <strong [style.color]="currentColor">Payment Details:</strong>
                             <p class="whitespace-prewrap">{{ invoice.paymentDetails }}</p>
                          </div>
                          <div class="summary-box modern-sum">
                             <div class="sr"><span>Subtotal:</span> <strong>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.subTotal | number:'1.2-2' }}</strong></div>
                             <div class="sr" *ngIf="invoice.invoiceConfig.taxRate > 0"><span>{{ invoice.invoiceConfig.taxName }}:</span> <strong>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.taxAmount | number:'1.2-2' }}</strong></div>
                             <div class="sr" *ngIf="invoice.totals.discount > 0"><span>Discount:</span> <strong>-{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.discount | number:'1.2-2' }}</strong></div>
                             <div class="sr total-row modern-tot" [style.background]="currentColor"><span>Total:</span> <span>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.total | number:'1.2-2' }}</span></div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <!-- Template 3: MINIMALIST -->
                 <div *ngIf="currentTemplate === 'minimalist'" class="tmpl-minimalp">
                     <div class="min-head">
                        <h1>Invoice</h1>
                        <div class="min-sub">{{ invoice.details.invoiceNumber }}</div>
                     </div>
                     <div class="min-details">
                        <div class="min-left">
                           <strong>From:</strong><br>
                           {{ invoice.sender.name }}<br>
                           {{ invoice.sender.address }}<br>
                           {{ invoice.sender.email }}<br>
                           <span *ngIf="invoice.invoiceConfig.showTaxId && invoice.sender.taxId">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.sender.taxId }}</span>
                        </div>
                        <div class="min-right">
                           <strong>To:</strong><br>
                           {{ invoice.recipient.name }}<br>
                           {{ invoice.recipient.address }}<br>
                           {{ invoice.recipient.email }}<br>
                           <span *ngIf="invoice.invoiceConfig.showTaxId && invoice.recipient.taxId">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.recipient.taxId }}</span>
                        </div>
                     </div>
                     <div class="min-dates">
                        <span>Date: {{ invoice.details.issueDate }}</span>
                        <span>Due: {{ invoice.details.dueDate }}</span>
                     </div>
                     <div class="min-items">
                        <div class="min-row header-row" style="border-bottom: 2px solid black;">
                           <div class="min-desc">Service</div>
                           <div class="min-qt">Qty</div>
                           <div class="min-rt">Rate</div>
                           <div class="min-am">Amount</div>
                        </div>
                        <div class="min-row" *ngFor="let item of invoice.items" style="border-bottom: 1px solid #ccc;">
                           <div class="min-desc">{{ item.description }}</div>
                           <div class="min-qt">{{ item.quantity }}</div>
                           <div class="min-rt">{{ invoice.invoiceConfig.currencySymbol }}{{ item.rate | number:'1.2-2' }}</div>
                           <div class="min-am">{{ invoice.invoiceConfig.currencySymbol }}{{ item.amount | number:'1.2-2' }}</div>
                        </div>
                     </div>
                     <div class="min-summary">
                        <div class="ms-row"><span>Subtotal:</span><span>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.subTotal | number:'1.2-2' }}</span></div>
                        <div class="ms-row" *ngIf="invoice.invoiceConfig.taxRate > 0"><span>{{ invoice.invoiceConfig.taxName }}:</span><span>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.taxAmount | number:'1.2-2' }}</span></div>
                        <div class="ms-row" *ngIf="invoice.totals.discount > 0"><span>Discount:</span><span>-{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.discount | number:'1.2-2' }}</span></div>
                        <div class="ms-row tot" style="border-top: 2px solid black; padding-top: 10px; font-weight:bold;"><span>Total:</span><span>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.total | number:'1.2-2' }}</span></div>
                     </div>
                     <div class="min-foot">
                        <strong>Payment/Notes:</strong>
                        <p class="whitespace-prewrap">{{ invoice.paymentDetails }}</p>
                        <p class="whitespace-prewrap">{{ invoice.notes }}</p>
                     </div>
                 </div>

                 <!-- Template 4: CORPORATE -->
                 <div *ngIf="currentTemplate === 'corporate'" class="tmpl-corp">
                    <div class="c-head" [style.border-bottom]="'4px solid ' + currentColor">
                       <div>
                          <h1 class="corp-h1">{{ invoice.sender.name }}</h1>
                          <p class="c-gray">{{ invoice.sender.email }} | {{ invoice.sender.phone }}</p>
                          <p *ngIf="invoice.invoiceConfig.showTaxId && invoice.sender.taxId" class="c-gray" style="margin-top:5px">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.sender.taxId }}</p>
                       </div>
                       <h2 class="corp-h2" [style.color]="currentColor">INVOICE</h2>
                    </div>
                    <div class="c-body-top">
                       <div class="c-box">
                          <strong>INVOICE TO</strong>
                          <p>{{ invoice.recipient.name }}</p>
                          <p>{{ invoice.recipient.address }}</p>
                          <p *ngIf="invoice.invoiceConfig.showTaxId && invoice.recipient.taxId" style="margin-top:5px">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.recipient.taxId }}</p>
                       </div>
                       <table class="c-meta-table">
                          <tr><td>Invoice No:</td><td><strong>{{ invoice.details.invoiceNumber }}</strong></td></tr>
                          <tr><td>Issue Date:</td><td>{{ invoice.details.issueDate }}</td></tr>
                          <tr><td>Due Date:</td><td>{{ invoice.details.dueDate }}</td></tr>
                       </table>
                    </div>
                    <table class="item-table corp-tbl" [style.border]="'1px solid ' + currentColor">
                       <thead [style.background]="currentColor" class="font-white">
                         <tr>
                            <th>Item Description</th>
                            <th>Qty</th>
                            <th>Unit Cost</th>
                            <th>Amount</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr *ngFor="let item of invoice.items" [style.border-bottom]="'1px solid #ccc'">
                            <td>{{ item.description }}</td>
                            <td>{{ item.quantity }}</td>
                            <td>{{ invoice.invoiceConfig.currencySymbol }}{{ item.rate | number:'1.2-2' }}</td>
                            <td>{{ invoice.invoiceConfig.currencySymbol }}{{ item.amount | number:'1.2-2' }}</td>
                         </tr>
                       </tbody>
                    </table>
                    <div class="c-bottom-wrap">
                       <div class="c-terms">
                          <strong>TERMS & CONDITIONS</strong>
                          <p class="whitespace-prewrap">{{ invoice.paymentDetails }}</p>
                       </div>
                       <table class="c-sum-table">
                          <tr><td>Subtotal:</td><td>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.subTotal | number:'1.2-2' }}</td></tr>
                          <tr *ngIf="invoice.invoiceConfig.taxRate > 0"><td>{{ invoice.invoiceConfig.taxName }}:</td><td>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.taxAmount | number:'1.2-2' }}</td></tr>
                          <tr *ngIf="invoice.totals.discount > 0"><td>Discount:</td><td>-{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.discount | number:'1.2-2' }}</td></tr>
                          <tr class="c-tot" [style.background]="currentColor"><td class="font-white">TOTAL DUE:</td><td class="font-white">{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.total | number:'1.2-2' }}</td></tr>
                       </table>
                    </div>
                 </div>

                 <!-- Template 5: CREATIVE -->
                 <div *ngIf="currentTemplate === 'creative'" class="tmpl-crt">
                    <div class="crt-geom" [style.background]="currentColor"></div>
                    <div class="crt-content">
                       <div class="crt-head">
                          <div class="ch-left">
                             <h1>{{ invoice.sender.name }}</h1>
                             <p>{{ invoice.sender.address }}<br>{{ invoice.sender.phone }}</p>
                             <p *ngIf="invoice.invoiceConfig.showTaxId && invoice.sender.taxId" style="margin-top:5px">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.sender.taxId }}</p>
                          </div>
                          <div class="ch-right">
                             <h2>INVOICE</h2>
                             <p># {{ invoice.details.invoiceNumber }}</p>
                          </div>
                       </div>
                       <div class="crt-bill">
                          <div class="cb-box">
                             <strong>BILL TO:</strong><br>
                             {{ invoice.recipient.name }}<br>{{ invoice.recipient.email }}<br>{{ invoice.recipient.address }}
                             <div *ngIf="invoice.invoiceConfig.showTaxId && invoice.recipient.taxId" style="margin-top:5px">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.recipient.taxId }}</div>
                          </div>
                          <div class="cb-date">
                             <strong>Issued:</strong> {{ invoice.details.issueDate }}<br>
                             <strong>Due:</strong> {{ invoice.details.dueDate }}
                          </div>
                       </div>
                       <table class="item-table crt-tbl">
                          <thead><tr [style.color]="currentColor"><th>Item</th><th>Hrs/Qty</th><th>Rate</th><th>Total</th></tr></thead>
                          <tbody>
                            <tr *ngFor="let item of invoice.items">
                              <td>{{ item.description }}</td>
                              <td>{{ item.quantity }}</td>
                              <td>{{ invoice.invoiceConfig.currencySymbol }}{{ item.rate | number:'1.2-2' }}</td>
                              <td>{{ invoice.invoiceConfig.currencySymbol }}{{ item.amount | number:'1.2-2' }}</td>
                            </tr>
                          </tbody>
                       </table>
                       <div class="crt-flex">
                          <div class="crt-notes">
                             <strong>PAYMENT DETAILS</strong>
                             <div class="whitespace-prewrap">{{ invoice.paymentDetails }}</div>
                          </div>
                          <div class="crt-sums">
                             <div>Subtotal: {{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.subTotal | number:'1.2-2' }}</div>
                             <div *ngIf="invoice.invoiceConfig.taxRate > 0">Tax: {{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.taxAmount | number:'1.2-2' }}</div>
                             <div class="crt-great-tot" [style.color]="currentColor">TOTAL: {{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.total | number:'1.2-2' }}</div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <!-- More templates (6-10) exist here with structural differences -->
                 <!-- Template 6: TECH -->
                 <div *ngIf="currentTemplate === 'tech'" class="tmpl-tech">
                    <div class="t-board">
                       <h1 [style.color]="currentColor">INVOICE {{ invoice.details.invoiceNumber }}</h1>
                       <div class="t-grid">
                          <div>
                             <span class="t-label">FROM</span>
                             <div class="t-monow">{{ invoice.sender.name }}</div>
                             <div class="t-mono">{{ invoice.sender.address }}</div>
                             <div class="t-mono" *ngIf="invoice.invoiceConfig.showTaxId && invoice.sender.taxId">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.sender.taxId }}</div>
                          </div>
                          <div>
                             <span class="t-label">STATUS: OUTSTANDING</span>
                             <div class="t-monow">CLIENT: {{ invoice.recipient.name }}</div>
                             <div class="t-mono">{{ invoice.recipient.address }}</div>
                             <div class="t-mono" *ngIf="invoice.invoiceConfig.showTaxId && invoice.recipient.taxId">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.recipient.taxId }}</div>
                          </div>
                          <div>
                             <span class="t-label">DATES</span>
                             <div class="t-mono">GEN: {{ invoice.details.issueDate }}</div>
                             <div class="t-mono">DUE: {{ invoice.details.dueDate }}</div>
                          </div>
                       </div>
                       
                       <div class="t-hr" [style.background]="currentColor"></div>
                       
                       <table class="item-table tech-tbl">
                          <thead><tr [style.color]="currentColor"><th>[DESCRIPTION]</th><th>[QTY]</th><th>[RATE]</th><th>[AMT]</th></tr></thead>
                          <tbody>
                             <tr *ngFor="let item of invoice.items">
                                <td>> {{ item.description }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ invoice.invoiceConfig.currencySymbol }}{{ item.rate | number:'1.2-2' }}</td>
                                <td>{{ invoice.invoiceConfig.currencySymbol }}{{ item.amount | number:'1.2-2' }}</td>
                             </tr>
                          </tbody>
                       </table>

                       <div class="t-math" [style.border-color]="currentColor">
                          <div class="tmr"><span>SUBTOTAL</span><span>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.subTotal | number:'1.2-2' }}</span></div>
                          <div class="tmr" *ngIf="invoice.invoiceConfig.taxRate > 0"><span>TAXES</span><span>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.taxAmount | number:'1.2-2' }}</span></div>
                          <div class="tmr tm-tot" [style.color]="currentColor"><span>GRAND TOTAL</span><span>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.total | number:'1.2-2' }}</span></div>
                       </div>
                       
                       <div class="t-foot">
                          <span class="t-label">EXECUTION_PARAMS</span>
                          <p class="t-mono whitespace-prewrap">{{ invoice.paymentDetails }}</p>
                       </div>
                    </div>
                 </div>

                 <!-- Template 7: FREELANCER -->
                 <div *ngIf="currentTemplate === 'freelancer'" class="tmpl-free">
                    <div class="f-head">
                       <div class="f-logo" [style.background]="currentColor">{{ invoice.sender.name.charAt(0) }}</div>
                       <div class="f-titles">
                          <h1>{{ invoice.sender.name }}</h1>
                          <p>Freelance Invoice</p>
                          <p *ngIf="invoice.invoiceConfig.showTaxId && invoice.sender.taxId" style="font-size:0.9rem; margin-top:5px; margin-bottom:0">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.sender.taxId }}</p>
                       </div>
                    </div>
                    <!-- Detailed structure stripped for brevity but acts similarly with rounded boxes -->
                    <div class="f-cards">
                       <div class="f-card"><strong>Billed To:</strong><br>{{ invoice.recipient.name }}<br>{{ invoice.recipient.email }}<br><span *ngIf="invoice.invoiceConfig.showTaxId && invoice.recipient.taxId">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.recipient.taxId }}</span></div>
                       <div class="f-card"><strong>Invoice No:</strong> {{ invoice.details.invoiceNumber }}<br><strong>Due:</strong> {{ invoice.details.dueDate }}</div>
                    </div>
                    <table class="item-table f-tbl">
                       <thead [style.background]="currentColor" class="font-white"><tr><th style="border-radius:8px 0 0 8px">Work</th><th>Hours</th><th>Rate</th><th style="border-radius:0 8px 8px 0">Amount</th></tr></thead>
                       <tbody>
                          <tr *ngFor="let item of invoice.items">
                             <td>{{ item.description }}</td><td>{{ item.quantity }}</td><td>{{ invoice.invoiceConfig.currencySymbol }}{{ item.rate | number:'1.2-2' }}</td><td><strong>{{ invoice.invoiceConfig.currencySymbol }}{{ item.amount | number:'1.2-2' }}</strong></td>
                          </tr>
                       </tbody>
                    </table>
                    <div class="f-end">
                       <div class="f-pay">
                          <strong>How to pay:</strong><p class="whitespace-prewrap">{{ invoice.paymentDetails }}</p>
                       </div>
                       <div class="f-sum">
                          <h2 [style.color]="currentColor">Total Due: {{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.total | number:'1.2-2' }}</h2>
                          <div class="f-subm">Sub: {{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.subTotal | number:'1.2-2' }} | Tax: {{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.taxAmount | number:'1.2-2' }}</div>
                       </div>
                    </div>
                 </div>

                 <!-- Template 8: RETAIL -->
                 <div *ngIf="currentTemplate === 'retail'" class="tmpl-retail">
                    <div style="text-align:center; padding-bottom: 20px; border-bottom: 2px dashed #000;">
                       <h1 style="margin-bottom:0">{{ invoice.sender.name }}</h1>
                       <p>{{ invoice.sender.address }}</p>
                       <p *ngIf="invoice.invoiceConfig.showTaxId && invoice.sender.taxId" style="margin-top:-10px; margin-bottom:15px">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.sender.taxId }}</p>
                       <h2>RECEIPT / INVOICE</h2>
                       <p># {{ invoice.details.invoiceNumber }} | Date: {{ invoice.details.issueDate }}</p>
                    </div>
                    <div style="padding: 20px 0;">
                       <strong>Customer:</strong> {{ invoice.recipient.name }}
                       <div *ngIf="invoice.invoiceConfig.showTaxId && invoice.recipient.taxId" style="margin-top:5px">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.recipient.taxId }}</div>
                    </div>
                    <table class="item-table retail-tbl" style="width:100%; text-align:left;">
                       <tr style="border-bottom: 1px solid #000;"><th style="padding:10px 0">Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                       <tr *ngFor="let item of invoice.items">
                          <td style="padding:10px 0">{{ item.description }}</td><td>{{ item.quantity }}</td><td>{{ invoice.invoiceConfig.currencySymbol }}{{ item.rate | number:'1.2-2' }}</td><td>{{ invoice.invoiceConfig.currencySymbol }}{{ item.amount | number:'1.2-2' }}</td>
                       </tr>
                    </table>
                    <div style="margin-top: 30px; text-align: right; border-top: 2px dashed #000; padding-top: 20px;">
                       <div>Subtotal: {{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.subTotal | number:'1.2-2' }}</div>
                       <div>Tax: {{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.taxAmount | number:'1.2-2' }}</div>
                       <h2 style="font-size: 24px;">TOTAL: {{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.total | number:'1.2-2' }}</h2>
                    </div>
                    <div style="text-align:center; margin-top:50px;">
                       <strong>Thank You!</strong><br><p class="whitespace-prewrap" style="color:gray;">{{ invoice.notes }}</p>
                    </div>
                 </div>

                 <!-- Template 9: SERVICE -->
                 <div *ngIf="currentTemplate === 'service'" class="tmpl-service" [style.border-top]="'15px solid ' + currentColor">
                    <div style="display:flex; justify-content:space-between; padding:40px 50px;">
                       <div>
                          <h1 style="margin:0; font-size:2.5rem;" [style.color]="currentColor">INVOICE</h1>
                          <p style="margin-top:5px; color:#666;">Date: {{ invoice.details.issueDate }}<br>No: {{ invoice.details.invoiceNumber }}</p>
                       </div>
                       <div style="text-align:right;">
                          <h2 style="margin:0">{{ invoice.sender.name }}</h2>
                          <p style="margin-top:5px; color:#555;">{{ invoice.sender.email }}<br>{{ invoice.sender.phone }}<br><span *ngIf="invoice.invoiceConfig.showTaxId && invoice.sender.taxId">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.sender.taxId }}</span></p>
                       </div>
                    </div>
                    <div style="background:#f4f4f4; padding:20px 50px; display:flex; justify-content:space-between;">
                       <div><strong>Service Provided For:</strong><br>{{ invoice.recipient.name }}<br>{{ invoice.recipient.address }}<br><span *ngIf="invoice.invoiceConfig.showTaxId && invoice.recipient.taxId">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.recipient.taxId }}</span></div>
                       <div style="text-align:right;"><strong>Amount Payable:</strong><br><h2 style="margin:5px 0 0;" [style.color]="currentColor">{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.total | number:'1.2-2' }}</h2></div>
                    </div>
                    <div style="padding:40px 50px;">
                       <table style="width:100%; border-collapse:collapse;">
                          <tr style="border-bottom:2px solid #ddd; text-align:left;"><th style="padding:10px 0;">Description of Service</th><th>Units</th><th>Rate</th><th style="text-align:right;">Amount</th></tr>
                          <tr *ngFor="let item of invoice.items" style="border-bottom:1px solid #eee;">
                             <td style="padding:15px 0;">{{ item.description }}</td><td>{{ item.quantity }}</td><td>{{ invoice.invoiceConfig.currencySymbol }}{{ item.rate | number:'1.2-2' }}</td><td style="text-align:right;">{{ invoice.invoiceConfig.currencySymbol }}{{ item.amount | number:'1.2-2' }}</td>
                          </tr>
                       </table>
                       <div style="display:flex; justify-content:space-between; margin-top:30px;">
                          <div style="width:50%;"><strong>Terms of Payment:</strong><br><p class="whitespace-prewrap" style="color:#666">{{ invoice.paymentDetails }}</p></div>
                          <div style="width:30%;">
                             <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>Subtotal:</span><span>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.subTotal | number:'1.2-2' }}</span></div>
                             <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>Tax ({{ invoice.invoiceConfig.taxRate }}%):</span><span>{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.taxAmount | number:'1.2-2' }}</span></div>
                             <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>Discount:</span><span style="color:red">-{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.discount | number:'1.2-2' }}</span></div>
                             <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:1.2rem; border-top:2px solid #ddd; padding-top:10px;"><span>Total:</span><span [style.color]="currentColor">{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.total | number:'1.2-2' }}</span></div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <!-- Template 10: EXECUTIVE -->
                 <div *ngIf="currentTemplate === 'executive'" class="tmpl-exec">
                    <div style="border: 2px solid #000; padding: 40px; height: calc(100% - 80px); margin:40px; box-sizing:border-box;">
                       <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:20px; font-family:'Times New Roman', serif;">
                          <h1 style="margin:0; font-size:2.8rem; text-transform:uppercase; letter-spacing:4px;" [style.color]="currentColor">{{ invoice.sender.name }}</h1>
                          <p style="margin:10px 0 0; letter-spacing:1px;">{{ invoice.sender.address }} &bull; {{ invoice.sender.phone }}</p>
                          <p *ngIf="invoice.invoiceConfig.showTaxId && invoice.sender.taxId" style="margin:5px 0 0">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.sender.taxId }}</p>
                       </div>
                       
                       <div style="display:flex; justify-content:space-between; margin:30px 0; font-family:'Times New Roman', serif;">
                          <div>
                             <strong style="text-decoration:underline; font-size:1.1rem;">BILLED TO:</strong><br>
                             <div style="margin-top:10px;">{{ invoice.recipient.name }}<br>{{ invoice.recipient.address }}<br>{{ invoice.recipient.email }}<br><span *ngIf="invoice.invoiceConfig.showTaxId && invoice.recipient.taxId">{{ invoice.invoiceConfig.taxIdName }}: {{ invoice.recipient.taxId }}</span></div>
                          </div>
                          <div style="text-align:right;">
                             <h2>INVOICE</h2>
                             <table style="width:100%; text-align:right;">
                                <tr><td><strong>No:</strong></td><td>{{ invoice.details.invoiceNumber }}</td></tr>
                                <tr><td><strong>Date:</strong></td><td>{{ invoice.details.issueDate }}</td></tr>
                                <tr><td><strong>Due:</strong></td><td>{{ invoice.details.dueDate }}</td></tr>
                             </table>
                          </div>
                       </div>

                       <table style="width:100%; border-collapse:collapse; margin-top:30px; font-family:'Arial', sans-serif;">
                          <tr style="background:#000; color:#fff;"><th style="padding:10px;text-align:left;">DESCRIPTION</th><th style="padding:10px;">QTY</th><th style="padding:10px;">RATE</th><th style="padding:10px;text-align:right;">AMOUNT</th></tr>
                          <tr *ngFor="let item of invoice.items" style="border-bottom:1px solid #ccc;">
                             <td style="padding:15px 10px;">{{ item.description }}</td><td style="text-align:center;">{{ item.quantity }}</td><td style="text-align:center;">{{ invoice.invoiceConfig.currencySymbol }}{{ item.rate | number:'1.2-2' }}</td><td style="text-align:right; padding-right:10px;">{{ invoice.invoiceConfig.currencySymbol }}{{ item.amount | number:'1.2-2' }}</td>
                          </tr>
                       </table>

                       <div style="display:flex; justify-content:flex-end; margin-top:30px; font-family:'Times New Roman', serif;">
                          <table style="width:40%;">
                             <tr><td style="padding:5px 0;">Subtotal:</td><td style="text-align:right;">{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.subTotal | number:'1.2-2' }}</td></tr>
                             <tr><td style="padding:5px 0; border-bottom:1px solid #000;">Taxes & Discs:</td><td style="text-align:right; border-bottom:1px solid #000;">{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.taxAmount - invoice.totals.discount | number:'1.2-2' }}</td></tr>
                             <tr><td style="padding:10px 0; font-size:1.3rem; font-weight:bold;">TOTAL:</td><td style="text-align:right; font-size:1.3rem; font-weight:bold;" [style.color]="currentColor">{{ invoice.invoiceConfig.currencySymbol }}{{ invoice.totals.total | number:'1.2-2' }}</td></tr>
                          </table>
                       </div>
                       
                       <div style="position:absolute; bottom:80px; width:calc(100% - 160px); text-align:center; font-family:'Arial', sans-serif; font-size:0.8rem; color:#666;">
                          <div style="border-top:1px solid #ccc; padding-top:10px;">{{ invoice.paymentDetails }}</div>
                          <div style="margin-top:5px;">{{ invoice.notes }}</div>
                       </div>
                    </div>
                 </div>

             </div>
          </div>
        </div>
      </div>
      
      <!-- Sticky Bottom Ad -->
      <div class="sticky-ad-footer" id="builder-ad-footer">
        <app-adsense-banner slotId="7777777777" margin="0" format="horizontal" responsive="true"></app-adsense-banner>
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
    .accent { color: var(--accent-orange); }

    .style-group { display: flex; align-items: center; gap: 8px; }
    .toolbar-label { font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; }
    .select-field {
      padding: 6px 12px; border: 1px solid var(--glass-border); border-radius: 6px; font-family: inherit; font-size: 0.9rem;
      background: var(--bg-input); outline: none; cursor: pointer; transition: all 0.2s; font-weight: 500; color: var(--text-primary);
    }
    .select-field:focus { border-color: var(--accent-orange); box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2); }
    
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
    .action-btn.primary { background: var(--accent-orange); color: white; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3); }
    .action-btn.primary:hover:not(:disabled) { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); transform: translateY(-1px); }
    .action-btn.secondary { background: var(--bg-elevated); color: var(--text-primary); border: 1px solid var(--glass-border); }
    .action-btn.secondary:hover { background: rgba(148, 163, 184, 0.15); border-color: var(--border-hover); }
    .action-btn:disabled { opacity: 0.7; cursor: wait; }
    .spinner-small { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }

    /* ===== Workspace ===== */
    .workspace { display: flex; flex: 1; overflow: hidden; }

    /* ===== Sidebar Form ===== */
    .sidebar.panel-scroll {
      width: 420px; background: var(--bg-card); backdrop-filter: var(--glass-blur); border-right: 1px solid var(--glass-border); overflow-y: auto; overflow-x: hidden;
      flex-shrink: 0; display: flex; flex-direction: column;
    }
    
    .accordion-item { border-bottom: 1px solid var(--glass-border); }
    .accordion-header {
      padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;
      transition: background 0.2s; user-select: none;
    }
    .accordion-header:hover { background: rgba(148, 163, 184, 0.05); }
    .accordion-item.active .accordion-header { background: rgba(148, 163, 184, 0.1); border-bottom: 1px solid var(--glass-border); }
    .accordion-item.active .accordion-header svg { transform: rotate(180deg); }
    .acc-title { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); }
    
    .accordion-body { padding: 24px; background: transparent; animation: slideDown 0.3s ease; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .input-block { display: flex; flex-direction: column; gap: 6px; }
    .input-block.full-width { grid-column: span 2; }
    .input-block label { font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); }
    
    .field {
      padding: 10px 12px; border: 1px solid var(--glass-border); border-radius: 6px; font-family: inherit; font-size: 0.95rem;
      background: var(--bg-input); outline: none; transition: all 0.2s; color: var(--text-primary); width: 100%; box-sizing: border-box;
    }
    .field:focus { border-color: var(--accent-orange); box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15); }
    .textarea-small { min-height: 60px; resize: vertical; }
    .textarea-medium { min-height: 100px; resize: vertical; }

    /* Line Items Form */
    .line-item-box { background: var(--bg-input); border: 1px solid var(--glass-border); border-radius: 8px; padding: 16px; margin-bottom: 16px; position:relative;}
    .item-header { display: flex; justify-content: space-between; margin-bottom: 12px; align-items:center; }
    .item-header h4 { margin:0; font-size: 0.85rem; color: var(--text-secondary); font-weight:700;}
    .icon-btn-small.delete { background: rgba(239,68,68,0.1); color: var(--accent-red); border:none; border-radius:4px; width:24px; height:24px; cursor:pointer; font-weight:bold; }
    .qty-box { grid-column: span 1; }
    .rate-box { grid-column: span 1; }
    .input-prefix { display:flex; align-items:center;}
    .input-prefix .prefix { background: var(--bg-elevated); padding:10px 12px; border:1px solid var(--glass-border); border-right:none; border-radius:6px 0 0 6px; color: var(--text-secondary); font-weight:600;}
    .input-prefix .field { border-radius: 0 6px 6px 0; }
    
    .add-btn {
      width: 100%; padding: 10px; background: transparent; border: 2px dashed var(--text-muted); border-radius: 6px;
      color: var(--text-secondary); font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .add-btn:hover { border-color: var(--accent-orange); color: var(--accent-orange); background: rgba(245, 158, 11, 0.05); }

    /* Financial Math Readout */
    .math-readout { background: var(--bg-input); border: 1px solid var(--glass-border); border-radius: 8px; padding: 16px; }
    .mr-row { display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.9rem; color: var(--text-secondary); }
    .mr-row.total { border-top: 2px solid var(--glass-border); padding-top: 10px; margin-top: 10px; font-weight: 800; font-size: 1.1rem; color: var(--text-primary); margin-bottom:0;}

    .mt-5 { margin-top: 5px; } .mt-20 { margin-top: 20px; } .mb-15 { margin-bottom: 15px; }
    .mb-30 { margin-bottom: 30px; } .p-30 { padding: 30px; }

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
      background: rgba(245, 158, 11, 0.12); border-color: var(--accent-orange); color: var(--accent-orange);
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
      .sidebar.panel-scroll {
        width: 100%; height: auto; max-height: 70vh;
        border-right: none; border-bottom: 1px solid var(--glass-border); overflow-y: auto;
      }
      .canvas-panel { height: auto; min-height: 60vh; overflow: visible; }
      .canvas-wrapper { padding: 16px; justify-content: flex-start; }
      .a4-page { width: 100%; min-width: unset; transform: none !important; box-shadow: var(--shadow-md); }
    }
    @media (max-width: 480px) {
      .editor-toolbar { padding: 6px 10px; }
      .action-btn { padding: 8px 12px; font-size: 0.82rem; }
      .form-grid { grid-template-columns: 1fr; }
      .input-block.full-width { grid-column: span 1; }
      .accordion-header { padding: 14px 16px; }
      .accordion-body { padding: 16px; }
    }

    /* A4 PAGE CONTAINER (210mm x 297mm) */
    .a4-page {
       width: 210mm;
       min-height: 297mm;
       background: white;
       box-shadow: 0 20px 40px rgba(0,0,0,0.2);
       transform-origin: top center;
       overflow: visible; box-sizing: border-box; height: max-content; padding-bottom: 10px;
       transition: transform 0.2s ease;
       font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
       color: #333; position: relative;
    }
    .whitespace-prewrap { white-space: pre-wrap; }

    /* TEMPLATE STYLES */
    /* Template 1: Standard */
    .tmpl-standard { padding: 50px 60px; height:100%; display:flex; flex-direction:column; }
    .s-header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .invoice-title { font-size: 2.5rem; letter-spacing: 2px; text-transform: uppercase; margin: 0; color:#111; }
    .company-head h2 { margin: 0 0 5px 0; font-size: 1.5rem; }
    .s-meta-row { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .bill-to h3 { margin:0 0 10px 0; color:#555; text-transform:uppercase; font-size:1rem; border-bottom: 1px solid #ddd; padding-bottom:5px;}
    .inv-table { background: #f9f9f9; padding: 15px 20px; border-radius: 4px; }
    .ir { display:flex; justify-content:space-between; width: 220px; margin-bottom:5px; }
    .item-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .standard-tbl th { border-bottom: 2px solid #333; padding: 12px 10px; text-align: left; background:#f4f4f4;}
    .standard-tbl td { border-bottom: 1px solid #eee; padding: 15px 10px; }
    .right { text-align: right; }
    .summary-box { width: 300px; margin-left: auto; }
    .standard-sum .sr { display:flex; justify-content:space-between; padding: 6px 10px; }
    .standard-sum .total-row { border-top: 2px solid #333; font-weight: bold; font-size: 1.2rem; margin-top:5px; padding-top:10px; }
    .s-footer h4 { border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom:10px; }

    /* Template 2: Modern */
    .tmpl-modern { height:100%; display:flex; flex-direction:column; }
    .m-banner { padding: 40px 50px; }
    .m-banner-content { display:flex; justify-content:space-between; align-items:center; }
    .font-white { color: white; } .opacity-80 { opacity: 0.8; font-size: 1.2rem; font-weight:600;}
    .m-double-split { display:flex; justify-content:space-between; }
    .m-block h4 { margin:0 0 15px 0; font-size:0.9rem; letter-spacing:2px; text-transform:uppercase; }
    .m-block h2 { margin:0 0 5px 0; font-size:1.6rem; }
    .m-block p { margin:0; line-height:1.6; color:#555; }
    .text-right { text-align: right; }
    .m-info-bar { display:flex; justify-content:space-around; background:#f8f9fa; padding:15px; border-radius:8px; border-left: 5px solid; }
    .m-info-bar div { font-size:1.1rem; }
    .modern-tbl th { padding: 15px; text-align: left; }
    .modern-tbl td { padding: 15px; border-bottom: 1px solid #eee; }
    .modern-tbl tr:nth-child(even) { background: #fafafa; }
    .summary-flex { display:flex; justify-content:space-between; }
    .notes-flex { width: 45%; padding:20px; background:#f8f9fa; border-radius:8px; }
    .modern-sum { width: 40%; }
    .modern-sum .sr { display:flex; justify-content:space-between; padding:10px 15px; border-bottom:1px solid #eee;}
    .modern-tot { border-radius:8px; margin-top:10px; font-weight:bold; font-size:1.3rem; color:white; border:none;}

    /* Template 3: Minimalist */
    .tmpl-minimalp { padding: 60px 70px; font-family:'Helvetica', sans-serif;}
    .min-head { display:flex; align-items:baseline; justify-content:space-between; border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:30px;}
    .min-head h1 { margin:0; font-size:3rem; font-weight:400; text-transform:uppercase;}
    .min-sub { font-size:1.2rem; font-weight:bold;}
    .min-details { display:flex; justify-content:space-between; margin-bottom:30px; font-size:0.95rem; line-height:1.6;}
    .min-left { width:45%; } .min-right { width:45%; text-align:right;}
    .min-dates { display:flex; justify-content:space-between; font-weight:bold; margin-bottom:30px; border:1px solid #000; padding:15px;}
    .min-row { display:flex; padding:15px 10px; }
    .header-row { font-weight:bold; text-transform:uppercase;}
    .min-desc { flex:1; } .min-qt { width:60px; text-align:center;} .min-rt { width:100px; text-align:right;} .min-am { width:100px; text-align:right;}
    .min-summary { width:250px; margin-left:auto; margin-top:20px; margin-bottom:50px;}
    .ms-row { display:flex; justify-content:space-between; padding:5px 0;}
    .min-foot { border-top:1px dashed #000; padding-top:20px;}

    /* Template 4: Corporate */
    .tmpl-corp { padding:50px; font-family:'Arial', sans-serif;}
    .c-head { display:flex; justify-content:space-between; padding-bottom:20px; margin-bottom:30px;}
    .corp-h1 { margin:0; font-size:2.2rem; }
    .c-gray { color:gray; margin-top:5px;}
    .corp-h2 { margin:0; font-size:3rem; letter-spacing:3px;}
    .c-body-top { display:flex; justify-content:space-between; margin-bottom:40px;}
    .c-box strong { font-size:1.1rem; border-bottom:1px solid #ccc; display:block; padding-bottom:5px; margin-bottom:10px;}
    .c-meta-table td { padding:8px 20px;}
    .corp-tbl th { padding:12px; text-align:left;}
    .corp-tbl td { padding:12px; }
    .c-bottom-wrap { display:flex; justify-content:space-between; margin-top:40px;}
    .c-terms { width:50%; }
    .c-terms strong { display:block; margin-bottom:10px;}
    .c-sum-table { width:40%; border-collapse:collapse;}
    .c-sum-table td { padding:10px; text-align:right;}
    .c-tot td { font-size:1.3rem; font-weight:bold;}

    /* Template 5: Creative */
    .tmpl-crt { position:relative; padding:50px; height:100%; box-sizing:border-box;}
    .crt-geom { position:absolute; top:0; right:0; width:350px; height:150px; border-bottom-left-radius:150px; z-index:1;}
    .crt-content { position:relative; z-index:2; }
    .crt-head { display:flex; justify-content:space-between; margin-bottom:50px;}
    .ch-left h1 { margin:0 0 5px; font-size:2.5rem; }
    .ch-right { text-align:right; color:white; padding-top:20px;}
    .ch-right h2 { margin:0; font-size:2rem; letter-spacing:5px;}
    .crt-bill { display:flex; justify-content:space-between; padding:20px; background:#f4f4f4; border-radius:10px; margin-bottom:30px;}
    .crt-tbl { margin-bottom:40px;}
    .crt-tbl th { text-align:left; padding:15px 10px; border-bottom:2px solid; font-size:1.1rem;}
    .crt-tbl td { padding:15px 10px; border-bottom:1px dashed #ccc;}
    .crt-flex { display:flex; justify-content:space-between;}
    .crt-notes { width:50%; }
    .crt-sums { width:35%; text-align:right; font-size:1.1rem; line-height:1.8;}
    .crt-great-tot { font-size:1.6rem; font-weight:bold; border-top:2px solid; margin-top:10px; padding-top:10px;}

    /* Template 6: Tech */
    .tmpl-tech { padding:50px; background:#0f172a; color:#e2e8f0; height:100%; font-family:'Courier New', monospace;}
    .t-board { border:1px solid #334155; padding:40px; height:calc(100% - 80px);}
    .t-board h1 { margin:0 0 30px; letter-spacing:2px;}
    .t-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-bottom:40px;}
    .t-label { color:#64748b; font-size:0.8rem; margin-bottom:5px; display:block; text-transform:uppercase;}
    .t-monow { color:white; font-weight:bold; margin-bottom:5px;}
    .t-hr { height:2px; width:100%; margin-bottom:40px;}
    .tech-tbl { width:100%; margin-bottom:40px;}
    .tech-tbl th { text-align:left; padding:10px; border-bottom:1px solid #334155;}
    .tech-tbl td { padding:15px 10px; border-bottom:1px solid #1e293b;}
    .t-math { width:300px; margin-left:auto; border-left:2px solid; padding-left:20px; margin-bottom:40px;}
    .tmr { display:flex; justify-content:space-between; padding:5px 0;}
    .tm-tot { font-size:1.2rem; font-weight:bold; margin-top:10px;}
    .t-foot { border-top:1px dashed #334155; padding-top:20px;}

    /* Template 7: Freelancer */
    .tmpl-free { padding:60px; font-family:'Nunito', sans-serif;}
    .f-head { display:flex; align-items:center; gap:20px; margin-bottom:40px;}
    .f-logo { width:80px; height:80px; border-radius:20px; display:flex; align-items:center; justify-content:center; color:white; font-size:2.5rem; font-weight:bold;}
    .f-titles h1 { margin:0; font-size:2.5rem;}
    .f-titles p { margin:0; color:gray; font-size:1.2rem;}
    .f-cards { display:flex; gap:20px; margin-bottom:40px;}
    .f-card { background:#f8fafc; padding:20px; border-radius:15px; flex:1; border:1px solid #e2e8f0;}
    .f-tbl th { padding:15px; text-align:left;}
    .f-tbl td { padding:15px; border-bottom:1px solid #f1f5f9;}
    .f-end { display:flex; justify-content:space-between; margin-top:40px; padding-top:40px; border-top:2px dashed #e2e8f0;}
    .f-pay { width:45%; background:#f1f5f9; padding:20px; border-radius:15px;}
    .f-sum { width:45%; text-align:right;}
    .f-sum h2 { font-size:2.2rem; margin:0 0 10px;}

  `]
})
export class InvoiceGeneratorComponent implements OnInit {
  Math = Math;
  env = environment;
  @ViewChild('a4Page') a4PageRef!: ElementRef;

  activeTab = 'general';
  zoom = 0.8;
  isGenerating = false;
  mobileView = 'edit';

  selectedCountry = 'us';
  currentTemplate = 'modern';
  currentColor = '#f59e0b'; // Amber default

  toggleAccordion(tab: string) {
    this.activeTab = this.activeTab === tab ? '' : tab;
  }

  invoice: InvoiceData = {
    invoiceConfig: {
      country: 'us',
      currencySymbol: '$',
      taxName: 'Tax',
      taxRate: 0,
      showTaxId: true,
      taxIdName: 'EIN / Tax ID',
      taxIdLabelSender: 'e.g. 12-3456789',
      taxIdLabelRecipient: ''
    },
    details: {
      invoiceNumber: 'INV-2024-001',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0]
    },
    sender: {
      name: 'Your Company LLC',
      company: '',
      email: 'hello@yourcompany.com',
      phone: '(555) 123-4567',
      address: '123 Business Rd.\nSuite 100\nSan Francisco, CA 94107',
      taxId: ''
    },
    recipient: {
      name: 'Acme Corp',
      company: '',
      email: 'billing@acmecorp.com',
      phone: '(555) 987-6543',
      address: '456 Corporate Blvd.\nNew York, NY 10001',
      taxId: ''
    },
    items: [
      { description: 'Web Design Services', quantity: 1, rate: 1200, amount: 1200 },
      { description: 'Hosting & Maintenance (1 Yr)', quantity: 1, rate: 300, amount: 300 }
    ],
    totals: { subTotal: 1500, taxAmount: 0, discount: 0, total: 1500 },
    notes: 'Thank you for your business! It has been a pleasure working with you.',
    paymentDetails: 'Bank: Example Bank\nAccount: 123456789\nRouting: 987654321\nPlease pay within 14 days.'
  };

  ngOnInit() {
    this.recalculate();
  }

  onCountryChange() {
    const config = this.invoice.invoiceConfig;
    switch (this.selectedCountry) {
      case 'us':
        config.currencySymbol = '$';
        config.taxName = 'Tax';
        config.showTaxId = true;
        config.taxIdName = 'EIN / Tax ID';
        config.taxIdLabelSender = 'e.g. 12-3456789';
        break;
      case 'uk':
        config.currencySymbol = '£';
        config.taxName = 'VAT';
        config.showTaxId = true;
        config.taxIdName = 'Company Reg / VAT No.';
        config.taxRate = 20;
        break;
      case 'eu':
        config.currencySymbol = '€';
        config.taxName = 'VAT';
        config.showTaxId = true;
        config.taxIdName = 'VAT ID';
        config.taxRate = 19;
        break;
      case 'in':
        config.currencySymbol = '₹';
        config.taxName = 'GST';
        config.showTaxId = true;
        config.taxIdName = 'GSTIN';
        config.taxIdLabelSender = 'e.g. 22AAAAA0000A1Z5';
        config.taxRate = 18;
        break;
      case 'au':
        config.currencySymbol = 'A$';
        config.taxName = 'GST';
        config.showTaxId = true;
        config.taxIdName = 'ABN';
        config.taxRate = 10;
        break;
      case 'ca':
        config.currencySymbol = 'C$';
        config.taxName = 'HST/GST';
        config.showTaxId = true;
        config.taxIdName = 'Business Number';
        config.taxRate = 13;
        break;
    }
    this.recalculate();
  }

  addItem() {
    this.invoice.items.push({ description: '', quantity: 1, rate: 0, amount: 0 });
    this.recalculate();
  }

  removeItem(index: number) {
    this.invoice.items.splice(index, 1);
    this.recalculate();
  }

  recalculate() {
    let sub = 0;
    this.invoice.items.forEach(item => {
      item.amount = (item.quantity || 0) * (item.rate || 0);
      sub += item.amount;
    });
    this.invoice.totals.subTotal = sub;

    const discountAmount = this.invoice.totals.discount || 0;
    const afterDiscount = Math.max(0, sub - discountAmount);

    const taxAmount = afterDiscount * ((this.invoice.invoiceConfig.taxRate || 0) / 100);
    this.invoice.totals.taxAmount = taxAmount;

    this.invoice.totals.total = afterDiscount + taxAmount;
  }

  setZoom(val: number) {
    this.zoom = Math.max(0.4, Math.min(val, 1.5));
  }

  async downloadPdf() {
    if (this.isGenerating) return;
    this.isGenerating = true;

    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
      // ── DESKTOP: direct PDF download via html2canvas + jsPDF ──────────────
      // On desktop there are no mobile media queries, so html2canvas captures
      // the A4 preview exactly as rendered — colours, template, and layout intact.
      const previousMobileView = this.mobileView;
      this.mobileView = 'preview';
      try {
        const previousZoom = this.zoom;
        this.zoom = 1;
        await new Promise(r => setTimeout(r, 300));

        const canvas = await html2canvas(this.a4PageRef.nativeElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          windowWidth: 1280,
        });

        const imgData  = canvas.toDataURL('image/png');
        const pdf      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfW     = pdf.internal.pageSize.getWidth();
        const pdfH     = pdf.internal.pageSize.getHeight();
        const imgH     = (canvas.height * pdfW) / canvas.width;
        let heightLeft = imgH;
        let position   = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfW, imgH);
        heightLeft -= pdfH;
        while (heightLeft >= 1) {
          position = heightLeft - imgH;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfW, imgH);
          heightLeft -= pdfH;
        }

        pdf.save(`Invoice_${this.invoice.details.invoiceNumber}.pdf`);
        this.zoom = previousZoom;
      } catch (err) {
        console.error('PDF error:', err);
        alert('PDF generation failed. Please try again.');
      } finally {
        this.isGenerating = false;
        this.mobileView = previousMobileView;
      }

    } else {
      // ── MOBILE: iframe print dialog ────────────────────────────────────────
      // Uses pure HTML table (no flexbox/classes) so layout is screen-size-proof.
      try {
        const html = this.buildInvoiceHtml();
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;opacity:0;';
        document.body.appendChild(iframe);
        const iDoc = iframe.contentDocument || (iframe.contentWindow as any)?.document;
        if (iDoc) {
          iDoc.open(); iDoc.write(html); iDoc.close();
          iframe.onload = () => {
            try { (iframe.contentWindow as any).print(); } catch(e) { console.error(e); }
            setTimeout(() => { try { document.body.removeChild(iframe); } catch(e) {} }, 15000);
          };
        }
      } catch(err) {
        console.error('PDF error:', err);
        alert('PDF generation failed. Please try again.');
      } finally {
        this.isGenerating = false;
      }
    }
  }

  /** Builds a printer-friendly self-contained HTML invoice using HTML table layout */
  private buildInvoiceHtml(): string {
    const inv = this.invoice;
    const clr = this.currentColor;
    const sym = inv.invoiceConfig.currencySymbol;
    const fmt = (n: number) => n.toFixed(2);
    const br  = (s: string) => (s||'').replace(/\n/g,'<br>');

    const rows = inv.items.map(i =>
      `<tr><td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:13px">${i.description}</td>` +
      `<td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;font-size:13px">${i.quantity}</td>` +
      `<td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;font-size:13px">${sym}${fmt(i.rate)}</td>` +
      `<td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;font-size:13px;font-weight:600">${sym}${fmt(i.amount)}</td></tr>`
    ).join('');

    const fromExtra = [inv.sender.email, inv.sender.phone,
      (inv.invoiceConfig.showTaxId && inv.sender.taxId) ? inv.invoiceConfig.taxIdName+': '+inv.sender.taxId : ''
    ].filter(Boolean).join('<br>');

    const toExtra = [inv.recipient.email, inv.recipient.phone,
      (inv.invoiceConfig.showTaxId && inv.recipient.taxId) ? inv.invoiceConfig.taxIdName+': '+inv.recipient.taxId : ''
    ].filter(Boolean).join('<br>');

    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice ${inv.details.invoiceNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;color:#333;background:#fff;
       -webkit-print-color-adjust:exact;print-color-adjust:exact}
  @page{size:A4 portrait;margin:12mm 12mm}
</style>
</head><body>
<table width="700" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto;border-collapse:collapse">
  <tr>
    <td style="padding:0 0 16px;border-bottom:3px solid ${clr};vertical-align:bottom">
      <span style="font-size:28px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:${clr}">INVOICE</span>
    </td>
    <td style="padding:0 0 16px;border-bottom:3px solid ${clr};text-align:right;vertical-align:bottom">
      <strong style="font-size:14px;color:#111">${inv.details.invoiceNumber}</strong><br>
      <span style="font-size:12px;color:#666">Issued: ${inv.details.issueDate}</span><br>
      <span style="font-size:12px;color:#666">Due: ${inv.details.dueDate}</span>
    </td>
  </tr>
  <tr><td colspan="2" style="height:22px"></td></tr>
  <tr>
    <td style="vertical-align:top;padding-bottom:26px">
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:${clr};margin-bottom:7px">FROM</div>
      <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:4px">${inv.sender.name}</div>
      <div style="font-size:12px;color:#555;line-height:1.7">${br(inv.sender.address)}${fromExtra?'<br>'+fromExtra:''}</div>
    </td>
    <td style="vertical-align:top;text-align:right;padding-bottom:26px">
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:${clr};margin-bottom:7px">BILLED TO</div>
      <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:4px">${inv.recipient.name}</div>
      <div style="font-size:12px;color:#555;line-height:1.7">${br(inv.recipient.address)}${toExtra?'<br>'+toExtra:''}</div>
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding-bottom:22px">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <thead><tr style="background:${clr}">
          <th style="padding:10px 8px;text-align:left;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;width:50%">Description</th>
          <th style="padding:10px 8px;text-align:center;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:0.8px">Qty</th>
          <th style="padding:10px 8px;text-align:right;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:0.8px">Unit Price</th>
          <th style="padding:10px 8px;text-align:right;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:0.8px">Amount</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </td>
  </tr>
  <tr>
    <td></td>
    <td style="padding-bottom:26px">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding:6px 0;font-size:13px;color:#555;border-bottom:1px solid #eee">Subtotal</td>
            <td style="padding:6px 0;font-size:13px;color:#555;border-bottom:1px solid #eee;text-align:right">${sym}${fmt(inv.totals.subTotal)}</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#555;border-bottom:1px solid #eee">${inv.invoiceConfig.taxName} (${inv.invoiceConfig.taxRate}%)</td>
            <td style="padding:6px 0;font-size:13px;color:#555;border-bottom:1px solid #eee;text-align:right">${sym}${fmt(inv.totals.taxAmount)}</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#555;border-bottom:1px solid #eee">Discount</td>
            <td style="padding:6px 0;font-size:13px;color:#555;border-bottom:1px solid #eee;text-align:right">-${sym}${fmt(inv.totals.discount)}</td></tr>
        <tr><td style="padding:12px 0;font-size:17px;font-weight:800;color:${clr}">Total</td>
            <td style="padding:12px 0;font-size:17px;font-weight:800;color:${clr};text-align:right">${sym}${fmt(inv.totals.total)}</td></tr>
      </table>
    </td>
  </tr>
  ${(inv.paymentDetails||inv.notes) ? `<tr><td colspan="2" style="border-top:1px solid #eee;padding-top:16px">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="vertical-align:top;width:50%;font-size:12px;color:#555;line-height:1.7;padding-right:20px">
        ${inv.paymentDetails?`<strong style="color:#333;display:block;margin-bottom:3px">Payment Instructions</strong>${br(inv.paymentDetails)}`:''}
      </td>
      <td style="vertical-align:top;text-align:right;font-size:12px;color:#555;line-height:1.7">
        ${inv.notes?`<strong style="color:#333;display:block;margin-bottom:3px">Notes</strong>${br(inv.notes)}`:''}
      </td>
    </tr></table></td></tr>` : ''}
</table>
<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},300);});<\/script>
</body></html>`;
  }


  downloadWord() {
    // Generate a simple Word Doc mapping using HTML Blob
    // Warning: Word doc styling exported like this from raw pure CSS spans heavily relies on msword renderer.
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
    const footer = "</body></html>";
    
    // Attempting to clone the node to strip out heavy CSS logic and put basic HTML table constructs for Word
    const htmlToExport = `
      <h1 style="text-align:center;">INVOICE ${this.invoice.details.invoiceNumber}</h1>
      <table style="width:100%; margin-bottom:20px;">
        <tr>
          <td><strong>From:</strong><br>${this.invoice.sender.name}<br>${this.invoice.sender.address}<br>${this.invoice.sender.email}</td>
          <td style="text-align:right;"><strong>To:</strong><br>${this.invoice.recipient.name}<br>${this.invoice.recipient.address}</td>
        </tr>
      </table>
      <p><strong>Issue Date:</strong> ${this.invoice.details.issueDate}</p>
      <p><strong>Due Date:</strong> ${this.invoice.details.dueDate}</p>
      <table border="1" style="width:100%; border-collapse:collapse;" cellpadding="5">
        <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
        ${this.invoice.items.map(i => `<tr><td>${i.description}</td><td>${i.quantity}</td><td>${this.invoice.invoiceConfig.currencySymbol}${i.rate}</td><td>${this.invoice.invoiceConfig.currencySymbol}${i.amount}</td></tr>`).join('')}
      </table>
      <div style="text-align:right; margin-top:20px;">
        <p>Subtotal: ${this.invoice.invoiceConfig.currencySymbol}${this.invoice.totals.subTotal.toFixed(2)}</p>
        <p>Tax: ${this.invoice.invoiceConfig.currencySymbol}${this.invoice.totals.taxAmount.toFixed(2)}</p>
        <p>Discount: -${this.invoice.invoiceConfig.currencySymbol}${this.invoice.totals.discount.toFixed(2)}</p>
        <h3>Total: ${this.invoice.invoiceConfig.currencySymbol}${this.invoice.totals.total.toFixed(2)}</h3>
      </div>
      <div>
        <h4>Payment Terms:</h4>
        <p>${this.invoice.paymentDetails}</p>
      </div>
    `;

    const sourceHTML = header + htmlToExport + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Invoice_${this.invoice.details.invoiceNumber}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }
}
