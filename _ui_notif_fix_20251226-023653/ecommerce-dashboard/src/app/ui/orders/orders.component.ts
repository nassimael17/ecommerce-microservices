import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrdersApi } from '../../api/orders.api';
import { ClientsApi } from '../../api/clients.api';
import { ProductsApi } from '../../api/products.api';

import { Client, Order, Product } from '../../api/api.models';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
  <mat-card class="card">
    <div style="padding:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
      <h2 style="margin:0; flex:1 1 auto;">Commandes</h2>

      <mat-form-field appearance="outline" style="min-width:260px;">
        <mat-label>Client</mat-label>
        <mat-select [(ngModel)]="clientId">
          <ng-container *ngFor="let c of clients()">
            <mat-option [value]="c.id">{{ c.fullName }} — {{ c.email }} (id={{c.id}})</mat-option>
          </ng-container>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" style="min-width:260px;">
        <mat-label>Produit</mat-label>
        <mat-select [(ngModel)]="productId">
          <ng-container *ngFor="let p of products()">
            <mat-option [value]="p.id">{{ p.name }} — {{ p.price }} MAD (id={{p.id}})</mat-option>
          </ng-container>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:140px;">
        <mat-label>Quantité</mat-label>
        <input matInput type="number" min="1" [(ngModel)]="quantity">
      </mat-form-field>

      <button mat-raised-button (click)="create()" [disabled]="!clientId || !productId || quantity<1">Créer</button>
      <button mat-button (click)="refresh()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucune commande (ou API non dispo).</div>

      <div *ngFor="let o of items()" style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid #eee; gap:12px; align-items:center;">
        <div style="min-width:0;">
          <div style="font-weight:600;">Commande #{{ o.id }}</div>
          <div style="opacity:.75; font-size:13px;">
            clientId={{o.clientId}} • productId={{o.productId}} • qty={{o.quantity}} • status={{o.status}}
          </div>
        </div>

        <div style="display:flex; gap:8px;">
          <button mat-stroked-button (click)="ship(o)" [disabled]="!o.id">Marquer SHIPPED</button>
        </div>
      </div>
    </div>
  </mat-card>
  `,
})
export class OrdersComponent {
  private ordersApi = new OrdersApi();
  private clientsApi = new ClientsApi();
  private productsApi = new ProductsApi();

  items = signal<Order[]>([]);
  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);

  clientId: number | null = null;
  productId: number | null = null;
  quantity = 1;

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.ordersApi.list().subscribe({ next: (d) => this.items.set(d ?? []), error: () => this.items.set([]) });

    this.clientsApi.list().subscribe({
      next: (d) => {
        const list = d ?? [];
        this.clients.set(list);
        if (!this.clientId && list.length) this.clientId = list[0].id ?? null;
      },
      error: () => this.clients.set([]),
    });

    this.productsApi.list().subscribe({
      next: (d) => {
        const list = d ?? [];
        this.products.set(list);
        if (!this.productId && list.length) this.productId = list[0].id ?? null;
      },
      error: () => this.products.set([]),
    });
  }

  create() {
    if (!this.clientId || !this.productId) return;
    this.ordersApi.create({ clientId: Number(this.clientId), productId: Number(this.productId), quantity: Number(this.quantity) })
      .subscribe({ next: () => this.refresh() });
  }

  ship(o: Order) {
    if (!o.id) return;
    this.ordersApi.updateStatus(o.id, 'SHIPPED').subscribe({ next: () => this.refresh() });
  }
}
