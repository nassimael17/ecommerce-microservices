import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Cart Item interface
interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

@Component({
    selector: 'app-shopping-cart',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-gray-900 p-6">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="bg-gray-800 rounded-lg p-6 mb-6">
          <h1 class="text-3xl font-bold text-white">🛒 Shopping Cart</h1>
          <p class="text-gray-400 mt-2">{{ cartItems.length }} items in your cart</p>
        </div>

        <!-- Cart Items -->
        <div class="space-y-4">
          <div *ngFor="let item of cartItems" 
               class="bg-gray-800 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-750 transition">
            
            <!-- Product Image -->
            <img [src]="item.imageUrl || 'https://via.placeholder.com/100'" 
                 [alt]="item.name"
                 class="w-20 h-20 rounded-lg object-cover">
            
            <!-- Product Info -->
            <div class="flex-1">
              <h3 class="text-white font-semibold text-lg">{{ item.name }}</h3>
              <p class="text-indigo-400 font-bold">{{ item.price }} MAD</p>
            </div>

            <!-- Quantity Controls -->
            <div class="flex items-center gap-3 bg-gray-700 rounded-lg p-2">
              <!-- Decrease Button -->
              <button (click)="decreaseQuantity(item)" 
                      class="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded text-white font-bold">
                -
              </button>
              
              <!-- Quantity Display -->
              <span class="text-white font-semibold w-8 text-center">
                {{ item.quantity }}
              </span>
              
              <!-- Increase Button -->
              <button (click)="increaseQuantity(item)"
                      class="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 rounded text-white font-bold">
                +
              </button>
            </div>

            <!-- Item Total -->
            <div class="text-right">
              <p class="text-gray-400 text-sm">Total</p>
              <p class="text-white font-bold text-lg">
                {{ item.price * item.quantity }} MAD
              </p>
            </div>

            <!-- Remove Button -->
            <button (click)="removeItem(item)"
                    class="w-10 h-10 bg-red-600 hover:bg-red-500 rounded-lg text-white">
              🗑️
            </button>
          </div>

          <!-- Empty Cart Message -->
          <div *ngIf="cartItems.length === 0" 
               class="bg-gray-800 rounded-lg p-12 text-center">
            <p class="text-gray-400 text-xl">Your cart is empty</p>
            <p class="text-gray-500 mt-2">Add some products to get started!</p>
          </div>
        </div>

        <!-- Cart Summary -->
        <div *ngIf="cartItems.length > 0" 
             class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 mt-6">
          <div class="flex justify-between items-center mb-4">
            <span class="text-white text-lg">Subtotal:</span>
            <span class="text-white text-2xl font-bold">{{ getSubtotal() }} MAD</span>
          </div>
          
          <div class="flex justify-between items-center mb-4">
            <span class="text-white text-lg">Shipping:</span>
            <span class="text-white text-xl">50 MAD</span>
          </div>
          
          <div class="border-t border-white/20 pt-4 mb-6">
            <div class="flex justify-between items-center">
              <span class="text-white text-xl font-semibold">Total:</span>
              <span class="text-white text-3xl font-bold">{{ getTotal() }} MAD</span>
            </div>
          </div>

          <!-- Checkout Button -->
          <button (click)="checkout()"
                  class="w-full bg-white text-indigo-600 font-bold py-4 rounded-lg hover:bg-gray-100 transition text-lg">
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    /* Tailwind CSS is used in the template above */
    /* No additional styles needed */
  `]
})
export class ShoppingCartComponent {
    // Cart items array
    cartItems: CartItem[] = [
        {
            id: 1,
            name: 'Laptop',
            price: 8000,
            quantity: 1,
            imageUrl: 'https://via.placeholder.com/100/6366f1/ffffff?text=Laptop'
        },
        {
            id: 2,
            name: 'Phone',
            price: 3000,
            quantity: 2,
            imageUrl: 'https://via.placeholder.com/100/ec4899/ffffff?text=Phone'
        },
        {
            id: 3,
            name: 'Headphones',
            price: 500,
            quantity: 1,
            imageUrl: 'https://via.placeholder.com/100/8b5cf6/ffffff?text=Headphones'
        }
    ];

    /**
     * Increase item quantity
     */
    increaseQuantity(item: CartItem) {
        item.quantity++;
        console.log(`Increased ${item.name} to ${item.quantity}`);
    }

    /**
     * Decrease item quantity
     */
    decreaseQuantity(item: CartItem) {
        if (item.quantity > 1) {
            item.quantity--;
            console.log(`Decreased ${item.name} to ${item.quantity}`);
        } else {
            // If quantity is 1, remove the item
            this.removeItem(item);
        }
    }

    /**
     * Remove item from cart
     */
    removeItem(item: CartItem) {
        const index = this.cartItems.indexOf(item);
        if (index > -1) {
            this.cartItems.splice(index, 1);
            console.log(`Removed ${item.name} from cart`);
        }
    }

    /**
     * Calculate subtotal (sum of all items)
     */
    getSubtotal(): number {
        return this.cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    /**
     * Calculate total (subtotal + shipping)
     */
    getTotal(): number {
        const shipping = 50; // Fixed shipping cost
        return this.getSubtotal() + shipping;
    }

    /**
     * Proceed to checkout
     */
    checkout() {
        console.log('Proceeding to checkout with items:', this.cartItems);
        alert(`Total: ${this.getTotal()} MAD\nProceeding to payment...`);

        // TODO: Navigate to checkout page or call payment API
        // You can use Router to navigate:
        // this.router.navigate(['/checkout']);
    }
}

/**
 * HOW TO USE THIS COMPONENT:
 * 
 * 1. Add to your routes:
 *    { path: 'cart', component: ShoppingCartComponent }
 * 
 * 2. Navigate to cart:
 *    <a routerLink="/cart">View Cart</a>
 * 
 * 3. To make it work with real data:
 *    - Create a CartService to manage cart items
 *    - Store cart in localStorage
 *    - Connect to your backend API
 * 
 * TAILWIND CSS SETUP:
 * Make sure Tailwind CSS is installed in your project:
 * npm install -D tailwindcss
 * npx tailwindcss init
 * 
 * Then add to your tailwind.config.js:
 * content: ["./src/**\/*.{html,ts}"]
 */
