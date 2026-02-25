# Backend Development Plan - Detailed Feature Breakdown
## E-commerce Platform (Pakistan-based, EasyPaisa/Sadapay)

---

## 📋 PROJECT OVERVIEW

**Market**: Pakistan  
**Categories**: 3 Main (Pret, Octa West 2026, Desire)  
**Payment Methods**: EasyPaisa, Sadapay, Future: Visa  
**Platforms**: Web (Guest + Registered), POS (Offline-first)  
**Analytics**: Product tracking, user behavior, admin monitoring  

---

## 🗄️ DATABASE SCHEMA MODIFICATIONS

### 1. CATEGORIES TABLE (Existing - Keep Simple)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,                    -- "Pret", "Octa West 2026", "Desire"
  slug VARCHAR(200) UNIQUE NOT NULL,             -- "pret", "octa-west-2026", "desire"
  description TEXT,
  image_url TEXT,                                -- Category banner/icon from Cloudinary
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. PRODUCTS TABLE (Enhance with Size & Guide Support)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,              -- Auto-generated unique barcode ID (system generated, not by admin)
  name VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES categories(id),
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Images
  main_image TEXT,                               -- Cloudinary URL
  images JSONB DEFAULT '[]',                     -- Array of Cloudinary URLs
  
  -- Size Management
  available_sizes JSONB DEFAULT '["S","M","L","XL"]',  -- ["S","M","L","XL","XXL",...]
  size_guide_html TEXT,                          -- HTML table with size measurements and descriptions (ADMIN ENTERS TABLE)
  
  -- Status & Features
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  barcode VARCHAR(100),                          -- Physical barcode (optional)
  
  -- Analytics
  view_count INTEGER DEFAULT 0,                  -- Total views
  purchase_count INTEGER DEFAULT 0,              -- Total purchases
  average_rating DECIMAL(3,2) DEFAULT 0,         -- Future: ratings
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
```

### 3. PRODUCT_SIZE_INVENTORY TABLE (Size-based Stock)
```sql
CREATE TABLE product_size_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id),           -- NULL = online inventory
  size VARCHAR(10) NOT NULL,                     -- "S", "M", "L", "XL"
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(product_id, store_id, size)
);

CREATE INDEX idx_size_inventory_product ON product_size_inventory(product_id);
CREATE INDEX idx_size_inventory_store ON product_size_inventory(store_id);
```

### 4. PROMOTIONS/SALES TABLE (Category & Product-level Discounts - Registered Users Only)
```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,                    -- "Summer Sale", "Pret Special 30% Off"
  description TEXT,
  
  -- Discount Type
  discount_type VARCHAR(50) NOT NULL,            -- "percentage", "fixed", "bogo"
  discount_value DECIMAL(10,2) NOT NULL,         -- 30 (for 30%), 500 (for PKR 500 off), etc
  
  -- Scope
  promotion_scope VARCHAR(50) NOT NULL,          -- "category", "product", "store", "global"
  category_id UUID REFERENCES categories(id),    -- NULL if global
  product_id UUID REFERENCES products(id),       -- NULL if category/global
  store_id UUID REFERENCES stores(id),           -- NULL if online only
  requires_login BOOLEAN DEFAULT true,           -- ALWAYS TRUE: Promotions only for registered users
  
  -- Timeline
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Additional Rules
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,   -- Minimum order value to apply
  max_discount_amount DECIMAL(10,2),             -- Cap on discount (e.g., max PKR 5000 off)
  usage_limit INTEGER,                           -- Max times this promotion can be used
  usage_count INTEGER DEFAULT 0,
  
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promotions_category ON promotions(category_id);
CREATE INDEX idx_promotions_product ON promotions(product_id);
CREATE INDEX idx_promotions_active ON promotions(is_active, start_date, end_date);
```

### 5. PROMO_CODES TABLE (User-Redeemable Discount Codes - Registered Users Only)
```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,              -- "PRET30", "SUMMER2026"
  description TEXT,
  
  -- Discount
  discount_type VARCHAR(50) NOT NULL,            -- "percentage", "fixed"
  discount_value DECIMAL(10,2) NOT NULL,
  
  -- Scope
  applicable_categories JSONB DEFAULT '[]',      -- [category_id1, category_id2] - empty = all
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  requires_login BOOLEAN DEFAULT true,           -- ALWAYS TRUE: Promo codes only for registered users
  
  -- Usage Rules
  usage_limit INTEGER,                           -- Total usage limit
  usage_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,              -- Max times per user
  
  -- Timeline
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active, start_date, end_date);
```

### 6. PROMO_CODE_USAGE TABLE (Track User Usage)
```sql
CREATE TABLE promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id),
  user_id UUID REFERENCES users(id),             -- NULL for guest orders
  order_id UUID NOT NULL REFERENCES orders(id),
  discount_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_code_usage_user ON promo_code_usage(user_id);
