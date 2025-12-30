#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Ecommerce Microservices...${NC}"

# Check for Maven Wrapper
if [ ! -f "./mvnw" ]; then
    echo "Error: mvnw not found in current directory."
    exit 1
fi

chmod +x mvnw

# Function to run service
run_service() {
    name=$1
    path=$2
    
    echo -e "${GREEN}Starting $name...${NC}"
    
    if command -v gnome-terminal &> /dev/null; then
        # Open in new tab for Gnome Terminal (Standard Ubuntu/Linux)
        gnome-terminal --tab --title="$name" -- bash -c "./mvnw -f $path spring-boot:run; echo 'Service Stopped'; exec bash"
    elif command -v xterm &> /dev/null; then
        # Fallback to xterm
        xterm -T "$name" -e "./mvnw -f $path spring-boot:run" &
    elif command -v konsole &> /dev/null; then
        # Fallback to KDE konsole
        konsole --new-tab --title "$name" -e bash -c "./mvnw -f $path spring-boot:run; exec bash" &
    else
        # Fallback to background process
        echo "No terminal emulator found. Running in background (logs in $name.log)"
        nohup ./mvnw -f $path spring-boot:run > "$name.log" 2>&1 &
    fi
}

# 1. Infrastructure Services
run_service "Config Server" "config-server/config-server"
echo "⏳ Waiting 15s for Config Server..."
sleep 15

run_service "Eureka Server" "eureka-server/eureka-server"
echo "⏳ Waiting 15s for Eureka Server..."
sleep 15

# 2. Gateways & Core
run_service "API Gateway" "api-gateway/api-gateway"
run_service "Notification Service" "notification-service/notification-service"

# 3. Business Logic Services
run_service "Product Service" "product-service/product-service"
run_service "Order Service" "order-service/order-service"
run_service "Payment Service" "payment-service/payment-service"
run_service "Client Service" "client-service/client-service"

echo -e "${BLUE}✅ All services launch commands issued!${NC}"
echo "Check the opened terminal tabs or log files."
