#!/bin/bash

# Dominic's Tasks Deployment Script
# This script handles building and deploying the application to Cloudflare Pages

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Dominic's Tasks Deployment Script ===${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Run this script from the project root.${NC}"
    exit 1
fi

# Parse command line arguments
ENVIRONMENT="production"
DRY_RUN=false
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --staging)
            ENVIRONMENT="staging"
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --help)
            echo "Usage: ./deploy.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --staging     Deploy to staging environment"
            echo "  --dry-run     Perform build and checks without deploying"
            echo "  --force       Skip confirmation prompts"
            echo "  --help        Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Dry run: ${DRY_RUN}${NC}"

# Check for required tools
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed. Please install it first.${NC}"
        exit 1
    fi
}

echo -e "\n${GREEN}Checking required tools...${NC}"
check_tool "node"
check_tool "npm"
check_tool "wrangler"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
if [ $NODE_MAJOR -lt 18 ]; then
    echo -e "${RED}Error: Node.js version 18 or higher is required. Found version ${NODE_VERSION}.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

# Check if environment variables are set for production
if [ "$ENVIRONMENT" = "production" ] && [ "$DRY_RUN" = false ]; then
    echo -e "\n${GREEN}Checking environment variables...${NC}"
    
    # Check for Firebase environment variables
    if [ -z "$VITE_FIREBASE_API_KEY" ]; then
        echo -e "${YELLOW}Warning: VITE_FIREBASE_API_KEY is not set${NC}"
        echo "You can set it in .env.production or as an environment variable"
        
        if [ "$FORCE" = false ]; then
            read -p "Continue anyway? (y/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "Aborting deployment."
                exit 1
            fi
        fi
    else
        echo -e "${GREEN}✓ Firebase environment variables are set${NC}"
    fi
fi

# Install dependencies
echo -e "\n${GREEN}Installing dependencies...${NC}"
npm ci --silent
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Run tests
echo -e "\n${GREEN}Running tests...${NC}"
if npm test -- --pass-with-no-tests; then
    echo -e "${GREEN}✓ Tests passed${NC}"
else
    echo -e "${RED}✗ Tests failed${NC}"
    
    if [ "$FORCE" = false ]; then
        read -p "Continue with deployment anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Aborting deployment."
            exit 1
        fi
    fi
fi

# Build the application
echo -e "\n${GREEN}Building application...${NC}"
if [ "$ENVIRONMENT" = "production" ]; then
    npm run build
else
    # For staging, we might want different build options
    VITE_DEV_MODE=true npm run build
fi

# Verify build output
echo -e "\n${GREEN}Verifying build output...${NC}"
if [ -f "dist/index.html" ] && [ -d "dist/assets" ]; then
    echo -e "${GREEN}✓ Build output verified${NC}"
    echo "  - dist/index.html: $(stat -f%z dist/index.html) bytes"
    echo "  - dist/assets: $(find dist/assets -type f | wc -l) files"
else
    echo -e "${RED}✗ Build output verification failed${NC}"
    ls -la dist/
    exit 1
fi

# Deploy to Cloudflare Pages
if [ "$DRY_RUN" = false ]; then
    echo -e "\n${GREEN}Deploying to Cloudflare Pages (${ENVIRONMENT})...${NC}"
    
    if [ "$FORCE" = false ]; then
        echo -e "${YELLOW}About to deploy to ${ENVIRONMENT} environment.${NC}"
        read -p "Continue with deployment? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Deployment cancelled."
            exit 0
        fi
    fi
    
    # Deploy using wrangler
    if [ "$ENVIRONMENT" = "staging" ]; then
        echo "Deploying to staging..."
        wrangler pages deploy dist --project-name=dominicstasks --branch=develop
    else
        echo "Deploying to production..."
        wrangler pages deploy dist --project-name=dominicstasks
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✓ Deployment successful!${NC}"
        echo -e "${YELLOW}The application should be live in a few minutes.${NC}"
    else
        echo -e "\n${RED}✗ Deployment failed${NC}"
        exit 1
    fi
else
    echo -e "\n${GREEN}✓ Dry run completed successfully${NC}"
    echo "The application is ready for deployment."
    echo "To deploy, run: ./deploy.sh"
fi

echo -e "\n${GREEN}=== Deployment script completed ===${NC}"