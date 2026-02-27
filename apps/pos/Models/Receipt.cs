namespace pos.Models;

public class Receipt
{
    public string OrderId { get; set; } = Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public DateTime PurchasedAt { get; set; } = DateTime.Now;
    public List<CartItem> Items { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Total { get; set; }

    public string GetFormattedReceipt()
    {
        var lines = new List<string>();

        // Header
        lines.Add("================================");
        lines.Add("         MIRHAPRET POS");
        lines.Add("================================");
        lines.Add("");

        // Order Info
        lines.Add($"Order ID: {OrderId}");
        lines.Add($"Date: {PurchasedAt:dd/MM/yyyy}");
        lines.Add($"Time: {PurchasedAt:HH:mm:ss}");
        lines.Add("");

        // Customer Info
        lines.Add($"Customer: {CustomerName}");
        lines.Add($"Phone: {CustomerPhone}");
        lines.Add("");

        // Items Header
        lines.Add("--------------------------------");
        lines.Add("Item              Qty  Price  Tax");
        lines.Add("--------------------------------");

        // Items
        foreach (var item in Items)
        {
            var itemTotal = item.Subtotal;
            var itemTax = item.TaxAmount;
            var name = item.ProductName.Length > 14 ? item.ProductName.Substring(0, 14) : item.ProductName;
            lines.Add($"{name,-14} {item.Quantity,3}  {itemTotal,6:F0}  {itemTax,3:F0}");
        }

        lines.Add("--------------------------------");

        // Totals
        lines.Add($"Subtotal:              PKR {Subtotal:F0}");
        if (TaxAmount > 0)
            lines.Add($"Tax (17%):             PKR {TaxAmount:F0}");
        if (DiscountAmount > 0)
            lines.Add($"Discount:             -PKR {DiscountAmount:F0}");

        lines.Add("================================");
        lines.Add($"TOTAL:                 PKR {Total:F0}");
        lines.Add("================================");
        lines.Add("");

        lines.Add("Thank you for your purchase!");
        lines.Add("Visit us again!");
        lines.Add("");
        lines.Add("Contact: +92 321 555 1851");
        lines.Add("");
        lines.Add("================================");

        return string.Join(Environment.NewLine, lines);
    }
}