CREATE INDEX idx_code_usage_order ON promo_code_usage(order_id);
```

### 7. PRODUCT_ANALYTICS TABLE (Tracking Views, Clicks, etc)
```sql
CREATE TABLE product_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- User Info (works for guest & registered)
  user_id UUID REFERENCES users(id),             -- NULL for guest
  guest_session_id VARCHAR(255),                 -- Session ID for guest tracking
  ip_address VARCHAR(45),                        -- IPv4 or IPv6
  user_agent TEXT,                               -- Browser info
  
  -- Event Data
  event_type VARCHAR(50) NOT NULL,               -- "view", "click", "add_to_cart", "purchase"
  referrer TEXT,                                 -- Where user came from
  duration_seconds INTEGER DEFAULT 0,            -- Time spent on page
  
  -- Device & Location
  device_type VARCHAR(50),                       -- "mobile", "tablet", "desktop"
  country VARCHAR(100) DEFAULT 'Pakistan',
  city VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_product ON product_analytics(product_id);
CREATE INDEX idx_analytics_user ON product_analytics(user_id);
CREATE INDEX idx_analytics_created ON product_analytics(created_at);
CREATE INDEX idx_analytics_event ON product_analytics(event_type);
```

### 8. ORDERS TABLE (Modifications for Pakistan Context)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,      -- ORD-20260125-0001
  
  -- Customer
  customer_id UUID REFERENCES users(id),         -- NULL for guest orders
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,           -- Critical for Pakistan
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name VARCHAR(100),
  
  -- Addresses
  shipping_address JSONB NOT NULL,               -- {street, city, province, postal_code, country}
  billing_address JSONB NOT NULL,
  shipping_same_as_billing BOOLEAN DEFAULT true,
  
  -- Order Details
  source VARCHAR(20) DEFAULT 'online',           -- "online", "pos"
  store_id UUID REFERENCES stores(id),           -- NULL = online order
  
  -- Order Status
  status VARCHAR(50) DEFAULT 'pending',          -- pending, confirmed, processing, shipped, delivered, cancelled, refunded
  payment_status VARCHAR(50) DEFAULT 'pending',  -- pending, paid, failed, refunded
  
  -- Pricing (All in PKR)
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,       -- From promotions + promo codes
  total DECIMAL(10,2) NOT NULL,
  
  -- Payment
  payment_method VARCHAR(50),                    -- "easypaisa", "sadapay", "visa", "cash"
  payment_transaction_id TEXT,                   -- From EasyPaisa/Sadapay API
  payment_provider VARCHAR(50),                  -- "easypaisa", "sadapay", "stripe", "manual"
  
  -- Tracking
  tracking_number VARCHAR(100),
  estimated_delivery_date DATE,
  
  -- POS
  pos_transaction_id VARCHAR(100),
  cashier_id UUID REFERENCES users(id),
  
  -- Metadata
  notes TEXT,
  admin_notes TEXT,
  is_priority BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
```

### 9. ORDER_ITEMS TABLE (With Size)
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  
  -- Product Snapshot (save at time of order)
  product_name VARCHAR(300) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  product_size VARCHAR(10),                      -- "S", "M", "L", "XL" - NULL if no size
  
  -- Pricing
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

