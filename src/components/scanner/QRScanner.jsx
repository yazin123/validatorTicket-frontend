import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { toast } from 'react-hot-toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExclamationTriangleIcon, CameraIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline'

export function QRScanner({ onScan, onError }) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const [scanCount, setScanCount] = useState(0)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const scannerRef = useRef(null)
  const scannerContainerRef = useRef(null)
  const errorToastRef = useRef(false)

  // Initialize scanner and detect cameras
  useEffect(() => {
    // Create scanner instance
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode('qr-reader');
    }

    // Detect cameras
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          setCameras(devices);
          setSelectedCamera(devices[0].id);
          setHasPermission(true);
        } else {
          console.log('No cameras found');
          setHasPermission(false);
        }
      })
      .catch(err => {
        console.error('Error getting cameras', err);
        setHasPermission(false);
      });

    // Clean up on unmount
    return () => {
      if (scannerRef.current && isScanning) {
        try {
          scannerRef.current.stop()
            .catch(e => console.log("Scanner already stopped or not running"));
        } catch (err) {
          // Ignore cleanup errors
          console.log("Cleanup: Scanner already stopped");
        }
      }
    };
  }, [isScanning]);

  const startScanning = async () => {
    if (!scannerRef.current || !selectedCamera) return;

    try {
      // Make sure scanner is not already running
      if (isScanning) {
        await stopScanning();
      }

      // Reset error toast flag
      errorToastRef.current = false;

      // Configure scanner with improved settings for better recognition
      const config = {
        fps: 15,                        // Higher FPS for faster scanning
        qrbox: { width: 300, height: 300 }, // Larger scanning area
        aspectRatio: 1.0,
        // Don't specify formats as they're not reliably supported
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true // Use native detector if available
        },
        rememberLastUsedCamera: true
      };

      await scannerRef.current.start(
        selectedCamera,
        config,
        handleScanSuccess,
        handleScanError
      );
      setIsScanning(true);
      toast.success('Camera started. Place QR code in view');
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast.error('Failed to start camera');
      setHasPermission(false);
    }
  };

  const handleScanSuccess = (decodedText) => {
    // Play success sound
    try {
      const audio = new Audio('/sounds/success-340660.mp3');
      audio.play().catch(e => console.log('Audio play error:', e));
    } catch (error) {
      console.log('Audio error:', error);
    }

    // Try to parse as JSON
    try {
      let qrData;
      try {
        qrData = JSON.parse(decodedText);
      } catch {
        // If not JSON, use as string
        qrData = decodedText;
      }
      
      // Show success feedback
      toast.success('QR code detected!');
      console.log('QR Data:', qrData);
      
      // Increment scan count
      setScanCount(prev => prev + 1);
      
      // Pass data to parent component
      onScan(qrData);
      
      // Stop scanner after successful scan
      stopScanning();
    } catch (error) {
      toast.error('Invalid QR code format');
      onError(error);
    }
  };

  const handleScanError = (error) => {
    // Completely ignore all errors from the scanner library
    // These are normal during scanning and should not be shown to the user
    return;
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (error) {
        console.log('Error stopping scanner - it may not be running:', error);
      } finally {
        setIsScanning(false);
      }
    }
  };

  const switchCamera = async () => {
    if (isScanning) {
      await stopScanning();
    }
    
    // Find the next camera in the list
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(camera => camera.id === selectedCamera);
      const nextIndex = (currentIndex + 1) % cameras.length;
      setSelectedCamera(cameras[nextIndex].id);
      toast.success(`Switched to ${cameras[nextIndex].label || 'other camera'}`);
      
      // Restart scanner with new camera after a small delay
      setTimeout(() => {
        startScanning();
      }, 500);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Scan QR Code</h3>
        <div className="flex gap-2">
          {cameras.length > 1 && (
            <Button 
              onClick={switchCamera}
              variant="outline"
              size="sm"
              title="Switch Camera"
            >
              <CameraIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={isScanning ? stopScanning : startScanning}
            className={isScanning ? "bg-red-600 hover:bg-red-700" : ""}
            size="sm"
          >
            {isScanning ? (
              <span className="flex items-center">
                <XCircleIcon className="h-4 w-4 mr-1" />
                Stop
              </span>
            ) : (
              <span className="flex items-center">
                <CameraIcon className="h-4 w-4 mr-1" />
                Start
              </span>
            )}
          </Button>
        </div>
      </div>

      {hasPermission === false && (
        <div className="flex items-center p-3 mb-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
          <div className="text-sm">
            <p>Camera access denied or no cameras found.</p>
            <p className="mt-1">Please allow camera access in your browser settings and try again.</p>
          </div>
        </div>
      )}

      <div className="relative rounded-lg overflow-hidden" ref={scannerContainerRef}>
        <div 
          id="qr-reader" 
          className="w-full mx-auto border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
          style={{ minHeight: '350px' }}
        />
        
        {isScanning && (
          <div className="absolute bottom-3 left-3 right-3 bg-black bg-opacity-70 text-white text-sm py-2 px-3 rounded">
            <div className="flex items-center">
              <span className="inline-block h-3 w-3 rounded-full bg-red-500 mr-2 animate-pulse"></span>
              <span>Scanning... Center QR code in view</span>
            </div>
          </div>
        )}
      </div>

      {isScanning && (
        <div className="mt-3 bg-blue-50 text-blue-800 p-3 rounded text-sm">
          <p className="font-medium">Scanning Tips:</p>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            <li>Hold QR code steady and centered in view</li>
            <li>Ensure good lighting on the QR code</li>
            <li>Keep about 6-8 inches away from camera</li>
            <li>Try switching camera if one doesn't work</li>
          </ul>
        </div>
      )}

      {scanCount > 0 && (
        <div className="mt-3 flex items-center text-green-600">
          <CheckIcon className="h-5 w-5 mr-1" />
          <p className="text-sm">Successfully scanned {scanCount} ticket{scanCount !== 1 ? 's' : ''}</p>
        </div>
      )}
    </Card>
  )
} 