import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsApi } from '../../api/products.api';
import { OrdersApi } from '../../api/orders.api';
import { ClientsApi } from '../../api/clients.api';

import { MatCardModule } from '@angular/material/card';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, MatCardModule],
  template: `
    <div style="display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:16px;">
      <mat-card class="card">
        <div style="padding:16px;">
          <div style="opacity:.7;">Produits</div>
          <div style="font-size:32px; font-weight:700;">{{ productsCount() }}</div>
        </div>
      </mat-card>

      <mat-card class="card">
        <div style="padding:16px;">
          <div style="opacity:.7;">Commandes</div>
          <div style="font-size:32px; font-weight:700;">{{ ordersCount() }}</div>
        </div>
      </mat-card>

      <mat-card class="card">
        <div style="padding:16px;">
          <div style="opacity:.7;">Clients</div>
          <div style="font-size:32px; font-weight:700;">{{ clientsCount() }}</div>
        </div>
      </mat-card>
    </div>
  `
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
