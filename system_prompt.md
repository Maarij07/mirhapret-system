# SYSTEM PROMPT: E-commerce Platform with Offline POS
# Save this file as: system_prompt.md
# Use with: VS Code Copilot or any AI coding assistant

---

## PROJECT MISSION

Build a production-ready e-commerce platform with 4 applications:
1. **E-commerce Store** (Next.js 14) - Customer-facing online store  
2. **Admin Portal** (Next.js 14) - Management dashboard
3. **POS System** (.NET 8) - Offline-first point-of-sale  
4. **Backend API** (NestJS) - Single unified backend

**Critical Requirements:**
- Handle 1500-3000+ monthly customers
- POS works 100% offline, syncs when online
- Real-time inventory across all channels
- Single PostgreSQL database
- Cloudinary for all media
- Production-ready, scalable architecture

---

## TECHNOLOGY DECISIONS (NON-NEGOTIABLE)

```yaml
Frontend:
  Ecommerce: Next.js 14 + TypeScript + Tailwind + shadcn/ui
  Admin: Next.js 14 + TypeScript + Tailwind + shadcn/ui
  POS: .NET 8 (WPF/MAUI) + SQLite (offline)

Backend:
  Framework: NestJS + TypeScript
  Database: PostgreSQL 15+
  Cache: Redis 7
  Queue: RabbitMQ
  Auth: JWT (access 15m, refresh 7d)
  Media: Cloudinary
  API: RESTful + WebSocket (real-time)

Infrastructure:
  Containers: Docker + Docker Compose
  Gateway: Nginx
  Monitoring: Logging + Error Tracking
  Deployment: Cloud-agnostic (AWS/GCP/Azure)
```

---

## FOLDER STRUCTURE

```
ecommerce-platform/
├── apps/
│   ├── backend/              # NestJS API (PORT 3000)
│   ├── ecommerce/            # Next.js Store (PORT 3001)
│   ├── admin/                # Next.js Admin (PORT 3002)
│   └── pos/                  # .NET POS Desktop App
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.ecommerce
│   │   ├── Dockerfile.admin
│   │   └── nginx.conf
│   └── scripts/
├── docs/
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## DATABASE SCHEMA (PostgreSQL)

### Core Tables

```sql
-- Users (customers, admins, cashiers)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'customer', -- super_admin, admin, store_manager, cashier, customer
  is_active BOOLEAN DEFAULT true,
  store_id UUID REFERENCES stores(id),
  avatar_url TEXT,
  address JSONB,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Stores
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  store_code VARCHAR(50) UNIQUE NOT NULL, -- STORE001, STORE002
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  settings JSONB, -- {timezone, currency, taxRate, receiptFooter}
  business_hours JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories (hierarchical)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  images JSONB DEFAULT '[]', -- ["url1", "url2"]
  main_image TEXT,
  attributes JSONB, -- {size: "M", color: "red"}
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  weight INTEGER DEFAULT 0, -- grams
  dimensions JSONB, -- {length, width, height, unit}
  seo JSONB, -- {metaTitle, metaDescription, keywords}
  barcode VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);

-- Inventory (per store + online)
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id), -- NULL = online inventory
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0, -- for pending orders
  low_stock_threshold INTEGER DEFAULT 5,
  max_stock_level INTEGER DEFAULT 100,
  location VARCHAR(100), -- shelf location in store
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, store_id)
);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_store ON inventory(store_id);

-- Customers (loyalty, history)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address JSONB,
  loyalty_points INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  preferences JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_purchase_at TIMESTAMP
);
CREATE INDEX idx_customers_email ON customers(email);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL, -- ORD-20240125-0001
  customer_id UUID REFERENCES users(id),
  customer_info JSONB, -- {email, firstName, lastName, phone}
  source VARCHAR(20) DEFAULT 'online', -- online, pos, phone
  store_id UUID REFERENCES stores(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled, refunded
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50), -- cash, card, online
  payment_transaction_id TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  tracking_number VARCHAR(100),
  pos_transaction_id VARCHAR(100), -- from POS system
  cashier_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_store ON orders(store_id);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(300) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  attributes JSONB -- selected size, color, etc.
);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Sync Logs (POS sync tracking)
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id),
  pos_device_id VARCHAR(100) NOT NULL,
  operation VARCHAR(50) NOT NULL, -- create_order, update_inventory, create_customer
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, success, failed, conflict
  data JSONB NOT NULL, -- the actual data being synced
  entity_id UUID, -- reference to created entity
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  client_timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);
CREATE INDEX idx_sync_logs_store ON sync_logs(store_id);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);
CREATE INDEX idx_sync_logs_created ON sync_logs(created_at);

