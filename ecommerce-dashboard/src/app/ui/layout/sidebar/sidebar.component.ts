import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatListModule],
  template: `
    <div class="sidebar-container">
      <div class="logo-area">
        <div class="logo-icon">
          <mat-icon>shopping_bag</mat-icon>
        </div>
        <span class="logo-text">E-Shop<span class="dot">.</span></span>
      </div>

      <mat-nav-list class="nav-list">
        @for(item of menuItems(); track item.link) {
          <a mat-list-item 
             [routerLink]="item.link" 
             routerLinkActive="active-link"
             class="nav-item">
            <mat-icon class="nav-icon">{{item.icon}}</mat-icon>
            <span class="nav-label">{{item.label}}</span>
            @if(item.badge) {
              <span class="badge">{{item.badge}}</span>
            }
          </a>
        }
      </mat-nav-list>

      <div class="user-profile">
         <div class="avatar">{{ initials() }}</div>
         <div class="user-info">
           <span class="name">{{ userName() }}</span>
           <span class="role">{{ userRole() }}</span>
         </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 260px;
      padding: 16px;
      box-sizing: border-box;
    }

    .sidebar-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.03);
      border-right: 1px solid var(--glass-border);
      border-radius: 0 var(--radius-xl) var(--radius-xl) 0;
      overflow: hidden;
    }

    .logo-area {
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;

      .logo-icon {
        width: 40px;
        height: 40px;
        background: var(--color-primary);
        color: white;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(100, 50, 255, 0.3);

        mat-icon { font-size: 24px; width: 24px; height: 24px; }
      }

      .logo-text {
        font-family: var(--font-heading);
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.5px;
        
        .dot { color: var(--color-secondary); }
      }
    }

    .nav-list {
      flex: 1;
      padding: 0 12px;
    }

    .nav-item {
      margin-bottom: 8px;
      border-radius: 12px !important;
      transition: all 0.2s ease;
      color: var(--color-text-muted) !important;
      height: 48px !important;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--color-text-main) !important;
        transform: translateX(5px);
       
        .nav-icon { color: var(--color-secondary); }
      }

      &.active-link {
        background: linear-gradient(90deg, rgba(88, 28, 135, 0.2), transparent);
        border-left: 3px solid var(--color-secondary);
        color: var(--color-text-main) !important;

        .nav-icon { color: var(--color-secondary); }
      }

      .nav-icon {
        margin-right: 12px;
        transition: color 0.2s;
      }

      .nav-label {
        font-weight: 500;
        font-size: 15px;
      }
    }

    .user-profile {
      margin: 12px;
      padding: 16px;
      background: rgba(0,0,0,0.2);
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 12px;

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        
        .name { font-weight: 600; font-size: 14px; }
        .role { font-size: 12px; color: var(--color-text-muted); }
      }
    }
  `]
})
export class SidebarComponent {
  private auth = inject(AuthService);

  allItems = [
    { link: '/app/dashboard', icon: 'dashboard', label: 'Dashboard', roles: ['ADMIN', 'USER'] },
    { link: '/app/products', icon: 'inventory_2', label: 'Products', roles: ['ADMIN', 'USER'] },
    { link: '/app/orders', icon: 'shopping_cart', label: 'Orders', badge: '3', roles: ['ADMIN', 'USER'] },
    { link: '/app/payments', icon: 'payments', label: 'Payments', roles: ['ADMIN', 'USER'] },
    { link: '/app/clients', icon: 'group', label: 'Clients', roles: ['ADMIN'] }, // Admin only
    { link: '/app/notifications', icon: 'notifications', label: 'Notifications', roles: ['ADMIN'] }, // Admin only
    { link: '/app/settings', icon: 'settings', label: 'Settings', roles: ['ADMIN', 'USER'] },
  ];

  menuItems = computed(() => {
    const user = this.auth.user();
    if (!user) return [];
    return this.allItems.filter(i => this.auth.hasRole(i.roles as any));
  });

  userName = computed(() => this.auth.user()?.email.split('@')[0] || 'User');
  userRole = computed(() => this.auth.user()?.role || 'Guest');
  initials = computed(() => this.userName().substring(0, 2).toUpperCase());
}
