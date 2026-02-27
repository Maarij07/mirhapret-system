using pos.Models;
using pos.ViewModels;
using System.Windows;

namespace pos.Views;

public partial class ReceiptPreviewWindow : Window
{
    public ReceiptPreviewWindow(Receipt receipt)
    {
        InitializeComponent();
        var viewModel = new ReceiptPreviewViewModel(receipt);
        DataContext = viewModel;
        viewModel.DialogClosed += (result) =>
        {
            DialogResult = result;
            Close();
        };
    }
}