-- Conflict Resolutions
CREATE TABLE conflict_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_log_id UUID NOT NULL REFERENCES sync_logs(id),
  conflict_type VARCHAR(50) NOT NULL, -- inventory_mismatch, duplicate_order, product_modified
  server_data JSONB NOT NULL,
  client_data JSONB NOT NULL,
  resolution VARCHAR(50) DEFAULT 'pending', -- pending, server_wins, client_wins, merged, manual
  resolved_data JSONB,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);
```

---

## BACKEND API (NestJS) - COMPLETE SETUP

### Step 1: Initialize Backend

```bash
cd apps
npx @nestjs/cli new backend
cd backend

# Install all dependencies
npm install @nestjs/config @nestjs/typeorm @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
npm install typeorm pg redis ioredis
npm install @nestjs/bull bull
npm install class-validator class-transformer
npm install bcrypt uuid
npm install @nestjs/swagger
npm install cloudinary
npm install amqplib @golevelup/nestjs-rabbitmq
npm install @nestjs/throttler

# Dev dependencies
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt @types/node
```

### Step 2: Environment Variables

Create `apps/backend/.env`:
```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ecommerce_db

REDIS_HOST=localhost
REDIS_PORT=6379

RABBITMQ_URL=amqp://guest:guest@localhost:5672

JWT_SECRET=change-this-to-a-secure-secret-min-32-characters
JWT_REFRESH_SECRET=change-this-refresh-secret-min-32-characters
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CORS_ORIGINS=http://localhost:3001,http://localhost:3002
```

### Step 3: Main Application Module

Create `apps/backend/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Use migrations in production
        logging: true,
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: +config.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    // Add your modules here
  ],
})
export class AppModule {}
```

### Step 4: Create All Modules

```bash
# Generate modules
nest g module auth
nest g module users
nest g module products
nest g module categories
nest g module inventory
nest g module orders
nest g module customers
nest g module stores
nest g module sync
nest g module cloudinary
nest g module analytics

# Generate services
nest g service auth
nest g service users
nest g service products
nest g service categories
nest g service inventory
nest g service orders
nest g service customers
nest g service stores
nest g service sync
nest g service cloudinary

# Generate controllers
nest g controller auth
nest g controller users
nest g controller products
nest g controller categories
nest g controller inventory
nest g controller orders
nest g controller customers
nest g controller stores
nest g controller sync
```

### Step 5: Auth Module (JWT Strategy)

Create `apps/backend/src/auth/strategies/jwt.strategy.ts`:
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

### Step 6: Key API Endpoints to Implement

```typescript
// Products Controller
GET    /api/v1/products              // List products (paginated, filtered)
GET    /api/v1/products/:id          // Get product details
POST   /api/v1/products              // Create product (admin)
PUT    /api/v1/products/:id          // Update product (admin)
DELETE /api/v1/products/:id          // Delete product (admin)
POST   /api/v1/products/:id/images   // Upload product images

// Orders Controller
GET    /api/v1/orders                // List orders
GET    /api/v1/orders/:id            // Get order details
POST   /api/v1/orders                // Create order
PUT    /api/v1/orders/:id/status     // Update order status
POST   /api/v1/orders/:id/cancel     // Cancel order

// Inventory Controller
GET    /api/v1/inventory             // Get inventory levels
GET    /api/v1/inventory/:productId  // Get product inventory
PUT    /api/v1/inventory/:productId  // Update inventory
POST   /api/v1/inventory/adjust      // Bulk adjust inventory

// Sync Controller (POS)
POST   /api/v1/sync/transactions     // Batch upload POS transactions
POST   /api/v1/sync/inventory        // Sync inventory changes
GET    /api/v1/sync/delta            // Get changes since timestamp
POST   /api/v1/sync/conflicts/resolve // Resolve sync conflicts

// Auth Controller
POST   /api/v1/auth/register         // Register user
POST   /api/v1/auth/login            // Login
POST   /api/v1/auth/refresh          // Refresh token
POST   /api/v1/auth/logout           // Logout
```

---

## FRONTEND - ECOMMERCE (Next.js)

### Setup

```bash
cd apps
npx create-next-app@latest ecommerce
# Choose: TypeScript, Tailwind, App Router, src directory