### 10. PAYMENT_TRANSACTIONS TABLE (Detailed Payment Tracking)
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  
  -- Payment Details
  payment_method VARCHAR(50) NOT NULL,           -- "easypaisa", "sadapay", "visa"
  payment_provider VARCHAR(50),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PKR',
  
  -- Provider Data
  provider_transaction_id TEXT,                  -- Reference from EasyPaisa/Sadapay
  provider_response JSONB,                       -- Full response from payment gateway
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',          -- pending, processing, success, failed, refunded
  error_message TEXT,
  
  -- Metadata
  merchant_reference VARCHAR(100),
  phone_number VARCHAR(20),                      -- For EasyPaisa/Sadapay
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payment_transactions(order_id);
CREATE INDEX idx_payments_status ON payment_transactions(status);
CREATE INDEX idx_payments_provider_id ON payment_transactions(provider_transaction_id);
```

### 11. CUSTOMER_ADDRESSES TABLE (Save Multiple Addresses)
```sql
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(20) NOT NULL,                     -- "shipping", "billing", "both"
  label VARCHAR(100),                            -- "Home", "Office", "Parent's House"
  
  full_name VARCHAR(200) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100),                         -- Punjab, Sindh, KPK, Balochistan
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Pakistan',
  
  is_default_shipping BOOLEAN DEFAULT false,
  is_default_billing BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON customer_addresses(user_id);
```

### 12. WISHLIST/FAVORITES TABLE (Optional but Useful)
```sql
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,    -- Registered users only
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlists(user_id);
```

---

## 🔌 API ENDPOINTS (Detailed)

### **AUTHENTICATION & USER MANAGEMENT**

```
POST   /auth/register                    Register new user (email, phone, password)
POST   /auth/login                       Login user (email/phone, password)
POST   /auth/logout                      Logout user
POST   /auth/refresh                     Refresh JWT token
POST   /auth/forgot-password             Request password reset
POST   /auth/reset-password              Reset password with token
POST   /auth/verify-email                Verify email address

GET    /users/profile                    Get current user profile
PUT    /users/profile                    Update user profile (name, phone, etc)
PUT    /users/change-password            Change password
```

### **PRODUCTS (Customer View)**

```
GET    /products                         List products (paginated, filtered, sorted)
       ├─ Query params:
       │  ├─ category: "pret", "octa-west-2026", "desire"
       │  ├─ sizes: "S,M,L,XL"
       │  ├─ price_min: 0
       │  ├─ price_max: 50000
       │  ├─ sort: "new", "price_asc", "price_desc", "popular", "trending"
       │  ├─ page: 1
       │  └─ limit: 20
       └─ Returns: [{ id, name, price, main_image, category, available_sizes, view_count, ... }]

GET    /products/:id                     Get product details with full info
       └─ Returns: { id, name, description, price, images[], available_sizes, size_guide_html, 
                     purchase_count, view_count, similar_products[], ... }

GET    /products/:id/analytics           Get product analytics (view count, trends)
       └─ Admin only - Returns: { view_count, purchase_count, trending_score, view_history[] }

POST   /products/:id/track               Track product view (guest & registered)
       ├─ Body: { event_type: "view", duration_seconds: 30 }
       └─ Returns: { tracked: true }
```

### **CATEGORIES**

```
GET    /categories                       Get all active categories
       └─ Returns: [{ id, name, slug, image_url, product_count }]

GET    /categories/:slug                 Get category details with products
       └─ Returns: { id, name, slug, description, image_url, products[] }
```

### **SHOPPING CART (Client-side in localStorage)**

```
(Cart managed client-side, but API needed for checkout)

POST   /cart/validate                    Validate cart items & prices
       ├─ Body: { items: [{ product_id, size, quantity }, ...] }
       └─ Returns: { valid: true, items_updated: [...], total: 50000 }

POST   /cart/apply-promo                 Apply promo code (REGISTERED USERS ONLY)
       ├─ Requires: JWT authentication
       ├─ Body: { code: "PRET30", items: [...] }
       └─ Returns: { valid: true, discount: 15000, new_total: 35000 }
```

### **ORDERS (Checkout & History)**

```
POST   /orders                           Create new order
       ├─ Body: {
       │   customer_email, customer_phone, customer_first_name, customer_last_name,
       │   shipping_address: { street, city, province, postal_code },
       │   billing_address: { ... },
       │   items: [{ product_id, size, quantity }, ...],
       │   promo_code: "PRET30" (optional),
       │   source: "online" (or "pos")
       │ }
       └─ Returns: { order_id, order_number, total, payment_instructions }

