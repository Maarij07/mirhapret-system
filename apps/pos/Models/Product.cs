using System;
using System.Collections.Generic;

namespace pos.Models;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public decimal TaxRate { get; set; } = 0.17m; // 17% default
    public string MainImage { get; set; } = string.Empty;
    public string Images { get; set; } = string.Empty; // JSON array
    public string AvailableSizes { get; set; } = string.Empty; // JSON array
    public string SizeGuideHtml { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Category? Category { get; set; }
    public Inventory? Inventory { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
