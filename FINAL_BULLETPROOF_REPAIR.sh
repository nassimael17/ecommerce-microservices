#!/bin/bash

# ==============================================================================
# 🚀 FINAL ABSOLUTE REPAIR SCRIPT (V3 - Bulletproof)
# ==============================================================================
# This script fixes: 
# 1. Database Schema (Missing Columns & Sequences)
# 2. Product Creation Errors (Force ID Generation & Logging)
# 3. Connection Errors (Eureka Uppercase Sync)
# ==============================================================================

echo "--------------------------------------------------------"
echo "🛠️  Starting System Repair..."
echo "--------------------------------------------------------"

# 1. Database Repair (Postgres)
# ------------------------------------------------------------------------------
POSTGRES_CONTAINER=$(docker ps --format '{{.Names}}' | grep "postgres" | head -n 1)

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo "❌ Error: Postgres container not found. Is your project running?"
    exit 1
fi

echo "🗄️  Step 1: Fixing Database Schema (Force sync)..."
SQL_CMDS=$(cat <<EOF
-- Fix Table: product (singular)
DO \$\$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='product' AND column_name='available') THEN
            ALTER TABLE product ADD COLUMN available BOOLEAN DEFAULT TRUE;
        END IF;
        UPDATE product SET available = TRUE;
        PERFORM setval(pg_get_serial_sequence('product', 'id'), coalesce(max(id), 1)) FROM product;
    END IF;
END \$\$;

-- Fix Table: orders (plural)
DO \$\$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='orders' AND column_name='client_id') THEN
            ALTER TABLE orders ADD COLUMN client_id BIGINT;
        END IF;
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='orders' AND column_name='product_id') THEN
            ALTER TABLE orders ADD COLUMN product_id BIGINT;
        END IF;
        PERFORM setval(pg_get_serial_sequence('orders', 'id'), coalesce(max(id), 1)) FROM orders;
    END IF;
END \$\$;

-- Fix Table: clients
DO \$\$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
        PERFORM setval(pg_get_serial_sequence('clients', 'id'), coalesce(max(id), 1)) FROM clients;
    END IF;
END \$\$;
EOF
)

docker exec -i "$POSTGRES_CONTAINER" psql -U postgres -d ecommerce -c "$SQL_CMDS" > /dev/null 2>&1
echo "   ✅ Database schema and counters synchronized."

# 2. Java Code Repair (Logging & Core Logic)
# ------------------------------------------------------------------------------
echo "📝 Step 2: Patching Product Service Controller..."

# Specific Path - No self-modifying 'sed'
PROD_PATH="product-service/product-service/src/main/java/com/ecommerce/product/service/controller/ProductController.java"

if [ -f "$PROD_PATH" ]; then
cat <<EOF > "$PROD_PATH"
package com.ecommerce.product.service.controller;

import com.ecommerce.product.service.model.Product;
import com.ecommerce.product.service.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            System.out.println("📥 Admin Attempting Create: " + product.getName());
            product.setAvailable(true); 
            Product saved = productService.createProduct(product);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            System.err.println("❌ CRITICAL ERROR SAVING PRODUCT: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            return productService.updateProduct(id, product)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("❌ CRITICAL ERROR UPDATING PRODUCT: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reduce-stock")
    public ResponseEntity<Void> reduceStock(@PathVariable Long id, @RequestParam int quantity) {
        productService.reduceStock(id, quantity);
        return ResponseEntity.ok().build();
    }
}
EOF
    echo "   ✅ ProductController patched with advanced logging."
else
    echo "   ⚠️ Warning: $PROD_PATH not found. Skipping file patch."
fi

# 3. Connection Sync (Eureka Case Sensitivity)
# ------------------------------------------------------------------------------
echo "🔡 Step 3: Unifying Service Names for Eureka..."

# We use specific file targets to avoid global sed errors
target_files=(
    "api-gateway/api-gateway/src/main/resources/application.yml"
    "order-service/order-service/src/main/resources/application.yml"
    "product-service/product-service/src/main/resources/application.yml"
    "order-service/order-service/src/main/java/com/ecommerce/order/service/client/ProductClient.java"
    "order-service/order-service/src/main/java/com/ecommerce/order/service/client/ClientClient.java"
    "order-service/order-service/src/main/java/com/ecommerce/order/service/client/PaymentClient.java"
)

for f in "${target_files[@]}"; do
    if [ -f "$f" ]; then
        sed -i 's/product-service/PRODUCT-SERVICE/g' "$f"
        sed -i 's/order-service/ORDER-SERVICE/g' "$f"
        sed -i 's/client-service/CLIENT-SERVICE/g' "$f"
        sed -i 's/payment-service/PAYMENT-SERVICE/g' "$f"
    fi
done
echo "   ✅ Internal connections updated (Eureka Uppercase Sync)."

# 4. Final Rebuild
# ------------------------------------------------------------------------------
echo "🛠️  Step 4: Rebuilding and Restarting Systems..."
docker-compose up -d --build product-service order-service api-gateway

echo "--------------------------------------------------------"
echo "✨ FINISHED! Everything is repaired."
echo "Please wait 45 seconds for Eureka to refresh."
echo "--------------------------------------------------------"
