#!/bin/bash

# Verification script for production dynamic page rendering fix
# Run this script to verify your environment is correctly configured

echo "🔍 Verifying Production Fix for Dynamic Page Rendering"
echo "======================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running in production
if [ "$NODE_ENV" = "production" ]; then
    echo -e "${GREEN}✅ Running in production mode${NC}"
else
    echo -e "${YELLOW}⚠️  Not in production mode (NODE_ENV=$NODE_ENV)${NC}"
fi
echo ""

# Check required environment variables
echo "Checking required environment variables..."
echo ""

# Check NEXT_PUBLIC_API_URL
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_API_URL is NOT set${NC}"
    ERROR=1
else
    echo -e "${GREEN}✅ NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}${NC}"
fi

# Check NEXT_PUBLIC_SHOP_ID
if [ -z "$NEXT_PUBLIC_SHOP_ID" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_SHOP_ID is NOT set${NC}"
    ERROR=1
else
    echo -e "${GREEN}✅ NEXT_PUBLIC_SHOP_ID=${NEXT_PUBLIC_SHOP_ID}${NC}"
fi

# Check NEXT_PUBLIC_BASE_URL
if [ -z "$NEXT_PUBLIC_BASE_URL" ]; then
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_BASE_URL is NOT set (recommended for SEO)${NC}"
else
    echo -e "${GREEN}✅ NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}${NC}"
fi

# Check BACKEND_KUBE_URL (recommended for Kubernetes)
if [ -z "$BACKEND_KUBE_URL" ]; then
    echo -e "${YELLOW}⚠️  BACKEND_KUBE_URL is NOT set${NC}"
    echo -e "   ${YELLOW}For optimal performance in Kubernetes, set this to your internal service URL${NC}"
    echo -e "   ${YELLOW}Example: http://backend-service:8080${NC}"
else
    echo -e "${GREEN}✅ BACKEND_KUBE_URL=${BACKEND_KUBE_URL}${NC}"
fi

echo ""
echo "======================================================="

if [ "$ERROR" = "1" ]; then
    echo -e "${RED}❌ Environment configuration has ERRORS${NC}"
    echo -e "${RED}   Please fix the issues above before deploying${NC}"
    echo ""
    echo "See RUNTIME_ENV.md for configuration instructions"
    exit 1
else
    echo -e "${GREEN}✅ Environment configuration looks good!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Deploy the updated code to production"
    echo "2. Check pod logs for successful API URL initialization"
    echo "3. Create a test page in the builder"
    echo "4. Verify the page renders without 500 errors"
    echo ""
    echo "Look for these log messages in your pod:"
    echo "  - [safeGetAllLayouts] Successfully fetched X layouts"
    echo "  - [DynamicPage] Successfully found layout for route: ..."
    echo ""
    exit 0
fi

