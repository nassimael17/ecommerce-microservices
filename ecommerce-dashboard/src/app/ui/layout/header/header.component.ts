import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <header class="glass-header">
      <div class="search-bar">
        <mat-icon class="search-icon">search</mat-icon>
        <input type="text" placeholder="Search anything..." />
      </div>

      <div class="actions">
        <button mat-icon-button class="action-btn" matTooltip="Notifications" (click)="navigateTo('/app/notifications')">
          <mat-icon>notifications_none</mat-icon>
          <div class="notification-dot"></div>
        </button>
        
        <button mat-icon-button class="action-btn" matTooltip="Settings" (click)="navigateTo('/app/settings')">
          <mat-icon>settings</mat-icon>
        </button>

        <button mat-icon-button class="logout-btn" (click)="onLogout.emit()" matTooltip="Logout">
          <mat-icon>logout</mat-icon>
        </button>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      padding: 0 24px;
      margin-top: 24px;
    }

    .glass-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      background: var(--glass-bg);
      backdrop-filter: blur(10px);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .search-bar {
      display: flex;
      align-items: center;
      background: rgba(255,255,255,0.05);
      border-radius: var(--radius-md);
      padding: 8px 16px;
      width: 300px;
      border: 1px solid transparent;
      transition: all 0.2s;

      &:focus-within {
        border-color: var(--color-primary);
        background: rgba(255,255,255,0.08);
      }

      .search-icon { color: var(--color-text-muted); font-size: 20px; width: 20px; height: 20px; margin-right: 8px;}
      
      input {
        background: transparent;
        border: none;
        color: white;
        width: 100%;
        outline: none;
        font-family: var(--font-body);
        
        &::placeholder { color: rgba(255,255,255,0.3); }
      }
    }

    .actions {
      display: flex;
      gap: 8px;

      .action-btn {
        color: var(--color-text-muted);
        position: relative;
        &:hover { color: white; background: rgba(255,255,255,0.1); }
      }

      .notification-dot {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 8px;
        height: 8px;
        background: var(--color-secondary);
        border-radius: 50%;
        border: 2px solid var(--color-bg-surface);
      }

      .logout-btn {
        color: var(--color-danger);
        &:hover { background: rgba(255, 65, 65, 0.1); }
      }
    }
  `]
})
export class HeaderComponent {
  onLogout = output<void>();
  private router = inject(Router);

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
