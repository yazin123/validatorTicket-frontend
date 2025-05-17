/**
 * QR Code Generator Utility
 * 
 * This utility generates QR codes for user identification
 */

export async function generateQRCode(data, options = {}) {
  // Dynamically import the QR code library to reduce bundle size
  const QRCode = (await import('qrcode')).default;
  
  // Default options
  const defaultOptions = {
    width: 300,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    ...options
  };
  
  try {
    // Generate QR code as data URL
    const dataUrl = await QRCode.toDataURL(data, defaultOptions);
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export function getQRCodeComponent(dataUrl) {
  return (
    <div className="qr-code-container">
      <img 
        src={dataUrl} 
        alt="QR Code" 
        className="qr-code-image" 
        style={{ 
          maxWidth: '100%', 
          height: 'auto', 
          border: '1px solid #eaeaea', 
          borderRadius: '8px' 
        }} 
      />
    </div>
  );
}

// Function to download QR code as image
export function downloadQRCode(dataUrl, filename = 'qrcode.png') {
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  
  // Append to body, click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} 