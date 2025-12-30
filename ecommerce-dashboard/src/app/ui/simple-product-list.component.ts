import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// Simple Product interface
interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string; // Optional image
}

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="container">
      <h1>Our Products</h1>
      
      <!-- Product Grid -->
      <div class="product-grid">
        <!-- Loop through each product -->
        <div *ngFor="let product of products" class="product-card">
          
          <!-- Product Image -->
          <div class="product-image">
            <img [src]="product.imageUrl || 'https://via.placeholder.com/300'" 
                 [alt]="product.name">
          </div>
          
          <!-- Product Info -->
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="description">{{ product.description }}</p>
            <p class="price">{{ product.price }} MAD</p>
            
            <!-- Add to Cart Button -->
            <button class="add-to-cart-btn" (click)="addToCart(product)">
              🛒 Add to Cart
            </button>
          </div>
        </div>
      </div>
      
      <!-- Loading message -->
      <div *ngIf="products.length === 0" class="loading">
        Loading products...
      </div>
    </div>
  `,
    styles: [`
    /* Container */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }

    /* Product Grid - 3 columns on desktop, 1 on mobile */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    /* Product Card */
    .product-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    /* Product Image */
    .product-image {
      width: 100%;
      height: 200px;
      overflow: hidden;
      background: #f5f5f5;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Product Info */
    .product-info {
      padding: 15px;
    }

    .product-info h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 18px;
    }

    .description {
      color: #666;
      font-size: 14px;
      margin-bottom: 10px;
      min-height: 40px;
    }

    .price {
      font-size: 20px;
      font-weight: bold;
      color: #6366f1;
      margin-bottom: 15px;
    }

    /* Add to Cart Button */
    .add-to-cart-btn {
      width: 100%;
      padding: 12px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .add-to-cart-btn:hover {
      background: #4f46e5;
    }

    .add-to-cart-btn:active {
      transform: scale(0.98);
    }

    /* Loading */
    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class ProductListComponent implements OnInit {
    // Array to store products
    products: Product[] = [];

    constructor(private http: HttpClient) { }

    ngOnInit() {
        // Load products when component starts
        this.loadProducts();
    }

    // Method to load products from API
    loadProducts() {
        // Call the API Gateway
        this.http.get<Product[]>('http://localhost:8085/api/products')
            .subscribe({
                next: (data) => {
                    this.products = data;
                    console.log('Products loaded:', data);
                },
                error: (error) => {
                    console.error('Error loading products:', error);
                    // Show some demo products if API fails
                    this.products = this.getDemoProducts();
                }
            });
    }

    // Method when user clicks "Add to Cart"
    addToCart(product: Product) {
        console.log('Adding to cart:', product);
        alert(`Added ${product.name} to cart!`);

        // TODO: Add to cart service
        // You can call a cart service here to actually add the item
    }

    // Demo products for testing
    getDemoProducts(): Product[] {
        return [
            {
                id: 1,
                name: 'Laptop',
                description: 'High performance laptop',
                price: 8000,
                imageUrl: 'https://via.placeholder.com/300/6366f1/ffffff?text=Laptop'
            },
            {
                id: 2,
                name: 'Phone',
                description: 'Latest smartphone',
                price: 3000,
                imageUrl: 'https://via.placeholder.com/300/ec4899/ffffff?text=Phone'
            },
            {
                id: 3,
                name: 'Headphones',
                description: 'Wireless headphones',
                price: 500,
                imageUrl: 'https://via.placeholder.com/300/8b5cf6/ffffff?text=Headphones'
            }
        ];
    }
}
