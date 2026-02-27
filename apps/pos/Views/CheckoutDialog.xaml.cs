using pos.ViewModels;
using System.Windows;

namespace pos.Views;

public partial class CheckoutDialog : Window
{
    public CheckoutDialog()
    {
        InitializeComponent();
        var viewModel = new CheckoutDialogViewModel();
        DataContext = viewModel;
        viewModel.DialogClosed += (result) =>
        {
            if (result.name != string.Empty)
            {
                CustomerName = result.name;
                CustomerPhone = result.phone;
                DialogResult = true;
            }
            else
            {
                DialogResult = false;
            }
            Close();
        };
    }

    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
}
