import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsApi } from '../../api/products.api';
import { Product } from '../../api/api.models';

@Component({
  standalone: true,
  selector: 'app-admin-products',
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container fade-in">
      <div class="glass-panel header-panel">
        <div class="header-content">
          <h1>Product Management</h1>
          <p>Inventory control, pricing, and visual assets.</p>
        </div>
        <div class="actions">
          <button class="btn-primary" (click)="openAddModal()">
            <mat-icon>add</mat-icon> Add Product
          </button>
        </div>
      </div>

      <div class="products-grid">
        @for (p of items(); track p.id) {
          <div class="glass-panel product-card">
            <div class="product-image">
              @if (p.imageUrl) {
                <div class="image-placeholder">
                  <mat-icon>image</mat-icon>
                </div>
                <img [src]="p.imageUrl" 
                     [alt]="p.name"
                     onerror="this.style.display='none'; this.parentElement.querySelector('.image-placeholder').style.display='flex'">
              } @else {
                <div class="image-placeholder" style="display: flex">
                  <mat-icon>image</mat-icon>
                </div>
              }
              <div class="status-overlay" [class.out]="p.quantity <= 0">
                {{ p.quantity > 0 ? p.quantity + ' in stock' : 'Out of Stock' }}
              </div>
            </div>
            
            <div class="product-info">
              <div class="title-row">
                <h3>{{ p.name }}</h3>
                <span class="price">{{ p.price | currency:'MAD ':'symbol':'1.0-0' }}</span>
              </div>
              <p class="desc">{{ p.description }}</p>
              
              <div class="card-actions">
                <button mat-stroked-button color="primary" (click)="editProduct(p)">
                  <mat-icon>edit</mat-icon> Edit
                </button>
                <button mat-icon-button color="warn" (click)="deleteProduct(p)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Enhanced Admin Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-content glass-panel luxury" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ currentProduct.id ? 'Refine Product' : 'Enroll New Product' }}</h2>
            <button class="close-btn" (click)="closeModal()"><mat-icon>close</mat-icon></button>
          </div>
          
          <div class="modal-body">
            <!-- Left: Form -->
            <div class="form-container">
              <div class="form-section">
                <label><mat-icon>label</mat-icon> Basic Information</label>
                <div class="input-group">
                  <input [(ngModel)]="currentProduct.name" placeholder="Product Name">
                  <div class="dual-row">
                    <input type="number" [(ngModel)]="currentProduct.price" placeholder="Price (MAD)">
                    <input type="number" [(ngModel)]="currentProduct.quantity" placeholder="Stock">
                  </div>
                </div>
              </div>

              <div class="form-section">
                <label><mat-icon>image</mat-icon> Visual Identity (URL)</label>
                <input [(ngModel)]="currentProduct.imageUrl" 
                       placeholder="https://images.unsplash.com/..."
                       (ngModelChange)="onUrlChange()">
              </div>

              <div class="form-section">
                <label><mat-icon>description</mat-icon> Details</label>
                <textarea [(ngModel)]="currentProduct.description" rows="3" placeholder="Describe the product experience..."></textarea>
              </div>

              <div class="toggle-row">
                <span>Active Status</span>
                <mat-slide-toggle [(ngModel)]="currentProduct.available"></mat-slide-toggle>
              </div>
            </div>

            <!-- Right: Live Preview -->
            <div class="preview-container">
              <label>Live Display Preview</label>
              <div class="preview-box">
                @if (currentProduct.imageUrl) {
                  <div class="image-placeholder">
                    <mat-icon>image</mat-icon>
                  </div>
                  <img [src]="currentProduct.imageUrl" 
                       [alt]="currentProduct.name"
                       onerror="this.style.display='none'; this.parentElement.querySelector('.image-placeholder').style.display='flex'">
                } @else {
                  <div class="image-placeholder" style="display: flex">
                    <mat-icon>image</mat-icon>
                  </div>
                }
                <div class="preview-overlay">
                  <h4>{{ currentProduct.name || 'Product Title' }}</h4>
                  <span>{{ currentProduct.price || 0 }} MAD</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">Discard</button>
            <button class="btn-save" (click)="saveProduct()" 
                    [disabled]="!currentProduct.name || currentProduct.price <= 0">
              <mat-icon>check_circle</mat-icon> Commit Changes
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding-top: 20px; }
    
    .header-panel {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 40px; padding: 32px 40px;
      h1 { margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -1px; }
      p { margin: 6px 0 0; opacity: 0.5; font-size: 15px; }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 32px;
    }

    .product-card {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border-radius: 24px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255,255,255,0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      &:hover { transform: translateY(-8px); border-color: var(--color-primary); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    }

    .product-image {
      position: relative;
      height: 200px;
      overflow: hidden;
      background: rgba(0,0,0,0.3);
      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; position: relative; z-index: 2; }
      .product-card:hover img { transform: scale(1.05); }
      
      .image-placeholder {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        display: none; flex-direction: column; align-items: center; justify-content: center;
        background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
        z-index: 1;
        mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.1; color: white; }
      }
    }

    .status-overlay {
      position: absolute; top: 16px; left: 16px;
      padding: 6px 14px; border-radius: 12px;
      background: rgba(16, 185, 129, 0.9);
      color: white; font-size: 11px; font-weight: 800; text-transform: uppercase;
      &.out { background: rgba(244, 63, 94, 0.9); }
    }

    .product-info {
      padding: 24px; flex: 1; display: flex; flex-direction: column;
    }

    .title-row {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 14px;
      h3 { margin: 0; font-size: 20px; font-weight: 700; }
      .price { color: var(--color-primary); font-weight: 800; font-size: 18px; }
    }

    .desc { font-size: 14px; opacity: 0.6; line-height: 1.6; margin-bottom: 24px; flex: 1; }

    .card-actions { display: flex; justify-content: space-between; align-items: center; }

    .btn-primary {
      background: linear-gradient(135deg, var(--color-primary), #4f46e5); 
      color: white; border: none; font-size: 15px;
      padding: 12px 24px; border-radius: 16px; cursor: pointer;
      display: flex; align-items: center; gap: 10px; font-weight: 700;
      transition: all 0.2s;
      &:hover { transform: scale(1.02); filter: brightness(1.1); }
    }

    /* Enhanced Modal */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
      display: grid; place-items: center; z-index: 2000;
    }

    .modal-content.luxury {
      width: 850px;
      padding: 0;
      overflow: hidden;
      display: flex; flex-direction: column;
    }

    .modal-header {
      padding: 24px 32px; border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex; justify-content: space-between; align-items: center;
      h2 { margin: 0; font-size: 24px; font-weight: 800; }
      .close-btn { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; &:hover { color: white; } }
    }

    .modal-body {
      display: grid; grid-template-columns: 1fr 300px; gap: 40px; padding: 32px;
    }

    .form-container { display: flex; flex-direction: column; gap: 24px; }
    
    .form-section {
      label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; margin-bottom: 12px; color: var(--color-primary); }
      input, textarea {
        width: 100%; border-radius: 12px; padding: 14px; background: rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.1); color: white; font-family: inherit;
        &:focus { outline: none; border-color: var(--color-primary); background: rgba(0,0,0,0.5); }
      }
      .dual-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
    }

    .toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 12px; span { font-weight: 600; } }

    .preview-container {
      label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 12px; opacity: 0.5; }
    }

    .preview-box {
      width: 100%; height: 350px; border-radius: 20px; overflow: hidden; position: relative;
      background: rgba(0,0,0,0.4); border: 2px dashed rgba(255,255,255,0.1);
      img { width: 100%; height: 100%; object-fit: cover; }
      .preview-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); h4 { margin: 0; } span { font-size: 14px; font-weight: 700; color: var(--color-primary); } }
    }

    .modal-footer {
      padding: 24px 32px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.08);
      display: flex; justify-content: flex-end; gap: 16px;
      .btn-cancel { background: none; border: none; color: white; opacity: 0.5; font-weight: 600; cursor: pointer; &:hover { opacity: 1; } }
      .btn-save { background: var(--color-primary); color: white; border: none; padding: 12px 32px; border-radius: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; &:hover { filter: brightness(1.2); } &:disabled { opacity: 0.5; cursor: not-allowed; } }
    }
  `]
})
export class AdminProductsComponent {
  private api = inject(ProductsApi);
  private snack = inject(MatSnackBar);

  items = signal<Product[]>([]);
  showModal = signal(false);

  currentProduct: Product = this.resetProduct();

  constructor() { this.load(); }

  load() {
    this.api.list().subscribe(v => this.items.set(v));
  }

  resetProduct(): Product {
    return { name: '', description: '', price: 0, quantity: 1, imageUrl: '', available: true };
  }

  onUrlChange() {
    // This triggers change detection for the image preview in the template
  }

  openAddModal() {
    this.currentProduct = this.resetProduct();
    this.showModal.set(true);
  }

  editProduct(p: Product) {
    this.currentProduct = { ...p };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveProduct() {
    const obs = this.currentProduct.id
      ? this.api.update(this.currentProduct.id, this.currentProduct)
      : this.api.create(this.currentProduct);

    obs.subscribe({
      next: () => {
        this.snack.open('Product saved successfully', 'OK', { duration: 3000 });
        this.closeModal();
        this.load();
      },
      error: () => this.snack.open('Error saving product', 'OK', { duration: 3000 })
    });
  }

  deleteProduct(p: Product) {
    if (confirm(`Are you sure you want to delete ${p.name}?`)) {
      this.api.delete(p.id!).subscribe(() => {
        this.snack.open('Product deleted', 'OK', { duration: 2000 });
        this.load();
      });
    }
  }
}