GET    /orders/:id                       Get order details (user's own order)
       └─ Returns: { order_number, status, items[], shipping_address, total, tracking_number }

GET    /orders                           Get user's order history (registered users only)
       ├─ Query: page, limit
       └─ Returns: [{ order_id, order_number, total, status, date, ... }]

PUT    /orders/:id/cancel                Cancel order (if not shipped)
       └─ Returns: { cancelled: true, refund_status: "processing" }

GET    /orders/:id/tracking              Get order tracking info
       └─ Returns: { tracking_number, status, estimated_delivery, updates[] }
```

### **ADDRESSES (For Registered Users)**

```
GET    /addresses                        Get all saved addresses
       └─ Returns: [{ id, label, street, city, province, is_default_shipping, ... }]

POST   /addresses                        Save new address
       ├─ Body: { type, label, full_name, phone, street, city, province, postal_code }
       └─ Returns: { id, ... }

PUT    /addresses/:id                    Update address
       └─ Returns: { id, ... }

DELETE /addresses/:id                    Delete address
       └─ Returns: { deleted: true }

PUT    /addresses/:id/set-default        Set as default shipping/billing
       └─ Returns: { updated: true }
```

### **PROMOTIONS & DISCOUNTS (Customer View - Registered Users Only)**

```
GET    /promotions/active                Get all active promotions (REGISTERED USERS ONLY)
       ├─ Requires: JWT authentication
       └─ Returns: [{ id, name, discount, scope, valid_until, applicable_to[] }]

GET    /promo-codes/:code/validate       Validate promo code (REGISTERED USERS ONLY)
       ├─ Requires: JWT authentication
       ├─ Query: code
       └─ Returns: { valid: true, discount_value, discount_type, terms }
```

### **WISHLIST (Registered Users Only)**

```
GET    /wishlist                         Get user's wishlist
       └─ Returns: [{ id, name, price, image, ... }]

POST   /wishlist                         Add to wishlist
       ├─ Body: { product_id }
       └─ Returns: { added: true }

DELETE /wishlist/:product_id             Remove from wishlist
       └─ Returns: { removed: true }
```

### **PAYMENT (EasyPaisa/Sadapay Integration)**

```
POST   /payments/initiate                Initiate payment
       ├─ Body: { order_id, payment_method: "easypaisa", phone_number: "03001234567" }
       └─ Returns: { payment_id, next_step: "redirect_to_provider", provider_url }

POST   /payments/callback                Webhook from payment provider
       ├─ Body: { provider_transaction_id, status, signature, ... }
       └─ Returns: { success: true, order_updated: true }

GET    /payments/:payment_id/status      Check payment status
       └─ Returns: { status: "pending|processing|success|failed", order_status }
```

### **ANALYTICS (Admin Only)**

```
GET    /admin/analytics/dashboard        Main analytics dashboard
       └─ Returns: {
         │   total_orders: 1250,
         │   total_revenue: 5000000,
         │   avg_order_value: 4000,
         │   conversion_rate: 2.5,
         │   top_products: [...],
         │   top_categories: [...],
         │   daily_sales: [...]
         │ }

GET    /admin/analytics/products         Product-level analytics
       ├─ Query: category, sort_by, date_range
       └─ Returns: [{ product_id, name, views, purchases, revenue, conversion_rate, ... }]

GET    /admin/analytics/categories       Category-level analytics
       └─ Returns: [{ category_id, name, views, revenue, top_products, ... }]

GET    /admin/analytics/customers        Customer analytics
       └─ Returns: {
         │   new_customers: 45,
         │   repeat_customers: 120,
         │   avg_lifetime_value: 12000,
         │   top_customers: [...]
         │ }

GET    /admin/analytics/traffic          Traffic analytics
       └─ Returns: { daily_views, daily_unique_visitors, device_breakdown, referrer_analysis, ... }
```

---

## 👥 ADMIN FEATURES (Backend)

### **PRODUCT MANAGEMENT**

```
POST   /admin/products                   Create new product
       ├─ Body: {
       │   name, category_id, price, cost_price,
       │   description, available_sizes: ["S","M","L","XL"],
       │   size_guide_image: "cloudinary_url",
       │   size_guide_html: "<table>...</table>",
       │   images: ["url1", "url2"],
       │   main_image: "url"
       │ }
       └─ Generates: SKU (unique barcode ID)

PUT    /admin/products/:id               Update product
       └─ Can update: name, price, description, images, size_guide, available_sizes, category

DELETE /admin/products/:id               Delete product
       └─ Soft delete (mark as inactive)

POST   /admin/products/:id/images        Upload images
       ├─ Multipart form: multiple image files
       └─ Returns: [{ image_url, cloudinary_id }]

PUT    /admin/products/:id/sizes/:size   Update size inventory
       ├─ Query: store_id (for specific store) or NULL (online)
       ├─ Body: { quantity, low_stock_threshold }
       └─ Returns: { updated: true, current_inventory }

GET    /admin/products/:id/analytics     Get product performance
       └─ Returns: { views, purchases, revenue, trending_score, top_referrers, demographics }
```

### **CATEGORY MANAGEMENT**

```
POST   /admin/categories                 Create category
POST   /admin/categories/:id             Update category
DELETE /admin/categories/:id             Delete category
```

### **PROMOTION MANAGEMENT**

```
POST   /admin/promotions                 Create promotion (category/product-level discount)
       ├─ Body: {
       │   name: "Pret 30% Off",
       │   discount_type: "percentage",
       │   discount_value: 30,
       │   promotion_scope: "category",
       │   category_id: "uuid",
       │   start_date, end_date,
       │   min_purchase_amount, max_discount_amount
       │ }
       └─ Returns: { id, ... }

PUT    /admin/promotions/:id             Update promotion
DELETE /admin/promotions/:id             Delete/Deactivate promotion

GET    /admin/promotions                 List all promotions
       └─ Returns: [{ id, name, scope, status, usage_count, impact (revenue/discount given) }]
```

### **PROMO CODE MANAGEMENT**

```
POST   /admin/promo-codes                Create promo code
       ├─ Body: {
       │   code: "PRET30",
       │   discount_type: "percentage",
       │   discount_value: 30,
       │   applicable_categories: ["pret_id"],
       │   min_purchase_amount: 2000,
       │   start_date, end_date,
       │   usage_limit: 100,
       │   per_user_limit: 1
       │ }
       └─ Returns: { id, code, ... }

PUT    /admin/promo-codes/:id            Update code
DELETE /admin/promo-codes/:id            Deactivate code

GET    /admin/promo-codes                List codes with usage stats
       └─ Returns: [{ code, usage_count, usage_limit, revenue, discount_given, ... }]
```

### **ORDER MANAGEMENT**

```
GET    /admin/orders                     List all orders (with filters)
       ├─ Query: status, payment_status, date_range, search (order_number/phone)
       └─ Returns: [{ order_id, order_number, total, status, payment_status, customer_phone, date }]

GET    /admin/orders/:id                 Get order details
       └─ Returns: { full order details, customer info, items, payment info, tracking }

PUT    /admin/orders/:id/status          Update order status
       ├─ Body: { status: "confirmed", notes: "Ready to ship" }
       └─ Returns: { updated: true, notification_sent_to_customer: true }

PUT    /admin/orders/:id/shipping        Update shipping info
       ├─ Body: { tracking_number: "TRK123456", estimated_delivery_date: "2026-02-01" }
       └─ Returns: { updated: true, customer_notified: true }

POST   /admin/orders/:id/refund          Process refund
       ├─ Body: { refund_amount: 50000, reason: "customer_request" }
       └─ Returns: { refund_id, status: "processing" }
```

### **USER MANAGEMENT**

```
GET    /admin/users                      List all users
       ├─ Query: role, search, date_range
       └─ Returns: [{ id, email, phone, name, role, signup_date, last_purchase, ... }]

GET    /admin/users/:id                  Get user details
       └─ Returns: { user_info, orders, wishlist, addresses, analytics }

PUT    /admin/users/:id                  Update user (admin editing)
       └─ Can update: name, email, phone, role, status

DELETE /admin/users/:id                  Deactivate user account
       └─ Soft delete (mark as inactive)
```

---

## 🏪 POS SYSTEM FEATURES (Offline-first)

### **Local Database (SQLite)**

The POS will maintain local copies of:
- Products (with barcodes/SKUs)
- Categories
- Stock levels (per size)
- Promotions & Promo codes
- Cashier accounts

### **POS Operations**

```
FEATURES:
1. Product Search/Barcode Scanning
   - Search by name/category
   - Scan barcode (SKU) to add to sale
   - Display product with available sizes

2. Point-of-Sale Transaction
   - Select size and quantity
   - Auto-apply promotions (if applicable)
   - Manual promo code entry
   - Tender payment (cash initially)
   - Print receipt

3. Inventory Management
   - Real-time stock display
   - Stock adjustment after sale
   - Low stock alerts

4. Background Sync
   - Every 5-15 minutes (configurable)
   - Queue pending transactions
   - Download latest prices/promotions
   - Update product catalog
   - Handle conflicts (server wins)

5. Reports (Local)
   - Daily sales report
   - Category-wise sales
   - Top products
   - Stock status
```

---

## 📊 ANALYTICS & TRACKING FEATURES

### **Product Analytics**

**What we track:**
- View count (unique & total)
- View duration
- Device type (mobile/tablet/desktop)
- Location (city/province)
- Referrer (from where user came)
- Conversion rate (views → purchase)
- Demographic data
- Time-based trends

**Use Cases:**
- Admin sees trending products
- Admin sees which categories are popular
- Admin sees which sizes are most popular
- Admin optimizes marketing spend based on data
- Admin identifies slow-moving products

### **Customer Analytics**

**Metrics:**
- New customers per day/week/month
- Repeat purchase rate
- Average order value
- Lifetime customer value
- Churn rate
- Geographic distribution
- Device breakdown

### **Sales Analytics**

**Metrics:**
- Daily/weekly/monthly revenue
- Revenue by category
- Revenue by product
- Average order value
- Conversion rate (visitors → customers)
- Payment method breakdown
- Refund rate

---

## 💳 PAYMENT INTEGRATION (EasyPaisa/Sadapay)

### **EasyPaisa Integration**

```
FLOW:
1. Customer initiates payment in checkout
2. API calls EasyPaisa endpoint with:
   - Order amount (PKR)
   - Customer phone number
   - Merchant account details
   - Return/callback URLs

3. EasyPaisa responds with payment link/OTP
4. Customer validates via OTP/PIN
5. Payment success/failure callback to our webhook
6. Update order status based on callback
7. Send confirmation SMS to customer
```

### **Sadapay Integration**

```
FLOW:
Similar to EasyPaisa
- API integration with Sadapay merchant account
- Payment link generation
- Callback handling
- Transaction verification
```

### **Future: Visa Integration**

```
Placeholder for Visa/Mastercard integration
- Can use Stripe Payments in Pakistan
- Or local acquiring bank integration
```

---

## 🛒 CHECKOUT FLOW

```
USER JOURNEY:
1. Browse products
   → Product views tracked (for analytics)
   → See category/product promotions

2. Add to cart
   → Cart stored in browser (localStorage)

3. Go to checkout
   → Validate cart items & prices (API call)
   → Show order summary

4. Enter shipping info
   → For registered: show saved addresses
   → For guests: manual entry
   → For registered: can save as new address

5. Enter billing info
   → Can be same as shipping
   → Or select from saved addresses

6. Review order
   → Show items with sizes/quantities
   → Show promotions applied
   → Show promo codes applied
   → Show final total

7. Select payment method
   → EasyPaisa
   → Sadapay
   → Cash on Delivery (later)

8. Initiate payment
   → API creates order
   → API initiates payment with EasyPaisa/Sadapay
   → Redirect to payment provider

9. Payment processing
   → Customer completes payment with provider
   → Provider calls webhook
   → Order status updated
   → Customer redirected to success page

10. Order confirmation
    → Send SMS confirmation (phone number captured)
    → Send email confirmation (if email provided)
    → Show tracking placeholder
    → Allow customer to track order
```

---

## 🔐 ROLES & PERMISSIONS

### **Roles:**

1. **Customer (Guest)**
   - View products
   - Browse categories
   - View promotions
   - Add to cart
   - Checkout
   - View product analytics (anonymous)

2. **Customer (Registered)**
   - All guest features
   - Create account
   - Save addresses
   - View order history
   - Track orders
   - Wishlist
   - Profile management
   - Product reviews (future)

3. **Cashier (POS)**
   - Create POS transactions
   - Process sales
   - View local stock
   - Print receipts
   - View daily reports

4. **Store Manager**
   - Manage own store's inventory
   - View store-level reports
   - Manage store staff
   - Process store orders

5. **Admin**
   - Full access
   - Product management (CRUD)
   - Category management
   - Promotion management
   - Promo code management
   - Order management
   - User management
   - Analytics dashboard
   - Store management
   - Sync logs review

6. **Super Admin**
   - All admin features
   - System configuration
   - Payment gateway configuration
   - User role management

---

## 📱 TECHNICAL IMPLEMENTATION NOTES

### **Guest Tracking (Without Accounts)**

```
Method:
- Generate unique session_id for guest
- Store in browser localStorage
- Send session_id with all API requests
- Track in product_analytics table
- Can aggregate by session_id instead of user_id
- No personal info stored (privacy compliant)
```

### **Size Guide Implementation**

```
Two approaches:
1. Image-based: Upload size chart as image to Cloudinary
   → Display as image in product detail

2. HTML/Table-based: Store HTML table in size_guide_html column
   → More flexible, can include size range descriptions
   → Example:
   ```
   <table>
     <tr><th>Size</th><th>Bust (cm)</th><th>Length (cm)</th></tr>
     <tr><td>S</td><td>32-34</td><td>58</td></tr>
     <tr><td>M</td><td>34-36</td><td>59</td></tr>
   </table>
   ```
```

### **Image Hosting (Cloudinary)**

```
Workflow:
1. Admin uploads image in product form
2. Image sent to Cloudinary API
3. Cloudinary returns public URL
4. URL saved in PostgreSQL
5. Frontend displays from Cloudinary CDN

Benefits:
- Automatic optimization
- Responsive images
- CDN distribution
- Transformations (resize, crop, etc)
```

### **Barcode Generation**

```
For POS:
- Use SKU as barcode (already unique)
- Can generate barcode image from SKU using:
  → JsBarcode library (frontend)
  → python-barcode (backend)
  → Bwip.js (Node.js)

- Print barcode on product labels
- Scan barcode in POS for quick add
```

---

## 🔄 SYNC STRATEGY (POS)

### **Data Download (Startup)**

```
When POS starts:
1. Download all active categories
2. Download all active products (with images)
3. Download all sizes and inventory
4. Download all active promotions
5. Download all active promo codes
6. Store locally in SQLite

Update frequency: Daily or on-demand
```

### **Transaction Upload (Continuous)**

```
When sales occur:
1. Create transaction record locally
2. Store in SyncQueue table (SQLite)
3. Background process:
   - Every 5-15 minutes
   - Check for pending transactions
   - Batch upload to server
   - Wait for confirmation
   - Mark as "synced" locally
   - If fails: retry up to 3 times
   - If still fails: alert cashier
```

### **Conflict Resolution**

```
Scenarios:
1. Inventory conflict
   - Server inventory differs from local
   - Solution: Server always wins
   - Alert cashier: "Stock updated from server"

2. Duplicate order
   - Same transaction synced twice
   - Detection: Check by transaction_id + timestamp
   - Solution: Reject duplicate, refund if needed

3. Price conflict
   - Product price changed on server since download
   - Solution: Use server price
   - Alert cashier if price differs from local
```

---

## 🎨 FRONTEND FEATURES (Store)

### **Product Page Features**

```
DISPLAY:
1. Product images (main + thumbnails)
   - Zoom capability
   - Multiple images

2. Product details
   - Name, price, category
   - Available sizes (S, M, L, XL, etc)
   - Size guide (image or chart)
   - Description with formatting

3. Promotions display
   - Category-level promotions
   - Product-level promotions
   - Savings amount

4. Add to cart
   - Size selector
   - Quantity selector
   - Add to cart button
   - Wishlist button (for registered users)

5. Product reviews (future)
   - Rating
   - Comments
   - Photos from customers
```

### **Checkout Page Features**

```
1. Order summary
   - Items with sizes/quantities
   - Individual prices
   - Subtotal

2. Address entry
   - For guests: manual entry
   - For registered: saved address selector + manual option

3. Billing address
   - "Same as shipping" toggle
   - Or separate entry

4. Promo code
   - Code input field
   - Validate button
   - Show discount applied

5. Pricing breakdown
   - Subtotal
   - Discount (from promotions)
   - Promo code discount
   - Tax (if applicable)
   - Shipping (if applicable)
   - Total

6. Payment method selector
   - EasyPaisa
   - Sadapay
   - (Future: Cash on Delivery)
```

### **Admin Dashboard Features**

```
MAIN DASHBOARD:
1. KPIs
   - Total orders (today, this month)
   - Total revenue
   - Average order value
   - Conversion rate

2. Charts
   - Daily sales trend
   - Revenue by category
   - Revenue by payment method
   - Top 5 products
   - Top 5 categories

3. Recent orders
   - Latest orders with status

4. Alerts
   - Pending orders
   - Failed payments
   - Low stock alerts
```

---

## ✅ SUMMARY OF FEATURES

### **Database Tables (12 New/Modified)**
1. ✅ Categories (existing, keep simple)
2. ✅ Products (enhanced with sizes, guides, analytics)
3. ✅ Product Size Inventory (size-based stock)
4. ✅ Promotions (category & product discounts)
5. ✅ Promo Codes (user-redeemable codes)
6. ✅ Promo Code Usage (track usage)
7. ✅ Product Analytics (tracking views, clicks)
8. ✅ Orders (enhanced for Pakistan context)
9. ✅ Order Items (with size)
10. ✅ Payment Transactions (detailed payment tracking)
11. ✅ Customer Addresses (save multiple addresses)
12. ✅ Wishlists (for registered users)

### **API Endpoints (45+ endpoints)**
- Authentication (7)
- Products (4)
- Categories (2)
- Cart (2)
- Orders (6)
- Addresses (5)
- Promotions & Codes (3)
- Wishlist (3)
- Payments (3)
- Analytics (5)
- Admin: Products (5)
- Admin: Categories (3)
- Admin: Promotions (6)
- Admin: Orders (5)
- Admin: Users (4)

### **Payment Integration**
- ✅ EasyPaisa merchant integration
- ✅ Sadapay merchant integration
- ✅ Webhook handling
- ✅ Transaction tracking
- ✅ Future: Visa integration

### **Analytics & Tracking**
- ✅ Product views tracking
- ✅ Customer behavior tracking
- ✅ Sales analytics
- ✅ Revenue analytics
- ✅ Trending products
- ✅ Category performance
- ✅ Customer demographics

### **POS Features**
- ✅ Offline transaction management
- ✅ Product search & barcode scanning
- ✅ Inventory management
- ✅ Background sync
- ✅ Conflict resolution
- ✅ Receipt printing
- ✅ Daily reports

### **Admin Features**
- ✅ Product management (CRUD with images)
- ✅ Category management
- ✅ Size & inventory management
- ✅ Promotion management (category & product level)
- ✅ Promo code management with usage tracking
- ✅ Order management with status tracking
- ✅ User management
- ✅ Analytics dashboard
- ✅ Refund management

---

## 🚀 DEVELOPMENT APPROACH

### **Phase 1: Backend Core (Current)**
1. Database migrations
2. Auth system (JWT)
3. Products & Categories
4. Size-based inventory
5. Product analytics tracking
6. Order management
7. Payment integration (EasyPaisa/Sadapay)
8. Promo codes & promotions
9. Admin endpoints

### **Phase 2: Frontend (Store)**
1. Product listing with filters
2. Product detail pages
3. Shopping cart
4. Checkout flow
5. Order confirmation
6. Order tracking
7. User accounts
8. Address management

### **Phase 3: Admin Panel**
1. Product management
2. Category management
3. Promotion management
4. Promo code management
5. Order management
6. Analytics dashboard
7. User management

### **Phase 4: POS System**
1. Product catalog (offline)
2. Transaction creation
3. Size selection
4. Receipt printing
5. Background sync
6. Conflict handling
7. Local reports

### **Phase 5: Advanced Features**
1. Real-time analytics
2. Advanced reporting
3. Customer segmentation
4. Recommendations engine
5. Reviews & ratings
6. Wishlist features
7. Customer support integration

---

## 📝 READY TO APPROVE?

Does this comprehensive feature breakdown match your vision? Should I:

1. **Modify anything?** (e.g., change payment methods, add features, remove features)
2. **Add more details?** (e.g., specific calculations, edge cases)
3. **Proceed with backend development?** Following this plan

Please review and let me know your feedback!
