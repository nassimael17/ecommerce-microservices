import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../core/cart.service';
import { OrdersApi } from '../../api/orders.api';
import { AuthService } from '../../core/auth/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-cart',
  // Added MatSnackBarModule
  imports: [CommonModule, MatSnackBarModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-300">
            🛒 Shopping Cart
          </h1>
          <div class="text-primary-400 font-semibold text-lg">
            {{ cartService.itemCount() }} {{ cartService.itemCount() === 1 ? 'item' : 'items' }}
          </div>
        </div>
        
        <!-- Cart Items -->
        <div class="space-y-4 mb-8" *ngIf="cartService.items().length > 0">
          <div *ngFor="let item of cartService.items()" 
               class="bg-gradient-to-r from-dark-800 to-dark-700 border border-primary-500/20 rounded-2xl p-6 
                      hover:border-primary-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/20">
            
            <div class="flex items-center gap-6">
              <!-- Item Image Placeholder -->
              <div class="w-24 h-24 bg-gradient-to-br from-dark-900 to-dark-800 rounded-xl flex items-center justify-center text-4xl border border-primary-500/30">
                📦
              </div>
              
              <!-- Item Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-xl font-bold text-white mb-1 truncate">{{ item.name }}</h3>
                <p class="text-dark-400 text-sm mb-2 line-clamp-2">{{ item.description }}</p>
                <div class="flex items-center gap-4">
                  <span class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-300">
                    {{ item.price }} MAD
                  </span>
                  <span class="text-dark-400 text-sm">× {{ item.quantity }}</span>
                </div>
              </div>

              <!-- Quantity Controls -->
              <div class="flex items-center gap-3 bg-dark-900/50 px-4 py-3 rounded-xl border border-primary-500/20">
                <button 
                  (click)="cartService.decreaseQuantity(item.id)"
                  class="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 
                         text-white rounded-lg font-bold text-lg transition-all duration-200 hover:scale-110 active:scale-95">
                  −
                </button>
                <span class="text-white font-bold text-lg min-w-[2rem] text-center">{{ item.quantity }}</span>
                <button 
                  (click)="cartService.increaseQuantity(item.id)"
                  class="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 
                         text-white rounded-lg font-bold text-lg transition-all duration-200 hover:scale-110 active:scale-95">
                  +
                </button>
              </div>

              <!-- Item Total -->
              <div class="text-right min-w-[120px]">
                <div class="text-sm text-dark-400 mb-1">Subtotal</div>
                <div class="text-2xl font-extrabold text-white">
                  {{ item.price * item.quantity }} MAD
                </div>
              </div>

              <!-- Remove Button -->
              <button 
                (click)="cartService.removeFromCart(item.id)"
                class="w-12 h-12 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 
                       text-red-500 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 text-xl">
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- Empty Cart State -->
        <div *ngIf="cartService.items().length === 0" 
             class="text-center py-20 bg-gradient-to-r from-dark-800 to-dark-700 rounded-2xl border border-dark-600">
          <div class="text-8xl mb-6 opacity-50">🛒</div>
          <h2 class="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p class="text-dark-400 mb-6">Add some products to get started!</p>
          <button 
            (click)="goToProducts()"
            class="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 
                   text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/30">
            Browse Products
          </button>
        </div>

        <!-- Cart Summary -->
        <div *ngIf="cartService.items().length > 0" 
             class="bg-gradient-to-r from-dark-800 to-dark-700 border border-primary-500/30 rounded-2xl p-8 shadow-xl">
          
          <!-- Summary Rows -->
          <div class="space-y-4 mb-6">
            <div class="flex justify-between items-center text-lg">
              <span class="text-dark-300">Subtotal</span>
              <span class="text-white font-bold">{{ cartService.subtotal() }} MAD</span>
            </div>
            
            <div class="flex justify-between items-center text-lg">
              <span class="text-dark-300">Shipping</span>
              <span class="text-white font-bold">
                <span *ngIf="cartService.getShippingCost() === 0" class="text-primary-400">FREE</span>
                <span *ngIf="cartService.getShippingCost() > 0">{{ cartService.getShippingCost() }} MAD</span>
              </span>
            </div>

            <div *ngIf="cartService.subtotal() < 500 && cartService.subtotal() > 0" 
                 class="text-sm text-primary-400 bg-primary-500/10 border border-primary-500/30 rounded-lg p-3">
              💡 Add {{ 500 - cartService.subtotal() }} MAD more for free shipping!
            </div>
            
            <div class="border-t-2 border-primary-500/30 pt-4 mt-4">
              <div class="flex justify-between items-center">
                <span class="text-2xl font-bold text-white">Total</span>
                <span class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-300">
                  {{ cartService.total() }} MAD
                </span>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex gap-4">
            <button 
              (click)="clearCart()"
              class="flex-1 px-6 py-4 bg-dark-600 hover:bg-dark-500 border border-dark-500 hover:border-dark-400 
                     text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
              Clear Cart
            </button>
            <button 
              (click)="checkout()"
              [disabled]="isCheckingOut"
              class="flex-[2] px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 
                     text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 
                     shadow-lg shadow-primary-500/40 text-lg flex justify-center items-center gap-2">
              <span *ngIf="!isCheckingOut">Proceed to Checkout →</span>
              <span *ngIf="isCheckingOut">Processing...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Tailwind utilities are used in the template */
    :host {
      display: block;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class CartComponent {
  cartService = inject(CartService);
  private router = inject(Router);
  private ordersApi = inject(OrdersApi);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);

  isCheckingOut = false;

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  checkout() {
    const user = this.auth.user();
    if (!user) {
      this.snack.open('Please login to checkout', 'OK', { duration: 3000 });
      // In a real app, redirect to login page
      return;
    }

    this.isCheckingOut = true;
    const items = this.cartService.items();

    // Create an order for each item in the cart
    // Note: The backend API creates orders per product. 
    // In a future update, we should implement a bulk order endpoint.
    // Filter out items that strictly have an ID (and we know user.id exists from check above)
    const validItems = items.filter(item => item.id !== undefined && item.id !== null);

    if (validItems.length === 0) {
      this.isCheckingOut = false;
      this.snack.open('Error: Cart items have missing IDs.', 'OK');
      return;
    }

    const orderRequests = validItems.map(item =>
      this.ordersApi.create(item.id!, item.quantity, user.id!)
    );

    forkJoin(orderRequests).subscribe({
      next: (orders) => {
        this.cartService.clearCart();
        const plural = orders.length > 1 ? 's' : '';
        this.snack.open(`${orders.length} order${plural} placed! Redirecting to payments...`, 'OK', { duration: 3000 });
        this.router.navigate(['/app/payments']);
        this.isCheckingOut = false;
      },
      error: (err) => {
        console.error('Checkout failed', err);
        this.snack.open('Checkout failed. Please try again.', 'OK', { duration: 3000 });
        this.isCheckingOut = false;
      }
    });
  }

  goToProducts() {
    this.router.navigate(['/app/products']);
  }
}
