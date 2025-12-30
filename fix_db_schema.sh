#!/bin/bash

# Configuration - Attempt to auto-discover the postgres container
POSTGRES_CONTAINER=$(docker ps --format '{{.Names}}' | grep "postgres" | head -n 1)

echo "🚀 Starting Database Schema Fix Script..."

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
echo "🛠️  Updating 'product' table schema..."

# SQL to add missing columns if they don't exist
SQL_COMMAND=$(cat <<EOF
-- Add 'available' column if missing
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product' AND column_name='available') THEN
        ALTER TABLE product ADD COLUMN available BOOLEAN DEFAULT TRUE;
        UPDATE product SET available = TRUE;
        RAISE NOTICE 'Added column available to product table';
    END IF;
END
\$\$;

-- Add 'image_url' column if missing (just in case)
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product' AND column_name='image_url') THEN
        ALTER TABLE product ADD COLUMN image_url VARCHAR(255);
        RAISE NOTICE 'Added column image_url to product table';
    END IF;
END
\$\$;

-- --- FIX FOR ORDERS TABLE ---

-- Add 'client_id' column if missing
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='client_id') THEN
        ALTER TABLE orders ADD COLUMN client_id BIGINT;
        -- If user_id exists, copy it to client_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='user_id') THEN
            UPDATE orders SET client_id = user_id;
        END IF;
        RAISE NOTICE 'Added column client_id to orders table';
    END IF;
END
\$\$;

-- Add 'product_id' column if missing
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='product_id') THEN
        ALTER TABLE orders ADD COLUMN product_id BIGINT;
        RAISE NOTICE 'Added column product_id to orders table';
    END IF;
END
\$\$;
EOF
)

# Execute SQL inside the container
docker exec -i "$POSTGRES_CONTAINER" psql -U postgres -d ecommerce -c "$SQL_COMMAND"

echo "✨ Schema update complete!"
echo "Now restart the product service to be sure:"
echo "docker-compose restart product-service"
