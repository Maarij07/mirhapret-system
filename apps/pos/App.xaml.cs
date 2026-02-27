using System.Configuration;
using System.Data;
using System.Windows;

namespace pos;

/// <summary>
/// Interaction logic for App.xaml
/// </summary>
public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);
        AppDomain.CurrentDomain.UnhandledException += (s, ex) =>
        {
            MessageBox.Show($"Unhandled Exception: {ex.ExceptionObject}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
        };
    }
}
