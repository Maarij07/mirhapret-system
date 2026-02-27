using pos.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace pos.Services;

public class MockDataService
{
    private static MockDataService? _instance;
    public static MockDataService Instance => _instance ??= new MockDataService();

    public List<Product> Products { get; private set; } = new();
    public List<Category> Categories { get; private set; } = new();
    public List<Promotion> Promotions { get; private set; } = new();

    private MockDataService()
    {
        InitializeMockData();
    }

    private void InitializeMockData()
    {
        // Categories
        Categories = new List<Category>
        {
            new Category { Id = Guid.NewGuid(), Name = "Clothing", Description = "Apparel and clothing items", IsActive = true, SortOrder = 1 },
            new Category { Id = Guid.NewGuid(), Name = "Accessories", Description = "Bags, belts, and accessories", IsActive = true, SortOrder = 2 },
            new Category { Id = Guid.NewGuid(), Name = "Footwear", Description = "Shoes and footwear", IsActive = true, SortOrder = 3 }
        };

        // Products
        Products = new List<Product>
        {
            new Product
            {
                Id = Guid.NewGuid(),
                Name = "Premium T-Shirt",
                Description = "High-quality cotton t-shirt",
                CategoryId = Categories[0].Id,
                Price = 1500,
                CostPrice = 800,
                TaxRate = 0.17m,
                Barcode = "SKU-001",
                IsActive = true,
                IsFeatured = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Name = "Casual Jeans",
                Description = "Comfortable denim jeans",
                CategoryId = Categories[0].Id,
                Price = 3500,
                CostPrice = 1800,
                TaxRate = 0.17m,
                Barcode = "SKU-002",
                IsActive = true,
                IsFeatured = true
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Name = "Leather Wallet",
                Description = "Premium leather wallet",
                CategoryId = Categories[1].Id,
                Price = 2000,
                CostPrice = 1000,
                TaxRate = 0.17m,
                Barcode = "SKU-003",
                IsActive = true,
                IsFeatured = false
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Name = "Running Shoes",
                Description = "Comfortable running shoes",
                CategoryId = Categories[2].Id,
                Price = 5000,
                CostPrice = 2500,
                TaxRate = 0.17m,
                Barcode = "SKU-004",
                IsActive = true,
                IsFeatured = true
            }
        };

        // Promotions
        Promotions = new List<Promotion>
        {
            new Promotion
            {
                Id = Guid.NewGuid(),
                Name = "Summer Sale",
                Description = "20% off on all clothing",
                DiscountType = "percentage",
                DiscountValue = 20,
                PromotionScope = "category",
                CategoryId = Categories[0].Id,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(1),
                IsActive = true,
                PromoCode = "SUMMER20"
            },
            new Promotion
            {
                Id = Guid.NewGuid(),
                Name = "Welcome Discount",
                Description = "500 PKR off on first purchase",
                DiscountType = "fixed",
                DiscountValue = 500,
                PromotionScope = "global",
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(3),
                IsActive = true,
                PromoCode = "WELCOME500"
            }
        };
    }

    public Product? GetProductByBarcode(string barcode)
    {
        return Products.FirstOrDefault(p => p.Barcode == barcode && p.IsActive);
    }

    public List<Product> SearchProducts(string searchTerm)
    {
        return Products
            .Where(p => p.IsActive && (p.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) || 
                                       p.Barcode.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)))
            .ToList();
    }

    public List<Product> GetProductsByCategory(Guid categoryId)
    {
        return Products.Where(p => p.CategoryId == categoryId && p.IsActive).ToList();
    }

    public Promotion? GetPromotionByCode(string code)
    {
        return Promotions.FirstOrDefault(p => p.PromoCode == code && p.IsActive && 
                                              p.StartDate <= DateTime.UtcNow && 
                                              p.EndDate >= DateTime.UtcNow);
    }
}
