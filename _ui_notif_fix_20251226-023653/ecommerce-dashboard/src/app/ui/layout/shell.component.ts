import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [
    CommonModule,
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatIconModule, MatListModule, MatButtonModule
  ],
  template: `
  <mat-sidenav-container style="height:100vh">
    <mat-sidenav mode="side" opened>
      <div style="padding:16px; font-weight:700;">Ecommerce Admin</div>

      <mat-nav-list>
        <a mat-list-item routerLink="/app/dashboard" routerLinkActive="active">
          <mat-icon>dashboard</mat-icon>
          <span style="margin-left:8px;">Dashboard</span>
        </a>

        <a mat-list-item routerLink="/app/products" routerLinkActive="active">
          <mat-icon>inventory_2</mat-icon>
          <span style="margin-left:8px;">Produits</span>
        </a>

        <a mat-list-item routerLink="/app/orders" routerLinkActive="active">
          <mat-icon>shopping_cart</mat-icon>
          <span style="margin-left:8px;">Commandes</span>
        </a>

        <a mat-list-item routerLink="/app/clients" routerLinkActive="active">
          <mat-icon>group</mat-icon>
          <span style="margin-left:8px;">Clients</span>
        </a>

        <a mat-list-item routerLink="/app/notifications" routerLinkActive="active">
          <mat-icon>notifications</mat-icon>
          <span style="margin-left:8px;">Notifications</span>
        </a>
      </mat-nav-list>
    </mat-sidenav>

    <mat-sidenav-content>
      <mat-toolbar>
        <span style="font-weight:600;">{{ title() }}</span>
        <span style="flex:1 1 auto;"></span>

        <span style="margin-right:12px; opacity:.8;">{{ userEmail() }}</span>
        <button mat-raised-button (click)="logout()">Logout</button>
      </mat-toolbar>

      <div class="container">
        <router-outlet></router-outlet>
      </div>
    </mat-sidenav-content>
  </mat-sidenav-container>
  `,
  styles: [`.active{font-weight:600}`]
})
export class ShellComponent {
  constructor(private auth: AuthService) {}

  userEmail = computed(() => this.auth.user()?.email ?? '');
  title = computed(() => 'Microservices Dashboard');

  logout() { this.auth.logout(); location.href = '/login'; }
}
