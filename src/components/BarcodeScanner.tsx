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

function BarcodeScanner() {
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
    <div 
      style={{ 
        position: 'relative',
        width: '100%',
        minHeight: '500px',
        height: '70vh',
        '--scan-frame-size': 'clamp(200px, min(60vw, 60vh), 400px)',
        '--scan-frame-half': 'calc(var(--scan-frame-size) / 2)'
      } as React.CSSProperties}
    >
      <video
        ref={videoRef}
        id="video"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
        autoPlay
        playsInline
        muted
      ></video>
      
      {/* Dark overlay on sides */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 10
      }}>
        {/* Top overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 'calc(50% - var(--scan-frame-half))',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}></div>
        {/* Bottom overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'calc(50% - var(--scan-frame-half))',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}></div>
        {/* Left overlay */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 'calc(50% - var(--scan-frame-half))',
          bottom: 'calc(50% - var(--scan-frame-half))',
          width: 'calc(50% - var(--scan-frame-half))',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}></div>
        {/* Right overlay */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(50% - var(--scan-frame-half))',
          bottom: 'calc(50% - var(--scan-frame-half))',
          width: 'calc(50% - var(--scan-frame-half))',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}></div>
      </div>

      {/* Overlay with scanning frame */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
        pointerEvents: 'none'
      }}>
        {/* Scanning Frame */}
        <div style={{
          position: 'relative',
          width: 'var(--scan-frame-size)',
          height: 'var(--scan-frame-size)'
        }}>
          {/* Corner indicators */}
          {/* Top-left */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '12.5%',
            height: '12.5%',
            borderTop: '3px solid white',
            borderLeft: '3px solid white'
          }}></div>
          {/* Top-right */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '12.5%',
            height: '12.5%',
            borderTop: '3px solid white',
            borderRight: '3px solid white'
          }}></div>
          {/* Bottom-left */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '12.5%',
            height: '12.5%',
            borderBottom: '3px solid white',
            borderLeft: '3px solid white'
          }}></div>
          {/* Bottom-right */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '12.5%',
            height: '12.5%',
            borderBottom: '3px solid white',
            borderRight: '3px solid white'
          }}></div>

          {/* Scanning line animation */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: '#a855f7',
            animation: isPaused ? 'none' : 'scan 2s linear infinite',
            top: '50%'
          }}></div>
        </div>
      </div>

      {/* Pause/Resume Button */}
      <button
        onClick={togglePause}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 30,
          backgroundColor: isPaused ? '#10b981' : '#f59e0b',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          transition: 'background-color 0.2s'
        }}
      >
        {isPaused ? '▶ Resume' : '⏸ Pause'}
      </button>

      {error && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.25rem',
          zIndex: 30
        }}>
          {error}
        </div>
      )}

      {detectedBarcode && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: product ? '#10b981' : '#dc2626',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          zIndex: 30,
          fontSize: '1rem',
          fontWeight: '600',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          maxWidth: '90%',
          textAlign: 'center'
        }}>
          {product ? (
            <div>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                ✓ WIC APPROVED
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9, fontWeight: '400' }}>
                {product.brandName} {product.foodDescription}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                UPC: {detectedBarcode}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                ✗ NOT WIC APPROVED
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9, fontWeight: '400' }}>
                UPC: {detectedBarcode}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                Product not found in WIC database
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% {
            top: 10%;
            opacity: 1;
          }
          50% {
            top: 90%;
            opacity: 0.5;
          }
          100% {
            top: 10%;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default BarcodeScanner;
