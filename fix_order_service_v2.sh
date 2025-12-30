#!/bin/bash

# Configuration
BASE_DIR="order-service/order-service"
JAVA_BASE="$BASE_DIR/src/main/java/com/ecommerce/order/service"
ORDER_FILE="$JAVA_BASE/model/Order.java"
USER_FILE="$JAVA_BASE/model/User.java"
REPO_DIR_OLD="$JAVA_BASE/model/repository"
REPO_DIR_NEW="$JAVA_BASE/repository"

echo "🚀 Starting Order Service Fix Script v2..."

# 1. Update Order.java to fix JPA Associations
echo "📝 Patching Order.java (removing invalid associations)..."
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

# 2. Update User.java to remove the broken 'orders' relationship
echo "📝 Patching User.java (removing broken mappedBy relationship)..."
cat <<EOF > "$USER_FILE"
package com.ecommerce.order.service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // USER or ADMIN

    private String fullName;
    private String phone;
    private String address;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
EOF

# 3. Fix Repository Package and Folder Structure
echo "📂 Reorganizing Repository Structure..."
mkdir -p "$REPO_DIR_NEW"

# Create OrderRepository.java in the correct package
cat <<EOF > "$REPO_DIR_NEW/OrderRepository.java"
package com.ecommerce.order.service.repository;

import com.ecommerce.order.service.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
}
EOF

# Remove old repository folder if it exists
if [ -d "$REPO_DIR_OLD" ]; then
    rm -rf "$REPO_DIR_OLD"
    echo "✅ Cleaned up old repository location."
fi

echo "✨ Fix complete! Now run:"
echo "   docker-compose down order-service"
echo "   docker-compose up -d --build order-service"
echo "   docker-compose logs -f order-service"
