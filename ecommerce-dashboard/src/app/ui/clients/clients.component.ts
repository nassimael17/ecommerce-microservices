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
  <mat-card class="card">
    <div style="padding:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:end;">
      <h2 style="margin:0; flex:1 1 auto;">Clients</h2>

      <mat-form-field appearance="outline">
        <mat-label>Nom complet</mat-label>
        <input matInput [(ngModel)]="fullName">
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput [(ngModel)]="email">
      </mat-form-field>

      <button mat-raised-button (click)="add()">Ajouter</button>
      <button mat-button (click)="load()">Rafraîchir</button>
    </div>

    <div style="padding:0 16px 16px 16px;">
      <div *ngIf="items().length===0" style="opacity:.7;">Aucun client (ou API non dispo).</div>

      <div *ngFor="let c of items()" style="display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid #eee;">
        <div>
          <div style="font-weight:600;">{{ c.fullName }}</div>
          <div style="opacity:.7;">{{ c.email }}</div>
        </div>
        <button mat-stroked-button (click)="remove(c)" [disabled]="!c.id">Supprimer</button>
      </div>
    </div>
  </mat-card>
  `
})
export class ClientsComponent {
  items = signal<Client[]>([]);
  fullName = '';
  email = '';

  constructor(private api: ClientsApi) { this.load(); }

  load() {
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }

  add() {
    if (!this.fullName.trim() || !this.email.trim()) return;
    this.api.create({ fullName: this.fullName.trim(), email: this.email.trim() }).subscribe({
      next: () => { this.fullName=''; this.email=''; this.load(); }
    });
  }

  remove(c: Client) {
    if (!c.id) return;
    this.api.delete(c.id).subscribe({ next: () => this.load() });
  }
}
