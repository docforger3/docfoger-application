import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Member {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  payerId: string;
  splitType: 'equal' | 'exact' | 'percentage';
  details: { [memberId: string]: number }; // contains share or percentage
  date: string;
}

interface Group {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
}

interface Transaction {
  from: string;
  to: string;
  amount: number;
}

@Component({
  selector: 'app-split-expense',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="split-expense-page">
      <div class="container animate-fade-in">
        <header class="page-header">
          <div class="header-content">
            <a routerLink="/" class="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              <span>Back to Dashboard</span>
            </a>
            <h1 class="page-title">Split <span class="gradient-text">Expense</span></h1>
            <p class="page-subtitle">Fairly split bills and track balances with ease.</p>
          </div>
        </header>

        <div class="main-content">
          <!-- Sidebar: Groups -->
          <aside class="sidebar card">
            <div class="sidebar-header">
              <h3>Groups</h3>
              <button class="btn-icon" (click)="showNewGroupModal = true" title="Create New Group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                  <path d="M5 12h14m-7-7v14"/>
                </svg>
              </button>
            </div>
            
            <div class="groups-list">
              <div *ngIf="groups.length === 0" class="empty-list">No groups yet.</div>
              <button 
                *ngFor="let group of groups" 
                class="group-item" 
                [class.active]="selectedGroup?.id === group.id"
                (click)="selectGroup(group)">
                <span class="group-name">{{ group.name }}</span>
                <span class="member-count">{{ group.members.length }} members</span>
              </button>
            </div>
          </aside>

          <!-- Main View -->
          <div class="content-view">
            <div *ngIf="!selectedGroup" class="empty-state card animate-fade-in">
              <div class="empty-icon">💸</div>
              <h2>Select a Group</h2>
              <p>Choose a group from the sidebar or create a new one to start splitting expenses.</p>
              <button class="btn-primary" (click)="showNewGroupModal = true">Create New Group</button>
            </div>

            <div *ngIf="selectedGroup" class="group-details animate-fade-in">
              <div class="group-header card">
                <div class="header-info">
                  <h2>{{ selectedGroup.name }}</h2>
                  <div class="members-chips">
                    <span *ngFor="let m of selectedGroup.members" class="member-chip">{{ m.name }}</span>
                  </div>
                </div>
                <div class="header-actions">
                  <button class="btn-secondary" (click)="showHistory = !showHistory">
                    {{ showHistory ? 'View Balance' : 'View History' }}
                  </button>
                  <button class="btn-primary" (click)="openExpenseModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                      <path d="M5 12h14m-7-7v14"/>
                    </svg>
                    Add Expense
                  </button>
                </div>
              </div>

              <!-- Balance Summary & Settlements -->
              <div *ngIf="!showHistory" class="balance-view animate-fade-in">
                <div class="summary-grid">
                  <div class="card summary-card">
                    <span class="label">Total Group Expense</span>
                    <span class="value">{{ getTotalExpense() | currency:'INR' }}</span>
                  </div>
                  <div class="card summary-card" *ngFor="let balance of memberBalances">
                    <span class="label">{{ balance.name }}</span>
                    <span class="value" [class.negative]="balance.amount < 0" [class.positive]="balance.amount > 0">
                      {{ balance.amount === 0 ? 'Settled' : (balance.amount | currency:'INR') }}
                    </span>
                    <span class="status-desc">
                      {{ balance.amount < 0 ? 'owes' : (balance.amount > 0 ? 'is owed' : '') }}
                    </span>
                  </div>
                </div>

                <div class="settlements-section card animate-fade-in-up">
                  <div class="section-title">
                    <h3>Suggested Settlements</h3>
                    <span class="badge">Minimized Transactions</span>
                  </div>
                  
                  <div *ngIf="settlements.length === 0" class="no-settle">Everyone is even! 🎉</div>
                  
                  <div class="settlements-list">
                    <div *ngFor="let s of settlements" class="settlement-item">
                      <div class="settle-person from">
                        <span class="name">{{ s.from }}</span>
                        <span class="action">pays</span>
                      </div>
                      <div class="settle-amount">
                        <div class="arrow"></div>
                        <span class="price">{{ s.amount | currency:'INR' }}</span>
                      </div>
                      <div class="settle-person to">
                        <span class="name">{{ s.to }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- History View -->
              <div *ngIf="showHistory" class="history-view animate-fade-in">
                <div class="card history-card">
                  <h3>Expense History</h3>
                  <div class="expense-list">
                    <div *ngIf="selectedGroup.expenses.length === 0" class="empty-list">No expenses recorded.</div>
                    <div *ngFor="let ex of selectedGroup.expenses" class="expense-item">
                      <div class="ex-info">
                        <strong>{{ ex.description || 'No description' }}</strong>
                        <span>Paid by {{ getMemberName(ex.payerId) }} on {{ ex.date | date }}</span>
                      </div>
                      <div class="ex-amount">
                        <span class="price">{{ ex.amount | currency:'INR' }}</span>
                        <span class="type-tag">{{ ex.splitType }}</span>
                      </div>
                      <button class="btn-icon delete" (click)="deleteExpense(ex.id)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                          <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <div class="modal-overlay" *ngIf="showNewGroupModal" (click)="showNewGroupModal = false">
        <div class="modal card animate-zoom-in" (click)="$event.stopPropagation()">
          <h3>Create New Group</h3>
          <div class="form-group">
            <label>Group Name</label>
            <input type="text" [(ngModel)]="newGroupName" placeholder="e.g. Goa Trip 2024">
          </div>
          <div class="form-group">
            <label>Add Members (comma separated names)</label>
            <textarea [(ngModel)]="newGroupMembers" placeholder="e.g. John, Sarah, Mike" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="showNewGroupModal = false">Cancel</button>
            <button class="btn-primary" [disabled]="!newGroupName || !newGroupMembers" (click)="createGroup()">Create Group</button>
          </div>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="showExpenseModal" (click)="showExpenseModal = false">
        <div class="modal card animate-zoom-in" (click)="$event.stopPropagation()">
          <h3>Add Expense</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Amount (₹)</label>
              <input type="number" [(ngModel)]="exForm.amount" (input)="updateSplitDetails()">
            </div>
            <div class="form-group custom-dropdown-container">
              <label>Payer</label>
              <div class="custom-select" (click)="toggleDropdown($event)">
                <div class="selected-value">
                  {{ getMemberName(exForm.payerId) }}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
                <div class="options-list" *ngIf="showPayerDropdown">
                  <div 
                    *ngFor="let m of selectedGroup?.members" 
                    class="option-item" 
                    [class.selected]="m.id === exForm.payerId"
                    (click)="selectPayer(m.id, $event)">
                    {{ m.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <input type="text" [(ngModel)]="exForm.description" placeholder="e.g. Dinner at Thalassa">
          </div>
          <div class="form-group">
            <label>Split Type</label>
            <div class="split-toggle">
              <button [class.active]="exForm.splitType === 'equal'" (click)="setSplitType('equal')">Equal</button>
              <button [class.active]="exForm.splitType === 'exact'" (click)="setSplitType('exact')">Exact</button>
              <button [class.active]="exForm.splitType === 'percentage'" (click)="setSplitType('percentage')">% Split</button>
            </div>
          </div>

          <!-- Split Detail Editor -->
          <div class="split-details" *ngIf="selectedGroup">
            <div *ngFor="let m of selectedGroup.members" class="split-row">
              <label>{{ m.name }}</label>
              <div class="input-wrapper">
                <input 
                  type="number" 
                  [(ngModel)]="exForm.details[m.id]" 
                  [disabled]="exForm.splitType === 'equal'"
                  [placeholder]="exForm.splitType === 'percentage' ? '%' : '₹'">
                <span class="unit">{{ exForm.splitType === 'percentage' ? '%' : '₹' }}</span>
              </div>
            </div>
            
            <div class="split-warning" *ngIf="!isSplitValid()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ getSplitWarning() }}
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-secondary" (click)="showExpenseModal = false">Cancel</button>
            <button class="btn-primary" [disabled]="!isExpenseValid()" (click)="addExpense()">Add Expense</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .split-expense-page {
      padding: 40px 0;
      min-height: calc(100vh - 80px);
    }

    .page-header {
      margin-bottom: 30px;
    }

    .back-link {
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      margin-bottom: 15px;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: var(--accent-cyan);
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 5px;
    }

    .gradient-text {
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 1.1rem;
    }

    .main-content {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 30px;
    }

    .card {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }

    /* Sidebar */
    .sidebar {
      height: fit-content;
      position: sticky;
      top: 100px;
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .sidebar-header h3 {
      font-size: 1.2rem;
      font-weight: 700;
    }

    .groups-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .group-item {
      display: flex;
      flex-direction: column;
      text-align: left;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .group-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .group-item.active {
      background: rgba(6, 182, 212, 0.1);
      border-color: var(--accent-cyan);
    }

    .group-name {
      font-weight: 600;
      font-size: 1rem;
    }

    .member-count {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* Content View */
    .content-view {
      min-height: 500px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 80px 40px;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .empty-state h2 {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    .empty-state p {
      color: var(--text-secondary);
      max-width: 400px;
      margin-bottom: 30px;
    }

    /* Group Details */
    .group-details {
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
    }

    .header-info h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .members-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .member-chip {
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--glass-border);
      border-radius: 100px;
      font-size: 0.8rem;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    /* Summary Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 25px;
    }

    .summary-card {
      display: flex;
      flex-direction: column;
      padding: 16px 20px;
    }

    .summary-card .label {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 5px;
    }

    .summary-card .value {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .summary-card .status-desc {
      font-size: 0.75rem;
      margin-top: 2px;
      opacity: 0.8;
    }

    .positive { color: #10b981; }
    .negative { color: #f43f5e; }

    /* Settlements */
    .settlements-section h3 {
      font-size: 1.2rem;
      font-weight: 700;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      background: var(--accent-cyan);
      color: white;
      border-radius: 4px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .settlements-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
    }

    .settlement-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
    }

    .settle-person {
      display: flex;
      flex-direction: column;
    }

    .settle-person .name {
      font-weight: 700;
      font-size: 1rem;
    }

    .settle-person .action {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .settle-amount {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      margin: 0 15px;
    }

    .settle-amount .price {
      font-weight: 800;
      color: var(--accent-cyan);
      font-size: 1.1rem;
    }

    .arrow {
      height: 2px;
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
      position: relative;
      margin-bottom: 5px;
    }

    .arrow::after {
      content: '';
      position: absolute;
      right: 0;
      top: -4px;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-left: 8px solid rgba(255, 255, 255, 0.1);
    }

    /* History */
    .expense-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 15px;
    }

    .expense-item {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 14px 18px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: var(--radius-md);
    }

    .ex-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .ex-info strong {
      font-size: 1rem;
    }

    .ex-info span {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .ex-amount {
      display: flex;
      flex-direction: column;
      text-align: right;
    }

    .ex-amount .price {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--accent-cyan);
    }

    .type-tag {
      font-size: 0.7rem;
      opacity: 0.6;
      text-transform: capitalize;
    }

    /* Modals */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal {
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 40px;
      scrollbar-width: thin;
      scrollbar-color: rgba(6, 182, 212, 0.2) transparent;
    }

    .modal h3 {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 24px;
      color: var(--text-primary);
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text-secondary);
    }

    .form-group input, .form-group textarea {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      color: var(--text-primary);
      outline: none;
      transition: all 0.2s;
      font-size: 0.95rem;
    }

    /* Custom Select */
    .custom-dropdown-container {
      position: relative;
    }

    .custom-select {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      color: var(--text-primary);
      cursor: pointer;
      position: relative;
      transition: all 0.2s;
    }

    .selected-value {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.95rem;
    }

    .options-list {
      position: absolute;
      top: calc(100% + 5px);
      left: 0;
      right: 0;
      background: #1e293b;
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      z-index: 1001;
      max-height: 200px;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    }

    .option-item {
      padding: 12px 16px;
      transition: all 0.2s;
      font-size: 0.9rem;
    }

    .option-item:hover {
      background: rgba(6, 182, 212, 0.1);
      color: var(--accent-cyan);
    }

    .option-item.selected {
      background: var(--accent-cyan);
      color: white;
    }

    .form-group input:focus, .form-group textarea:focus, .custom-select:hover {
      border-color: var(--accent-cyan);
      background: rgba(255, 255, 255, 0.08);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    @media (max-width: 480px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 30px;
    }

    .split-toggle {
      display: flex;
      background: rgba(255, 255, 255, 0.05);
      padding: 4px;
      border-radius: var(--radius-md);
    }

    .split-toggle button {
      flex: 1;
      padding: 8px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .split-toggle button.active {
      background: var(--accent-cyan);
      color: white;
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
    }

    .split-details {
      margin-top: 15px;
      border-top: 1px solid var(--glass-border);
      padding-top: 15px;
    }

    .split-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }

    .split-row:last-child {
      border-bottom: none;
    }

    .split-row label {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      flex: 1;
      margin-right: 20px;
    }

    .input-wrapper {
      position: relative;
      width: 120px;
    }

    .input-wrapper input {
      padding: 10px 35px 10px 12px;
      text-align: right;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      width: 100%;
      outline: none;
    }

    .input-wrapper input:focus {
      border-color: var(--accent-cyan);
    }

    .input-wrapper input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: transparent;
    }

    .input-wrapper .unit {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.85rem;
      color: var(--accent-cyan);
      font-weight: 600;
      pointer-events: none;
    }

    .split-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: var(--accent-orange);
      background: rgba(245, 158, 11, 0.1);
      padding: 8px 12px;
      border-radius: 6px;
      margin-top: 15px;
    }

    .btn-icon.delete:hover {
      color: var(--accent-red);
      background: rgba(244, 63, 94, 0.1);
    }

    .empty-list {
      padding: 20px;
      text-align: center;
      color: var(--text-muted);
      font-style: italic;
    }

    @media (max-width: 800px) {
      .split-expense-page { padding: 20px 0; }
      .main-content {
        grid-template-columns: 1fr;
      }
      .sidebar {
        position: static;
        margin-bottom: 20px;
      }
      .page-title {
        font-size: 2rem;
      }
      .container { padding: 0 15px; }
      .modal { padding: 20px; }

      .group-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
      }

      .header-actions {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .header-actions button {
        width: 100%;
        justify-content: center;
        padding: 12px 8px;
        font-size: 0.9rem;
      }

      .members-chips {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 6px;
      }
    }

    @media (max-width: 480px) {
      .modal-actions {
        flex-direction: column-reverse;
      }
      .modal-actions button { width: 100%; }
      .split-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .input-wrapper { width: 100%; }
    }
  `]
})
export class SplitExpenseComponent implements OnInit {
  groups: Group[] = [];
  selectedGroup: Group | null = null;
  
  showNewGroupModal = false;
  newGroupName = '';
  newGroupMembers = '';

  showExpenseModal = false;
  showHistory = false;
  
  exForm: any = {
    description: '',
    amount: 0,
    payerId: '',
    splitType: 'equal',
    details: {}
  };

  memberBalances: { id: string, name: string, amount: number }[] = [];
  settlements: Transaction[] = [];

  showPayerDropdown = false;

  ngOnInit() {
    this.loadData();
    // Global click listener to close dropdown
    window.addEventListener('click', () => {
      this.showPayerDropdown = false;
    });
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.showPayerDropdown = !this.showPayerDropdown;
  }

  selectPayer(id: string, event: Event) {
    event.stopPropagation();
    this.exForm.payerId = id;
    this.showPayerDropdown = false;
  }

  loadData() {
    const saved = localStorage.getItem('split_expense_groups');
    if (saved) {
      this.groups = JSON.parse(saved);
    }
  }

  saveData() {
    localStorage.setItem('split_expense_groups', JSON.stringify(this.groups));
    this.calculateOverview();
  }

  createGroup() {
    const members: Member[] = this.newGroupMembers.split(',')
      .map(name => name.trim())
      .filter(name => !!name)
      .map(name => ({ id: Math.random().toString(36).substr(2, 9), name }));

    const newGroup: Group = {
      id: Math.random().toString(36).substr(2, 9),
      name: this.newGroupName,
      members,
      expenses: []
    };

    this.groups.push(newGroup);
    this.saveData();
    
    this.newGroupName = '';
    this.newGroupMembers = '';
    this.showNewGroupModal = false;
    this.selectGroup(newGroup);
  }

  selectGroup(group: Group) {
    this.selectedGroup = group;
    this.showHistory = false;
    this.calculateOverview();
  }

  openExpenseModal() {
    if (!this.selectedGroup) return;
    
    this.exForm = {
      description: '',
      amount: 0,
      payerId: this.selectedGroup.members[0]?.id,
      splitType: 'equal',
      details: {}
    };
    
    this.updateSplitDetails();
    this.showExpenseModal = true;
  }

  setSplitType(type: 'equal' | 'exact' | 'percentage') {
    this.exForm.splitType = type;
    this.updateSplitDetails();
  }

  updateSplitDetails() {
    if (!this.selectedGroup) return;
    
    const count = this.selectedGroup.members.length;
    this.selectedGroup.members.forEach(m => {
      if (this.exForm.splitType === 'equal') {
        this.exForm.details[m.id] = parseFloat((this.exForm.amount / count).toFixed(2));
      } else if (this.exForm.splitType === 'percentage' && !this.exForm.details[m.id]) {
        this.exForm.details[m.id] = 0;
      } else if (this.exForm.splitType === 'exact' && !this.exForm.details[m.id]) {
         this.exForm.details[m.id] = 0;
      }
    });
  }

  isSplitValid(): boolean {
    if (!this.selectedGroup) return false;
    if (this.exForm.splitType === 'equal') return true;
    
    const total = Object.values(this.exForm.details).reduce((sum: any, val: any) => sum + val, 0) as number;
    
    if (this.exForm.splitType === 'percentage') {
      return Math.abs(total - 100) < 0.01;
    } else {
      return Math.abs(total - this.exForm.amount) < 0.01;
    }
  }

  getSplitWarning(): string {
    const total = Object.values(this.exForm.details).reduce((sum: any, val: any) => sum + val, 0) as number;
    if (this.exForm.splitType === 'percentage') {
      return `Total is ${total}%. It must be 100%.`;
    } else {
      const diff = this.exForm.amount - total;
      return `Total split is ${total}. ${diff > 0 ? 'Short' : 'Over'} by ${Math.abs(diff)}.`;
    }
  }

  isExpenseValid(): boolean {
    return this.exForm.amount > 0 && !!this.exForm.payerId && this.isSplitValid();
  }

  addExpense() {
    if (!this.selectedGroup) return;

    const newEx: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      description: this.exForm.description,
      amount: this.exForm.amount,
      payerId: this.exForm.payerId,
      splitType: this.exForm.splitType,
      details: { ...this.exForm.details },
      date: new Date().toISOString()
    };

    this.selectedGroup.expenses.push(newEx);
    this.saveData();
    this.showExpenseModal = false;
  }

  deleteExpense(id: string) {
    if (!this.selectedGroup) return;
    this.selectedGroup.expenses = this.selectedGroup.expenses.filter(e => e.id !== id);
    this.saveData();
  }

  getMemberName(id: string): string {
    return this.selectedGroup?.members.find(m => m.id === id)?.name || 'Unknown';
  }

  getTotalExpense(): number {
    return this.selectedGroup?.expenses.reduce((sum, ex) => sum + ex.amount, 0) || 0;
  }

  calculateOverview() {
    if (!this.selectedGroup) return;

    const balances: { [id: string]: number } = {};
    this.selectedGroup.members.forEach(m => balances[m.id] = 0);

    this.selectedGroup.expenses.forEach(ex => {
      const payerId = ex.payerId;
      
      this.selectedGroup!.members.forEach(m => {
        let share = 0;
        if (ex.splitType === 'equal' || ex.splitType === 'exact') {
          share = ex.details[m.id] || 0;
        } else {
          share = (ex.amount * (ex.details[m.id] || 0)) / 100;
        }

        if (m.id === payerId) {
          balances[m.id] += (ex.amount - share);
        } else {
          balances[m.id] -= share;
        }
      });
    });

    this.memberBalances = this.selectedGroup.members.map(m => ({
      id: m.id,
      name: m.name,
      amount: parseFloat(balances[m.id].toFixed(2))
    }));

    this.calculateSettlements();
  }

  calculateSettlements() {
    this.settlements = [];
    
    // Greedy algorithm for transaction minimization
    let debtors = this.memberBalances.filter(b => b.amount < -0.01)
      .map(b => ({ ...b, amount: Math.abs(b.amount) }))
      .sort((a, b) => b.amount - a.amount);
      
    let creditors = this.memberBalances.filter(b => b.amount > 0.01)
      .sort((a, b) => b.amount - a.amount);

    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];
      
      const settlementAmount = Math.min(debtor.amount, creditor.amount);
      
      this.settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: parseFloat(settlementAmount.toFixed(2))
      });

      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;

      if (debtor.amount < 0.01) debtors.shift();
      if (creditor.amount < 0.01) creditors.shift();
      
      // Re-sort if needed (actually for greedy max it's mostly already fine, but safe)
      debtors.sort((a, b) => b.amount - a.amount);
      creditors.sort((a, b) => b.amount - a.amount);
    }
  }
}
