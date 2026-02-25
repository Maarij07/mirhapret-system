# Quick Start Guide

Get the e-commerce platform running in minutes.

## 1. Prerequisites

Ensure you have installed:
- **Node.js 20+** → [Download](https://nodejs.org)
- **.NET 8 SDK** → [Download](https://dotnet.microsoft.com/download)
- **Docker Desktop** → [Download](https://www.docker.com/products/docker-desktop)

Verify installation:
```bash
node --version     # v20.x.x or higher
dotnet --version   # 8.0.x or higher
docker --version   # 24.x.x or higher
```

## 2. Clone and Initial Setup

```bash
# Navigate to project directory
cd d:\temp\development\mirhapret-system

# Copy environment template
copy .env.example .env

# Start Docker services (PostgreSQL, Redis, RabbitMQ)
docker-compose up -d

# Wait 10-15 seconds for services to initialize
```

## 3. Start Backend (NestJS API)

```bash
# Open new terminal
cd apps\backend

# Start development server (with hot reload)
npm run start:dev
```

**API will be at**: http://localhost:3000/api/v1

## 4. Start E-commerce Frontend

```bash
# Open new terminal
cd apps\ecommerce

# Start development server
npm run dev
```

**Store will be at**: http://localhost:3001

## 5. Start Admin Portal

```bash
# Open new terminal
cd apps\admin

# Start development server
npm run dev
```

**Admin will be at**: http://localhost:3002

## 6. Start POS System

```bash
# Open new terminal
cd apps\pos

# Run the application
dotnet run
```

## 7. Verify Everything Works

### Check Backend API
```bash
# In any terminal, run:
curl http://localhost:3000/api/v1/health
```

Should return: `{"status":"ok"}`

### Check Store Frontend
Open browser to: http://localhost:3001

### Check Admin Portal
Open browser to: http://localhost:3002

### Check Docker Services
```bash
docker-compose ps
```

Should show all services running:
- postgres (healthy)
- redis (healthy)
- rabbitmq (healthy)

## Default Access

| Service | URL | Notes |
|---------|-----|-------|
| Store | http://localhost:3001 | Customer-facing website |
| Admin | http://localhost:3002 | Management dashboard |
| API | http://localhost:3000/api/v1 | REST endpoints |
| API Docs | http://localhost:3000/api/docs | Swagger documentation |
| RabbitMQ | http://localhost:15672 | Guest/Guest |

## Important: Update Environment Variables

Before testing, update `.env` with:

```env
# Generate secure random strings (min 32 characters)
JWT_SECRET=your-secure-random-string-here-min-32-chars
JWT_REFRESH_SECRET=another-secure-random-string-min-32

# Add Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Stopping Everything

```bash
# Stop Docker containers (preserves data)
docker-compose down

# Stop Node/Dotnet servers: Press Ctrl+C in each terminal
```

## Clean Reset (Delete All Data)

⚠️ **WARNING**: This deletes all database data!

```bash
# Stop and remove everything including volumes
docker-compose down -v

# Remove node_modules (optional)
rmdir /s apps\backend\node_modules
rmdir /s apps\ecommerce\node_modules
rmdir /s apps\admin\node_modules

# Restart from step 2
```

## Common Issues

### Issue: "Port 3000 already in use"
```bash
# Find process using port 3000 (Windows)
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Or change port in backend .env: PORT=3001
```

### Issue: "Cannot connect to PostgreSQL"
```bash
# Check if PostgreSQL container is running
docker ps | findstr postgres

# Restart container
docker-compose restart postgres

# Check logs
docker logs ecommerce_postgres
```

### Issue: "npm dependencies not installed"
```bash
# Clear cache and reinstall
npm cache clean --force
rmdir /s node_modules
npm install
```

### Issue: ".NET build error"
```bash
# Restore NuGet packages
cd apps\pos
dotnet restore
dotnet build
```

## Next Steps

1. **Read Documentation**
   - [README.md](../README.md) - Project overview
   - [Development Guide](../docs/DEVELOPMENT.md) - How to build features
   - [Deployment Guide](../docs/DEPLOYMENT.md) - How to go live

2. **Explore Sample Data**
   - Create products in Admin dashboard
   - Browse products in Store
   - View orders in Admin

3. **Test API**
   - Visit http://localhost:3000/api/docs
   - Try sample requests

4. **Start Development**
   - Create a feature branch
   - Follow the development guide
   - Make changes and test locally

## Getting Help

- Check [DEVELOPMENT.md](../docs/DEVELOPMENT.md) for detailed guides
- Review [system_prompt.md](../system_prompt.md) for technical specs
- Check Docker logs: `docker logs <container-name>`
- Review application console output for error messages

## Tech Stack Summary

- **Backend**: NestJS + TypeScript + PostgreSQL
- **Frontend Store**: Next.js 14 + TypeScript + Tailwind + shadcn/ui
- **Frontend Admin**: Next.js 14 + TypeScript + Tailwind + shadcn/ui
- **POS System**: .NET 8 WPF + SQLite
- **Infrastructure**: Docker + Docker Compose + Nginx
- **Database**: PostgreSQL + Redis + RabbitMQ

## Directory Structure

```
ecommerce-platform/
├── apps/
│   ├── backend/          ← NestJS API
│   ├── ecommerce/        ← Next.js Store
│   ├── admin/            ← Next.js Admin
│   └── pos/              ← .NET POS
├── infrastructure/
│   ├── docker/           ← Docker configs
│   └── scripts/          ← Utility scripts
├── docs/                 ← Documentation
├── docker-compose.yml    ← Container setup
├── .env                  ← Configuration (created)
└── README.md             ← This file
```

---

**Happy coding! 🚀**
