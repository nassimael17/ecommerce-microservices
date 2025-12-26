import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsApi } from '../../api/notifications.api';
import { NotificationMessage } from '../../api/api.models';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-notifications',
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
  <mat-card class="card">
    <div style="padding:16px; display:flex; align-items:center;">
      <h2 style="margin:0; flex:1 1 auto;">Notifications</h2>
      <button mat-button (click)="load()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucune notification (ou API non dispo).</div>

      <div *ngFor="let n of items()" style="padding:12px 0; border-top:1px solid #eee;">
        <div style="font-weight:600;">{{ n.subject ?? 'Notification' }}</div>
        <div style="opacity:.75;">{{ n.text ?? '' }}</div>
        <div style="font-size:12px; opacity:.6;">to={{ n.to ?? '—' }} | {{ n.createdAt ?? '' }}</div>
      </div>
    </div>
  </mat-card>
  `
})
export class NotificationsComponent {
  items = signal<NotificationMessage[]>([]);
  constructor(private api: NotificationsApi) { this.load(); }
  load() {
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }
}
