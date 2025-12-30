#!/bin/bash

echo "🏆 Starting FINAL MASTER REPAIR for Nassima's VM..."

# Configuration
POSTGRES_CONTAINER=$(docker ps --format '{{.Names}}' | grep "postgres" | head -n 1)

# --- 1. Fix Database Schema and Values ---
echo "🗄️  1. Fixing Database Columns and Availability..."
SQL_COMMAND=$(cat <<EOF
-- Add columns if missing
DO \$\$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product' AND column_name='available') THEN
        ALTER TABLE product ADD COLUMN available BOOLEAN DEFAULT TRUE;
    END IF;
END \$\$;

DO \$\$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='client_id') THEN
        ALTER TABLE orders ADD COLUMN client_id BIGINT;
    END IF;
END \$\$;

-- CRITICAL: Force all existing products to be available
UPDATE product SET available = TRUE;
-- Force sequences to sync
SELECT setval(pg_get_serial_sequence('clients', 'id'), coalesce(max(id), 1)) FROM clients;
SELECT setval(pg_get_serial_sequence('product', 'id'), coalesce(max(id), 1)) FROM product;
SELECT setval(pg_get_serial_sequence('orders', 'id'), coalesce(max(id), 1)) FROM orders;
EOF
)
docker exec -i "$POSTGRES_CONTAINER" psql -U postgres -d ecommerce -c "$SQL_COMMAND"

# --- 2. Fix Case Mismatch in Config and Code ---
echo "🔡 2. Fixing Uppercase Service Names for Eureka..."
# Gateway
GATEWAY_YML="api-gateway/api-gateway/src/main/resources/application.yml"
if [ -f "$GATEWAY_YML" ]; then
    sed -i 's/lb:\/\/product-service/lb:\/\/PRODUCT-SERVICE/g' "$GATEWAY_YML"
    sed -i 's/lb:\/\/order-service/lb:\/\/ORDER-SERVICE/g' "$GATEWAY_YML"
    sed -i 's/lb:\/\/client-service/lb:\/\/CLIENT-SERVICE/g' "$GATEWAY_YML"
    sed -i 's/lb:\/\/payment-service/lb:\/\/PAYMENT-SERVICE/g' "$GATEWAY_YML"
fi

# Feign Clients (Order Service)
sed -i 's/name = "product-service"/name = "PRODUCT-SERVICE"/g' order-service/order-service/src/main/java/com/ecommerce/order/service/client/ProductClient.java 2>/dev/null
sed -i 's/name = "client-service"/name = "CLIENT-SERVICE"/g' order-service/order-service/src/main/java/com/ecommerce/order/service/client/ClientClient.java 2>/dev/null
sed -i 's/name = "payment-service"/name = "PAYMENT-SERVICE"/g' order-service/order-service/src/main/java/com/ecommerce/order/service/client/PaymentClient.java 2>/dev/null

# --- 3. Fix Product Creation Bug (Defaulting to available=true) ---
echo "📝 3. Fixing Product Model (ensuring available=true by default)..."
PRODUCT_MODEL="product-service/product-service/src/main/java/com/ecommerce/product/service/model/Product.java"
if [ -f "$PRODUCT_MODEL" ]; then
    sed -i 's/private boolean available = true;/private boolean available = true;/g' "$PRODUCT_MODEL"
    # Ensure @Builder.Default is used if present, or just hardcode the initialization
fi

# --- 4. Final Rebuild and Restart ---
echo "🛠️  4. Rebuilding and Restarting affected services..."
docker-compose up -d --build product-service order-service api-gateway payment-service

echo "✨ REPAIR COMPLETE!"
echo "Please wait 30 seconds for services to register in Eureka."
echo "Then check: http://localhost:4200/app/products"
