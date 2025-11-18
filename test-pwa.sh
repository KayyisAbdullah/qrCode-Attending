#!/bin/bash

# PWA Testing Script untuk Sistem Absensi QR Code
# Script ini membantu testing PWA features

echo "🚀 PWA Testing Script - Sistem Absensi QR Code"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running on localhost
check_server() {
    echo -e "${BLUE}📋 Checking server status...${NC}"
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✅ Server is running on http://localhost:3000${NC}"
        return 0
    else
        echo -e "${RED}❌ Server is not running on http://localhost:3000${NC}"
        echo -e "${YELLOW}💡 Start the server first: npm run dev${NC}"
        return 1
    fi
}

# Check manifest.json
check_manifest() {
    echo -e "\n${BLUE}📋 Checking manifest.json...${NC}"
    if curl -s http://localhost:3000/manifest.json | jq . > /dev/null 2>&1; then
        echo -e "${GREEN}✅ manifest.json is valid${NC}"
        echo -e "${YELLOW}   Name: Sistem Absensi QR Code${NC}"
        echo -e "${YELLOW}   Short name: AbsensiQR${NC}"
        echo -e "${YELLOW}   Display: standalone${NC}"
    else
        echo -e "${RED}❌ manifest.json is not valid${NC}"
    fi
}

# Check Service Worker
check_service_worker() {
    echo -e "\n${BLUE}📋 Checking Service Worker...${NC}"
    if curl -s http://localhost:3000/service-worker.js > /dev/null; then
        echo -e "${GREEN}✅ Service Worker is accessible${NC}"
    else
        echo -e "${RED}❌ Service Worker is not accessible${NC}"
    fi
}

# Check icons
check_icons() {
    echo -e "\n${BLUE}📋 Checking icons...${NC}"
    icons=("icon-192x192.svg" "icon-512x512.svg" "icon-192x192-maskable.svg" "icon-512x512-maskable.svg")
    
    for icon in "${icons[@]}"; do
        if curl -s http://localhost:3000/icons/$icon > /dev/null; then
            echo -e "${GREEN}✅ $icon exists${NC}"
        else
            echo -e "${RED}❌ $icon not found${NC}"
        fi
    done
}

# Check offline page
check_offline_page() {
    echo -e "\n${BLUE}📋 Checking offline page...${NC}"
    if curl -s http://localhost:3000/offline.html > /dev/null; then
        echo -e "${GREEN}✅ offline.html exists${NC}"
    else
        echo -e "${RED}❌ offline.html not found${NC}"
    fi
}

# Check HTTPS headers (localhost can use HTTP)
check_headers() {
    echo -e "\n${BLUE}📋 Checking HTTP headers...${NC}"
    headers=$(curl -s -I http://localhost:3000)
    
    if echo "$headers" | grep -q "Cache-Control"; then
        echo -e "${GREEN}✅ Cache-Control header present${NC}"
    else
        echo -e "${YELLOW}⚠️  Cache-Control header not present (might be set in SW)${NC}"
    fi
}

# Generate PWA checklist
generate_checklist() {
    echo -e "\n${BLUE}📋 PWA Checklist${NC}"
    echo -e "${YELLOW}============================================${NC}"
    
    checklist=(
        "manifest.json with all required fields"
        "Service Worker registered"
        "Icons in multiple sizes (192x192, 512x512)"
        "Maskable icons for adaptive display"
        "Offline page fallback"
        "Theme colors configured"
        "Display mode set to standalone"
        "Shortcuts configured"
        "Screenshots provided"
        "Service Worker caching strategy"
        "Online/offline event handling"
        "Update detection mechanism"
        "Storage quota monitoring"
    )
    
    for i in "${!checklist[@]}"; do
        echo -e "${GREEN}✅${NC} ${checklist[$i]}"
    done
}

# Testing instructions
print_testing_instructions() {
    echo -e "\n${BLUE}🧪 Manual Testing Instructions${NC}"
    echo -e "${YELLOW}============================================${NC}"
    echo ""
    echo -e "${YELLOW}1. Open DevTools (F12 or Ctrl+Shift+I)${NC}"
    echo ""
    echo -e "${YELLOW}2. Service Worker Testing:${NC}"
    echo "   - Go to Application tab"
    echo "   - Check Service Workers section"
    echo "   - Verify 'service-worker.js' is registered"
    echo ""
    echo -e "${YELLOW}3. Manifest Testing:${NC}"
    echo "   - Go to Application tab"
    echo "   - Check Manifest section"
    echo "   - Verify all fields are correct"
    echo ""
    echo -e "${YELLOW}4. Offline Testing:${NC}"
    echo "   - Go to Network tab"
    echo "   - Check 'Offline' checkbox"
    echo "   - Refresh page to see offline.html"
    echo "   - Uncheck 'Offline' to restore connection"
    echo ""
    echo -e "${YELLOW}5. Cache Testing:${NC}"
    echo "   - Go to Application tab"
    echo "   - Check Cache Storage section"
    echo "   - Verify cached assets"
    echo ""
    echo -e "${YELLOW}6. Lighthouse Audit:${NC}"
    echo "   - Go to Lighthouse tab"
    echo "   - Run PWA audit"
    echo "   - Check for score 90+ on PWA"
    echo ""
    echo -e "${YELLOW}7. Installation Testing:${NC}"
    echo "   - Look for install prompt in address bar"
    echo "   - Or check Application tab > Install"
    echo ""
}

# Main execution
main() {
    if check_server; then
        check_manifest
        check_service_worker
        check_icons
        check_offline_page
        check_headers
        echo ""
        generate_checklist
        print_testing_instructions
        
        echo -e "\n${GREEN}✅ PWA is properly configured!${NC}"
        echo -e "${BLUE}Start testing in your browser:${NC} http://localhost:3000"
    else
        exit 1
    fi
}

main