cd ecommerce
npm install axios swr
npm install zustand
npm install react-hook-form zod @hookform/resolvers
npm install lucide-react
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label toast
```

### Key Pages Structure

```
apps/ecommerce/src/app/
├── (home)/
│   └── page.tsx                 # Homepage
├── products/
│   ├── page.tsx                 # Products listing
│   └── [slug]/
│       └── page.tsx             # Product detail
├── cart/
│   └── page.tsx                 # Shopping cart
├── checkout/
│   └── page.tsx                 # Checkout flow
├── account/
│   ├── page.tsx                 # Account dashboard
│   ├── orders/
│   │   └── page.tsx             # Order history
│   └── profile/
│       └── page.tsx             # Profile settings
└── api/                         # API routes (if needed)
```

### Example Product Page

```typescript
// apps/ecommerce/src/app/products/[slug]/page.tsx
import { getProduct } from '@/lib/api';
import { AddToCartButton } from '@/components/add-to-cart-button';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img src={product.mainImage} alt={product.name} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl mt-4">${product.price}</p>
          <p className="mt-4">{product.description}</p>
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
```

---

## FRONTEND - ADMIN (Next.js)

### Setup

```bash
cd apps
npx create-next-app@latest admin
cd admin
npm install axios swr
npm install recharts
npm install react-hook-form zod
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input table dialog
```

### Key Pages

```
apps/admin/src/app/
├── dashboard/
│   └── page.tsx                 # Main dashboard (metrics)
├── products/
│   ├── page.tsx                 # Products list
│   ├── new/
│   │   └── page.tsx             # Create product
│   └── [id]/
│       └── edit/
│           └── page.tsx         # Edit product
├── orders/
│   ├── page.tsx                 # Orders list
│   └── [id]/
│       └── page.tsx             # Order details
├── inventory/
│   └── page.tsx                 # Inventory management
├── customers/
│   └── page.tsx                 # Customers list
└── stores/
    └── page.tsx                 # Store management
```

---

## POS SYSTEM (.NET 8)

### Project Setup

```bash
cd apps
dotnet new wpf -n POSApp
cd POSApp

# Add packages
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Newtonsoft.Json
dotnet add package RestSharp
```

### Project Structure

```
apps/pos/POSApp/
├── Models/
│   ├── Product.cs
│   ├── Order.cs
│   ├── Customer.cs
│   └── SyncItem.cs
├── Data/
│   ├── LocalDbContext.cs
│   └── Migrations/
├── Services/
│   ├── SyncService.cs
│   ├── ProductService.cs
│   ├── OrderService.cs
│   └── ApiClient.cs
├── ViewModels/
│   ├── MainViewModel.cs
│   ├── ProductsViewModel.cs
│   └── CheckoutViewModel.cs
├── Views/
│   ├── MainWindow.xaml
│   ├── ProductsView.xaml
│   └── CheckoutView.xaml
└── App.xaml
```

### SQLite Context

```csharp
// apps/pos/POSApp/Data/LocalDbContext.cs
using Microsoft.EntityFrameworkCore;

public class LocalDbContext : DbContext
{
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<SyncQueue> SyncQueue { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        options.UseSqlite("Data Source=pos.db");
    }
}

public class SyncQueue
{
    public int Id { get; set; }
    public string OperationType { get; set; } // "sale", "inventory_adjust"
    public string DataJson { get; set; }
    public DateTime Timestamp { get; set; }
    public int RetryCount { get; set; }
    public string Status { get; set; } // "pending", "syncing", "synced", "failed"
}
```

### Sync Service

```csharp
// apps/pos/POSApp/Services/SyncService.cs
using System.Net.Http;
using Newtonsoft.Json;

public class SyncService
{
    private readonly LocalDbContext _db;
    private readonly HttpClient _http;
    private readonly string _apiUrl = "http://localhost:3000/api/v1";

    public async Task SyncPendingTransactions()
    {
        var pending = await _db.SyncQueue
            .Where(s => s.Status == "pending")
            .OrderBy(s => s.Timestamp)
            .Take(100)
            .ToListAsync();

        foreach (var item in pending)
        {
            try
            {
                item.Status = "syncing";
                await _db.SaveChangesAsync();

                var response = await _http.PostAsync(
                    $"{_apiUrl}/sync/transactions",
                    new StringContent(item.DataJson, Encoding.UTF8, "application/json")
                );

                if (response.IsSuccessStatusCode)
                {
                    item.Status = "synced";
                }
                else
                {
                    item.Status = "failed";
                    item.RetryCount++;
                }
            }
            catch (Exception ex)
            {
                item.Status = "failed";
                item.RetryCount++;
            }

            await _db.SaveChangesAsync();
        }
    }

    public async Task DownloadLatestData()
    {
        // Download products, inventory updates
        var response = await _http.GetAsync($"{_apiUrl}/sync/delta?since={lastSyncTime}");
        // Update local database
    }
}
```

---

## DOCKER SETUP

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ecommerce_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest

  backend:
    build:
      context: ./apps/backend
      dockerfile: ../../infrastructure/docker/Dockerfile.backend
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
      - rabbitmq
    env_file:
      - ./apps/backend/.env

  ecommerce:
    build:
      context: ./apps/ecommerce
      dockerfile: ../../infrastructure/docker/Dockerfile.ecommerce
    ports:
      - "3001:3000"
    depends_on:
      - backend

  admin:
    build:
      context: ./apps/admin
      dockerfile: ../../infrastructure/docker/Dockerfile.admin
    ports:
      - "3002:3000"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./infrastructure/docker/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
      - ecommerce
      - admin

volumes:
  postgres_data:
  redis_data:
```

