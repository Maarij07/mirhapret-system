using pos.Models;
using pos.Services;
using pos.Utils;
using pos.Views;
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Input;

namespace pos.ViewModels;

public class MainWindowViewModel : BaseViewModel
{
    private readonly MockDataService _mockDataService;
    private readonly ReceiptService _receiptService;
    private readonly BarcodeScanner _barcodeScanner;
    private string _searchInput = string.Empty;
    private decimal _discountAmount = 0;
    private string _promoCode = string.Empty;
    private string _errorMessage = string.Empty;
    private bool _isScannerConnected = false;

    public ObservableCollection<CartItem> CartItems { get; }
    public ObservableCollection<Product> SearchSuggestions { get; }
    public ICommand AddToCartCommand { get; }
    public ICommand RemoveFromCartCommand { get; }
    public ICommand IncreaseQuantityCommand { get; }
    public ICommand DecreaseQuantityCommand { get; }
    public ICommand ApplyPromoCommand { get; }
    public ICommand CompleteSaleCommand { get; }
    public ICommand ClearCartCommand { get; }
    public ICommand SelectProductCommand { get; }
    public ICommand ConnectScannerCommand { get; }
    public ICommand DisconnectScannerCommand { get; }

    public MainWindowViewModel()
    {
        _mockDataService = MockDataService.Instance;
        _receiptService = new ReceiptService();
        _barcodeScanner = new BarcodeScanner();
        CartItems = new ObservableCollection<CartItem>();
        SearchSuggestions = new ObservableCollection<Product>();

        AddToCartCommand = new RelayCommand(_ => AddToCart());
        RemoveFromCartCommand = new RelayCommand<CartItem>(item => RemoveFromCart(item));
        IncreaseQuantityCommand = new RelayCommand<CartItem>(item => IncreaseQuantity(item));
        DecreaseQuantityCommand = new RelayCommand<CartItem>(item => DecreaseQuantity(item));
        ApplyPromoCommand = new RelayCommand(_ => ApplyPromo());
        CompleteSaleCommand = new RelayCommand(_ => CompleteSale());
        ClearCartCommand = new RelayCommand(_ => ClearCart());
        SelectProductCommand = new RelayCommand<Product>(product => SelectProduct(product));
        ConnectScannerCommand = new RelayCommand(_ => ConnectScanner());
        DisconnectScannerCommand = new RelayCommand(_ => DisconnectScanner());

        // Subscribe to barcode scanner events
        _barcodeScanner.BarcodeScanned += OnBarcodeScanned;
        _barcodeScanner.ErrorOccurred += OnScannerError;

        // Auto-connect to scanner if available (optional)
        TryAutoConnectScanner();
    }

    public string SearchInput
    {
        get => _searchInput;
        set
        {
            if (SetProperty(ref _searchInput, value))
            {
                UpdateSearchSuggestions();
            }
        }
    }

    public decimal DiscountAmount
    {
        get => _discountAmount;
        set => SetProperty(ref _discountAmount, value);
    }

    public string PromoCode
    {
        get => _promoCode;
        set => SetProperty(ref _promoCode, value);
    }

    public string ErrorMessage
    {
        get => _errorMessage;
        set => SetProperty(ref _errorMessage, value);
    }

    public bool IsScannerConnected
    {
        get => _isScannerConnected;
        set => SetProperty(ref _isScannerConnected, value);
    }

    public decimal Subtotal => CartItems.Sum(item => item.Subtotal);
    public decimal TaxAmount => CartItems.Sum(item => item.TaxAmount);
    public decimal Total => Subtotal + TaxAmount - DiscountAmount;

    private void AddToCart()
    {
        if (string.IsNullOrWhiteSpace(SearchInput))
        {
            ErrorMessage = "Please enter a barcode or product name";
            return;
        }

        ErrorMessage = string.Empty;

        // Try to find by barcode first
        var product = _mockDataService.GetProductByBarcode(SearchInput);

        // If not found, search by name
        if (product == null)
        {
            var results = _mockDataService.SearchProducts(SearchInput);
            product = results.FirstOrDefault();
        }

        if (product == null)
        {
            ErrorMessage = "Product not found";
            return;
        }

        // Check if product already in cart
        var existingItem = CartItems.FirstOrDefault(item => item.ProductId == product.Id);
        if (existingItem != null)
        {
            existingItem.Quantity++;
        }
        else
        {
            CartItems.Add(new CartItem
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                ProductName = product.Name,
                Barcode = product.Barcode,
                UnitPrice = product.Price,
                Quantity = 1,
                TaxRate = product.TaxRate
            });
        }

