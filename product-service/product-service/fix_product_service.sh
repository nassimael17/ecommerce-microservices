#!/bin/bash

BASE_DIR="/mnt/c/Users/elmehdi.ajana.Mehdi-Laptop/Desktop/Java-Project/ecommerce-microservices/product-service/product-service/src/main/java/com/ecommerce/product/service"
echo "🔧 Resetting Product Service files..."

# Ensure directories exist
mkdir -p $BASE_DIR/model
mkdir -p $BASE_DIR/repository
mkdir -p $BASE_DIR/service
mkdir -p $BASE_DIR/controller

# ✅ Product model
cat <<'EOF' > $BASE_DIR/model/Product.java
package com.ecommerce.product.service.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private double price;
    private int quantity;
}
EOF

# ✅ Repository
cat <<'EOF' > $BASE_DIR/repository/ProductRepository.java
package com.ecommerce.product.service.repository;

import com.ecommerce.product.service.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
}
EOF

# ✅ Service
cat <<'EOF' > $BASE_DIR/service/ProductService.java
package com.ecommerce.product.service.service;

import com.ecommerce.product.service.model.Product;
import com.ecommerce.product.service.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(updatedProduct.getName());
            existing.setDescription(updatedProduct.getDescription());
            existing.setPrice(updatedProduct.getPrice());
            existing.setQuantity(updatedProduct.getQuantity());
            return productRepository.save(existing);
        });
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
EOF

# ✅ Controller
cat <<'EOF' > $BASE_DIR/controller/ProductController.java
package com.ecommerce.product.service.controller;

import com.ecommerce.product.service.model.Product;
import com.ecommerce.product.service.service.ProductService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id).orElse(null);
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productService.updateProduct(id, product).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}
EOF

echo "✅ Product Service files recreated successfully!"
