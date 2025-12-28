#!/bin/bash
set -e

echo "🧹 Cleaning and packaging all microservices..."

# 1️⃣ Build each microservice
for service in config-server eureka-server product-service order-service notification-service api-gateway
do
  echo "⚙️ Building $service ..."
  cd $service/$service
  mvn clean package -DskipTests
  cd ../..
done

echo "✅ All services built successfully!"

# 2️⃣ Rebuild docker images
echo "🐳 Rebuilding Docker containers..."
docker compose down -v
docker compose build
docker compose up -d

echo "✅ All containers started!"

# 3️⃣ Wait a few seconds for startup
echo "⏳ Waiting for services to start..."
sleep 15



