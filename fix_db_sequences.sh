#!/bin/bash

# Configuration - Attempt to auto-discover the postgres container
POSTGRES_CONTAINER=$(docker ps --format '{{.Names}}' | grep "postgres" | head -n 1)

echo "🚀 Starting Database Sequence Fix Script..."

# check if docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running or you don't have permissions."
    exit 1
fi

# check if postgres container was found
if [ -z "$POSTGRES_CONTAINER" ]; then
    echo "❌ Error: Could not find a running container with 'postgres' in its name."
    exit 1
fi

echo "🔍 Found Postgres container: $POSTGRES_CONTAINER"
echo "📊 Resetting sequences for existing tables..."

# Function to reset sequence for a table if it exists
reset_seq() {
    local table=$1
    echo "   Checking table: $table..."
    docker exec -i "$POSTGRES_CONTAINER" psql -U postgres -d ecommerce -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');" | grep -q 't'
    if [ $? -eq 0 ]; then
        echo "   ✅ Table '$table' found. Syncing sequence..."
        docker exec -i "$POSTGRES_CONTAINER" psql -U postgres -d ecommerce -c "SELECT setval(pg_get_serial_sequence('$table', 'id'), coalesce(max(id), 1)) FROM $table;"
    else
        echo "   ⏭️ Table '$table' not found. Skipping."
    fi
}

# Try both singular and plural names commonly used
reset_seq "clients"
reset_seq "client"
reset_seq "products"
reset_seq "product"
reset_seq "orders"
reset_seq "order"
reset_seq "payments"
reset_seq "payment"
reset_seq "users"
reset_seq "user"

echo "✨ Sequence synchronization complete!"
