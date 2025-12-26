import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersApi } from '../../api/orders.api';
import { Order } from '../../api/api.models';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
  <mat-card class="card">
    <div style="padding:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
      <h2 style="margin:0; flex:1 1 auto;">Commandes</h2>

      <mat-form-field appearance="outline">
        <mat-label>Client ID</mat-label>
        <input matInput type="number" [(ngModel)]="clientId">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Produit ID</mat-label>
        <input matInput type="number" [(ngModel)]="productId">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Quantité</mat-label>
        <input matInput type="number" [(ngModel)]="quantity">
      </mat-form-field>

      <button mat-raised-button (click)="add()">Créer</button>
      <button mat-button (click)="load()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucune commande (ou API non dispo).</div>

      <div *ngFor="let o of items()" style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid #eee;">
        <div>
          <div style="font-weight:600;">Order #{{ o.id ?? '—' }}</div>
          <div style="opacity:.7;">clientId={{ o.clientId }}, productId={{ o.productId }}, qty={{ o.quantity }}, status={{ o.status ?? '—' }}</div>
        </div>
        <button mat-stroked-button (click)="ship(o)" [disabled]="!o.id">Ship</button>
      </div>
    </div>
  </mat-card>
  `
})
export class OrdersComponent {
  items = signal<Order[]>([]);
  clientId = 1;
  productId = 1;
  quantity = 1;

  constructor(private api: OrdersApi) { this.load(); }

  load() {
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }

  add() {
    this.api.create({
      clientId: Number(this.clientId),
      productId: Number(this.productId),
      quantity: Number(this.quantity),
    }).subscribe({ next: () => this.load() });
  }

  ship(o: Order) {
    if (!o.id) return;
    this.api.updateStatus(o.id, 'SHIPPED').subscribe({ next: () => this.load() });
  }
}
