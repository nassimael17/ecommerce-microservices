#!/bin/bash
# === Create Dockerfile, application.yml and main class for each microservice ===

services=("config-server" "eureka-server" "api-gateway" "product-service" "client-service" "order-service" "payment-service" "notification-service" "batch-service")

for s in "${services[@]}"
do
  echo "🔧 Setting up $s ..."
  base_dir="$HOME/Java-Project/ecommerce-microservices/$s/$s"

  if [ ! -d "$base_dir" ]; then
    echo "⚠️  Directory $base_dir not found, skipping..."
    continue
  fi

  # Create folders
  mkdir -p "$base_dir/src/main/resources"
  mkdir -p "$base_dir/src/main/java/com/ecommerce/${s//-//}"

  # Create main class
  cat > "$base_dir/src/main/java/com/ecommerce/${s//-//}/MainApplication.java" <<EOF
package com.ecommerce.${s//-/.};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MainApplication {
    public static void main(String[] args) {
        SpringApplication.run(MainApplication.class, args);
    }
}
EOF

  # Create application.yml
  cat > "$base_dir/src/main/resources/application.yml" <<EOF
server:
  port: 0

spring:
  application:
    name: ${s}
EOF

  # Create Dockerfile
  cat > "$base_dir/Dockerfile" <<'EOF'
FROM openjdk:17-jdk-slim
VOLUME /tmp
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
EOF

  echo "✅ Added files for $s"
done

echo "🎉 All microservices updated successfully!"
