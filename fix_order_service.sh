#!/bin/bash

# Configuration
BASE_DIR="order-service/order-service"
JAVA_BASE="$BASE_DIR/src/main/java/com/ecommerce/order/service"
ORDER_FILE="$JAVA_BASE/model/Order.java"
REPO_DIR_OLD="$JAVA_BASE/model/repository"
REPO_DIR_NEW="$JAVA_BASE/repository"

echo "🚀 Starting Order Service Fix Script..."

# 1. Update Order.java to fix JPA Associations
echo "📝 Patching Order.java..."
cat <<EOF > "$ORDER_FILE"
package com.ecommerce.order.service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to Client (from Client Service)
    @Column(name = "client_id", nullable = false)
    private Long clientId;

    // Link to Product (from Product Service)
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double totalPrice;

    @Column(nullable = false)
    private String status; // PENDING, PAID, SHIPPED, DELIVERED, CANCELLED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
EOF

# 2. Fix Repository Package and Folder Structure
echo "📂 Reorganizing Repository Structure..."
mkdir -p "$REPO_DIR_NEW"

if [ -f "$REPO_DIR_OLD/OrderRepository.java" ]; then
    cat <<EOF > "$REPO_DIR_NEW/OrderRepository.java"
package com.ecommerce.order.service.repository;

import com.ecommerce.order.service.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
}
EOF
    rm -rf "$REPO_DIR_OLD"
    echo "✅ OrderRepository moved and updated."
else
    echo "⚠️ OrderRepository not found in expected old location. Creating in new location..."
    cat <<EOF > "$REPO_DIR_NEW/OrderRepository.java"
package com.ecommerce.order.service.repository;

import com.ecommerce.order.service.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
}
EOF
fi

echo "✨ Fix complete! Now run:"
echo "   docker-compose down order-service"
echo "   docker-compose up -d --build order-service"
