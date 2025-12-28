import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrdersApi } from '../../api/orders.api';
import { ClientsApi } from '../../api/clients.api';
import { ProductsApi } from '../../api/products.api';
import { AuthService } from '../../core/auth/auth.service';

import { Order, Client, Product } from '../../api/api.models';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  template: `
   <div class="page-container fade-in">
     <div class="glass-panel header-panel">
       <div class="header-content">
         <h1>Orders</h1>
         <p>Manage client orders and subscriptions.</p>
       </div>
       <div class="actions">
         <button class="btn-icon" (click)="reloadAll()" title="Refresh">
           <span class="material-icons">refresh</span>
         </button>
       </div>
     </div>
 
     <div class="content-grid two-columns">
       <!-- Create Order Panel -->
       <div class="glass-panel form-panel">
         <h2><span class="material-icons">add_shopping_cart</span> New Order</h2>
         <div class="form-grid">
           
           <!-- Only show Client Select if Admin -->
           <div class="form-group" *ngIf="isAdmin()">
             <label>Select Client</label>
             <select [(ngModel)]="selectedClientId">
               <option [ngValue]="null" disabled>-- Choose Client --</option>
               <option *ngFor="let c of clients()" [value]="c.id">
                 {{ c.fullName }}
               </option>
             </select>
           </div>
 
           <div class="form-group">
             <label>Select Product</label>
             <select [(ngModel)]="selectedProductId">
               <option [ngValue]="null" disabled>-- Choose Product --</option>
               <option *ngFor="let p of products()" [value]="p.id">
                 {{ p.name }} ({{ p.price }} MAD)
               </option>
             </select>
           </div>
 
           <div class="form-group">
             <label>Quantity</label>
             <input type="number" min="1" [(ngModel)]="quantity">
           </div>
 
           <button class="btn-primary" (click)="add()" [disabled]="!selectedProductId || (!selectedClientId && isAdmin())">
             Create Order
           </button>
         </div>
       </div>
 
       <!-- Orders List Panel -->
       <div class="glass-panel list-panel">
         <h2>Active Orders</h2>
         
         <div class="empty-state" *ngIf="items().length === 0">
          <div class="empty-icon">LIST</div>
          <h3>No orders yet</h3>
          <p>Create an order to initiate the process.</p>
        </div>

        <div class="orders-list" *ngIf="items().length > 0">
          <div class="order-item" *ngFor="let o of items()">
            <div class="order-icon" [class.paid]="o.status==='PAID'" [class.failed]="o.status?.includes('FAILED')">
              <span class="material-icons">{{ o.status === 'PAID' ? 'check_circle' : 'pending' }}</span>
            </div>
            
            <div class="order-details">
              <div class="order-header">
                <span class="order-id">Order #{{ o.id }}</span>
                <span class="status-badge" 
                      [class.paid]="o.status==='PAID'" 
                      [class.confirmed]="o.status==='CONFIRMED'"
                      [class.shipped]="o.status==='SHIPPED'"
                      [class.delivered]="o.status==='DELIVERED'"
                      [class.failed]="o.status?.includes('FAILED')"
                      [class.canceled]="o.status==='CANCELED'">
                  {{ o.status }}
                </span>
              </div>
              <div class="order-meta">
                Product: {{ getProductName(o.productId) }} x {{ o.quantity }}
              </div>
              <div class="order-meta">
                Client: {{ getClientName(o.clientId) }}
              </div>
            </div>

            <div class="order-total">
               {{ o.totalPrice | currency:'MAD ':'symbol':'1.2-2' }}
            </div>
            
            
            <!-- Status Management Buttons (Admin Only) -->
            <div class="status-actions" *ngIf="isAdmin()">
              <button class="btn-status confirm" (click)="updateStatus(o, 'CONFIRMED')" 
                      *ngIf="o.status === 'PENDING'" title="Confirm Order">
                <span class="material-icons">check</span>
              </button>
              <button class="btn-status ship" (click)="updateStatus(o, 'SHIPPED')" 
                      *ngIf="o.status === 'CONFIRMED'" title="Ship Order">
                <span class="material-icons">local_shipping</span>
              </button>
              <button class="btn-status deliver" (click)="updateStatus(o, 'DELIVERED')" 
                      *ngIf="o.status === 'SHIPPED'" title="Mark as Delivered">
                <span class="material-icons">done_all</span>
              </button>
              <button class="btn-status cancel" (click)="updateStatus(o, 'CANCELED')" 
                      *ngIf="o.status !== 'CANCELED' && o.status !== 'DELIVERED'" title="Cancel Order">
                <span class="material-icons">cancel</span>
              </button>
            </div>
            <button class="btn-icon delete" (click)="remove(o)" title="Delete" *ngIf="isAdmin()">
              <span class="material-icons">delete_outline</span>
            </button>
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
       gap: 24px;
       
       &.two-columns {
         grid-template-columns: 350px 1fr;
         @media (max-width: 900px) { grid-template-columns: 1fr; }
       }
     }
 
     .form-panel {
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
 
           option { background: var(--color-bg-body); color: white; }
         }
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
         &:disabled { opacity: 0.5; cursor: not-allowed; }
       }
     }
 
     .list-panel {
       h2 { margin: 0 0 20px; font-size: 18px; }
     }
 
     .empty-state {
       text-align: center;
       padding: 40px;
       opacity: 0.5;
       .empty-icon { font-size: 32px; margin-bottom: 12px; font-weight: 700; opacity: 0.3; }
     }
 
     .orders-list {
       display: flex;
       flex-direction: column;
       gap: 12px;
     }
 
     .order-item {
       display: flex;
       align-items: center;
       gap: 16px;
       padding: 16px;
       border-radius: 16px;
       background: rgba(255,255,255,0.03);
       border: 1px solid transparent;
       transition: all 0.2s;
 
       &:hover {
         background: rgba(255,255,255,0.05);
         border-color: var(--glass-border);
       }
     }
 
     .order-icon {
       width: 48px;
       height: 48px;
       border-radius: 12px;
       background: rgba(255,255,255,0.1);
       color: white;
       display: grid;
       place-items: center;
 
       &.paid { background: rgba(16, 185, 129, 0.2); color: #10b981; }
       &.failed { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
     }
 
     .order-details { flex: 1; display: flex; flex-direction: column; gap: 4px; }
     
     .order-header {
       display: flex;
       align-items: center;
       gap: 12px;
     }
 
     .order-id { font-weight: 600; font-size: 14px; }
     
     .status-badge {
       font-size: 10px;
       padding: 2px 8px;
       border-radius: 12px;
       background: rgba(255,255,255,0.15);
       text-transform: uppercase;
       letter-spacing: 0.5px;
       
       &.paid { background: rgba(16, 185, 129, 0.2); color: #10b981; }
       &.failed { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
     }
 
     .order-meta { font-size: 13px; opacity: 0.7; }
     .order-total { font-weight: 700; font-size: 16px; margin-right: 16px; white-space: nowrap; }
 
     .btn-icon {
       background: rgba(255,255,255,0.05);
       border: none;
       color: white;
       width: 36px;
       height: 36px;
       border-radius: 8px;
       cursor: pointer;
       display: grid;
       place-items: center;
       transition: bg 0.2s;
 
       &:hover { background: rgba(255,255,255,0.15); }
       &.delete:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
     }

     .status-actions {
       display: flex;
       gap: 8px;
       margin-right: 8px;
     }

     .btn-status {
       background: rgba(255,255,255,0.05);
       border: none;
       color: white;
       width: 32px;
       height: 32px;
       border-radius: 6px;
       cursor: pointer;
       display: grid;
       place-items: center;
       transition: all 0.2s;

       &:hover { background: rgba(255,255,255,0.15); }
       &.confirm:hover { background: rgba(16, 185, 129, 0.2); color: #10b981; }
       &.ship:hover { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
       &.deliver:hover { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }
       &.cancel:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
       
       .material-icons { font-size: 18px; }
     }
  `]
})
export class OrdersComponent {
  items = signal<Order[]>([]);
  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);

  selectedClientId: number | null = null;
  selectedProductId: number | null = null;
  quantity = 1;

  constructor(
    private ordersApi: OrdersApi,
    private clientsApi: ClientsApi,
    private productsApi: ProductsApi,
    private auth: AuthService
  ) {
    this.reloadAll();
  }

  isAdmin() { return this.auth.hasRole(['ADMIN']); }

  reloadAll() {
    this.loadOrders();
    this.loadClients();
    this.loadProducts();
  }

  loadOrders() {
    this.ordersApi.list().subscribe({
      next: v => {
        if (this.isAdmin()) {
          this.items.set(v);
        } else {
          const uid = this.auth.user()?.id;
          this.items.set(v.filter(o => o.clientId === uid));
        }
      },
      error: () => this.items.set([])
    });
  }

  loadClients() {
    // Only load clients if admin, optimization
    if (!this.isAdmin()) return;

    this.clientsApi.list().subscribe({
      next: v => {
        this.clients.set(v);
        if (this.selectedClientId == null && v.length) this.selectedClientId = v[0].id ?? null;
      }, error: () => this.clients.set([])
    });
  }

  loadProducts() {
    this.productsApi.list().subscribe({
      next: v => {
        this.products.set(v);
        if (this.selectedProductId == null && v.length) this.selectedProductId = v[0].id ?? null;
      }, error: () => this.products.set([])
    });
  }

  add() {
    if (!this.selectedProductId) return;

    let cid = this.selectedClientId ? Number(this.selectedClientId) : null;

    // If not admin, force current user ID
    if (!this.isAdmin()) {
      cid = this.auth.user()?.id || null;
    }

    if (!cid) return; // Should not happen if logged in

    const pid = Number(this.selectedProductId);
    const qty = Number(this.quantity || 1);

    this.ordersApi.create(pid, qty, cid).subscribe({
      next: () => this.loadOrders(),
      error: (e) => {
        console.error(e);
        const msg = e.error?.message || 'Order creation failed. Check stock or logs.';
        alert(msg);
      }
    });
  }

  remove(o: Order) {
    if (!o.id) return;
    if (confirm('Delete this order?')) {
      this.ordersApi.delete(o.id).subscribe({ next: () => this.loadOrders() });
    }
  }

  getClientName(id?: number) {
    if (!id) return 'Unknown';
    // If filtering, we might not have list of all clients, so just show "You" or ID
    if (!this.isAdmin()) {
      const u = this.auth.user();
      return (u && u.id === id) ? 'You' : `Client #${id}`;
    }

    const c = this.clients().find(x => x.id === id);
    return c ? c.fullName : `Client #${id}`;
  }

  getProductName(id?: number) {
    if (!id) return 'Unknown';
    const p = this.products().find(x => x.id === id);
    return p ? p.name : `Product #${id}`;
  }

  updateStatus(order: Order, newStatus: string) {
    if (!order.id) return;

    this.ordersApi.updateStatus(order.id, newStatus).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (err) => {
        console.error('Failed to update order status:', err);
        alert('Failed to update order status');
      }
    });
  }
}
