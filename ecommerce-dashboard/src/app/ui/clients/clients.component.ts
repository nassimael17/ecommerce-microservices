import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientsApi } from '../../api/clients.api';
import { Client } from '../../api/api.models';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  selector: 'app-clients',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
   <div class="page-container fade-in">
     <div class="glass-panel header-panel">
       <div class="header-content">
         <h1>Clients</h1>
         <p>Manage your client database and relationships.</p>
       </div>
       <div class="actions">
         <button class="btn-icon" (click)="load()" title="Refresh">
           <span class="material-icons">refresh</span>
         </button>
       </div>
     </div>

     <div class="content-grid single-column">
       <!-- Clients List Panel -->
       <div class="glass-panel list-panel">
         <h2>Client Directory</h2>
         
         <div class="empty-state" *ngIf="items().length === 0">
           <div class="empty-icon">👥</div>
           <h3>No clients found</h3>
           <p>Clients will appear here once they register.</p>
         </div>

         <div class="clients-list" *ngIf="items().length > 0">
           <div class="client-item" *ngFor="let c of items()">
             <div class="client-avatar">
               {{ c.fullName.charAt(0).toUpperCase() }}
             </div>
             
             <div class="client-info">
               <div class="client-name">{{ c.fullName }}</div>
               <div class="client-email">{{ c.email }}</div>
             </div>

             <button class="btn-icon delete" (click)="remove(c)" title="Delete" [disabled]="!c.id">
               <span class="material-icons">delete_outline</span>
             </button>
           </div>
         </div>
       </div>
     </div>
   </div>
  `,
  styles: [`
    .page-container {
      padding: 0;
      max-width: 1200px;
      margin: 0 auto;
    }

    .glass-panel {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      padding: 24px;
    }

    .header-panel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      h1 { margin: 0; font-size: 24px; font-weight: 700; color: white; }
      p { margin: 4px 0 0; opacity: 0.6; font-size: 14px; }
    }

    .content-grid {
      display: grid;
      gap: 24px;
      &.two-columns {
        grid-template-columns: 350px 1fr;
        @media (max-width: 900px) { grid-template-columns: 1fr; }
      }
    }

    .form-panel {
      h2 { margin: 0 0 20px; font-size: 18px; display: flex; align-items: center; gap: 8px; }
      .form-grid { display: flex; flex-direction: column; gap: 16px; }
      .form-group {
        label { display: block; font-size: 12px; margin-bottom: 6px; opacity: 0.8; }
        input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          color: white;
          box-sizing: border-box;
          &:focus { outline: none; border-color: var(--color-primary); background: rgba(255,255,255,0.1); }
        }
      }
      .btn-primary {
        margin-top: 8px;
        padding: 12px;
        border-radius: 10px;
        background: var(--color-primary);
        color: white;
        border: none;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: all 0.2s;
        &:hover { filter: brightness(1.1); }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
      }
    }

    .clients-list { display: flex; flex-direction: column; gap: 12px; }

    .client-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 16px;
      background: rgba(255,255,255,0.03);
      transition: all 0.2s;
      &:hover { background: rgba(255,255,255,0.05); }
    }

    .client-avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--color-primary-gradient);
      color: white;
      display: grid;
      place-items: center;
      font-weight: 700;
      font-size: 18px;
    }

    .client-info { flex: 1; }
    .client-name { font-weight: 600; font-size: 15px; color: white; }
    .client-email { font-size: 13px; opacity: 0.6; }

    .btn-icon {
      background: rgba(255,255,255,0.05);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: all 0.2s;
      &:hover { background: rgba(255,255,255,0.1); }
      &.delete:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      opacity: 0.5;
      .empty-icon { font-size: 48px; margin-bottom: 12px; }
    }
  `]
})
export class ClientsComponent {
  items = signal<Client[]>([]);

  constructor(private api: ClientsApi) { this.load(); }

  load() {
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }

  remove(c: Client) {
    if (!c.id) return;
    if (confirm('Are you sure you want to delete this client?')) {
      this.api.delete(c.id).subscribe({ next: () => this.load() });
    }
  }
}
