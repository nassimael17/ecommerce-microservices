import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
    standalone: true,
    selector: 'app-admin-settings',
    imports: [CommonModule, MatButtonModule, MatIconModule, MatSlideToggleModule],
    template: `
    <div class="settings-card glass-panel fade-in">
      <div class="card-header">
        <mat-icon>admin_panel_settings</mat-icon>
        <h2>Admin Configurations</h2>
      </div>
      
      <p class="section-desc">Global system settings for the e-commerce platform.</p>

      <div class="settings-list">
        <div class="setting-item">
          <div class="setting-info">
            <span class="label">Maintenance Mode</span>
            <span class="desc">Disable all customer-facing operations.</span>
          </div>
          <mat-slide-toggle color="primary"></mat-slide-toggle>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="label">Auto-Confirm Orders</span>
            <span class="desc">Skip manual confirmation for new orders.</span>
          </div>
          <mat-slide-toggle color="primary" checked="true"></mat-slide-toggle>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="label">Email Notifications</span>
            <span class="desc">Global toggle for all outgoing emails.</span>
          </div>
          <mat-slide-toggle color="primary" checked="true"></mat-slide-toggle>
        </div>
      </div>

      <div class="action-row">
        <button mat-flat-button color="warn" class="system-btn">
          <mat-icon>restart_alt</mat-icon>
          Restart Microservices Cluster
        </button>
      </div>
    </div>

    <div class="settings-card glass-panel fade-in" style="margin-top: 24px;">
      <div class="card-header">
        <mat-icon>query_stats</mat-icon>
        <h2>System Health</h2>
      </div>
      
      <div class="health-grid">
        <div class="health-item UP">
          <span class="service">Order Service</span>
          <span class="status-dot"></span>
        </div>
        <div class="health-item UP">
          <span class="service">Product Service</span>
          <span class="status-dot"></span>
        </div>
        <div class="health-item UP">
          <span class="service">Payment Service</span>
          <span class="status-dot"></span>
        </div>
        <div class="health-item DOWN">
          <span class="service">Shipping Provider API</span>
          <span class="status-dot"></span>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .settings-card {
      padding: 32px;
      border-radius: 24px;
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(255,255,255,0.05);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      
      mat-icon { color: var(--color-secondary); }
      h2 { margin: 0; font-size: 20px; font-weight: 600; }
    }

    .section-desc {
      opacity: 0.5;
      font-size: 14px;
      margin-bottom: 32px;
    }

    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-bottom: 32px;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: rgba(255,255,255,0.03);
      border-radius: 16px;
      
      .setting-info {
        display: flex;
        flex-direction: column;
        
        .label { font-weight: 500; font-size: 16px; margin-bottom: 2px; }
        .desc { font-size: 13px; opacity: 0.5; }
      }
    }

    .action-row {
      border-top: 1px solid rgba(255,255,255,0.05);
      padding-top: 24px;
    }

    .system-btn {
      height: 48px;
      border-radius: 12px;
      font-weight: 600;
      gap: 8px;
      display: flex;
      align-items: center;
    }

    .health-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .health-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: rgba(0,0,0,0.2);
      border-radius: 12px;
      font-size: 14px;

      .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }

      &.UP .status-dot { background: #10b981; box-shadow: 0 0 10px #10b981; }
      &.DOWN .status-dot { background: #ef4444; box-shadow: 0 0 10px #ef4444; }
    }
  `]
})
export class AdminSettingsComponent { }
