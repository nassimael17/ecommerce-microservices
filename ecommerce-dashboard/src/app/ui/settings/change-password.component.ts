import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ClientsApi } from '../../api/clients.api';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-change-password',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  template: `
    <div class="page-container fade-in">
      <div class="glass-panel security-panel">
        <div class="panel-header">
          <div class="icon-circle">
            <mat-icon>lock_open</mat-icon>
          </div>
          <h2>Access Recovery</h2>
          <p>Update your account credentials. You will be signed out immediately upon success for your security.</p>
        </div>

        <form class="password-form" (submit)="updatePassword($event)">
          <mat-form-field appearance="outline" class="custom-field">
            <mat-label>New Secure Password</mat-label>
            <input matInput type="password" [(ngModel)]="newPassword" name="newPassword" required placeholder="Min. 8 characters">
            <mat-icon matSuffix>key</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="custom-field">
            <mat-label>Confirm Password</mat-label>
            <input matInput type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required placeholder="Repeat new password">
            <mat-icon matSuffix>verified</mat-icon>
          </mat-form-field>

          <div class="alert-box" *ngIf="newPassword && confirmPassword && newPassword !== confirmPassword">
            <mat-icon>warning_amber</mat-icon>
            <span>The passwords you entered do not match.</span>
          </div>

          <div class="action-row">
            <button mat-button type="button" class="cancel-btn" (click)="goBack()">Discard</button>
            <button mat-raised-button color="primary" type="submit" class="submit-btn"
                    [disabled]="!newPassword || newPassword.length < 4 || newPassword !== confirmPassword">
              <mat-icon>logout</mat-icon> Update & Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container { height: 100%; display: grid; place-items: center; padding-top: 60px; }
    
    .security-panel {
      width: 100%;
      max-width: 480px;
      padding: 48px;
      border-radius: 32px;
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    }

    .panel-header {
      text-align: center;
      margin-bottom: 40px;
      .icon-circle {
        width: 72px; height: 72px; border-radius: 50%; background: rgba(99, 102, 241, 0.15);
        display: grid; place-items: center; margin: 0 auto 20px;
        mat-icon { font-size: 36px; width: 36px; height: 36px; color: var(--color-primary); }
      }
      h2 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
      p { margin: 12px 0 0; opacity: 0.6; font-size: 14px; line-height: 1.5; }
    }

    .password-form { display: flex; flex-direction: column; gap: 24px; }
    
    .custom-field {
      width: 100%;
      ::ng-deep {
        .mat-mdc-text-field-wrapper { background-color: rgba(0,0,0,0.2) !important; border-radius: 14px !important; }
        .mdc-notched-outline__leading, .mdc-notched-outline__notch, .mdc-notched-outline__trailing { border-color: rgba(255,255,255,0.1) !important; }
        input { color: white !important; }
        .mat-mdc-form-field-label { color: rgba(255,255,255,0.85) !important; }
      }
    }

    .alert-box {
      display: flex; align-items: center; gap: 10px;
      padding: 16px; border-radius: 12px;
      background: rgba(244, 63, 94, 0.1); color: #fb7185;
      font-size: 13px; font-weight: 600;
      mat-icon { font-size: 20px; }
    }

    .action-row {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 16px;
    }

    .submit-btn {
      height: 48px; padding: 0 24px; border-radius: 12px; font-weight: 700;
      background: linear-gradient(135deg, var(--color-primary), #4f46e5) !important;
    }

    .cancel-btn { color: rgba(255,255,255,0.5); font-weight: 600; }
  `]
})
export class ChangePasswordComponent {
  private api = inject(ClientsApi);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  newPassword = '';
  confirmPassword = '';

  updatePassword(event: Event) {
    event.preventDefault();
    const user = this.auth.user();
    if (!user) return;

    if (user.id !== undefined && user.id !== 0) {
      this.api.updatePassword(user.id, this.newPassword).subscribe({
        next: () => {
          this.snack.open('Security credentials updated. Signing out...', 'OK', { duration: 2000 });
          this.auth.logout();
          this.router.navigate(['/login'], { replaceUrl: true });
        },
        error: () => this.snack.open('Security update failed. Please try again.', 'OK', { duration: 3000 })
      });
    } else {
      // Simulate for Admin
      this.snack.open('Admin credentials updated (Simulated). Signing out...', 'OK', { duration: 2000 });
      this.auth.logout();
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  goBack() {
    this.router.navigate(['/app/settings']);
  }
}