        SearchInput = string.Empty;
        OnPropertyChanged(nameof(Subtotal));
        OnPropertyChanged(nameof(TaxAmount));
        OnPropertyChanged(nameof(Total));
    }

    private void RemoveFromCart(CartItem? item)
    {
        if (item != null)
        {
            CartItems.Remove(item);
            OnPropertyChanged(nameof(Subtotal));
            OnPropertyChanged(nameof(TaxAmount));
            OnPropertyChanged(nameof(Total));
        }
    }

    private void IncreaseQuantity(CartItem? item)
    {
        if (item != null)
        {
            item.Quantity++;
            OnPropertyChanged(nameof(Subtotal));
            OnPropertyChanged(nameof(TaxAmount));
            OnPropertyChanged(nameof(Total));
        }
    }

    private void DecreaseQuantity(CartItem? item)
    {
        if (item != null && item.Quantity > 1)
        {
            item.Quantity--;
            OnPropertyChanged(nameof(Subtotal));
            OnPropertyChanged(nameof(TaxAmount));
            OnPropertyChanged(nameof(Total));
        }
    }

    private void ApplyPromo()
    {
        if (string.IsNullOrWhiteSpace(PromoCode))
        {
            ErrorMessage = "Please enter a promo code";
            return;
        }

        var promo = _mockDataService.GetPromotionByCode(PromoCode);
        if (promo == null)
        {
            ErrorMessage = "Invalid promo code";
            return;
        }

        ErrorMessage = string.Empty;

        if (promo.DiscountType == "percentage")
        {
            DiscountAmount = Subtotal * (promo.DiscountValue / 100);
        }
        else if (promo.DiscountType == "fixed")
        {
            DiscountAmount = promo.DiscountValue;
        }

        OnPropertyChanged(nameof(Total));
    }

    private void CompleteSale()
    {
        if (CartItems.Count == 0)
        {
            ErrorMessage = "Cart is empty";
            return;
        }

        ErrorMessage = string.Empty;

        // Show checkout dialog
        var dialog = new CheckoutDialog();
        if (dialog.ShowDialog() == true)
        {
            var customerName = dialog.CustomerName;
            var customerPhone = dialog.CustomerPhone;

            // Generate receipt
            var receipt = _receiptService.GenerateReceipt(
                customerName,
                customerPhone,
                CartItems,
                Subtotal,
                TaxAmount,
                DiscountAmount,
                Total);

            // Show receipt preview
            var receiptWindow = new ReceiptPreviewWindow(receipt);
            receiptWindow.ShowDialog();

            // Clear cart after successful sale
            ClearCart();
        }
    }

    private void ClearCart()
    {
        CartItems.Clear();
        SearchInput = string.Empty;
        PromoCode = string.Empty;
        DiscountAmount = 0;
        ErrorMessage = string.Empty;
        OnPropertyChanged(nameof(Subtotal));
        OnPropertyChanged(nameof(TaxAmount));
        OnPropertyChanged(nameof(Total));
    }

    private void UpdateSearchSuggestions()
    {
        SearchSuggestions.Clear();

        if (string.IsNullOrWhiteSpace(SearchInput))
            return;

        var results = _mockDataService.SearchProducts(SearchInput);
        foreach (var product in results.Take(5))
        {
            SearchSuggestions.Add(product);
        }
    }

    private void SelectProduct(Product? product)
    {
        if (product != null)
        {
            SearchInput = product.Barcode;
            SearchSuggestions.Clear();
            AddToCart();
        }
    }

    // Barcode Scanner Methods
    private void TryAutoConnectScanner()
    {
        // Try to auto-connect to first available COM port
        var ports = BarcodeScanner.GetAvailablePorts();
        if (ports.Length > 0)
        {
            try
            {
                _barcodeScanner.Connect(ports[0]);
                IsScannerConnected = true;
                ErrorMessage = $"Scanner connected on {ports[0]}";
            }
            catch
            {
                // Silent fail - scanner not available
            }
        }
    }

    private void ConnectScanner()
    {
        var ports = BarcodeScanner.GetAvailablePorts();
        if (ports.Length == 0)
        {
            ErrorMessage = "No COM ports available";
            return;
        }

        // Connect to first available port
        _barcodeScanner.Connect(ports[0]);
        IsScannerConnected = _barcodeScanner.IsConnected;
        ErrorMessage = IsScannerConnected ? $"Scanner connected on {ports[0]}" : "Failed to connect scanner";
    }

    private void DisconnectScanner()
    {
        _barcodeScanner.Disconnect();
        IsScannerConnected = false;
        ErrorMessage = "Scanner disconnected";
    }

    private void OnBarcodeScanned(object? sender, BarcodeScannedEventArgs e)
    {
        // Automatically add product to cart when barcode is scanned
        SearchInput = e.Barcode;
        AddToCart();
    }

    private void OnScannerError(object? sender, string error)
    {
        ErrorMessage = error;
    }
}
