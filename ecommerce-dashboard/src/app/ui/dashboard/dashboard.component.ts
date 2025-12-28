import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsApi } from '../../api/products.api';
import { OrdersApi } from '../../api/orders.api';
import { ClientsApi } from '../../api/clients.api';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="dashboard-header">
      <h1>Dashboard Overview</h1>
      <p>Welcome back, here's what's happening today.</p>
    </div>

    <div class="stats-grid">
      <!-- Products Card -->
      <div class="stat-card products-card">
        <div class="stat-icon">
          <mat-icon>inventory_2</mat-icon>
        </div>
        <div class="stat-content">
          <span class="stat-label">Total Products</span>
          <span class="stat-value">{{ productsCount() }}</span>
          <span class="stat-trend positive">+12% this week</span>
        </div>
      </div>

      <!-- Orders Card -->
      <div class="stat-card orders-card">
        <div class="stat-icon">
          <mat-icon>shopping_cart</mat-icon>
        </div>
        <div class="stat-content">
          <span class="stat-label">Total Orders</span>
          <span class="stat-value">{{ ordersCount() }}</span>
          <span class="stat-trend positive">+5% from yesterday</span>
        </div>
      </div>

      <!-- Clients Card -->
      <div class="stat-card clients-card">
        <div class="stat-icon">
          <mat-icon>group</mat-icon>
        </div>
        <div class="stat-content">
          <span class="stat-label">Active Clients</span>
          <span class="stat-value">{{ clientsCount() }}</span>
          <span class="stat-trend neutral">0% change</span>
        </div>
      </div>
    </div>

    <!-- Recent Activity Section (Placeholder) -->
    <div class="content-grid">
      <div class="panel large-panel">
        <div class="panel-header">
          <h3>Revenue Analytics</h3>
          <button class="icon-btn"><mat-icon>more_horiz</mat-icon></button>
        </div>
        <div class="chart-placeholder">
          <div class="bar" style="height: 60%"></div>
          <div class="bar" style="height: 80%"></div>
          <div class="bar" style="height: 40%"></div>
          <div class="bar" style="height: 90%"></div>
          <div class="bar" style="height: 50%"></div>
          <div class="bar" style="height: 75%"></div>
        </div>
      </div>

      <div class="panel side-panel">
        <div class="panel-header">
          <h3>Recent Orders</h3>
        </div>
        <div class="activity-list">
          <div class="activity-item">
            <div class="dot green"></div>
            <span>Order #1023 completed</span>
          </div>
          <div class="activity-item">
            <div class="dot orange"></div>
            <span>Payment pending for #1024</span>
          </div>
          <div class="activity-item">
            <div class="dot blue"></div>
            <span>New client registered</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .dashboard-header {
      h1 { font-size: 32px; font-weight: 700; color: white; margin: 0; }
      p { color: var(--color-text-muted); margin-top: 8px; }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .stat-card {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-xl);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: transform 0.2s;

      &:hover { transform: translateY(-4px); background: rgba(255,255,255,0.08); }

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        mat-icon { font-size: 28px; width: 28px; height: 28px; }
      }

      &.products-card .stat-icon { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
      &.orders-card .stat-icon { background: rgba(236, 72, 153, 0.2); color: #f472b6; }
      &.clients-card .stat-icon { background: rgba(16, 185, 129, 0.2); color: #34d399; }

      .stat-content {
        display: flex;
        flex-direction: column;
        
        .stat-label { color: var(--color-text-muted); font-size: 14px; }
        .stat-value { font-size: 28px; font-weight: 700; color: white; margin: 4px 0; }
        .stat-trend { font-size: 12px; font-weight: 500; }
        .stat-trend.positive { color: var(--color-accent); }
        .stat-trend.neutral { color: var(--color-text-muted); }
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      
      @media (max-width: 1000px) { grid-template-columns: 1fr; }
    }

    .panel {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-xl);
      padding: 24px;
      min-height: 300px;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      h3 { margin: 0; color: white; font-size: 18px; }
      .icon-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; }
    }

    .chart-placeholder {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      height: 200px;
      padding-top: 20px;
      
      .bar {
        flex: 1;
        background: linear-gradient(to top, var(--color-primary), var(--color-secondary));
        border-radius: 8px 8px 0 0;
        opacity: 0.8;
        transition: height 1s ease-out;
      }
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .activity-item {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--color-text-muted);
        font-size: 14px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.05);

        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.green { background: var(--color-accent); box-shadow: 0 0 8px var(--color-accent); }
        .dot.orange { background: #fbbf24; box-shadow: 0 0 8px #fbbf24; }
        .dot.blue { background: #60a5fa; box-shadow: 0 0 8px #60a5fa; }
      }
    }
  `]
})
export class DashboardComponent {
  productsCount = signal(0);
  ordersCount = signal(0);
  clientsCount = signal(0);

  constructor(products: ProductsApi, orders: OrdersApi, clients: ClientsApi) {
    products.list().subscribe({ next: v => this.productsCount.set(v.length), error: () => this.productsCount.set(0) });
    orders.list().subscribe({ next: v => this.ordersCount.set(v.length), error: () => this.ordersCount.set(0) });
    clients.list().subscribe({ next: v => this.clientsCount.set(v.length), error: () => this.clientsCount.set(0) });
  }
}
