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
  <mat-card class="card">
    <div style="padding:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
      <h2 style="margin:0; flex:1 1 auto;">Paiements</h2>

      <mat-form-field appearance="outline" style="width:140px;">
        <mat-label>Order ID</mat-label>
        <input matInput type="number" [(ngModel)]="orderId">
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:160px;">
        <mat-label>Amount</mat-label>
        <input matInput type="number" [(ngModel)]="amount">
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:180px;">
        <mat-label>Method</mat-label>
        <input matInput [(ngModel)]="method" placeholder="CARD / CASH">
      </mat-form-field>

      <button mat-raised-button (click)="pay()">Payer</button>
      <button mat-button (click)="load()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucun paiement.</div>

      <div *ngFor="let p of items()" style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid #eee;">
        <div>
          <div style="font-weight:600;">Payment #{{ p.id ?? '—' }} ({{ p.status ?? '—' }})</div>
          <div style="opacity:.7;">orderId={{ p.orderId }}, amount={{ p.amount }}, method={{ p.method }}, at={{ p.createdAt ?? '—' }}</div>
        </div>
      </div>
    </div>
  </mat-card>
  `
})
export class PaymentsComponent {
  items = signal<Payment[]>([]);
  orderId = 1;
  amount = 0;
  method = 'CARD';

  constructor(private api: PaymentsApi) { this.load(); }

  load() {
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }

  pay() {
    this.api.create({ orderId: Number(this.orderId), amount: Number(this.amount), method: this.method })
      .subscribe({ next: () => this.load() });
  }
}
