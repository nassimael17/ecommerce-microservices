import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PaymentsApi } from '../../api/payments.api';
import { OrdersApi } from '../../api/orders.api';
import { Payment, Order } from '../../api/api.models';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  selector: 'app-payments',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
  <mat-card class="card">
    <div style="padding:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
      <h2 style="margin:0; flex:1 1 auto;">Paiements</h2>

      <mat-form-field appearance="outline" style="min-width:260px;">
        <mat-label>Commande</mat-label>
        <mat-select [(ngModel)]="orderId">
          <ng-container *ngFor="let o of orders()">
            <mat-option [value]="o.id">Commande #{{o.id}} — status={{o.status}} (id={{o.id}})</mat-option>
          </ng-container>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:160px;">
        <mat-label>Montant</mat-label>
        <input matInput type="number" min="0" [(ngModel)]="amount">
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:160px;">
        <mat-label>Méthode</mat-label>
        <mat-select [(ngModel)]="method">
          <mat-option value="CARD">CARD</mat-option>
          <mat-option value="CASH">CASH</mat-option>
          <mat-option value="TRANSFER">TRANSFER</mat-option>
        </mat-select>
      </mat-form-field>

      <button mat-raised-button (click)="create()" [disabled]="!orderId || amount<=0">Créer</button>
      <button mat-button (click)="load()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucun paiement (ou API non dispo).</div>

      <div *ngFor="let p of items()" style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid #eee; gap:12px; align-items:center;">
        <div style="min-width:0;">
          <div style="font-weight:600;">Paiement #{{ p.id }}</div>
          <div style="opacity:.75; font-size:13px;">
            orderId={{p.orderId}} • {{p.amount}} • method={{p.method}} • status={{p.status}}
          </div>
        </div>
      </div>
    </div>
  </mat-card>
  `,
})
export class PaymentsComponent {
  private api = new PaymentsApi();
  private ordersApi = new OrdersApi();

  items = signal<Payment[]>([]);
  orders = signal<Order[]>([]);

  orderId: number | null = null;
  amount = 199.99;
  method = 'CARD';

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.list().subscribe({ next: (d) => this.items.set(d ?? []), error: () => this.items.set([]) });

    this.ordersApi.list().subscribe({
      next: (d) => {
        const list = d ?? [];
        this.orders.set(list);
        if (!this.orderId && list.length) this.orderId = list[0].id ?? null;
      },
      error: () => this.orders.set([]),
    });
  }

  create() {
    if (!this.orderId) return;
    this.api.create({ orderId: Number(this.orderId), amount: Number(this.amount), method: this.method })
      .subscribe({ next: () => this.load() });
  }
}
