using pos.Utils;
using System.Text.RegularExpressions;
using System.Windows.Input;

namespace pos.ViewModels;

public class CheckoutDialogViewModel : BaseViewModel
{
    private string _customerName = string.Empty;
    private string _customerPhone = "+92";
    private string _phoneError = string.Empty;
    private bool _isPhoneValid = false;

    public ICommand PrintCommand { get; }
    public ICommand CancelCommand { get; }

    public event Action<(string name, string phone)>? DialogClosed;

    public CheckoutDialogViewModel()
    {
        PrintCommand = new RelayCommand(_ => Print());
        CancelCommand = new RelayCommand(_ => Cancel());
    }

    public string CustomerName
    {
        get => _customerName;
        set => SetProperty(ref _customerName, value);
    }

    public string CustomerPhone
    {
        get => _customerPhone;
        set
        {
            if (SetProperty(ref _customerPhone, value))
            {
                ValidatePhone();
            }
        }
    }

    public string PhoneError
    {
        get => _phoneError;
        set => SetProperty(ref _phoneError, value);
    }

    public bool IsPhoneValid
    {
        get => _isPhoneValid;
        set => SetProperty(ref _isPhoneValid, value);
    }

    private void ValidatePhone()
    {
        // Pakistani phone number regex: +92 followed by 10 digits (3XX-XXXXXXX format)
        // Accepts: +923001234567, +92 300 1234567, +92-300-1234567, etc.
        var pattern = @"^\+92\d{10}$";
        var cleanPhone = Regex.Replace(CustomerPhone, @"[\s\-]", "");

        if (Regex.IsMatch(cleanPhone, pattern))
        {
            IsPhoneValid = true;
            PhoneError = string.Empty;
        }
        else
        {
            IsPhoneValid = false;
            if (CustomerPhone.Length < 13)
            {
                PhoneError = "Phone must be +92 followed by 10 digits";
            }
            else
            {
                PhoneError = "Invalid Pakistani phone number";
            }
        }
    }

    private void Print()
    {
        if (string.IsNullOrWhiteSpace(CustomerName))
        {
            PhoneError = "Customer name is required";
            return;
        }

        if (!IsPhoneValid)
        {
            return;
        }

        DialogClosed?.Invoke((CustomerName, CustomerPhone));
    }

    private void Cancel()
    {
        DialogClosed?.Invoke((string.Empty, string.Empty));
    }
}
