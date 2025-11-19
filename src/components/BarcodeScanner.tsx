/**
 * Request camera permissions
 * Access device camera via getUserMedia API
 * Display camera feed in video element
 * Handle camera errors and permissions
 */
import { useEffect, useRef, useState } from "react";
import { detectBarcodeFromVideo } from "../lib/barcodeDetection";
import { lookupProduct } from "../lib/productLookup";
import type { Product } from "../lib/db";

interface BarcodeScannerProps {
  onClose?: () => void;
}

function BarcodeScanner({ onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const scanIntervalRef = useRef<number | null>(null);
  const lastScannedBarcode = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    // Clear detected barcode and product when pausing
    setDetectedBarcode(null);
    setProduct(null);
    lastScannedBarcode.current = null;
  };

  const startCamera = async () => {
    try {
      // Try to get back camera first (environment facing)
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices?.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera on mobile devices
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
        }) || null;
      } catch (envError) {
        // Fallback to any available camera if back camera fails
        console.warn('Back camera not available, trying default camera:', envError);
        stream = await navigator.mediaDevices?.getUserMedia({
          video: true,
        }) || null;
      }
      
      if (stream && videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        // Start scanning once video is ready
        setIsScanning(true);
        setError(null);
      } else {
        setError("Failed to access camera");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const togglePause = () => {
    if (isPaused) {
      // Resume: start camera
      startCamera();
    } else {
      // Pause: stop camera
      stopCamera();
    }
    setIsPaused(prev => !prev);
  };

  useEffect(() => {
    // Start camera on mount
    if (!isPaused) {
      startCamera();
    }
    
    // Cleanup: stop camera stream when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  // Continuous barcode scanning
  useEffect(() => {
    if (!isScanning || !videoRef.current || isPaused) return;

    const scan = async () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        try {
          const barcode = await detectBarcodeFromVideo(videoRef.current);
          if (barcode && barcode !== lastScannedBarcode.current) {
            // Only process if it's a new barcode
            lastScannedBarcode.current = barcode;
            setDetectedBarcode(barcode);
            console.log('Detected barcode:', barcode);
            
            // Look up product in database
            const foundProduct = await lookupProduct(barcode);
            setProduct(foundProduct);
            
            if (foundProduct) {
              console.log('Product found:', foundProduct);
            } else {
              console.log('Product not found in WIC database');
            }
          }
        } catch (err) {
          // Silently handle errors (barcode not found is expected)
        }
      }
    };

    // Scan every 500ms (adjust as needed for performance)
    scanIntervalRef.current = window.setInterval(scan, 500);

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [isScanning, isPaused]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white">
      <video
        ref={videoRef}
        id="video"
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      ></video>
      
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30 bg-gradient-to-b from-black/70 to-transparent pb-8">
        <button 
           onClick={onClose}
           className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors active:scale-95"
           aria-label="Close scanner"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <button
          onClick={togglePause}
          className={`px-4 py-2 rounded-full font-medium text-sm backdrop-blur-md transition-colors shadow-lg ${
            isPaused ? 'bg-emerald-500/90 hover:bg-emerald-600' : 'bg-amber-500/90 hover:bg-amber-600'
          }`}
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      {/* Focus Overlay (Hollow Box) */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="w-64 h-64 sm:w-80 sm:h-80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-2xl"></div>
      </div>

      {/* Scanning Frame & Animation */}
      <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 border border-white/20 rounded-2xl overflow-hidden">
           {/* Corners */}
           <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-sm"></div>
           <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-sm"></div>
           <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-sm"></div>
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-sm"></div>
           
           {/* Scan Line */}
           {!isPaused && (
             <div className="absolute left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] top-1/2 animate-[scan_2s_linear_infinite]"></div>
           )}
           
           {!isPaused && <div className="absolute bottom-4 w-full text-center text-white/70 text-sm font-medium">Align barcode within frame</div>}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-xl z-30 max-w-[90%] text-center font-medium">
          {error}
        </div>
      )}

      {/* Result Overlay */}
      {detectedBarcode && (
        <div className="absolute bottom-8 left-4 right-4 z-30 animate-in slide-in-from-bottom-4 fade-in duration-300">
           <div className={`p-5 rounded-2xl shadow-2xl backdrop-blur-md border ${
             product ? 'bg-emerald-900/90 border-emerald-500/50' : 'bg-red-900/90 border-red-500/50'
           }`}>
              {product ? (
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-2 text-emerald-200 font-bold text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    WIC APPROVED
                  </div>
                  <div className="text-lg leading-tight font-medium mb-1">
                    {product.brandName} {product.foodDescription}
                  </div>
                  <div className="text-xs text-emerald-200/70 font-mono mt-2">
                    UPC: {detectedBarcode}
                  </div>
                </div>
              ) : (
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-2 text-red-200 font-bold text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    NOT WIC APPROVED
                  </div>
                  <div className="text-white/90 mb-1">
                    Product not found in WIC database
                  </div>
                   <div className="text-xs text-red-200/70 font-mono mt-2">
                    UPC: {detectedBarcode}
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 1; }
          50% { top: 90%; opacity: 0.5; }
          100% { top: 10%; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default BarcodeScanner;
