import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface AmortizationRow {
  month: number;
  principalPaid: number;
  interestPaid: number;
  totalPayment: number;
  balance: number;
}

@Component({
  selector: 'app-emi-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="tools-page">
      <!-- Toolbar -->
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <a routerLink="/" class="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </a>
          <span class="toolbar-title">EMI <span class="accent">Calculator</span></span>
        </div>
      </div>

      <div class="workspace">
        <!-- Input Sidebar -->
        <div class="sidebar">
          <div class="sidebar-header">
            <h3>Loan Details</h3>
          </div>
          <div class="sidebar-content">
            
            <div class="form-group block">
              <div class="header-row">
                <label>Loan Amount (₹)</label>
                <input type="number" class="number-input" [(ngModel)]="loanAmount" (ngModelChange)="calculate()">
              </div>
              <input type="range" min="10000" max="10000000" step="10000" [(ngModel)]="loanAmount" (ngModelChange)="calculate()" class="slider">
              <div class="range-labels">
                <span>10K</span>
                <span>1Cr</span>
              </div>
            </div>

            <div class="form-group block mt-3">
              <div class="header-row">
                <label>Interest Rate (p.a %)</label>
                <input type="number" class="number-input" [(ngModel)]="interestRate" step="0.1" (ngModelChange)="calculate()">
              </div>
              <input type="range" min="0.1" max="25" step="0.1" [(ngModel)]="interestRate" (ngModelChange)="calculate()" class="slider">
              <div class="range-labels">
                <span>0.1%</span>
                <span>25%</span>
              </div>
            </div>

            <div class="form-group block mt-3">
              <div class="header-row">
                <label>Loan Tenure</label>
                <div class="toggle-group">
                  <button [class.active]="isYears" (click)="setTenureType(true)">Yr</button>
                  <button [class.active]="!isYears" (click)="setTenureType(false)">Mo</button>
                </div>
                <input type="number" class="number-input small" [(ngModel)]="loanTenure" (ngModelChange)="calculate()">
              </div>
              <input type="range" [min]="1" [max]="isYears ? 30 : 360" step="1" [(ngModel)]="loanTenure" (ngModelChange)="calculate()" class="slider">
              <div class="range-labels">
                <span>1</span>
                <span>{{ isYears ? 30 : 360 }}</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Output Dashboard -->
        <div class="main-panel">
          <div class="main-content-wrapper">
          
          <div class="summary-cards">
            <div class="card highlight">
              <h4>Monthly EMI</h4>
              <h2 class="emi-text">₹ {{ monthlyEMI | number:'1.0-0' }}</h2>
            </div>
            <div class="card">
              <h4>Total Interest Payable</h4>
              <h2>₹ {{ totalInterest | number:'1.0-0' }}</h2>
            </div>
            <div class="card">
              <h4>Total Payment (Principal + Interest)</h4>
              <h2>₹ {{ totalPayment | number:'1.0-0' }}</h2>
            </div>
          </div>

          <div class="visual-panel">
            <div class="chart-container">
               <div class="donut-chart" [style.background]="getConicGradient()"></div>
               <div class="chart-legend">
                 <div class="legend-item">
                   <div class="color-box principal-color"></div>
                   <div class="legend-text">
                     <span>Principal Loan Amount</span>
                     <strong>{{ getPrincipalPercentage() }}%</strong>
                   </div>
                 </div>
                 <div class="legend-item">
                   <div class="color-box interest-color"></div>
                   <div class="legend-text">
                     <span>Total Interest</span>
                     <strong>{{ getInterestPercentage() }}%</strong>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          <!-- Amortization Schedule Table -->
          <div class="table-container" *ngIf="amortizationSchedule.length > 0">
            <h3>Amortization Schedule</h3>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Opening Balance</th>
                    <th>Principal Paid</th>
                    <th>Interest Paid</th>
                    <th>Closing Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let row of amortizationSchedule">
                    <td>{{ row.month }}</td>
                    <td>₹ {{ (row.balance + row.principalPaid) | number:'1.0-0' }}</td>
                    <td class="td-positive">₹ {{ row.principalPaid | number:'1.0-0' }}</td>
                    <td class="td-negative">₹ {{ row.interestPaid | number:'1.0-0' }}</td>
                    <td>₹ {{ row.balance | number:'1.0-0' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: calc(100vh - 80px); overflow: hidden; background: transparent; font-family: 'Inter', sans-serif; color: var(--text-primary); }
    .tools-page { display: flex; flex-direction: column; height: 100%; }

    /* ===== Toolbar ===== */
    .editor-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 24px; height: 60px;
      background: var(--bg-card); backdrop-filter: var(--glass-blur);
      border-bottom: 1px solid var(--glass-border); flex-shrink: 0; box-shadow: var(--shadow-sm); z-index: 10;
    }
    .toolbar-left { display: flex; align-items: center; gap: 16px; }
    .back-btn {
      width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      color: var(--text-muted); transition: all 0.2s; text-decoration: none; border: 1px solid transparent;
    }
    .back-btn:hover { color: var(--accent-cyan); background: rgba(6, 182, 212, 0.1); border-color: var(--glass-border); }
    .toolbar-title { font-weight: 700; font-size: 1.15rem; color: var(--text-primary); }
    .accent { color: var(--accent-green); } /* Emerald accent for financial tool */

    .workspace { display: flex; flex: 1; overflow: hidden; background: transparent; }

    /* ===== Sidebar ===== */
    .sidebar { width: 340px; background: var(--bg-card); backdrop-filter: var(--glass-blur); border-right: 1px solid var(--glass-border); display: flex; flex-direction: column; z-index: 5; }
    .sidebar-header { padding: 18px 24px; border-bottom: 1px solid var(--glass-border); }
    .sidebar-header h3 { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .sidebar-content { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
    
    .form-group { display: flex; flex-direction: column; gap: 10px; }
    .header-row { display: flex; justify-content: space-between; align-items: center; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
    
    .number-input {
      width: 120px; padding: 8px 12px; border: 1px solid var(--glass-border); border-radius: 6px; font-family: inherit; font-size: 0.95rem;
      background: var(--bg-input); outline: none; transition: all 0.2s; color: var(--text-primary); font-weight: 600; text-align: right;
    }
    .number-input.small { width: 70px; }
    .number-input:focus { border-color: var(--accent-green); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
    
    .slider {
      -webkit-appearance: none; width: 100%; height: 6px; border-radius: 3px; background: var(--bg-input); border: 1px solid var(--glass-border); outline: none; padding: 0; margin: 8px 0;
    }
    .slider::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%;
      background: var(--accent-green); cursor: pointer; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.5); transition: transform 0.1s;
    }
    .slider::-webkit-slider-thumb:hover { transform: scale(1.1); box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
    .range-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }

    .toggle-group { display: flex; background: var(--bg-input); border: 1px solid var(--glass-border); border-radius: 6px; padding: 3px; }
    .toggle-group button {
      border: none; background: transparent; padding: 4px 12px; font-size: 0.85rem; font-weight: 600; color: var(--text-muted);
      cursor: pointer; border-radius: 4px; transition: all 0.2s;
    }
    .toggle-group button.active { background: rgba(16, 185, 129, 0.2); color: var(--accent-green); }

    /* ===== Main Panel ===== */
    .main-panel { flex: 1; padding: 30px 80px; overflow-y: auto; display: flex; justify-content: center; }
    .main-content-wrapper { width: 100%; max-width: 1000px; display: flex; flex-direction: column; gap: 30px; margin: 0 auto; }
    
    .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .card { background: var(--glass-bg); backdrop-filter: var(--glass-blur); padding: 24px; border-radius: 12px; box-shadow: var(--shadow-md); border: 1px solid var(--glass-border); border-top: 4px solid var(--border-hover); display: flex; flex-direction: column; justify-content: center; align-items: flex-start;}
    .card.highlight { border-top-color: var(--accent-green); background: rgba(16, 185, 129, 0.05); }
    .card h4 { font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .card h2 { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .card .emi-text { color: var(--accent-green); font-size: 2.2rem; text-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }

    /* ===== Visual Representation ===== */
    .chart-container { background: var(--glass-bg); backdrop-filter: var(--glass-blur); padding: 30px; border-radius: 12px; border: 1px solid var(--glass-border); box-shadow: var(--shadow-md); display: flex; align-items: center; justify-content: center; gap: 60px; }
    .donut-chart {
      width: 200px; height: 200px; border-radius: 50%;
      background: conic-gradient(var(--accent-green) 0% 70%, var(--accent-pink) 70% 100%);
      position: relative;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    .donut-chart::before {
      content: ""; position: absolute; top: 15%; left: 15%; right: 15%; bottom: 15%;
      background: var(--bg-secondary); border-radius: 50%;
    }
    
    .chart-legend { display: flex; flex-direction: column; gap: 20px; }
    .legend-item { display: flex; align-items: center; gap: 15px; }
    .color-box { width: 16px; height: 16px; border-radius: 4px; }
    .principal-color { background: var(--accent-green); box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
    .interest-color { background: var(--accent-pink); box-shadow: 0 0 10px rgba(236, 72, 153, 0.4); }
    .legend-text { display: flex; flex-direction: column; }
    .legend-text span { font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; }
    .legend-text strong { font-size: 1.2rem; color: var(--text-primary); font-weight: 800; }

    /* ===== Table ===== */
    .table-container { background: var(--glass-bg); backdrop-filter: var(--glass-blur); padding: 24px; border-radius: 12px; border: 1px solid var(--glass-border); box-shadow: var(--shadow-md); }
    .table-container h3 { margin: 0 0 20px 0; font-size: 1.1rem; color: var(--text-primary); }
    .table-wrapper { max-height: 400px; overflow-y: auto; border: 1px solid var(--glass-border); border-radius: 8px;}
    .table-wrapper::-webkit-scrollbar { width: 6px; }
    .table-wrapper::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
    .data-table { width: 100%; border-collapse: collapse; text-align: right; }
    .data-table th, .data-table td { padding: 12px 16px; border-bottom: 1px solid var(--glass-border); font-size: 0.9rem; }
    .data-table th { position: sticky; top: 0; background: rgba(30, 41, 59, 1); color: var(--text-muted); font-weight: 700; text-transform: uppercase; font-size: 0.8rem; z-index: 1;}
    .data-table th:first-child, .data-table td:first-child { text-align: left; }
    .data-table tbody tr { transition: background 0.2s; }
    .data-table tbody tr:hover { background: rgba(148, 163, 184, 0.05); }
    .td-positive { color: var(--accent-green); font-weight: 600; }
    .td-negative { color: var(--accent-pink); font-weight: 600; }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 900px) {
      .workspace { flex-direction: column; overflow-y: auto; }
      .sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--glass-border); flex-shrink: 0; }
      .main-panel { padding: 20px; flex: none; overflow: visible; }
      .chart-container { flex-direction: column; gap: 30px; }
    }
    @media (max-width: 600px) {
      .summary-cards { grid-template-columns: 1fr; }
      .editor-toolbar { padding: 12px; }
      .main-panel { padding: 16px 12px; }
      .donut-chart { width: 150px; height: 150px; }
    }
  `]
})
export class EmiCalculatorComponent implements OnInit {

  loanAmount: number = 1000000;
  interestRate: number = 8.5;
  loanTenure: number = 5;
  isYears: boolean = true;

  monthlyEMI: number = 0;
  totalInterest: number = 0;
  totalPayment: number = 0;

  amortizationSchedule: AmortizationRow[] = [];

  ngOnInit() {
    this.calculate();
  }

  setTenureType(years: boolean) {
    if (this.isYears === years) return;
    this.isYears = years;
    
    // Convert current tenure
    if (this.isYears) {
      this.loanTenure = Math.max(1, Math.round(this.loanTenure / 12));
    } else {
      this.loanTenure = this.loanTenure * 12;
    }
    this.calculate();
  }

  calculate() {
    let p = this.loanAmount;
    let r = this.interestRate / 12 / 100;
    let n = this.isYears ? this.loanTenure * 12 : this.loanTenure;

    if (p <= 0 || r <= 0 || n <= 0) {
      this.monthlyEMI = 0;
      this.totalInterest = 0;
      this.totalPayment = 0;
      this.amortizationSchedule = [];
      return;
    }

    // EMI Formula: P x R x (1+R)^N / [(1+R)^N-1]
    let emi = p * r * (Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    this.monthlyEMI = emi;
    this.totalPayment = emi * n;
    this.totalInterest = this.totalPayment - p;

    this.generateAmortizationSchedule(p, r, n, emi);
  }

  generateAmortizationSchedule(p: number, r: number, n: number, emi: number) {
    this.amortizationSchedule = [];
    let balance = p;

    for (let month = 1; month <= n; month++) {
      let interestForMonth = balance * r;
      let principalForMonth = emi - interestForMonth;
      
      balance -= principalForMonth;
      
      if (balance < 0) {
        balance = 0;
      }

      this.amortizationSchedule.push({
        month: month,
        principalPaid: principalForMonth,
        interestPaid: interestForMonth,
        totalPayment: emi,
        balance: balance
      });
    }
  }

  getPrincipalPercentage(): string {
    if (this.totalPayment === 0) return '0.0';
    return ((this.loanAmount / this.totalPayment) * 100).toFixed(1);
  }

  getInterestPercentage(): string {
    if (this.totalPayment === 0) return '0.0';
    return ((this.totalInterest / this.totalPayment) * 100).toFixed(1);
  }

  getConicGradient(): string {
    const principalPct = parseFloat(this.getPrincipalPercentage());
    return `conic-gradient(#10b981 0% ${principalPct}%, #f43f5e ${principalPct}% 100%)`;
  }
}
