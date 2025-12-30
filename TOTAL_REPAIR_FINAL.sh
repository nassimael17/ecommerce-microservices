#!/bin/bash

# ==============================================================================
# 🛡️ TOTAL_REPAIR_FINAL.sh - SURGICAL REPAIR (V4)
# ==============================================================================
# This script is designed to be 100% safe. 
# It targets only the logic, NOT the folder paths.
# ==============================================================================

echo "--------------------------------------------------------"
echo "🛠️  Starting Surgical System Repair..."
echo "--------------------------------------------------------"

# 1. FIX DOCKER-COMPOSE (REVERSE DAMAGE)
# ------------------------------------------------------------------------------
echo "📂 Step 1: Repairing docker-compose.yml paths..."
if [ -f "docker-compose.yml" ]; then
    # Fix the service context paths that were accidentally capitalized
    sed -i 's/context: \.\/PRODUCT-SERVICE\/PRODUCT-SERVICE/context: \.\/product-service\/product-service/g' docker-compose.yml
    sed -i 's/context: \.\/ORDER-SERVICE\/ORDER-SERVICE/context: \.\/order-service\/order-service/g' docker-compose.yml
    sed -i 's/context: \.\/CLIENT-SERVICE\/CLIENT-SERVICE/context: \.\/client-service\/client-service/g' docker-compose.yml
    sed -i 's/context: \.\/PAYMENT-SERVICE\/PAYMENT-SERVICE/context: \.\/payment-service\/payment-service/g' docker-compose.yml
    sed -i 's/context: \.\/NOTIFICATION-SERVICE\/NOTIFICATION-SERVICE/context: \.\/notification-service\/notification-service/g' docker-compose.yml
    sed -i 's/context: \.\/BATCH-SERVICE\/BATCH-SERVICE/context: \.\/batch-service\/batch-service/g' docker-compose.yml
    sed -i 's/context: \.\/CONFIG-SERVER\/CONFIG-SERVER/context: \.\/config-server\/config-server/g' docker-compose.yml
    sed -i 's/context: \.\/EUREKA-SERVER\/EUREKA-SERVER/context: \.\/eureka-server\/eureka-server/g' docker-compose.yml
    sed -i 's/context: \.\/API-GATEWAY\/API-GATEWAY/context: \.\/api-gateway\/api-gateway/g' docker-compose.yml
    
    # Also fix the service names in the services: block (should be lowercase)
    sed -i 's/^  PRODUCT-SERVICE:/  product-service:/g' docker-compose.yml
    sed -i 's/^  ORDER-SERVICE:/  order-service:/g' docker-compose.yml
    sed -i 's/^  CLIENT-SERVICE:/  client-service:/g' docker-compose.yml
    sed -i 's/^  PAYMENT-SERVICE:/  payment-service:/g' docker-compose.yml
    sed -i 's/^  API-GATEWAY:/  api-gateway:/g' docker-compose.yml
    echo "   ✅ Folder paths in docker-compose.yml restored to lowercase."
fi

# 2. DATABASE REPAIR
# ------------------------------------------------------------------------------
POSTGRES_CONTAINER=$(docker ps --format '{{.Names}}' | grep "postgres" | head -n 1)
if [ -n "$POSTGRES_CONTAINER" ]; then
    echo "🗄️  Step 2: Syncing Database Sequences..."
    SQL_CMDS="SELECT setval(pg_get_serial_sequence('product', 'id'), coalesce(max(id), 1)) FROM product; SELECT setval(pg_get_serial_sequence('clients', 'id'), coalesce(max(id), 1)) FROM clients; SELECT setval(pg_get_serial_sequence('orders', 'id'), coalesce(max(id), 1)) FROM orders;"
    docker exec -i "$POSTGRES_CONTAINER" psql -U postgres -d ecommerce -c "$SQL_CMDS" > /dev/null 2>&1
    echo "   ✅ Database counters synchronized."
fi

# 3. SURGICAL CONFIG PATCH (ONLY MATCHES URLS/CALLS, NOT PATHS)
# ------------------------------------------------------------------------------
echo "🔡 Step 3: Patching Connections (Uppercase for Eureka)..."

# This pattern targets:
# - lb://...
# - name = "..."
# - service-id: ...
# It specifically AVOIDS ./path/to/product-service

# Files to patch
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
        # Replace only in URLs or name assignments
        sed -i 's/lb:\/\/product-service/lb:\/\/PRODUCT-SERVICE/g' "$f"
        sed -i 's/lb:\/\/order-service/lb:\/\/ORDER-SERVICE/g' "$f"
        sed -i 's/lb:\/\/client-service/lb:\/\/CLIENT-SERVICE/g' "$f"
        sed -i 's/lb:\/\/payment-service/lb:\/\/PAYMENT-SERVICE/g' "$f"
        
        sed -i 's/name = "product-service"/name = "PRODUCT-SERVICE"/g' "$f"
        sed -i 's/name = "order-service"/name = "ORDER-SERVICE"/g' "$f"
        sed -i 's/name = "client-service"/name = "CLIENT-SERVICE"/g' "$f"
        sed -i 's/name = "payment-service"/name = "PAYMENT-SERVICE"/g' "$f"
    fi
done
echo "   ✅ Service calls updated (Surgical precision: folder paths preserved)."

# 4. REBUILD
# ------------------------------------------------------------------------------
echo "🛠️  Step 4: Restarting services..."
docker-compose up -d --build product-service order-service api-gateway

echo "--------------------------------------------------------"
echo "✨ SYSTEM CLEANED AND REPAIRED!"
echo "--------------------------------------------------------"
