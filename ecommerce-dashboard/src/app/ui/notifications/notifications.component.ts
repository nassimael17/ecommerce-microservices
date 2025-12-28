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
  <div class="page-container fade-in">
    <div class="glass-panel header-panel">
      <div class="header-content">
        <h1>Notifications</h1>
        <p>Stay updated with your latest alerts.</p>
      </div>
      <div class="actions">
        <button class="btn-icon" (click)="load()" title="Refresh">
          <span class="material-icons">refresh</span>
        </button>
      </div>
    </div>

    <div class="glass-panel list-panel">
      <div class="empty-state" *ngIf="items().length === 0">
        <div class="empty-icon">🔔</div>
        <h3>No Notifications</h3>
        <p>You're all caught up!</p>
      </div>

      <div class="notification-list" *ngIf="items().length > 0">
        <div class="notification-item" *ngFor="let n of items()">
          <div class="notif-icon">
            <span class="material-icons">mail_outline</span>
          </div>
          <div class="notif-content">
            <div class="notif-header">
              <span class="subject">{{ n.subject || 'Notification' }}</span>
              <span class="date">{{ n.createdAt | date:'short' }}</span>
            </div>
            <p class="text">{{ n.text }}</p>
            <span class="recipient">To: {{ n.to || '—' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .page-container {
      padding: 0;
      max-width: 800px;
      margin: 0 auto;
    }

    .glass-panel {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .header-panel {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h1 { margin: 0; font-size: 24px; font-weight: 700; color: white; }
      p { margin: 4px 0 0; opacity: 0.6; font-size: 14px; }
    }

    .btn-icon {
      background: rgba(255, 255, 255, 0.05);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: bg 0.2s;

      &:hover { background: rgba(255, 255, 255, 0.15); }
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      opacity: 0.5;
      
      .empty-icon { font-size: 48px; margin-bottom: 12px; }
    }

    .notification-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .notification-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid transparent;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--glass-border);
      }
    }

    .notif-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }

    .notif-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .subject { font-weight: 600; font-size: 15px; }
      .date { font-size: 12px; opacity: 0.6; }
    }

    .text {
      margin: 0;
      font-size: 14px;
      opacity: 0.8;
      line-height: 1.4;
    }

    .recipient {
      font-size: 11px;
      opacity: 0.4;
      margin-top: 4px;
    }
  `]
})
export class NotificationsComponent {
  items = signal<NotificationMessage[]>([]);
  constructor(private api: NotificationsApi) { this.load(); }
  load() {
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }
}
