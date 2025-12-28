import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
  <div class="login-container">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

    <div class="login-card glass-panel">
      <div class="logo-area">
        <div class="logo-icon">🛍️</div>
        <h1>E-Shop.</h1>
      </div>

      <p class="subtitle">Welcome back! Please login to your account.</p>

      <div class="form-group">
        <label>Email Address</label>
        <div class="input-wrapper">
          <input [(ngModel)]="email" placeholder="admin@demo.com" type="email">
        </div>
      </div>

      <div class="form-group">
        <label>Password</label>
        <div class="input-wrapper">
          <input [(ngModel)]="password" placeholder="••••••••" type="password">
        </div>
      </div>

      <button class="btn-primary" (click)="doLogin()">
        <span>Sign In</span>
        <span class="material-icons" style="font-size:18px;">arrow_forward</span>
      </button>

      <div class="footer-note">
        <p>Use <b>admin</b> in email for Admin access.</p>
        <p style="margin-top: 8px;">Don't have an account? <a [routerLink]="['/register']" style="color: var(--color-primary); cursor: pointer; text-decoration: none; font-weight: 600;">Sign Up</a></p>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: grid;
      place-items: center;
      position: relative;
      overflow: hidden;
      background: var(--color-bg-body);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 40px;
      border-radius: 24px;
      position: relative;
      z-index: 10;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }

    .logo-area {
      text-align: center;
      margin-bottom: 24px;

      .logo-icon {
        font-size: 48px;
        margin-bottom: 8px;
        filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
      }

      h1 {
        font-size: 32px;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .subtitle {
      text-align: center;
      color: var(--color-text-secondary);
      margin-bottom: 32px;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;

      label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-secondary);
        margin-bottom: 8px;
        margin-left: 4px;
      }

      .input-wrapper {
        position: relative;
        
        input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: white;
          font-family: inherit;
          transition: all 0.2s ease;
          box-sizing: border-box; /* Fix padding issue */

          &:focus {
            outline: none;
            border-color: var(--color-primary);
            background: rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          }
        }
      }
    }

    .btn-primary {
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      color: white;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-top: 12px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px -5px var(--color-primary);
      }
      
      &:active {
        transform: scale(0.98);
      }
    }

    .footer-note {
      text-align: center;
      margin-top: 24px;
      font-size: 12px;
      color: var(--color-text-secondary);
      opacity: 0.6;
    }

    /* Animated Background */
    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.4;
      z-index: 1;
      animation: float 10s infinite alternate;
    }

    .blob-1 {
      top: -10%;
      left: -10%;
      width: 600px;
      height: 600px;
      background: var(--color-primary);
      animation-delay: 0s;
    }
    
    .blob-2 {
      bottom: -10%;
      right: -10%;
      width: 500px;
      height: 500px;
      background: var(--color-secondary);
      animation-delay: -5s;
    }

    @keyframes float {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(50px, 50px) scale(1.1); }
    }
  `]
})
export class LoginComponent {
  email = 'admin@demo.com';
  password = 'admin';

  constructor(private auth: AuthService, private router: Router) { }

  doLogin() {
    if (!this.email.trim()) return;
    this.auth.login({ email: this.email, password: this.password }).subscribe(success => {
      if (success) {
        this.router.navigateByUrl('/app/dashboard');
      } else {
        alert('Invalid credentials');
      }
    });
  }
}
