#!/bin/bash

# Configuration
DASHBOARD_DIR="ecommerce-dashboard"

echo "🚀 Starting Dashboard Fix Script..."

if [ ! -d "$DASHBOARD_DIR" ]; then
    echo "❌ Error: $DASHBOARD_DIR not found. Please run this script in the root of the microservices project."
    exit 1
fi

cd "$DASHBOARD_DIR"

# 1. Clear Angular Cache
echo "🧹 Cleaning Angular cache..."
rm -rf .angular

# 2. Clean Node Modules (if corruption is suspected)
echo "🧹 Cleaning node_modules..."
rm -rf node_modules package-lock.json

# 3. Reinstall dependencies
echo "📦 Reinstalling dependencies (this may take a few minutes)..."
npm install --legacy-peer-deps

# 4. Final Recommendation
echo "✨ Cleanup complete!"
echo "--------------------------------------------------------"
echo "💡 CRITICAL TIP FOR WSL USERS:"
echo "The 'input/output error' usually happens because the project is in a Windows folder (/mnt/c/)."
echo "For best performance and to avoid these errors, please move your project to your home directory:"
echo "Example: mv /mnt/c/Users/.../ecommerce-microservices /home/nassima-elhattabi/"
echo "--------------------------------------------------------"
echo "Now try to run: npm start"
