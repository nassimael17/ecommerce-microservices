import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
}

const CART_STORAGE_KEY = 'ecommerce_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
    private _items = signal<CartItem[]>(this.loadFromStorage());

    // Public computed signals
    items = computed(() => this._items());
    itemCount = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));
    subtotal = computed(() => this._items().reduce((sum, item) => sum + (item.price * item.quantity), 0));
    total = computed(() => this.subtotal() + this.getShippingCost());

    constructor() {
        // Auto-save to localStorage whenever items change
    }

    addToCart(product: { id: number; name: string; description: string; price: number }) {
        const currentItems = this._items();
        const existingItem = currentItems.find(item => item.id === product.id);

        if (existingItem) {
            // Increase quantity if item already exists
            this._items.update(items =>
                items.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            // Add new item
            this._items.update(items => [
                ...items,
                { ...product, quantity: 1 }
            ]);
        }

        this.saveToStorage();
    }

    removeFromCart(productId: number) {
        this._items.update(items => items.filter(item => item.id !== productId));
        this.saveToStorage();
    }

    updateQuantity(productId: number, quantity: number) {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        this._items.update(items =>
            items.map(item =>
                item.id === productId
                    ? { ...item, quantity }
                    : item
            )
        );
        this.saveToStorage();
    }

    increaseQuantity(productId: number) {
        this._items.update(items =>
            items.map(item =>
                item.id === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
        this.saveToStorage();
    }

    decreaseQuantity(productId: number) {
        const item = this._items().find(i => i.id === productId);
        if (item && item.quantity > 1) {
            this._items.update(items =>
                items.map(i =>
                    i.id === productId
                        ? { ...i, quantity: i.quantity - 1 }
                        : i
                )
            );
        } else {
            this.removeFromCart(productId);
        }
        this.saveToStorage();
    }

    clearCart() {
        this._items.set([]);
        this.saveToStorage();
    }

    getShippingCost(): number {
        // Free shipping over 500 MAD, otherwise 50 MAD
        return this.subtotal() > 500 ? 0 : 50;
    }

    private saveToStorage() {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this._items()));
        } catch (error) {
            console.error('Failed to save cart to localStorage:', error);
        }
    }

    private loadFromStorage(): CartItem[] {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load cart from localStorage:', error);
            return [];
        }
    }
}
