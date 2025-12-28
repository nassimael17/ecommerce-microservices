import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsApi } from '../../api/products.api';
import { Product } from '../../api/api.models';
import { AuthService } from '../../core/auth/auth.service';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
  <div class="page-container fade-in">
    <div class="glass-panel header-panel">
      <div class="header-content">
        <h1>Products</h1>
        <p>Manage your product inventory.</p>
      </div>
      <div class="actions">
        <button class="btn-icon" (click)="load()" title="Refresh">
          <span class="material-icons">refresh</span>
        </button>
      </div>
    </div>

    <div class="content-grid" [class.two-columns]="isAdmin()">
      <!-- Add Product Panel (Admin Only) -->
      <div class="glass-panel form-panel" *ngIf="isAdmin()">
        <h2><span class="material-icons">add_box</span> New Product</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Product Name</label>
            <input [(ngModel)]="name" placeholder="E.g. Wireless Headphones">
          </div>
          <div class="form-group">
            <label>Price (MAD)</label>
            <input type="number" [(ngModel)]="price" placeholder="0.00">
          </div>
          <button class="btn-primary" (click)="add()">
            Add Product
          </button>
        </div>
      </div>

      <!-- Product List Panel -->
      <div class="glass-panel list-panel">
        <h2>Inventory List</h2>

        <div class="empty-state" *ngIf="items().length === 0">
          <div class="empty-icon">📦</div>
          <h3>Inventory Empty</h3>
          <p>No products found. Add one to get started.</p>
        </div>

        <div class="inventory-list" *ngIf="items().length > 0">
          <div class="product-item" *ngFor="let p of items()">
            <div class="prod-icon">
              <span class="material-icons">inventory_2</span>
            </div>
            <div class="prod-details">
              <span class="prod-name">{{ p.name }}</span>
              <span class="prod-id">ID: #{{ p.id }}</span>
            </div>
            <div class="prod-price">
              {{ p.price }} MAD
            </div>
            <button class="btn-icon delete" (click)="remove(p)" title="Delete" *ngIf="isAdmin()">
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
      
      .form-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-group {
        label { display: block; font-size: 12px; margin-bottom: 6px; opacity: 0.8; }
        
        input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: white;
          box-sizing: border-box;

          &:focus {
            outline: none;
            border-color: var(--color-primary);
            background: rgba(255, 255, 255, 0.1);
          }
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
      }
    }

    .list-panel {
      h2 { margin: 0 0 20px; font-size: 18px; }
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      opacity: 0.5;
      
      .empty-icon { font-size: 48px; margin-bottom: 12px; }
    }

    .inventory-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .product-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid transparent;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--glass-border);
      }
    }

    .prod-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(139, 92, 246, 0.2);
      color: #a78bfa;
      display: grid;
      place-items: center;
    }

    .prod-details { flex: 1; display: flex; flex-direction: column; }
    .prod-name { font-weight: 600; font-size: 14px; }
    .prod-id { font-size: 12px; opacity: 0.6; }
    .prod-price { font-weight: 700; font-size: 16px; margin-right: 16px; }

    .btn-icon {
      background: rgba(255, 255, 255, 0.05);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: bg 0.2s;

      &:hover { background: rgba(255, 255, 255, 0.15); }
      
      &.delete:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    }
  `]
})
export class ProductsComponent {
  items = signal<Product[]>([]);
  name = '';
  price = 10;

  constructor(private api: ProductsApi, private auth: AuthService) { this.load(); }

  isAdmin() { return this.auth.hasRole(['ADMIN']); }

  load() {
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }

  add() {
    if (!this.name.trim()) return;
    this.api.create({ name: this.name.trim(), price: Number(this.price) }).subscribe({
      next: () => { this.name = ''; this.load(); }
    });
  }

  remove(p: Product) {
    if (!p.id) return;
    this.api.delete(p.id).subscribe({ next: () => this.load() });
  }
}
