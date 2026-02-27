using System;

namespace pos.Models;

public class Promotion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DiscountType { get; set; } = string.Empty; // percentage, fixed, bogo
    public decimal DiscountValue { get; set; }
    public string PromotionScope { get; set; } = string.Empty; // category, product, store, global
    public Guid? CategoryId { get; set; }
    public Guid? ProductId { get; set; }
    public Guid? StoreId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool RequiresLogin { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public decimal MinPurchaseAmount { get; set; } = 0;
    public decimal MaxDiscountAmount { get; set; } = 0;
    public int UsageLimit { get; set; } = 0;
    public int TimesUsed { get; set; } = 0;
    public string PromoCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
