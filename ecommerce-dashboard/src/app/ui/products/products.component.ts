import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsApi } from '../../api/products.api';
import { OrdersApi } from '../../api/orders.api';
import { AuthService } from '../../core/auth/auth.service';
import { Product } from '../../api/api.models';
import { DecimalPipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, MatIconModule, DecimalPipe],
  template: `
  <div class="page-container fade-in">
    <div class="glass-panel header-panel">
      <div class="header-content">
        <h1>Marketplace</h1>
        <p>Discover our curated collection of premium products.</p>
      </div>
      <div class="actions">
        <div class="search-box">
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search products...">
          <span class="material-icons">search</span>
        </div>
        <button class="btn-icon" (click)="load()" title="Refresh">
          <span class="material-icons">refresh</span>
        </button>
      </div>
    </div>

    @if (cart().length > 0) {
      <div class="glass-panel cart-bar fade-in">
        <div class="cart-info">
          <mat-icon color="primary">shopping_basket</mat-icon>
          <span><strong>{{ cart().length }}</strong> items selected</span>
          <span class="total-preview">Total: {{ cartTotal() | currency:'MAD ':'symbol':'1.0-0' }}</span>
        </div>
        <div class="cart-actions">
          <button mat-button color="warn" (click)="clearCart()">Clear</button>
          <button class="proceed-btn" (click)="checkout()">
            Proceed to Payment ({{ cart().length }})
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>
      </div>
    }

    @if (items().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">🛋️</div>
        <h3>No products available</h3>
        <p>Check back later for new arrivals.</p>
      </div>
    }

    <div class="products-grid">
      @for (p of filteredItems(); track p.id) {
        <div class="glass-panel product-card" [class.out-of-stock]="p.quantity <= 0" [class.in-cart]="isInCart(p)">
          <div class="image-container">
            <div class="image-placeholder">
              <mat-icon>image</mat-icon>
            </div>
            <img [src]="p.imageUrl || getFallbackImage(p)" 
                 [alt]="p.name"
                 onerror="this.style.display='none'; this.parentElement.querySelector('.image-placeholder').style.display='flex'">
            @if (p.quantity <= 0) {
              <div class="sold-out-badge">Sold Out</div>
            }
            @if (isInCart(p)) {
              <div class="cart-badge"><mat-icon>check</mat-icon></div>
            }
          </div>
          
          <div class="card-body">
            <div class="category">{{ getCategory(p) }}</div>
            <h3 class="name">{{ p.name }}</h3>
            <p class="description">{{ p.description }}</p>
            
            <div class="footer-row">
              <div class="price-stack">
                <span class="currency">MAD</span>
                <span class="amount">{{ p.price | number:'1.0-0' }}</span>
              </div>
              
              <button class="buy-btn" (click)="toggleCart(p)" [disabled]="p.quantity <= 0" [class.in-cart]="isInCart(p)">
                <mat-icon>{{ isInCart(p) ? 'remove_shopping_cart' : 'add_shopping_cart' }}</mat-icon>
                {{ isInCart(p) ? 'Remove' : 'Add to Cart' }}
              </button>
            </div>
            
            <div class="stock-status" [class.low]="p.quantity > 0 && p.quantity <= 5">
              <span class="dot"></span>
              {{ p.quantity > 0 ? (p.quantity <= 5 ? 'Only ' + p.quantity + ' left!' : 'In Stock') : 'Currently Unavailable' }}
            </div>
          </div>
        </div>
      }
    </div>
  </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; }
    
    .header-panel {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 32px;
      h1 { margin: 0; font-size: 28px; font-weight: 800; }
      p { margin: 4px 0 0; opacity: 0.5; font-size: 14px; }
    }

    .search-box {
      position: relative; margin-right: 12px;
      input {
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        padding: 10px 16px 10px 40px; border-radius: 12px; color: white; width: 240px;
        &:focus { outline: none; border-color: var(--color-primary); }
      }
      .material-icons { position: absolute; left: 12px; top: 10px; font-size: 20px; opacity: 0.5; }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 32px;
    }

    .product-card {
      padding: 0; overflow: hidden; display: flex; flex-direction: column;
      height: 100%; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      &:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
      &.out-of-stock { opacity: 0.7; .buy-btn { opacity: 0.5; cursor: not-allowed; } }
    }

    .cart-bar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; padding: 16px 32px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
      border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 20px;
      .cart-info { display: flex; align-items: center; gap: 12px; font-size: 16px; }
      .total-preview { opacity: 0.6; padding-left: 12px; border-left: 1px solid rgba(255,255,255,0.1); }
      .proceed-btn {
        background: white; color: var(--color-primary); border: none; padding: 10px 24px;
        border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px;
        cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        &:hover { background: #f8fafc; transform: translateY(-1px); }
      }
    }

    .image-container {
      position: relative; height: 200px; overflow: hidden; background: rgba(0,0,0,0.2);
      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; position: relative; z-index: 2; }
      .product-card:hover img { transform: scale(1.1); }
      
      .cart-badge {
        position: absolute; top: 12px; left: 12px; z-index: 10;
        background: var(--color-primary); color: white; width: 28px; height: 28px;
        border-radius: 50%; display: grid; place-items: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        mat-icon { font-size: 18px; width: 18px; height: 18px; }
      }

      .image-placeholder {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        display: none; flex-direction: column; align-items: center; justify-content: center;
        background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
        z-index: 1;
        mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.1; color: white; }
      }
    }

    .sold-out-badge {
      position: absolute; top: 12px; right: 12px;
      background: rgba(239, 68, 68, 0.9); color: white;
      padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.5px;
    }

    .card-body { padding: 24px; flex: 1; display: flex; flex-direction: column; }
    .category { font-size: 11px; text-transform: uppercase; color: var(--color-primary); font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; }
    .name { margin: 0 0 12px; font-size: 18px; font-weight: 700; }
    .description { font-size: 13px; opacity: 0.6; line-height: 1.6; margin-bottom: 24px; flex: 1; }

    .footer-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    
    .price-stack {
      display: flex; align-items: baseline; gap: 4px;
      .currency { font-size: 12px; font-weight: 600; opacity: 0.5; }
      .amount { font-size: 24px; font-weight: 800; color: white; }
    }

    .buy-btn {
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: white; border: none; padding: 10px 18px; border-radius: 12px;
      font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px;
      cursor: pointer; transition: all 0.2s;
      &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4); }
      &.in-cart { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.05); }
      .material-icons { font-size: 18px; }
    }

    .stock-status {
      display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; opacity: 0.7;
      .dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }
      &.low .dot { background: #f59e0b; }
      &.low { color: #f59e0b; opacity: 1; }
    }

    .btn-icon {
      background: rgba(255, 255, 255, 0.05); border: none; color: white;
      width: 40px; height: 40px; border-radius: 12px; cursor: pointer;
      display: grid; place-items: center; transition: all 0.2s;
      &:hover { background: rgba(255, 255, 255, 0.1); }
    }
  `]
})
export class ProductsComponent {
  private api = inject(ProductsApi);
  private auth = inject(AuthService);
  private ordersApi = inject(OrdersApi);
  private snack = inject(MatSnackBar);

