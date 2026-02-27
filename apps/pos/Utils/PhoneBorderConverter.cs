using System.Globalization;
using System.Windows.Media;
using System.Windows.Data;

namespace pos.Utils;

public class PhoneBorderConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is bool isValid)
        {
            return isValid ? new SolidColorBrush(Color.FromArgb(255, 26, 122, 74)) : new SolidColorBrush(Color.FromArgb(255, 224, 224, 224));
        }
        return new SolidColorBrush(Color.FromArgb(255, 224, 224, 224));
    }

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}
