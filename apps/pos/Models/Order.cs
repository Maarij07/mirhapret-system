using System;
using System.Collections.Generic;

namespace pos.Models;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerFirstName { get; set; } = string.Empty;
    public string CustomerLastName { get; set; } = string.Empty;
    public Guid? CustomerId { get; set; }

    // Addresses
    public string ShippingAddress { get; set; } = string.Empty; // JSON
    public string BillingAddress { get; set; } = string.Empty; // JSON

    // Totals
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal ShippingAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Total { get; set; }

    // Payment & Status
    public string PaymentMethod { get; set; } = "Cash"; // Cash on Delivery
    public string Status { get; set; } = "pending"; // pending, confirmed, processing, shipped, delivered, cancelled, refunded
    public string Notes { get; set; } = string.Empty;

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
