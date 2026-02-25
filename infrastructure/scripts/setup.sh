#!/bin/bash

# E-commerce Platform Setup Script
# This script initializes the development environment

set -e

echo "================================"
echo "E-commerce Platform Setup"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Please install Node.js 20+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Please install Docker${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker $(docker --version)${NC}"

# Check .NET
if ! command -v dotnet &> /dev/null; then
    echo -e "${YELLOW}.NET SDK not found. Please install .NET 8 SDK${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .NET $(dotnet --version | head -n 1)${NC}"

# Copy environment file
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please update .env with your configuration${NC}"
    echo -e "${YELLOW}Special attention to JWT_SECRET and JWT_REFRESH_SECRET${NC}"
fi

# Start Docker services
echo -e "${BLUE}Starting Docker services...${NC}"
docker-compose up -d postgres redis rabbitmq

echo -e "${BLUE}Waiting for PostgreSQL to be ready...${NC}"
sleep 10

# Check if PostgreSQL is ready
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}PostgreSQL not responding after 30 seconds${NC}"
        exit 1
    fi
    echo "Waiting... ($i/30)"
    sleep 1
done

# Install backend dependencies
echo -e "${BLUE}Setting up backend...${NC}"
cd apps/backend
npm install
cd ../..

# Install ecommerce dependencies
echo -e "${BLUE}Setting up e-commerce frontend...${NC}"
cd apps/ecommerce
npm install
cd ../..

# Install admin dependencies
echo -e "${BLUE}Setting up admin portal...${NC}"
cd apps/admin
npm install
cd ../..

# Install POS dependencies
echo -e "${BLUE}Setting up POS system...${NC}"
cd apps/pos
dotnet restore
cd ../..

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Update .env file with your configuration"
echo "   Required:"
echo "   - JWT_SECRET (min 32 characters)"
echo "   - JWT_REFRESH_SECRET (min 32 characters)"
echo "   - CLOUDINARY_* credentials"
echo ""
echo "2. Start services in separate terminals:"
echo "   Terminal 1: docker-compose up -d"
echo "   Terminal 2: cd apps/backend && npm run start:dev"
echo "   Terminal 3: cd apps/ecommerce && npm run dev"
echo "   Terminal 4: cd apps/admin && npm run dev"
echo "   Terminal 5: cd apps/pos && dotnet run"
echo ""
echo "3. Access applications:"
echo "   - API: http://localhost:3000"
echo "   - Store: http://localhost:3001"
echo "   - Admin: http://localhost:3002"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "   - README.md - Project overview"
echo "   - docs/DEVELOPMENT.md - Development guide"
echo "   - docs/DEPLOYMENT.md - Deployment guide"
echo "   - system_prompt.md - Technical specifications"
