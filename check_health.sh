#!/bin/bash

echo "🔍 Checking System Health..."

# 1. Check Container Status
echo "📦 Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 2. Check Eureka Registration
echo -e "\n📡 Checking Eureka Service Registry..."
EUREKA_URL="http://localhost:8761/eureka/apps"
curl -s -H "Accept: application/json" "$EUREKA_URL" | grep -o '"name":"[^"]*"' | sort -u

echo -e "\n💡 If you don't see PRODUCT-SERVICE or ORDER-SERVICE above, they are NOT registered yet."

# 3. Test direct connectivity (bypassing Gateway)
echo -e "\n🔌 Testing direct service ports..."
check_port() {
    if nc -z localhost $1 2>/dev/null; then
        echo "   ✅ Port $1 ($2) is OPEN"
    else
        echo "   ❌ Port $1 ($2) is CLOSED"
    fi
}

check_port 8761 "Eureka"
check_port 8888 "Config Server"
check_port 8085 "API Gateway"
check_port 8081 "Product Service"
check_port 8082 "Order Service"
check_port 8084 "Client Service"

echo -e "\n📋 Recommendation:"
echo "1. If a port is CLOSED, check the logs: docker logs ecommerce-microservices-<service>-1"
echo "2. If all ports are OPEN but Eureka is empty, wait 30 seconds for services to register."
echo "3. If Gateways shows 'Connection Refused', TRY RESTARTING THE GATEWAY:"
echo "   docker-compose restart api-gateway"