  items = signal<Product[]>([]);
  cart = signal<Product[]>([]);
  searchQuery = '';

  filteredItems = computed(() => {
    return this.items().filter(p =>
      p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  });

  cartTotal = computed(() => this.cart().reduce((sum, p) => sum + (p.price || 0), 0));

  constructor() { this.load(); }

  load() {
    this.api.list().subscribe({ next: v => this.items.set(v), error: () => this.items.set([]) });
  }

  isInCart(p: Product) { return this.cart().some(i => i.id === p.id); }

  toggleCart(p: Product) {
    if (this.isInCart(p)) {
      this.cart.update(c => c.filter(i => i.id !== p.id));
    } else {
      this.cart.update(c => [...c, p]);
    }
  }

  clearCart() { this.cart.set([]); }

  async checkout() {
    const user = this.auth.user();
    if (!user || !user.id) {
      this.snack.open('Please log in to purchase products', 'OK', { duration: 3000 });
      return;
    }

    const items = this.cart();
    this.snack.open(`Processing ${items.length} orders...`, 'OK', { duration: 2000 });

    let successCount = 0;

    for (const p of items) {
      try {
        // We use lastValueFrom or toPromise to wait for each order
        await this.ordersApi.create(p.id!, 1, user.id).toPromise();
        successCount++;
      } catch (e) {
        console.error(`Failed to order ${p.name}`, e);
      }
    }

    if (successCount > 0) {
      this.snack.open(`${successCount} orders placed! Redirecting to payments...`, 'GO', { duration: 5000 })
        .onAction().subscribe(() => {
          window.location.href = '/app/payments';
        });
      this.clearCart();
      this.load();
    } else {
      this.snack.open('Could not place any orders. Check stock or logs.', 'Close', { duration: 4000 });
    }
  }

  getCategory(p: Product): string {
    const n = p.name?.toLowerCase() || '';
    const d = p.description?.toLowerCase() || '';
    if (n.includes('laptop') || d.includes('laptop') || n.includes('zenbook')) return 'Computing';
    if (n.includes('watch') || d.includes('watch') || n.includes('airpods')) return 'Accessories';
    if (n.includes('phone') || d.includes('phone')) return 'Mobile';
    if (n.includes('book') || d.includes('book')) return 'Literature';
    return 'General';
  }

  getFallbackImage(p: Product): string {
    const cat = this.getCategory(p);
    switch (cat) {
      case 'Computing': return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800';
      case 'Accessories': return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';
      case 'Mobile': return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800';
      case 'Literature': return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800';
      default: return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800';
    }
  }
}
