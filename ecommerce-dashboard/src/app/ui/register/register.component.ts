
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientsApi } from '../../api/clients.api';

@Component({
    standalone: true,
    selector: 'app-register',
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="login-container">
      <div class="glass-card fade-in">
        <div class="logo">
          <span class="material-icons">shopping_bag</span>
        </div>
        <h1>Create Account</h1>
        <p class="subtitle">Join E-Shop today</p>

        <div class="form-group">
          <label>Full Name</label>
          <input [(ngModel)]="fullName" placeholder="John Doe">
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <input [(ngModel)]="email" placeholder="name@company.com">
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" placeholder="••••••••">
        </div>

        <button class="btn-primary" (click)="register()">
          Create Account
          <span class="material-icons">arrow_forward</span>
        </button>

        <div class="footer">
          Already have an account? <a routerLink="/login">Sign in</a>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top right, #581c87, #0f172a);
    }

    .glass-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .logo {
      width: 64px;
      height: 64px;
      background: var(--color-primary);
      border-radius: 16px;
      margin: 0 auto 24px;
      display: grid;
      place-items: center;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);

      span { font-size: 32px; color: white; }
    }

    h1 {
      color: white;
      margin: 0 0 8px;
    }

    .subtitle {
      color: var(--color-text-muted);
      margin-bottom: 32px;
    }

    .form-group {
      margin-bottom: 20px;
      text-align: left;

      label {
        display: block;
        color: var(--color-text-muted);
        font-size: 14px;
        margin-bottom: 8px;
      }

      input {
        width: 100%;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        color: white;
        transition: all 0.2s;
        box-sizing: border-box;

        &:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--color-primary);
        }
      }
    }

    .btn-primary {
      width: 100%;
      padding: 14px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;

      &:hover {
        background: var(--color-primary-dark);
        transform: translateY(-1px);
      }
    }

    .footer {
      margin-top: 24px;
      color: var(--color-text-muted);
      font-size: 14px;

      a {
        color: var(--color-secondary);
        text-decoration: none;
        font-weight: 500;
        
        &:hover { text-decoration: underline; }
      }
    }
  `]
})
export class RegisterComponent {
    private router = inject(Router);
    private api = inject(ClientsApi);

    fullName = '';
    email = '';
    password = '';

    register() {
        if (!this.email || !this.password || !this.fullName) return;

        // In real app we would call register, which creates client AND logs them in.
        // Here we just create the client record.
        this.api.create({
            fullName: this.fullName,
            email: this.email,
            password: this.password
        }).subscribe({
            next: () => {
                // Redirect to login after successful registration
                this.router.navigate(['/login']);
            }
        });
    }
}
