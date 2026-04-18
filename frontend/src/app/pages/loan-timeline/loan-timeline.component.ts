import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-loan-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="lth-page">

      <!-- Toolbar -->
      <div class="lth-toolbar">
        <div class="tb-left">
          <a routerLink="/" class="back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </a>
          <span class="tb-title">Loan <span class="accent">Timeline Hacker</span></span>
        </div>
        <div class="tb-badge">⚡ Skip EMI Years · Save Lakhs</div>
      </div>

      <div class="lth-body">

        <!-- LEFT: Inputs -->
        <div class="lth-left">
          <div class="glass-card inputs-card">
            <div class="card-head">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M3 9h18M9 21V9M15 21V9M21 3H3v18h18V3z"/>
              </svg>
              Your Loan Details
            </div>

            <div class="field-group">
              <label>Outstanding Loan Amount</label>
              <div class="input-wrap prefix-wrap">
                <span class="prefix">₹</span>
                <input type="number" [(ngModel)]="loanAmount" (ngModelChange)="calculate()" min="0" placeholder="e.g. 5000000" class="lth-input">
              </div>
              <span class="hint">{{ formatCrore(loanAmount) }}</span>
            </div>

            <div class="field-group">
              <label>Annual Interest Rate</label>
              <div class="input-wrap suffix-wrap">
                <input type="number" [(ngModel)]="interestRate" (ngModelChange)="calculate()" min="1" max="36" step="0.1" placeholder="e.g. 8.5" class="lth-input">
                <span class="suffix">%</span>
              </div>
            </div>

            <div class="field-group">
              <label>Remaining Tenure</label>
              <div class="input-wrap suffix-wrap">
                <input type="number" [(ngModel)]="remainingYears" (ngModelChange)="onTenureChange()" min="1" max="40" placeholder="e.g. 20" class="lth-input">
                <span class="suffix">yrs</span>
              </div>
            </div>

            <!-- Year Skip Slider -->
            <div class="slider-section" *ngIf="remainingYears > 1">
              <label class="slider-label">
                Years I want to <span class="accent-text">skip</span>
                <span class="skip-badge">{{ skipYears }} yr{{ skipYears !== 1 ? 's' : '' }}</span>
              </label>
              <input
                type="range"
                class="skip-slider"
                [min]="1"
                [max]="remainingYears - 1"
                [(ngModel)]="skipYears"
                (ngModelChange)="calculate()"
              >
              <div class="slider-labels">
                <span>1 yr</span>
                <span>{{ remainingYears - 1 }} yrs</span>
              </div>
            </div>

            <!-- Action Hint -->
            <div class="action-hint" *ngIf="result">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              Pay <strong>{{ formatINR(result.extraPerMonth) }}/month extra</strong> to finish {{ skipYears }} year{{ skipYears !== 1 ? 's' : '' }} early
            </div>
          </div>

          <!-- Standard EMI Card -->
          <div class="glass-card emi-display-card" *ngIf="result">
            <div class="emi-label">Standard EMI</div>
            <div class="emi-value">{{ formatINR(result.standardEmi) }}<span class="emi-per">/mo</span></div>
            <div class="emi-sub">{{ remainingYears }} years × 12 = {{ remainingYears * 12 }} EMIs</div>
          </div>
        </div>

        <!-- RIGHT: Results -->
        <div class="lth-right" *ngIf="result">

          <!-- Hero Result -->
          <div class="hero-result-card">
            <div class="hero-result-inner">
              <div class="hero-result-top">
                <div class="hero-icon">⏩</div>
                <div>
                  <div class="hero-label">To finish <strong>{{ skipYears }} year{{ skipYears !== 1 ? 's' : '' }} early</strong>, pay:</div>
                  <div class="hero-amount">{{ formatINR(result.newEmi) }}<span class="hero-per">/month</span></div>
                  <div class="hero-extra">+{{ formatINR(result.extraPerMonth) }} extra per month</div>
                </div>
              </div>
              <div class="hero-divider"></div>
              <div class="hero-result-bot">
                <div class="hero-stat">
                  <div class="hs-value green">{{ formatINR(result.interestSaved) }}</div>
                  <div class="hs-label">Interest Saved</div>
                </div>
                <div class="hero-stat">
                  <div class="hs-value cyan">{{ result.newPayoffDate }}</div>
                  <div class="hs-label">New Payoff Date</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Metrics Grid -->
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="mc-icon" style="background:rgba(245,158,11,0.12);color:#f59e0b">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div class="mc-body">
                <div class="mc-value">{{ formatINR(result.standardTotalInterest) }}</div>
                <div class="mc-label">Std Total Interest</div>
              </div>
            </div>

            <div class="metric-card">
              <div class="mc-icon" style="background:rgba(16,185,129,0.12);color:#10b981">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div class="mc-body">
                <div class="mc-value green">{{ formatINR(result.newTotalInterest) }}</div>
                <div class="mc-label">New Total Interest</div>
              </div>
            </div>

            <div class="metric-card">
              <div class="mc-icon" style="background:rgba(239,68,68,0.12);color:#ef4444">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-5"/></svg>
              </div>
              <div class="mc-body">
                <div class="mc-value red">{{ formatINR(result.costOfDelay) }}</div>
                <div class="mc-label">Cost of {{ skipYears }}-yr Delay</div>
              </div>
            </div>

            <div class="metric-card">
              <div class="mc-icon" style="background:rgba(139,92,246,0.12);color:#8b5cf6">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div class="mc-body">
                <div class="mc-value purple">{{ result.newTenureMonths }} months</div>
                <div class="mc-label">New Tenure</div>
              </div>
            </div>
          </div>

          <!-- Comparison Bar -->
          <div class="glass-card comparison-card">
            <div class="comp-title">Interest Comparison</div>
            <div class="comp-bar-wrap">
              <div class="comp-bar-label">
                <span>Standard</span>
                <span>{{ formatINR(result.standardTotalInterest) }}</span>
              </div>
              <div class="comp-bar-track">
                <div class="comp-bar-fill standard-fill" style="width:100%"></div>
              </div>
            </div>
            <div class="comp-bar-wrap">
              <div class="comp-bar-label">
                <span class="green">With Prepayment</span>
                <span class="green">{{ formatINR(result.newTotalInterest) }}</span>
              </div>
              <div class="comp-bar-track">
                <div class="comp-bar-fill new-fill" [style.width]="result.newInterestPct + '%'"></div>
              </div>
            </div>
            <div class="comp-savings-pill">
              You save {{ result.savingsPct.toFixed(1) }}% on total interest 🎉
            </div>
          </div>

          <!-- How It Works -->
          <div class="glass-card how-card">
            <div class="how-title">How It Works</div>
            <ol class="how-list">
              <li>Your standard EMI is calculated using the reducing balance method.</li>
              <li>We find the <strong>extra monthly payment</strong> needed so your loan closes {{ skipYears }} year{{ skipYears > 1 ? 's' : '' }} sooner.</li>
              <li>The difference in cumulative interest = your <strong>Interest Saved</strong>.</li>
              <li><strong>Cost of Delay</strong> = what you lose if you keep current EMI.</li>
            </ol>
          </div>

        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="!result">
          <div class="empty-icon">🏦</div>
          <div class="empty-title">Enter your loan details</div>
          <div class="empty-desc">Fill in the fields on the left and move the slider to see your Timeline Hack.</div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: calc(100vh - 80px); background: transparent; }

    /* ── Toolbar ── */
    .lth-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 28px; background: var(--bg-card);
      border-bottom: 1px solid var(--glass-border);
      backdrop-filter: var(--glass-blur); flex-shrink: 0; z-index: 10;
    }
    .tb-left { display: flex; align-items: center; gap: 14px; }
    .back-btn {
      width: 36px; height: 36px; border-radius: 8px; display: flex;
      align-items: center; justify-content: center; color: var(--text-muted);
      transition: all 0.2s; text-decoration: none; border: 1px solid transparent;
    }
    .back-btn:hover { color: var(--accent-cyan); background: rgba(6,182,212,0.1); border-color: var(--glass-border); }
    .tb-title { font-weight: 800; font-size: 1.2rem; color: var(--text-primary); }
    .accent { color: var(--accent-orange); }
    .tb-badge {
      font-size: 0.78rem; font-weight: 700; padding: 6px 14px; border-radius: 20px;
      background: rgba(245,158,11,0.1); color: var(--accent-orange);
      border: 1px solid rgba(245,158,11,0.2);
    }

    /* ── Layout ── */
    .lth-body {
      display: grid; grid-template-columns: 380px 1fr;
      gap: 24px; padding: 28px; max-width: 1200px; margin: 0 auto;
      align-items: start;
    }
    .lth-left { display: flex; flex-direction: column; gap: 16px; }
    .lth-right { display: flex; flex-direction: column; gap: 16px; }

    /* ── Glass card ── */
    .glass-card {
      background: var(--bg-card); border: 1px solid var(--glass-border);
      border-radius: 16px; padding: 24px; backdrop-filter: var(--glass-blur);
    }

    /* ── Inputs Card ── */
    .card-head {
      display: flex; align-items: center; gap: 10px; font-weight: 800;
      font-size: 1rem; color: var(--text-primary); margin-bottom: 22px;
      color: var(--accent-orange);
    }
    .field-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
    .field-group label { font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
    .input-wrap { display: flex; align-items: center; }
    .prefix-wrap .prefix {
      padding: 11px 14px; background: var(--bg-elevated); border: 1px solid var(--glass-border);
      border-right: none; border-radius: 8px 0 0 8px; color: var(--accent-orange); font-weight: 700;
    }
    .prefix-wrap .lth-input { border-radius: 0 8px 8px 0; }
    .suffix-wrap .suffix {
      padding: 11px 14px; background: var(--bg-elevated); border: 1px solid var(--glass-border);
      border-left: none; border-radius: 0 8px 8px 0; color: var(--text-secondary); font-weight: 700;
    }
    .suffix-wrap .lth-input { border-radius: 8px 0 0 8px; }
    .lth-input {
      flex: 1; padding: 11px 14px; border: 1px solid var(--glass-border); border-radius: 8px;
      background: var(--bg-input); color: var(--text-primary); font-size: 1rem;
      font-family: inherit; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .lth-input:focus { border-color: var(--accent-orange); box-shadow: 0 0 0 3px rgba(245,158,11,0.15); }
    .hint { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }

    /* Slider */
    .slider-section { margin-top: 6px; margin-bottom: 6px; }
    .slider-label {
      display: flex; align-items: center; justify-content: space-between;
      font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 12px;
    }
    .accent-text { color: var(--accent-orange); }
    .skip-badge {
      background: var(--accent-orange); color: #fff; font-size: 0.82rem;
      font-weight: 800; padding: 3px 10px; border-radius: 20px;
    }
    .skip-slider {
      width: 100%; height: 6px; -webkit-appearance: none; appearance: none;
      background: var(--glass-border); border-radius: 3px; outline: none; cursor: pointer;
    }
    .skip-slider::-webkit-slider-thumb {
      -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%;
      background: var(--accent-orange); border: 3px solid var(--bg-card);
      box-shadow: 0 0 8px rgba(245,158,11,0.5); cursor: pointer; transition: transform 0.15s;
    }
    .skip-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
    .slider-labels { display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-top: 6px; }

    .action-hint {
      display: flex; align-items: center; gap: 8px; margin-top: 16px;
      background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2);
      border-radius: 10px; padding: 12px 16px; font-size: 0.85rem; color: var(--text-secondary);
    }

    /* Standard EMI card */
    .emi-display-card { text-align: center; }
    .emi-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 6px; }
    .emi-value { font-size: 2rem; font-weight: 900; color: var(--text-primary); }
    .emi-per { font-size: 1rem; color: var(--text-muted); font-weight: 500; }
    .emi-sub { font-size: 0.82rem; color: var(--text-muted); margin-top: 4px; }

    /* ── Hero Result Card ── */
    .hero-result-card {
      background: linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(249,115,22,0.08) 100%);
      border: 1px solid rgba(245,158,11,0.3); border-radius: 18px; padding: 0; overflow: hidden;
    }
    .hero-result-inner { padding: 26px; }
    .hero-result-top { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
    .hero-icon { font-size: 2rem; }
    .hero-label { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 6px; }
    .hero-amount { font-size: 2.4rem; font-weight: 900; color: var(--accent-orange); line-height: 1; }
    .hero-per { font-size: 1rem; color: var(--text-secondary); font-weight: 500; }
    .hero-extra { font-size: 0.85rem; color: var(--text-muted); margin-top: 6px; }
    .hero-divider { height: 1px; background: rgba(245,158,11,0.2); margin-bottom: 20px; }
    .hero-result-bot { display: flex; gap: 32px; }
    .hero-stat {}
    .hs-value { font-size: 1.4rem; font-weight: 800; }
    .hs-label { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }

    /* ── Metrics Grid ── */
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .metric-card {
      display: flex; align-items: center; gap: 14px;
      background: var(--bg-card); border: 1px solid var(--glass-border);
      border-radius: 12px; padding: 16px;
    }
    .mc-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .mc-value { font-size: 1.05rem; font-weight: 800; color: var(--text-primary); }
    .mc-label { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }

    /* ── Comparison Bar ── */
    .comp-title { font-weight: 800; font-size: 0.95rem; margin-bottom: 16px; color: var(--text-primary); }
    .comp-bar-wrap { margin-bottom: 14px; }
    .comp-bar-label { display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 6px; color: var(--text-secondary); font-weight: 600; }
    .comp-bar-track { height: 10px; background: var(--bg-elevated); border-radius: 5px; overflow: hidden; }
    .comp-bar-fill { height: 100%; border-radius: 5px; transition: width 0.6s ease; }
    .standard-fill { background: rgba(148,163,184,0.4); }
    .new-fill { background: linear-gradient(90deg, #10b981, #059669); }
    .comp-savings-pill {
      margin-top: 12px; text-align: center; font-size: 0.85rem; font-weight: 700;
      color: #10b981; background: rgba(16,185,129,0.1); border-radius: 20px; padding: 8px 16px;
      border: 1px solid rgba(16,185,129,0.2);
    }

    /* How It Works */
    .how-title { font-weight: 800; font-size: 0.95rem; margin-bottom: 14px; color: var(--text-primary); }
    .how-list { padding-left: 18px; display: flex; flex-direction: column; gap: 8px; }
    .how-list li { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; }

    /* Color Utilities */
    .green { color: #10b981; }
    .cyan  { color: var(--accent-cyan); }
    .red   { color: #ef4444; }
    .purple { color: #8b5cf6; }

    /* Empty State */
    .empty-state {
      grid-column: 1 / -1; text-align: center; padding: 80px 20px;
      color: var(--text-muted);
    }
    .empty-icon { font-size: 4rem; margin-bottom: 16px; }
    .empty-title { font-size: 1.3rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px; }
    .empty-desc { font-size: 0.9rem; max-width: 340px; margin: 0 auto; }

    /* Responsive */
    @media (max-width: 900px) {
      .lth-body { grid-template-columns: 1fr; }
      .metrics-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 520px) {
      .lth-toolbar { padding: 10px 16px; flex-wrap: wrap; gap: 8px; }
      .lth-body { padding: 16px; gap: 16px; }
      .metrics-grid { grid-template-columns: 1fr; }
      .hero-amount { font-size: 1.8rem; }
      .hero-result-bot { flex-wrap: wrap; gap: 16px; }
      .tb-badge { display: none; }
    }
  `]
})
export class LoanTimelineComponent implements OnInit {

  // Inputs
  loanAmount   = 5000000;
  interestRate = 8.5;
  remainingYears = 20;
  skipYears    = 5;

  // Result
  result: LoanResult | null = null;

  ngOnInit() {
    this.calculate();
  }

  onTenureChange() {
    if (this.skipYears >= this.remainingYears) {
      this.skipYears = Math.max(1, this.remainingYears - 1);
    }
    this.calculate();
  }

  calculate() {
    if (!this.loanAmount || !this.interestRate || !this.remainingYears || !this.skipYears) {
      this.result = null;
      return;
    }

    const P  = this.loanAmount;
    const r  = this.interestRate / 12 / 100;   // monthly rate
    const N  = this.remainingYears * 12;        // total months standard
    const Ns = (this.remainingYears - this.skipYears) * 12; // new tenure months

    if (N <= 0 || Ns <= 0 || r <= 0) { this.result = null; return; }

    // Standard EMI
    const standardEmi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
    const standardTotal = standardEmi * N;
    const standardTotalInterest = standardTotal - P;

    // New (higher) EMI to repay same principal in fewer months
    const newEmi = (P * r * Math.pow(1 + r, Ns)) / (Math.pow(1 + r, Ns) - 1);
    const newTotal = newEmi * Ns;
    const newTotalInterest = newTotal - P;

    const interestSaved  = standardTotalInterest - newTotalInterest;
    const extraPerMonth  = newEmi - standardEmi;

    // Cost of delay = what you pay extra by NOT starting the prepayment
    const costOfDelay = interestSaved;

    // New payoff date
    const today = new Date();
    const payoffDate = new Date(today.getFullYear(), today.getMonth() + Ns, 1);
    const newPayoffDate = payoffDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

    // Comparison bar pct
    const newInterestPct = (newTotalInterest / standardTotalInterest) * 100;
    const savingsPct     = (interestSaved / standardTotalInterest) * 100;

    this.result = {
      standardEmi,
      newEmi,
      extraPerMonth,
      standardTotalInterest,
      newTotalInterest,
      interestSaved,
      costOfDelay,
      newPayoffDate,
      newInterestPct,
      savingsPct,
      newTenureMonths: Ns
    };
  }

  formatINR(val: number): string {
    if (!val && val !== 0) return '—';
    if (val >= 10000000) return '₹' + (val / 10000000).toFixed(2) + ' Cr';
    if (val >= 100000)   return '₹' + (val / 100000).toFixed(2) + ' L';
    if (val >= 1000)     return '₹' + (val / 1000).toFixed(1) + 'k';
    return '₹' + Math.round(val).toLocaleString('en-IN');
  }

  formatCrore(val: number): string {
    if (!val) return '';
    if (val >= 10000000) return (val / 10000000).toFixed(2) + ' Crore';
    if (val >= 100000)   return (val / 100000).toFixed(2) + ' Lakh';
    return val.toLocaleString('en-IN');
  }
}

interface LoanResult {
  standardEmi:           number;
  newEmi:                number;
  extraPerMonth:         number;
  standardTotalInterest: number;
  newTotalInterest:      number;
  interestSaved:         number;
  costOfDelay:           number;
  newPayoffDate:         string;
  newInterestPct:        number;
  savingsPct:            number;
  newTenureMonths:       number;
}
