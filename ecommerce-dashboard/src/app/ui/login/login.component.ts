import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
  <div style="height:100vh; display:grid; place-items:center;">
    <mat-card class="card" style="width:420px; padding:16px;">
      <h2 style="margin:0 0 12px 0;">Connexion</h2>
      <p style="margin:0 0 16px 0; opacity:.8;">Email + mot de passe (auth simulée pour le moment).</p>

      <mat-form-field appearance="outline" style="width:100%;">
        <mat-label>Email</mat-label>
        <input matInput [(ngModel)]="email" placeholder="admin@demo.com">
      </mat-form-field>

      <mat-form-field appearance="outline" style="width:100%;">
        <mat-label>Mot de passe</mat-label>
        <input matInput type="password" [(ngModel)]="password" placeholder="********">
      </mat-form-field>

      <button mat-raised-button style="width:100%; margin-top:8px;" (click)="doLogin()">Se connecter</button>

      <div style="margin-top:12px; font-size:12px; opacity:.75;">
        Astuce: si l'email contient <b>admin</b> ⇒ rôle ADMIN, sinon USER.
      </div>
    </mat-card>
  </div>
  `
})
export class LoginComponent {
  email = 'admin@demo.com';
  password = 'admin';

  constructor(private auth: AuthService, private router: Router) {}

  doLogin() {
    if (!this.email.trim()) return;
    this.auth.login({ email: this.email, password: this.password });
    this.router.navigateByUrl('/app/dashboard');
  }
}
