import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { PaymentsApi } from '../../api/payments.api';
import { Payment } from '../../api/api.models';

@Component({
  standalone: true,
  selector: 'app-payments',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
  <div class="page-container fade-in">
    <div class="glass-panel header-panel">
      <div class="header-content">
        <h1>Payments</h1>
        <p>Process and track order payments securely.</p>
      </div>
      <div class="actions">
        <button class="btn-icon" (click)="load()" title="Refresh">
          <span class="material-icons">refresh</span>
        </button>
      </div>
    </div>

    <div class="content-grid">
      <!-- Payment Processor Card -->
      <div class="glass-panel processor-panel">
        <h2><span class="material-icons">credit_card</span> New Payment</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Order ID</label>
            <input type="number" [(ngModel)]="orderId" placeholder="#123">
          </div>
          <div class="form-group">
            <label>Amount (MAD)</label>
            <input type="number" [(ngModel)]="amount" placeholder="0.00">
          </div>
          <div class="form-group">
            <label>Method</label>
            <select [(ngModel)]="method">
              <option value="CARD">Credit Card</option>
              <option value="CASH">Cash on Delivery</option>
              <option value="TRANSFER">Bank Transfer</option>
            </select>
          </div>

          <!-- Card Details (Only if CARD) -->
          <div class="card-details-grid" *ngIf="method === 'CARD'">
            <div class="form-group full-width">
              <label>Cardholder Name</label>
              <input [(ngModel)]="ownerName" placeholder="John Doe">
            </div>
            
            <div class="form-group full-width">
              <label>Card Number</label>
              <input [(ngModel)]="cardNumber" placeholder="0000 0000 0000 0000" maxlength="19">
            </div>

            <div class="form-group">
              <label>Expiry Date</label>
              <input [(ngModel)]="expiryDate" placeholder="MM/YY" maxlength="5">
            </div>

            <div class="form-group">
              <label>CVV</label>
              <input [(ngModel)]="cvv" placeholder="123" maxlength="3">
            </div>
          </div>
          <button class="btn-primary" (click)="pay()">
            Process Payment
          </button>
        </div>
      </div>

      <!-- Recent Payments List -->
      <div class="glass-panel list-panel">
        <h2>Recent Transactions</h2>
        
        <div class="empty-state" *ngIf="items().length === 0">
          <div class="empty-icon">💸</div>
          <h3>No payments found</h3>
          <p>Processed payments will appear here.</p>
        </div>

        <div class="transactions-list" *ngIf="items().length > 0">
          <div class="transaction-item" *ngFor="let p of items()">
            <div class="tx-icon" [class.cash]="p.method==='CASH'">
              <span class="material-icons">{{ p.method === 'CASH' ? 'payments' : 'credit_score' }}</span>
            </div>
            <div class="tx-details">
              <span class="tx-order">Order #{{ p.orderId }}</span>
              <span class="tx-date">{{ p.createdAt | date:'short' }}</span>
            </div>
            <div class="tx-amount">
              {{ p.amount | currency:'MAD ':'symbol':'1.2-2' }}
            </div>
            <div class="tx-status status-badge success">
              {{ p.status }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .page-container {
      padding: 0;
      max-width: 1200px;
      margin: 0 auto;
    }

    .glass-panel {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      padding: 24px;
    }

    .header-panel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h1 { margin: 0; font-size: 24px; font-weight: 700; color: white; }
      p { margin: 4px 0 0; opacity: 0.6; font-size: 14px; }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 24px;
    }

    .processor-panel {
      h2 { margin: 0 0 20px; font-size: 18px; display: flex; align-items: center; gap: 8px; }
      
      .form-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-group {
        label { display: block; font-size: 12px; margin-bottom: 6px; opacity: 0.8; }
        
        input, select {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          color: white;
          box-sizing: border-box;

          &:focus {
            outline: none;
            border-color: var(--color-primary);
            background: rgba(255,255,255,0.1);
          }
        }
      }

      .card-details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 8px;
        padding-top: 16px;
        border-top: 1px solid var(--glass-border);

        .full-width { grid-column: 1 / -1; }
      }

      .btn-primary {
        margin-top: 8px;
        padding: 12px;
        border-radius: 10px;
        background: var(--color-primary);
        color: white;
        border: none;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: all 0.2s;
        
        &:hover { filter: brightness(1.1); }
      }
    }

    .list-panel {
      h2 { margin: 0 0 20px; font-size: 18px; }
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      opacity: 0.5;
      
      .empty-icon { font-size: 48px; margin-bottom: 12px; }
    }

    .transactions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      border-radius: 12px;
      background: rgba(255,255,255,0.03);
      border: 1px solid transparent;
      transition: all 0.2s;

      &:hover {
        background: rgba(255,255,255,0.05);
        border-color: var(--glass-border);
      }
    }

    .tx-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(99, 102, 241, 0.2);
      color: var(--color-primary);
      display: grid;
      place-items: center;
      
      &.cash { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    }

    .tx-details { flex: 1; display: flex; flex-direction: column; }
    .tx-order { font-weight: 600; font-size: 14px; }
    .tx-date { font-size: 12px; opacity: 0.6; }
    .tx-amount { font-weight: 700; font-size: 16px; }
    
    .status-badge {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 6px;
      background: rgba(255,255,255,0.1);
      
      &.success { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    }
    
    .btn-icon {
      background: rgba(255,255,255,0.1);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      display: grid;
      place-items: center;
      &:hover { background: rgba(255,255,255,0.2); }
    }
  `]
})
export class PaymentsComponent {
  items = signal<Payment[]>([]);
  orderId = 1;
  amount = 0;
  method = 'CARD';

  // Card fields
  cardNumber = '';
  cvv = '';
  expiryDate = '';
  ownerName = '';

  constructor(private api: PaymentsApi) { this.load(); }

  load() {
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }

  pay() {
    this.api.create({
      orderId: Number(this.orderId),
      amount: Number(this.amount),
      method: this.method,
      cardNumber: this.method === 'CARD' ? this.cardNumber : undefined,
      cvv: this.method === 'CARD' ? this.cvv : undefined,
      expiryDate: this.method === 'CARD' ? this.expiryDate : undefined,
      ownerName: this.method === 'CARD' ? this.ownerName : undefined
    }).subscribe({ next: () => this.load() });
  }
}
