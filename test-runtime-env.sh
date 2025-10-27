#!/bin/bash

# Script to test runtime environment variables with Docker
# This simulates how your tenant controller should inject env vars

echo "🐳 Building Docker image..."
docker build -t webshop-test:latest .

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "🚀 Starting container with runtime env vars..."
echo ""

# Start container with runtime env vars (simulating tenant controller)
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:8080" \
  -e NEXT_PUBLIC_SHOP_ID="60f7b3b3b3b3b3b3b3b3b3b3" \
  -e NEXT_PUBLIC_BASE_URL="http://localhost:3000" \
  webshop-test:latest

echo ""
echo "📊 Container stopped"

