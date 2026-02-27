using pos.Models;
using pos.Services;
using pos.Utils;
using System.Windows.Input;

namespace pos.ViewModels;

public class ReceiptPreviewViewModel : BaseViewModel
{
    private readonly ReceiptService _receiptService;
    private Receipt _receipt;
    private string _receiptText = string.Empty;

    public ICommand PrintCommand { get; }
    public ICommand CloseCommand { get; }

    public event Action<bool>? DialogClosed;

    public ReceiptPreviewViewModel(Receipt receipt)
    {
        _receipt = receipt;
        _receiptService = new ReceiptService();
        _receiptText = _receiptService.GetReceiptAsText(receipt);

        PrintCommand = new RelayCommand(_ => Print());
        CloseCommand = new RelayCommand(_ => Close());
    }

    public Receipt Receipt => _receipt;

    public string ReceiptText
    {
        get => _receiptText;
        set => SetProperty(ref _receiptText, value);
    }

    private void Print()
    {
        _receiptService.PrintReceipt(_receipt);
        DialogClosed?.Invoke(true);
    }

    private void Close()
    {
        DialogClosed?.Invoke(false);
    }
}
