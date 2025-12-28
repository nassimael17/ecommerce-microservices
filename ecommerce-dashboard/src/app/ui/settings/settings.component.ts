import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AccountSettingsComponent } from './account-settings.component';
import { AdminSettingsComponent } from './admin-settings.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-settings',
  imports: [CommonModule, MatTabsModule, MatIconModule, AccountSettingsComponent, AdminSettingsComponent],
  template: `
    <div class="page-container fade-in">
      <div class="glass-panel header-panel">
        <div class="header-content">
          <h1>Settings</h1>
          <p>Manage your account and system configurations.</p>
        </div>
      </div>
      
      <mat-tab-group class="settings-tabs">
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>person</mat-icon>
            <span>My Account</span>
          </ng-template>
          <div class="tab-content">
            <app-account-settings></app-account-settings>
          </div>
        </mat-tab>

        @if(isAdmin()) {
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Administration</span>
            </ng-template>
            <div class="tab-content">
              <app-admin-settings></app-admin-settings>
            </div>
          </mat-tab>
        }
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 0;
      max-width: 1000px;
      margin: 0 auto;
    }

    .glass-panel {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .header-panel {
      h1 { margin: 0; font-size: 24px; font-weight: 700; color: white; }
      p { margin: 4px 0 0; opacity: 0.6; font-size: 14px; }
    }

    .settings-tabs {
      ::ng-deep {
        .mat-mdc-tab-header { margin-bottom: 24px; }
        .mat-mdc-tab-labels { gap: 12px; }
        .mat-mdc-tab { 
          border-radius: 12px;
          min-width: 160px;
          color: rgba(255,255,255,0.5);
          
          &.mdc-tab--active { color: white; }
        }
        .mat-mdc-tab-label-content {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }
        .mat-mdc-tab-indicator-active-indicator {
          height: 3px;
          border-radius: 3px;
        }
      }
    }

    .tab-content {
      padding: 0 4px;
    }
  `]
})
export class SettingsComponent {
  private auth = inject(AuthService);
  isAdmin = computed(() => this.auth.hasRole(['ADMIN']));
}
