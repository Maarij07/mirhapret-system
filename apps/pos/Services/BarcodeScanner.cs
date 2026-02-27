using System.IO.Ports;

namespace pos.Services;

/// <summary>
/// Barcode Scanner Service
/// Handles communication with barcode scanner hardware via Serial Port
/// Can be easily integrated with USB or COM port barcode readers
/// </summary>
public class BarcodeScanner : IDisposable
{
    private SerialPort? _serialPort;
    private string _buffer = string.Empty;
    private bool _isConnected = false;

    public event EventHandler<BarcodeScannedEventArgs>? BarcodeScanned;
    public event EventHandler<string>? ErrorOccurred;

    public bool IsConnected => _isConnected;

    /// <summary>
    /// Connect to barcode scanner via serial port
    /// </summary>
    /// <param name="portName">COM port name (e.g., "COM3", "COM4")</param>
    /// <param name="baudRate">Baud rate (typically 9600)</param>
    public void Connect(string portName, int baudRate = 9600)
    {
        try
        {
            if (_serialPort != null && _serialPort.IsOpen)
            {
                _serialPort.Close();
            }

            _serialPort = new SerialPort(portName, baudRate, Parity.None, 8, StopBits.One)
            {
                ReadTimeout = 500,
                WriteTimeout = 500
            };

            _serialPort.DataReceived += OnDataReceived;
            _serialPort.Open();
            _isConnected = true;
        }
        catch (Exception ex)
        {
            _isConnected = false;
            ErrorOccurred?.Invoke(this, $"Failed to connect to barcode scanner: {ex.Message}");
        }
    }

    /// <summary>
    /// Disconnect from barcode scanner
    /// </summary>
    public void Disconnect()
    {
        try
        {
            if (_serialPort != null && _serialPort.IsOpen)
            {
                _serialPort.Close();
                _isConnected = false;
            }
        }
        catch (Exception ex)
        {
            ErrorOccurred?.Invoke(this, $"Error disconnecting: {ex.Message}");
        }
    }

    /// <summary>
    /// Get available COM ports
    /// </summary>
    public static string[] GetAvailablePorts()
    {
        return SerialPort.GetPortNames();
    }

    private void OnDataReceived(object sender, SerialDataReceivedEventArgs e)
    {
        try
        {
            if (_serialPort == null || !_serialPort.IsOpen)
                return;

            string data = _serialPort.ReadExisting();
            _buffer += data;

            // Check for barcode terminator (typically Enter key = \r or \n)
            if (_buffer.Contains("\r") || _buffer.Contains("\n"))
            {
                string barcode = _buffer.Replace("\r", "").Replace("\n", "").Trim();

                if (!string.IsNullOrWhiteSpace(barcode))
                {
                    // Raise event on UI thread
                    System.Windows.Application.Current?.Dispatcher.Invoke(() =>
                    {
                        BarcodeScanned?.Invoke(this, new BarcodeScannedEventArgs(barcode));
                    });
                }

                _buffer = string.Empty;
            }
        }
        catch (Exception ex)
        {
            ErrorOccurred?.Invoke(this, $"Error reading barcode: {ex.Message}");
        }
    }

    public void Dispose()
    {
        Disconnect();
        _serialPort?.Dispose();
    }
}

/// <summary>
/// Event args for barcode scanned event
/// </summary>
public class BarcodeScannedEventArgs : EventArgs
{
    public string Barcode { get; }

    public BarcodeScannedEventArgs(string barcode)
    {
        Barcode = barcode;
    }
}
