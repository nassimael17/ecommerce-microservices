import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PaymentsApi } from '../../api/payments.api';
import { OrdersApi } from '../../api/orders.api';
import { ProductsApi } from '../../api/products.api';
import { AuthService } from '../../core/auth/auth.service';
import { Payment, Order, Product } from '../../api/api.models';

@Component({
  standalone: true,
  selector: 'app-payments',
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatSelectModule, MatMenuModule, MatSnackBarModule
  ],
  template: `
  <div class="page-container fade-in">
    <div class="glass-panel header-panel">
      <div class="header-content">
        <h1>{{ isAdmin() ? 'Payment Records' : 'My Payments' }}</h1>
        <p>{{ isAdmin() ? 'System-wide transaction monitoring.' : 'Settle your pending orders securely.' }}</p>
      </div>
      <div class="actions">
        <button class="btn-icon" (click)="load()" title="Refresh">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>
    </div>

    @if (isAdmin()) {
      <div class="glass-panel admin-msg">
        <mat-icon>security</mat-icon>
        <div>
          <h3>Admin Restricted View</h3>
          <p>Admins can view transaction history but cannot process payments here. Please use the Order Management panel to update order statuses.</p>
        </div>
      </div>
    }

    <div class="content-grid" [class.admin-grid]="isAdmin()">
      <!-- Payment Processor Card (Client ONLY) -->
      @if (!isAdmin()) {
        <div class="glass-panel processor-panel">
          <div class="panel-header">
            <mat-icon>payments</mat-icon>
            <h2>Checkout</h2>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Select Pending Order</label>
              <mat-form-field appearance="outline" class="custom-field">
                <mat-select [(ngModel)]="selectedOrderId" (selectionChange)="onOrderSelect($event.value)" placeholder="Select an order">
                  @for (o of myPendingOrders(); track o.id) {
                    <mat-option [value]="o.id">
                      Order #{{ o.id }} ({{ getProductName(o.productId) }}) - {{ o.totalPrice | currency:'MAD ':'symbol':'1.0-0' }}
                    </mat-option>
                  }
                  @if (myPendingOrders().length === 0) {
                    <mat-option disabled>No pending orders found</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            
            <div class="form-group">
              <label>Amount (MAD)</label>
              <input type="number" [(ngModel)]="amount" readonly placeholder="0.00" class="readonly-input">
            </div>

            <label class="section-label">Payment Method</label>
            <div class="method-cards">
              <div class="method-card" [class.active]="method === 'CARD'" (click)="method = 'CARD'">
                <mat-icon>credit_card</mat-icon>
                <span>Card</span>
              </div>
              <div class="method-card" [class.active]="method === 'CASH'" (click)="method = 'CASH'">
                <mat-icon>payments</mat-icon>
                <span>Cash</span>
              </div>
              <div class="method-card" [class.active]="method === 'TRANSFER'" (click)="method = 'TRANSFER'">
                <mat-icon>account_balance</mat-icon>
                <span>Bank</span>
              </div>
            </div>

            @if (method === 'CARD') {
              <div class="card-details-grid fade-in">
                <div class="form-group full-width">
                  <label>Cardholder Name</label>
                  <input [(ngModel)]="ownerName" placeholder="Full name on card">
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
            }

            <button class="btn-primary" (click)="pay()" [disabled]="amount <= 0 || !selectedOrderId">
              <mat-icon>lock</mat-icon>
              {{ method === 'CARD' ? 'Authorize Payment' : 'Confirm Order' }}
            </button>
          </div>
        </div>
      }

      <!-- Recent Payments List -->
      <div class="glass-panel list-panel">
        <div class="panel-header">
          <mat-icon>history</mat-icon>
          <h2>{{ isAdmin() ? 'All Transactions' : 'My History' }}</h2>
        </div>
        
        <div class="transactions-list" *ngIf="items().length > 0">
          <div class="transaction-item" *ngFor="let p of filteredItems()">
            <div class="tx-type-icon" [class.failed]="p.status === 'FAILED'">
              <mat-icon>{{ p.method === 'CASH' ? 'local_shipping' : (p.method === 'TRANSFER' ? 'account_balance' : 'credit_card') }}</mat-icon>
            </div>
            <div class="tx-info">
              <span class="order-id">Order #{{ p.orderId }} ({{ getOrder(p.orderId) ? getProductName(getOrder(p.orderId)!.productId) : '...' }})</span>
              <span class="tx-meta">{{ p.method }} • {{ p.createdAt | date:'MMM dd, HH:mm' }}</span>
            </div>
            <div class="tx-amount" [class.failed]="p.status === 'FAILED'">
              {{ p.amount | currency:'MAD ':'symbol':'1.2-2' }}
            </div>
            
            <div class="tx-actions">
              @if (getOrder(p.orderId); as o) {
                <div class="order-status-chip"
                     [class.confirmed]="o.status === 'CONFIRMED'"
                     [class.shipped]="o.status === 'SHIPPED'"
                     [class.delivered]="o.status === 'DELIVERED'"
                     [class.canceled]="o.status === 'CANCELED'">
                  {{ o.status }}
                </div>
              }

              <div class="status-chip" [class.success]="p.status === 'PAID'" [class.failed]="p.status === 'FAILED'">
                {{ getOrder(p.orderId)?.status || p.status }}
              </div>
              
              @if (isAdmin()) {
                @if (getOrder(p.orderId); as o) {
                  <button mat-icon-button [matMenuTriggerFor]="txMenu" color="primary" title="Manage Order & Payment">
                    <mat-icon>tune</mat-icon>
                  </button>
                <mat-menu #txMenu="matMenu" class="tx-context-menu luxury">
                  <div class="menu-header">Order Management</div>
                  <button mat-menu-item (click)="updateOrderStatus(o, 'CONFIRMED')">
                    <mat-icon color="primary">check_circle</mat-icon>
                    <span>Confirm Order</span>
                  </button>
                  <button mat-menu-item (click)="updateOrderStatus(o, 'SHIPPED')">
                    <mat-icon color="accent">local_shipping</mat-icon>
                    <span>Mark as Shipped</span>
                  </button>
                  <button mat-menu-item (click)="updateOrderStatus(o, 'DELIVERED')">
                    <mat-icon style="color: #10b981">verified</mat-icon>
                    <span>Mark as Delivered</span>
                  </button>
                  <button mat-menu-item (click)="updateOrderStatus(o, 'CANCELED')">
                    <mat-icon color="warn">cancel</mat-icon>
                    <span>Cancel Order</span>
                  </button>
                  
                  <div class="menu-divider"></div>
                  <div class="menu-header">Payment Control</div>
                  <button mat-menu-item (click)="toggleStatus(p)">
                    <mat-icon [color]="p.status === 'PAID' ? 'warn' : 'primary'">
                      {{ p.status === 'PAID' ? 'block' : 'account_balance_wallet' }}
                    </mat-icon>
                    <span>{{ p.status === 'PAID' ? 'Mark as FAILED' : 'Mark as PAID' }}</span>
                  </button>
                </mat-menu>
              }
            }
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .page-container { padding: 0; max-width: 1100px; margin: 0 auto; }
    .glass-panel { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 32px; }
    .header-panel { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: rgba(30, 41, 59, 0.6); 
      h1 { margin: 0; font-size: 26px; font-weight: 700; color: white; letter-spacing: -0.5px;}
      p { margin: 4px 0 0; opacity: 0.5; font-size: 14px; }
    }
    .admin-msg { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.2);
      mat-icon { font-size: 32px; width: 32px; height: 32px; color: var(--color-primary); }
      h3 { margin: 0; font-size: 16px; }
      p { margin: 4px 0 0; font-size: 13px; opacity: 0.7; }
    }
    .content-grid { display: grid; grid-template-columns: 420px 1fr; gap: 24px; align-items: start; }
    .admin-grid { grid-template-columns: 1fr; }
    .panel-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; mat-icon { color: var(--color-primary); } h2 { margin: 0; font-size: 18px; font-weight: 600; } }
    .form-grid { display: flex; flex-direction: column; gap: 20px; }
    .form-group { label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 8px; opacity: 0.7; } 
      input { width: 100%; padding: 12px 16px; border-radius: 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; box-sizing: border-box; 
        &:focus { outline: none; border-color: var(--color-primary); }
      }
      .readonly-input { background: rgba(255,255,255,0.05); color: var(--color-primary); font-weight: 700; border-style: dashed; }
    }
    .custom-field { width: 100%; }
    .method-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .method-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 16px 8px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; 
      mat-icon { font-size: 24px; opacity: 0.5; }
      span { font-size: 12px; font-weight: 600; opacity: 0.6; }
      &.active { background: rgba(99, 102, 241, 0.15); border-color: var(--color-primary); mat-icon { color: var(--color-primary); opacity: 1; } span { color: white; opacity: 1; } }
    }
    .card-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 20px; background: rgba(0,0,0,0.1); border-radius: 16px; .full-width { grid-column: 1 / -1; } }
    .btn-primary { height: 52px; border-radius: 14px; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: white; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
      &:disabled { opacity: 0.5; filter: grayscale(1); }
    }
    .transactions-list { display: flex; flex-direction: column; gap: 12px; }
    .transaction-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: rgba(255,255,255,0.02); border-radius: 20px; transition: background 0.2s; &:hover { background: rgba(255,255,255,0.04); } }
    .tx-type-icon { width: 44px; height: 44px; border-radius: 14px; background: rgba(99, 102, 241, 0.1); color: var(--color-primary); display: grid; place-items: center; &.failed { background: rgba(239, 68, 68, 0.1); color: #ef4444; } }
    .tx-info { flex: 1; .order-id { font-weight: 600; font-size: 15px; display: block; } .tx-meta { font-size: 12px; opacity: 0.5; } }
    .tx-amount { font-weight: 700; font-size: 16px; &.failed { color: #ef4444; text-decoration: line-through; } }
    .tx-actions { display: flex; align-items: center; gap: 12px; }
    .status-chip { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; &.success { background: rgba(16, 185, 129, 0.15); color: #10b981; } &.failed { background: rgba(239, 68, 68, 0.15); color: #ef4444; } }
    .order-status-chip { padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); 
      &.confirmed { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
      &.shipped { background: rgba(139, 92, 246, 0.2); color: #a78bfa; }
      &.delivered { background: rgba(16, 185, 129, 0.2); color: #34d399; }
      &.canceled { background: rgba(244, 63, 94, 0.2); color: #fb7185; }
    }
    .btn-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); color: white; cursor: pointer; display: grid; place-items: center; }

    ::ng-deep .tx-context-menu.luxury {
      background: rgba(30, 41, 59, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 8px 0;
      .menu-header { padding: 12px 16px 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--color-primary); letter-spacing: 1px; }
      .menu-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 8px 0; }
      .mat-mdc-menu-item {
        span { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.8); }
        &:hover { background: rgba(255,255,255,0.05); }
      }
    }
  `]
})
export class PaymentsComponent {
  private api = inject(PaymentsApi);
  private ordersApi = inject(OrdersApi);
  private apiProducts = inject(ProductsApi);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);

  items = signal<Payment[]>([]);
  myPendingOrders = signal<Order[]>([]);
  orders = signal<Order[]>([]);
  products = signal<Product[]>([]);

  isAdmin = computed(() => this.auth.hasRole(['ADMIN']));

  filteredItems = computed(() => this.items());

  getProductName(pid: number) {
    const list = this.products();
    const found = list.find(p => p.id === pid);
    return found?.name || 'Unknown Item';
  }

  selectedOrderId?: number;
  amount = 0;
  method = 'CARD';

  // Card fields
  cardNumber = '';
  cvv = '';
  expiryDate = '';
  ownerName = '';

  constructor() { this.load(); }

  load() {
    // 0. Load Products for naming
    this.apiProducts.list().subscribe(v => this.products.set(v));

    // 1. Load History
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });

    // 2. Load Orders for mapping
    this.ordersApi.list().subscribe(orders => {
      this.orders.set(orders);

      // 3. For Client: Filter pending orders for the checkout dropdown
      if (!this.isAdmin()) {
        const uid = this.auth.user()?.id;
        const pending = orders.filter(o => o.clientId === uid && o.status === 'PENDING');
        this.myPendingOrders.set(pending);
      }
    });
  }

  onOrderSelect(id: number) {
    const order = this.myPendingOrders().find(o => o.id === id);
    this.amount = order?.totalPrice || 0;
  }

  updateOrderStatus(order: Order, newStatus: string) {
    if (!order.id) return;
    this.ordersApi.updateStatus(order.id, newStatus).subscribe({
      next: () => {
        this.snack.open(`Order #${order.id} status updated to ${newStatus}`, 'OK', { duration: 2000 });
        this.load();
      },
      error: () => this.snack.open('Failed to update order status', 'OK', { duration: 3000 })
    });
  }

  toggleStatus(p: Payment) {
    const newStatus = p.status === 'PAID' ? 'FAILED' : 'PAID';

    if (this.auth.user()?.id !== 0) {
      this.api.updateStatus(p.id!, newStatus).subscribe({
        next: () => {
          this.snack.open(`Payment status updated to ${newStatus}`, 'OK', { duration: 2000 });
          this.load();
        },
        error: () => this.snack.open('Failed to update payment status', 'OK', { duration: 3000 })
      });
    } else {
      // Handle simulated Admin locally
      const items = this.items().map(item => item.id === p.id ? { ...item, status: newStatus } : item);
      this.items.set(items);
      this.snack.open(`Admin payment status toggled (Simulated)`, 'OK', { duration: 2000 });
    }
  }

  pay() {
    if (!this.selectedOrderId) return;

    this.api.create({
      orderId: this.selectedOrderId,
      amount: Number(this.amount),
      method: this.method,
      cardNumber: this.method === 'CARD' ? this.cardNumber : undefined,
      cvv: this.method === 'CARD' ? this.cvv : undefined,
      expiryDate: this.method === 'CARD' ? this.expiryDate : undefined,
      ownerName: this.method === 'CARD' ? this.ownerName : undefined
    }).subscribe({
      next: () => {
        this.snack.open('Payment processed successfully', 'OK', { duration: 3000 });
        this.load();
        this.selectedOrderId = undefined;
        this.amount = 0;
      },
      error: () => this.snack.open('Payment failed. Please check your card or balance.', 'OK', { duration: 3000 })
    });
  }
}

