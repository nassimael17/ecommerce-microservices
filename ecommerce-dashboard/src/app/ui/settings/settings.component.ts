import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-settings',
    imports: [CommonModule],
    template: `
  <div class="page-container fade-in">
    <div class="glass-panel header-panel">
      <div class="header-content">
        <h1>Settings</h1>
        <p>Manage your account preferences.</p>
      </div>
    </div>
    
    <div class="glass-panel content-panel">
      <div class="empty-state">
        <div class="empty-icon">⚙️</div>
        <h3>Settings Coming Soon</h3>
        <p>We are working on adding more configuration options.</p>
      </div>
    </div>
  </div>
  `,
    styles: [`
    .page-container {
      padding: 0;
      max-width: 800px;
      margin: 0 auto;
    }

    .glass-panel {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .header-panel {
      display: flex;
      align-items: center;

      h1 { margin: 0; font-size: 24px; font-weight: 700; color: white; }
      p { margin: 4px 0 0; opacity: 0.6; font-size: 14px; }
    }
    
    .empty-state {
      text-align: center;
      padding: 60px;
      opacity: 0.5;
      
      .empty-icon { font-size: 48px; margin-bottom: 12px; }
    }
  `]
})
export class SettingsComponent { }
