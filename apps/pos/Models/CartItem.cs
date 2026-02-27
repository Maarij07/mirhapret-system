using System.ComponentModel;

namespace pos.Models;

public class CartItem : INotifyPropertyChanged
{
    private int _quantity;

    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal TaxRate { get; set; }

    public int Quantity
    {
        get => _quantity;
        set
        {
            if (_quantity != value)
            {
                _quantity = value;
                OnPropertyChanged(nameof(Quantity));
                OnPropertyChanged(nameof(Subtotal));
                OnPropertyChanged(nameof(TaxAmount));
                OnPropertyChanged(nameof(Total));
            }
        }
    }

    public decimal Subtotal => UnitPrice * Quantity;
    public decimal TaxAmount => Subtotal * TaxRate;
    public decimal Total => Subtotal + TaxAmount;

    public event PropertyChangedEventHandler? PropertyChanged;

    protected void OnPropertyChanged(string propertyName)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}
