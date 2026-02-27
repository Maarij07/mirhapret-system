using System;

namespace pos.Models;

public class Inventory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public int Quantity { get; set; } = 0;
    public int ReservedQuantity { get; set; } = 0;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    // Navigation
    public Product? Product { get; set; }
}
