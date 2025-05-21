import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { toast } from 'react-hot-toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { ExclamationTriangleIcon, CameraIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline'

export function QRScanner({ onScan, onError }) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const [permissionRequested, setPermissionRequested] = useState(false)
  const [scanCount, setScanCount] = useState(0)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const scannerRef = useRef(null)
  const scannerContainerRef = useRef(null)
  const errorToastRef = useRef(false)

  // Detect if on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobileDevice(isMobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize scanner and detect cameras
  useEffect(() => {
    // Create scanner instance
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode('qr-reader');
    }

    const requestCameraPermission = async () => {
      try {
        setPermissionRequested(true);
        await navigator.mediaDevices.getUserMedia({ video: true });
        detectCameras();
      } catch (error) {
        console.error('Camera permission denied', error);
        setHasPermission(false);
      }
    };

    const detectCameras = () => {
      Html5Qrcode.getCameras()
        .then(devices => {
          if (devices && devices.length) {
            setCameras(devices);
            // On mobile, prefer back camera which is usually at index 0
            const preferredCameraIndex = isMobileDevice ? 0 : 0;
            const preferredCamera = devices[preferredCameraIndex] || devices[0];
            setSelectedCamera(preferredCamera.id);
            setHasPermission(true);
            
            // On mobile, auto-start scanner when permission is granted
            if (isMobileDevice && !isScanning) {
              setTimeout(() => startScanning(), 1000);
            }
          } else {
            console.log('No cameras found');
            setHasPermission(false);
          }
        })
        .catch(err => {
          console.error('Error getting cameras', err);
          setHasPermission(false);
        });
    };

    // Request camera permission on component mount if on mobile
    if (isMobileDevice && !permissionRequested) {
      requestCameraPermission();
    } else if (!permissionRequested) {
      detectCameras();
    }

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
  }, [isScanning, isMobileDevice, permissionRequested]);

  const startScanning = async () => {
    if (!scannerRef.current || !selectedCamera) {
      toast.error('Camera not available. Please check permissions.');
      return;
    }

    try {
      // Make sure scanner is not already running
      if (isScanning) {
        await stopScanning();
      }

      // Reset error toast flag
      errorToastRef.current = false;

      // Adapt QR box size for mobile
      const qrboxSize = isMobileDevice ? { width: 250, height: 250 } : { width: 300, height: 300 };

      // Configure scanner with improved settings for better recognition
      const config = {
        fps: 15,                        // Higher FPS for faster scanning
        qrbox: qrboxSize,               // Adaptive scanning area
        aspectRatio: 1.0,
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
      toast.error('Failed to start camera. Check permissions and try again.');
      setHasPermission(false);
      // On mobile, prompt to request permission again
      if (isMobileDevice) {
        setPermissionRequested(false);
      }
    }
  };

  const handleScanSuccess = (decodedText) => {
    // Try to parse as JSON
    try {
      let qrData;
      
      // Handle special cases for QR formats
      if (decodedText.startsWith('data:image/png;base64,')) {
        console.log('Detected QR code as data URL, forwarding for processing');
        // Instead of rejecting data URLs, we'll pass them through for backend processing
        qrData = decodedText;
      } else if (decodedText.includes('|')) {
        // Handle ticket data in pipe-delimited format (eventId|showId|userId|timestamp|random)
        console.log('Detected pipe-delimited ticket format');
        qrData = decodedText;
      } else {
        // Try to parse as JSON, but if it fails, use as-is
        try {
          qrData = JSON.parse(decodedText);
          console.log('Parsed QR data as JSON object');
        } catch {
          console.log('Using QR data as plain string');
          qrData = decodedText;
        }
      }
      
      // Play success sound if available
      try {
        const audio = new Audio('/sounds/success-notification.mp3');
        audio.play().catch(e => console.log('Audio play error:', e));
      } catch (e) {
        console.log('Audio error:', e);
      }
      
      // Show QR detected toast
      toast.success('QR code detected!');
      console.log('QR Data:', qrData);
      
      // Increment scan count
      setScanCount(prev => prev + 1);
      
      // Pass data to parent component for verification
      onScan(qrData);
      
      // Stop scanner after successful scan
      stopScanning();
    } catch (error) {
      console.error('Error processing QR code:', error);
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

  const requestPermissionAgain = () => {
    setPermissionRequested(false);
    setHasPermission(null);
    // This will trigger the useEffect to request permissions again
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
              {!isMobileDevice && <span className="ml-1 hidden sm:inline">Switch</span>}
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
                Start Scanner
              </span>
            )}
          </Button>
        </div>
      </div>

      {hasPermission === false && (
        <div className="flex flex-col p-3 mb-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Camera access denied or no cameras found.</p>
              <p className="mt-1">Please allow camera access in your browser settings and try again.</p>
              
              {isMobileDevice && (
                <ol className="mt-2 ml-4 text-xs space-y-1 list-decimal">
                  <li>Check that your device has a camera</li>
                  <li>Make sure your browser has permission to access the camera</li>
                  <li>On iPhone/iPad, check Settings &gt; Safari &gt; Camera</li>
                  <li>On Android, check browser settings or app permissions</li>
                </ol>
              )}
            </div>
          </div>
          
          <Button
            onClick={requestPermissionAgain}
            size="sm"
            className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Request Camera Permission
          </Button>
        </div>
      )}

      <div className="relative rounded-lg overflow-hidden" ref={scannerContainerRef}>
        <div 
          id="qr-reader" 
          className="w-full mx-auto border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
          style={{ minHeight: isMobileDevice ? '280px' : '350px' }}
        />
        
        {isScanning && (
          <div className="absolute bottom-3 left-3 right-3 bg-black bg-opacity-70 text-white text-sm py-2 px-3 rounded">
            <div className="flex items-center">
              <span className="inline-block h-3 w-3 rounded-full bg-red-500 mr-2 animate-pulse"></span>
              <span>Scanning... Center QR code in view</span>
            </div>
          </div>
        )}
        
        {!isScanning && hasPermission && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
            <div className="text-center p-4">
              <CameraIcon className="h-8 w-8 mx-auto mb-2" />
              <p>Camera ready</p>
              <p className="text-sm opacity-80">Press Start to begin scanning</p>
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
            {cameras.length > 1 && (
              <li>Try switching camera if one doesn't work</li>
            )}
            {isMobileDevice && (
              <li>Hold your device in portrait orientation</li>
            )}
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