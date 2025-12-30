#!/bin/bash

echo "🚀 Starting Service Name Case Fix (Lowercase -> Uppercase)..."

# 1. Fix API Gateway (application.yml)
GATEWAY_YML="api-gateway/api-gateway/src/main/resources/application.yml"
if [ -f "$GATEWAY_YML" ]; then
    echo "📝 Patching API Gateway routes..."
    sed -i 's/lb:\/\/product-service/lb:\/\/PRODUCT-SERVICE/g' "$GATEWAY_YML"
    sed -i 's/lb:\/\/order-service/lb:\/\/ORDER-SERVICE/g' "$GATEWAY_YML"
    sed -i 's/lb:\/\/client-service/lb:\/\/CLIENT-SERVICE/g' "$GATEWAY_YML"
    sed -i 's/lb:\/\/payment-service/lb:\/\/PAYMENT-SERVICE/g' "$GATEWAY_YML"
    sed -i 's/lb:\/\/batch-service/lb:\/\/BATCH-SERVICE/g' "$GATEWAY_YML"
    sed -i 's/lb:\/\/notification-service/lb:\/\/NOTIFICATION-SERVICE/g' "$GATEWAY_YML"
    echo "   ✅ Gateway routes updated to Uppercase."
fi

# 2. Fix Order Service Feign Clients
ORDER_CLIENTS="order-service/order-service/src/main/java/com/ecommerce/order/service/client"
if [ -d "$ORDER_CLIENTS" ]; then
    echo "📝 Patching Order Service Feign Clients..."
    sed -i 's/name = "product-service"/name = "PRODUCT-SERVICE"/g' "$ORDER_CLIENTS/ProductClient.java"
    sed -i 's/name = "client-service"/name = "CLIENT-SERVICE"/g' "$ORDER_CLIENTS/ClientClient.java"
    sed -i 's/name = "payment-service"/name = "PAYMENT-SERVICE"/g' "$ORDER_CLIENTS/PaymentClient.java"
    echo "   ✅ Order Service Feign clients updated."
fi

# 3. Fix Payment Service Feign Clients
PAYMENT_CLIENTS="payment-service/payment-service/src/main/java/com/ecommerce/payment/service/client"
if [ -d "$PAYMENT_CLIENTS" ]; then
    echo "📝 Patching Payment Service Feign Client..."
    sed -i 's/name = "order-service"/name = "ORDER-SERVICE"/g' "$PAYMENT_CLIENTS/OrderClient.java"
    echo "   ✅ Payment Service Feign client updated."
fi

# 4. Final Restart
echo "✨ Fix complete! Now restarting containers to apply changes..."
docker-compose up -d --build api-gateway order-service payment-service

echo "⏳ Waiting 30 seconds for Eureka to sync..."
sleep 30

echo "📋 Final Test Recommendation:"
echo "Try to access: http://localhost:8081/api/products (Directly)"
echo "Then try: http://localhost:8085/api/products (Through Gateway)"
