import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent
  ],
  template: `
    <div class="app-layout">
      <aside class="sidebar-area">
        <app-sidebar></app-sidebar>
      </aside>

      <main class="main-content">
        <app-header (onLogout)="logout()"></app-header>
        
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Decorative Background Blobs -->
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .app-layout {
      display: flex;
      height: 100%;
      position: relative;
      background: var(--color-bg-body);
      z-index: 1;
    }

    .sidebar-area {
      width: 260px;
      flex-shrink: 0;
      z-index: 20;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 10;
      overflow: hidden;
    }

    .content-wrapper {
      flex: 1;
      overflow-y: auto;
      padding: 0; // Padding handled by child components or global .container
    }

    /* Decorative Blobs */
    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      transition: all 5s ease;
      opacity: 0.4;
      z-index: 0;
    }

    .blob-1 {
      top: -10%;
      left: -10%;
      width: 500px;
      height: 500px;
      background: var(--color-primary);
    }

    .blob-2 {
      bottom: -10%;
      right: -10%;
      width: 600px;
      height: 600px;
      background: var(--color-secondary);
    }
  `]
})
export class ShellComponent {
  constructor(private auth: AuthService) { }

  logout() {
    this.auth.logout();
    location.href = '/login';
  }
}
