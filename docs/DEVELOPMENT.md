# Development Guide

This guide covers the development workflow and important information for working on the e-commerce platform.

## Environment Setup

### 1. Environment Variables

Create a `.env` file in the project root with all required variables:

```bash
cp .env.example .env
```

Key variables to update:
- `JWT_SECRET` - Min 32 characters, random string
- `JWT_REFRESH_SECRET` - Min 32 characters, random string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 2. Database Setup

PostgreSQL will run in Docker. To initialize:

```bash
# Start Docker containers
docker-compose up -d postgres

# Wait for PostgreSQL to be ready (check logs)
docker logs ecommerce_postgres
```

## Backend Development

### File Structure

```
apps/backend/
├── src/
│   ├── auth/              # Authentication & JWT
│   ├── users/             # User management
│   ├── products/          # Product catalog
│   ├── categories/        # Product categories
│   ├── inventory/         # Stock management
│   ├── orders/            # Order processing
│   ├── customers/         # Customer management
│   ├── stores/            # Store management
│   ├── sync/              # POS sync service
│   ├── cloudinary/        # Image hosting
│   ├── database/          # Entities & migrations
│   ├── common/            # Shared utilities
│   ├── app.module.ts      # Root module
│   └── main.ts            # Application entry
├── test/                  # E2E tests
└── package.json
```

### Adding New Features

#### 1. Create Module
```bash
cd apps/backend
nest g module features/my-feature
```

#### 2. Create Service
```bash
nest g service features/my-feature
```

#### 3. Create Controller
```bash
nest g controller features/my-feature
```

#### 4. Create Entity
```typescript
// src/database/entities/my-entity.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  createdAt: Date;
}
```

#### 5. Create Database Migration
```bash
npm run typeorm migration:generate -- src/database/migrations/initial
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

### Building for Production

```bash
npm run build

# Start production build
node dist/main
```

## Frontend Development (Next.js Apps)

### File Structure (E-commerce & Admin)

```
apps/ecommerce/  or  apps/admin/
├── src/
│   ├── app/               # Route segments & layouts
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── common/       # Shared components
│   │   └── features/     # Feature-specific components
│   ├── lib/              # Utilities & helpers
│   │   ├── api.ts        # API client setup
│   │   ├── store.ts      # Zustand stores
│   │   └── utils.ts      # Helper functions
│   ├── hooks/            # Custom React hooks
│   ├── styles/           # Global styles
│   └── types/            # TypeScript types
├── public/               # Static assets
└── package.json
```

### Creating Pages

```bash
# In app/products/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export default function ProductPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/products?slug=${params.slug}`)
      .then(res => setProduct(res.data[0]))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      {/* Product details */}
    </div>
  );
}
```

### Using Zustand for State

```typescript
// src/lib/store.ts
import { create } from 'zustand';

interface CartItem {
  id: string;
  quantity: number;
  price: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

export const useCart = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  clear: () => set({ items: [] })
}));
```

### Forms with React Hook Form + Zod

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(async (data) => {
      // Submit to API
    })}>
      <Input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      
      <Input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      
      <Button type="submit">Login</Button>
    </form>
  );
}
```

## POS System Development (.NET)

### Project Structure

```
apps/pos/
├── Models/
│   ├── Product.cs
│   ├── Order.cs
│   ├── SyncItem.cs
│   └── Customer.cs
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
├── App.xaml
└── pos.csproj
```

### Database Context (SQLite)

```csharp
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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>()
            .HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class SyncQueue
{
    public int Id { get; set; }
    public string OperationType { get; set; }
    public string DataJson { get; set; }
    public DateTime Timestamp { get; set; }
    public int RetryCount { get; set; }
    public string Status { get; set; } = "pending";
}
```

### Running POS

```bash
cd apps/pos
dotnet run
```

## Docker & Infrastructure

### Docker Compose Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset volumes (DELETE DATA!)
docker-compose down -v
```

### Database Commands

```bash
# Connect to PostgreSQL
docker exec -it ecommerce_postgres psql -U postgres -d ecommerce_db

# Backup database
docker exec ecommerce_postgres pg_dump -U postgres ecommerce_db > backup.sql

# Restore database
docker exec -i ecommerce_postgres psql -U postgres ecommerce_db < backup.sql
```

## API Testing

### Using REST Client (VS Code Extension)

Create `requests.http` in project root:

```http
### Get Products
GET http://localhost:3000/api/v1/products HTTP/1.1

### Create Order
POST http://localhost:3000/api/v1/orders HTTP/1.1
Content-Type: application/json

{
  "items": [
    {
      "productId": "uuid-here",
      "quantity": 2
    }
  ]
}

### Login
POST http://localhost:3000/api/v1/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Using cURL

```bash
# Get products
curl http://localhost:3000/api/v1/products

# Create order
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"uuid","quantity":2}]}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Performance Tips

### Backend
- Use database indexes on frequently queried columns
- Implement pagination for list endpoints
- Cache products in Redis (5-minute TTL)
- Use connection pooling for database
- Optimize N+1 queries with eager loading

### Frontend
- Use Next.js Image component for optimization
- Implement code splitting with dynamic imports
- Use SWR for efficient data fetching
- Lazy load components below the fold
- Optimize bundle size with webpack analysis

### POS
- Cache products locally in SQLite
- Batch sync operations
- Use background sync to prevent UI blocking
- Implement local optimistic updates

## Debugging

### Backend
```bash
# Debug mode with Node
node --inspect-brk dist/main

# Use Chrome DevTools: chrome://inspect
```

### Frontend
```bash
# Use Next.js built-in debugging
npm run dev

# View in browser DevTools (F12)
```

### POS
- Use Visual Studio debugger
- Add console logging to Debug Output

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/add-product-filters

# Commit changes
git add .
git commit -m "feat: add product category filters"

# Push to remote
git push origin feature/add-product-filters

# Create pull request on GitHub/GitLab
```

Commit message format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Dependencies, configs

## Common Issues

### Port Already in Use
```bash
# Windows: Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Database Connection Fails
```bash
# Check PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Module Not Found Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild TypeScript
npm run build
```

## Resources

- [NestJS Official Docs](https://docs.nestjs.com)
- [Next.js Official Docs](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Zustand State Management](https://github.com/pmndrs/zustand)
