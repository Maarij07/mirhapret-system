using pos.Models;
using System.Collections.ObjectModel;

namespace pos.Services;

public class ReceiptService
{
    public Receipt GenerateReceipt(
        string customerName,
        string customerPhone,
        ObservableCollection<CartItem> cartItems,
        decimal subtotal,
        decimal taxAmount,
        decimal discountAmount,
        decimal total)
    {
        var receipt = new Receipt
        {
            CustomerName = customerName,
            CustomerPhone = customerPhone,
            PurchasedAt = DateTime.Now,
            Items = cartItems.ToList(),
            Subtotal = subtotal,
            TaxAmount = taxAmount,
            DiscountAmount = discountAmount,
            Total = total
        };

        return receipt;
    }

    public void PrintReceipt(Receipt receipt)
    {
        // TODO: Integrate with thermal printer hardware
        // For now, this will be called when user clicks Print
        var receiptText = receipt.GetFormattedReceipt();
        System.Diagnostics.Debug.WriteLine(receiptText);
    }

    public string GetReceiptAsText(Receipt receipt)
    {
        return receipt.GetFormattedReceipt();
    }
}
