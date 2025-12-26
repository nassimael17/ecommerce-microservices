import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrdersApi } from '../../api/orders.api';
import { ClientsApi } from '../../api/clients.api';
import { ProductsApi } from '../../api/products.api';

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
  <mat-card class="card">
    <div style="padding:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
      <h2 style="margin:0; flex:1 1 auto;">Commandes</h2>

      <!-- ✅ Client dropdown (for UX) -->
      <mat-form-field appearance="outline" style="min-width:220px;">
        <mat-label>Client</mat-label>
        <mat-select [(ngModel)]="selectedClientId">
          <mat-option *ngFor="let c of clients()" [value]="c.id">
            {{ c.fullName }} ({{ c.email }}) - #{{ c.id }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <!-- ✅ Product dropdown -->
      <mat-form-field appearance="outline" style="min-width:260px;">
        <mat-label>Produit</mat-label>
        <mat-select [(ngModel)]="selectedProductId">
          <mat-option *ngFor="let p of products()" [value]="p.id">
            {{ p.name }} - {{ p.price }} MAD - Stock: {{ p.stock }} (#{{ p.id }})
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:140px;">
        <mat-label>Quantité</mat-label>
        <input matInput type="number" min="1" [(ngModel)]="quantity">
      </mat-form-field>

      <button mat-raised-button (click)="add()" [disabled]="!selectedProductId">Créer</button>
      <button mat-button (click)="reloadAll()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucune commande (ou API non dispo).</div>

      <div *ngFor="let o of items()" style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid #eee;">
        <div>
          <div style="font-weight:600;">Order #{{ o.id ?? '—' }}</div>
          <div style="opacity:.7;">
            productId={{ o.productId }}, qty={{ o.quantity }}, status={{ o.status ?? '—' }},
            total={{ o.totalPrice ?? '—' }}
          </div>
        </div>
        <button mat-stroked-button color="warn" (click)="remove(o)" [disabled]="!o.id">Delete</button>
      </div>
    </div>
  </mat-card>
  `
})
export class OrdersComponent {
  items = signal<Order[]>([]);
  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);

  selectedClientId: number | null = null;   // UX only for now
  selectedProductId: number | null = null;

  quantity = 1;

  constructor(
    private ordersApi: OrdersApi,
    private clientsApi: ClientsApi,
    private productsApi: ProductsApi
  ) {
    this.reloadAll();
  }

  reloadAll() {
    this.loadOrders();
    this.loadClients();
    this.loadProducts();
  }

  loadOrders() {
    this.ordersApi.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }

  loadClients() {
    this.clientsApi.list().subscribe({ next: v => {
      this.clients.set(v);
      if (this.selectedClientId == null && v.length) this.selectedClientId = v[0].id ?? null;
    }, error: () => this.clients.set([]) });
  }

  loadProducts() {
    this.productsApi.list().subscribe({ next: v => {
      this.products.set(v);
      if (this.selectedProductId == null && v.length) this.selectedProductId = v[0].id ?? null;
    }, error: () => this.products.set([]) });
  }

  add() {
    if (!this.selectedProductId) return;
    const pid = Number(this.selectedProductId);
    const qty = Number(this.quantity || 1);

    // ✅ backend expects query params
    this.ordersApi.create(pid, qty).subscribe({
      next: () => this.loadOrders(),
      error: (e) => {
        console.error(e);
        alert("Erreur création commande (voir console).");
      }
    });
  }

  remove(o: Order) {
    if (!o.id) return;
    this.ordersApi.delete(o.id).subscribe({ next: () => this.loadOrders() });
  }
}
