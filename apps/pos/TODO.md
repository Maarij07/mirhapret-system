# POS System Development TODO

## Overview
**Cashier-Only POS System** - No admin features. Admin panel is in the separate admin app.
Features: Transaction processing, product search, cart management, receipt printing, basic reporting.

## Phase 1: Project Structure & Database Setup
- [x] Create folder structure (Models, Services, Data, Views, ViewModels, Utils)
- [x] Setup Entity Framework Core DbContext with SQLite
- [x] Create database models matching backend DTOs
- [x] Setup database migrations and initialization
- [x] Create mock data seeder for testing

## Phase 2: Core Models & Database
- [x] Create Product model (name, description, category_id, price, cost_price, tax_rate, images, sizes, barcode, is_active)
- [x] Create Category model (name, description, image_url, is_active, sort_order)
- [x] Create Order model (customer_email, customer_phone, customer_name, items, addresses, totals, status, payment_method)
- [x] Create OrderItem model (product_id, product_name, sku, size, quantity, unit_price, total)
- [x] Create Address model (street_address, city, province, postal_code, country, phone)
- [x] Create Inventory model (product_id, quantity, reserved_quantity)
- [x] Create Promotion model (name, discount_type, discount_value, scope, start_date, end_date, usage_limit)
- [x] Create User model (email, password_hash, first_name, last_name, phone, role)
- [x] Create CartItem model (for in-memory cart management)

## Phase 3: Services Layer
- [x] Create MockDataService (search by name/barcode, filter by category, get all, get promo by code)
- [ ] Create ProductService (search by name/barcode, filter by category, get all)
- [ ] Create OrderService (create, update status, get history)
- [ ] Create InventoryService (check stock, update quantity)
- [ ] Create PromotionService (apply discount, validate promo codes)
- [ ] Create AuthService (login only - no registration for cashiers)

## Phase 4: Main Window & Navigation
- [x] Design main window layout (header, transaction area, cart sidebar)
- [ ] Create login screen (cashier login only)
- [ ] Implement view switching mechanism (Transaction, History, Logout)
- [x] Create main window ViewModel
- [x] Setup MVVM pattern with INotifyPropertyChanged

## Phase 5: Login Screen
- [ ] Create login view and ViewModel
- [ ] Implement cashier authentication
- [ ] Add password validation
- [ ] Display error messages
- [ ] Remember last logged-in cashier (optional)

## Phase 6: POS Transaction View (Core)
- [x] Create Transaction view and ViewModel
- [x] Build product search/barcode scanner input
- [x] Create cart display (product, size, quantity, price)
- [x] Implement add to cart functionality
- [x] Add quantity adjustment controls
- [x] Add remove from cart button
- [x] Display cart totals (subtotal, tax, discount, total)
- [x] Implement promo code input and validation
- [ ] Create payment method selection (Cash on Delivery)
- [ ] Add customer info input (name, email, phone - optional)
- [x] Create order confirmation dialog
- [ ] Implement receipt generation and printing
- [x] Clear cart after successful transaction

## Phase 7: Transaction History View
- [ ] Create History view and ViewModel
- [ ] Display list of completed transactions (date, order ID, customer, total, status)
- [ ] Add search/filter by date range
- [ ] Add search by order ID
- [ ] Create transaction detail view
- [ ] Add reprint receipt functionality

## Phase 8: Printing & Receipts
- [ ] Create receipt template
- [ ] Implement thermal printer support
- [ ] Add receipt preview
- [ ] Create print service
- [ ] Add receipt history/reprint functionality

## Phase 9: UI/UX Polish
- [x] Apply black & white minimalist design
- [x] Ensure sharp corners (no border-radius except circles)
- [x] Verify instant interactions (no animations)
- [ ] Test responsive layout
- [ ] Add keyboard shortcuts for common actions (F1=Help, F2=New Transaction, etc.)
- [ ] Implement error messages and validation feedback

## Phase 10: Testing & Optimization
- [ ] Unit tests for services
- [ ] Integration tests for database operations
- [ ] UI testing
- [ ] Performance optimization
- [ ] Memory leak detection
- [ ] Error handling and edge cases

## Phase 11: Backend Integration (Optional)
- [ ] Setup API client for syncing with backend
- [ ] Implement data sync when online
- [ ] Add conflict resolution for offline changes
- [ ] Create sync status indicator
- [ ] Implement automatic sync scheduling

## Notes
- **Cashier-Only System**: No admin features, no user management, no settings
- Design: Black & white minimalist, sharp corners, no animations
- Database: SQLite for offline-first operation (MVP uses in-memory mock data)
- Pattern: MVVM with INotifyPropertyChanged
- Framework: WPF .NET 8
- All interactions instant (no transitions)
- Barcode scanner support for quick product lookup
- Receipt printing for thermal printers
- Admin panel is in separate admin app for product/category/promotion management