---

## CRITICAL IMPLEMENTATION NOTES

### 1. POS Offline Sync Strategy
- **On Startup**: Download latest products, inventory, prices
- **During Day**: Save all transactions to local SQLite with status "pending"
- **Background Sync**: Every 5-15 minutes, upload pending transactions
- **Conflict Resolution**: 
  - Inventory: Server always wins, alert cashier
  - Orders: Never delete, create duplicate for manual review
  - Timestamp-based for other operations

### 2. Real-time Inventory Updates
- Use Redis Pub/Sub for inventory changes
- WebSocket connections for admin dashboard
- Optimistic locking in database (version column)

### 3. Security Checklist
- [ ] HTTPS only in production
- [ ] JWT secret 32+ characters
- [ ] Rate limiting on all endpoints
- [ ] Input validation (class-validator)
- [ ] SQL injection prevention (TypeORM)
- [ ] XSS protection
- [ ] CORS configured properly
- [ ] API keys for POS terminals
- [ ] Encrypt POS local database

### 4. Performance Optimization
- [ ] Database indexes on foreign keys
- [ ] Redis caching for products (5min TTL)
- [ ] Pagination on all list endpoints
- [ ] Image optimization via Cloudinary
- [ ] CDN for static assets
- [ ] Database connection pooling
- [ ] Background jobs for heavy operations

### 5. Monitoring & Logging
- [ ] Structured logging (Winston/Pino)
- [ ] Error tracking (Sentry)
- [ ] API response time monitoring
- [ ] Database query performance
- [ ] Sync success/failure rates
- [ ] Inventory low-stock alerts

---

## DEVELOPMENT WORKFLOW

### Initial Setup
```bash
# 1. Clone/create project
mkdir ecommerce-platform && cd ecommerce-platform

# 2. Copy this file as system_prompt.md

# 3. Start infrastructure
docker-compose up -d postgres redis rabbitmq

# 4. Setup backend
cd apps
npx @nestjs/cli new backend
# Follow backend setup steps above

# 5. Setup frontend apps
npx create-next-app@latest ecommerce
npx create-next-app@latest admin

# 6. Setup POS
dotnet new wpf -n POSApp
```

### Daily Development
```bash
# Start all services
docker-compose up -d

# Run backend
cd apps/backend && npm run start:dev

# Run ecommerce
cd apps/ecommerce && npm run dev

# Run admin
cd apps/admin && npm run dev

# Run POS
cd apps/pos/POSApp && dotnet run
```

---

## PHASE-BY-PHASE IMPLEMENTATION

### Phase 1: Core Backend (Weeks 1-2)
- [ ] Database setup + migrations
- [ ] Auth module (JWT)
- [ ] Products CRUD
- [ ] Categories CRUD
- [ ] Basic inventory management
- [ ] Cloudinary integration

### Phase 2: E-commerce Frontend (Weeks 3-4)
- [ ] Product listing + filtering
- [ ] Product detail pages
- [ ] Shopping cart (localStorage)
- [ ] Checkout flow
- [ ] Order placement

### Phase 3: Admin Portal (Weeks 5-6)
- [ ] Dashboard with metrics
- [ ] Product management
- [ ] Order management
- [ ] Inventory management
- [ ] User management

### Phase 4: POS System (Weeks 7-8)
- [ ] .NET WPF application
- [ ] Local SQLite setup
- [ ] Offline transaction recording
- [ ] Product search + barcode
- [ ] Receipt printing
- [ ] Basic sync implementation

### Phase 5: Advanced Sync (Weeks 9-10)
- [ ] Robust sync service
- [ ] Conflict detection
- [ ] Conflict resolution UI
- [ ] Real-time inventory updates
- [ ] Sync monitoring dashboard

### Phase 6: Production Ready (Weeks 11-12)
- [ ] Redis caching
- [ ] RabbitMQ queues
- [ ] Error handling + logging
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Deployment scripts

---

## SCALING CONSIDERATIONS

### Current Architecture (1.5k-3k customers/month)
- 2 API servers (auto-scale)
- PostgreSQL single instance (4 vCPU, 16GB RAM)
- Redis single instance (2GB)
- RabbitMQ single instance

### Growth Path (10k+ customers/month)
- Add PostgreSQL read replicas (2-3 instances)
- Redis cluster (3 master + 3 replica)
- Separate microservices (Products, Orders, Inventory)
- CDN for API responses
- Database partitioning by date

### Enterprise Scale (50k+ customers/month)
- Multi-region deployment
- Database sharding
- Separate cache