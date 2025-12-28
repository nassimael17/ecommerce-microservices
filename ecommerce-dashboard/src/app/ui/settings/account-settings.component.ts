import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ClientsApi } from '../../api/clients.api';
import { AuthUser } from '../../core/auth/auth.models';

@Component({
  standalone: true,
  selector: 'app-account-settings',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  template: `
    <div class="settings-card glass-panel fade-in">
      <div class="card-header">
        <mat-icon>person</mat-icon>
        <h2>Account Settings</h2>
      </div>
      
      <div class="profile-section">
        <div class="avatar-large">{{ initials() }}</div>
        <div class="profile-meta">
          <h3>{{ userName() }}</h3>
          <p>{{ userEmail() }}</p>
        </div>
      </div>

      <form class="settings-form" (submit)="updateProfile($event)">
        <mat-form-field appearance="outline" class="custom-field">
          <mat-label>Full Name</mat-label>
          <input matInput [(ngModel)]="fullName" name="fullName" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="custom-field">
          <mat-label>Email Address</mat-label>
          <input matInput [(ngModel)]="email" name="email" required>
          <mat-hint>Caution: Changing email affects your login credentials.</mat-hint>
        </mat-form-field>

        <div class="action-row">
          <button mat-raised-button color="primary" type="submit" class="save-btn" [disabled]="!fullName || !email">
            Update Profile
          </button>
        </div>
      </form>
    </div>

    <div class="settings-card glass-panel fade-in" style="margin-top: 24px;">
      <div class="card-header danger">
        <mat-icon>security</mat-icon>
        <h2>Security & Privacy</h2>
      </div>
      <p class="section-desc">Manage your password and security credentials. Success will trigger a secure logout.</p>
      
      <button mat-stroked-button color="warn" class="security-btn" (click)="changePassword()">
        <mat-icon>vpn_key</mat-icon> Change Security Password
      </button>
    </div>
  `,
  styles: [`
    .settings-card {
      padding: 40px;
      border-radius: 24px;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
      
      mat-icon { color: var(--color-primary); font-size: 28px; width: 28px; height: 28px; }
      h2 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
      
      &.danger mat-icon { color: #f43f5e; }
    }

    .custom-field {
      width: 100%;
      margin-bottom: 8px;
      ::ng-deep {
        .mat-mdc-text-field-wrapper {
          background-color: rgba(0, 0, 0, 0.2) !important;
          border-radius: 12px !important;
        }
        .mdc-notched-outline__leading,
        .mdc-notched-outline__notch,
        .mdc-notched-outline__trailing {
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        input {
          color: white !important;
          font-weight: 500;
        }
        .mat-mdc-form-field-label {
          color: rgba(255, 255, 255, 0.85) !important;
        }
      }
    }

    .section-desc {
      opacity: 0.7;
      font-size: 14px;
      margin-bottom: 24px;
      line-height: 1.5;
    }

    .profile-section {
      display: flex;
      align-items: center;
      gap: 24px;
      padding-bottom: 32px;
      margin-bottom: 32px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .avatar-large {
      width: 90px;
      height: 90px;
      border-radius: 24px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      font-weight: 800;
      color: white;
      box-shadow: 0 12px 24px rgba(99, 102, 241, 0.3);
    }

    .profile-meta {
      h3 { margin: 0; font-size: 24px; font-weight: 700; }
      p { margin: 4px 0 0; opacity: 0.5; font-size: 14px; }
    }

    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 500px;
    }

    .save-btn {
      margin-top: 12px;
      padding: 0 32px;
      height: 50px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 15px;
      background: linear-gradient(135deg, var(--color-primary), #4f46e5) !important;
    }

    .security-btn {
      height: 48px;
      border-radius: 12px;
      padding: 0 24px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class AccountSettingsComponent {
  private auth = inject(AuthService);
  private clientsApi = inject(ClientsApi);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  fullName = this.auth.user()?.fullName || '';
  email = this.auth.user()?.email || '';

  userName = computed(() => this.auth.user()?.fullName || '');
  userEmail = computed(() => this.auth.user()?.email || '');
  initials = computed(() => (this.fullName || '??').substring(0, 2).toUpperCase());

  updateProfile(event: Event) {
    event.preventDefault();
    const user = this.auth.user();
    if (!user) return;

    // Handle standard users via API
    if (user.id !== undefined && user.id !== 0) {
      // ✅ Sanitize payload: Only send what the backend expects (ClientRequest)
      const payload = {
        fullName: this.fullName,
        email: this.email,
        phone: user.phone,
        address: user.address
      };

      this.clientsApi.update(user.id, payload as any).subscribe({
        next: (updated: any) => {
          const authUser: AuthUser = { ...user, fullName: updated.fullName, email: updated.email };
          this.auth.updateUser(authUser);
          this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('Failed to update profile. Server rejected the request.', 'Close', { duration: 3000 })
      });
    } else {
      // Handle simulated Admin locally
      const authUser: AuthUser = { ...user, fullName: this.fullName, email: this.email };
      this.auth.updateUser(authUser);
      this.snackBar.open('Admin profile updated (Simulated)', 'Close', { duration: 3000 });
    }
  }

  changePassword() {
    this.router.navigate(['/app/settings/change-password']);
  }
}
