/**
 * Request camera permissions
 * Access device camera via getUserMedia API
 * Display camera feed in video element
 * Handle camera errors and permissions
 */
import { useEffect, useRef, useState } from "react";
import { detectBarcodeFromVideo } from "../lib/barcodeDetection";
import { lookupProduct } from "../lib/productLookup";
import { checkEligibility } from "../lib/eligibility";
import type { Product, ParticipantType } from "../lib/db";

interface BarcodeScannerProps {
  onClose?: () => void;
  selectedParticipant: ParticipantType | null;
}

function BarcodeScanner({ onClose, selectedParticipant }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const scanIntervalRef = useRef<number | null>(null);
  const lastScannedBarcode = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = (type: 'success' | 'error') => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === 'success') {
        // High pitched pleasant beep
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
      } else {
        // Lower pitched error buzz
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.error('Audio playback failed', e);
    }
  };

  const triggerFeedback = (isSuccess: boolean) => {
    // Sound
    playSound(isSuccess ? 'success' : 'error');
    
    // Vibration
    if (navigator.vibrate) {
      if (isSuccess) {
        navigator.vibrate(200);
      } else {
        navigator.vibrate([100, 50, 100]); // Double vibration for error
      }
    }
  };

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

    let isActive = true;
    let animationFrameId: number;

    const scan = async () => {
      if (!isActive) return;
      
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
              
              // Check eligibility if participant is selected
              let isProductEligible = true;
              if (selectedParticipant) {
                const eligibility = checkEligibility(
                  foundProduct.categoryDescription,
                  foundProduct.subCategoryDescription,
                  selectedParticipant
                );
                isProductEligible = eligibility.eligible;
                setIsEligible(eligibility.eligible);
                setEligibilityReason(eligibility.reason || null);
              } else {
                setIsEligible(null);
                setEligibilityReason(null);
              }
              
              // Play error feedback if not eligible, success if eligible
              triggerFeedback(isProductEligible);
            } else {
              console.log('Product not found in WIC database');
              setIsEligible(null);
              setEligibilityReason(null);
              triggerFeedback(false);
            }
          }
        } catch (err) {
          // Silently handle errors (barcode not found is expected)
        }
      }

      // Schedule next scan with a slight throttle to avoid choking main thread
      // Waits for the async operation to complete before queueing the next, preventing overlap
      if (isActive) {
        setTimeout(() => {
          if (isActive) {
            animationFrameId = requestAnimationFrame(scan);
          }
        }, 100);
      }
    };

    // Start scanning loop
    animationFrameId = requestAnimationFrame(scan);

    return () => {
      isActive = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isScanning, isPaused, selectedParticipant]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white animate-in slide-in-from-bottom-full duration-300">
      <video
        ref={videoRef}
        id="video"
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      ></video>
      
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30 bg-linear-to-b from-black/70 to-transparent pb-8">
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
          className={`px-5 py-2.5 rounded-full font-semibold text-sm backdrop-blur-md transition-all shadow-xl border border-white/10 ${
            isPaused ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-white/90 text-stone-900 hover:bg-white'
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
             <div className="absolute left-0 right-0 h-[3px] bg-wic-sage shadow-[0_0_12px_rgba(129,178,154,0.9)] top-1/2 animate-[scan_2s_linear_infinite]"></div>
           )}
           
           {!isPaused && <div className="absolute bottom-4 w-full text-center text-white/90 text-sm font-medium drop-shadow-md">Align barcode within frame</div>}
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
        <div className="absolute bottom-8 left-4 right-4 z-30 animate-in slide-in-from-bottom-10 fade-in duration-500 ease-out-back">
           <div className={`p-5 rounded-2xl shadow-2xl backdrop-blur-md border transform transition-all duration-300 ${
             product 
               ? isEligible === false 
                 ? 'bg-amber-900/90 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                 : 'bg-emerald-900/90 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
               : 'bg-red-900/90 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
           }`}>
               {product ? (
                 <div className="text-white animate-in zoom-in-95 duration-300">
                   <div className={`flex items-center gap-2 mb-2 font-bold text-lg ${
                     isEligible === false ? 'text-amber-200' : 'text-emerald-200'
                   }`}>
                     <div className={`p-1 rounded-full ${
                       isEligible === false ? 'bg-amber-500/20' : 'bg-emerald-500/20'
                     }`}>
                       {isEligible === false ? (
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                       ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
                       )}
                     </div>
                     {isEligible === false ? 'NOT ELIGIBLE' : 'WIC APPROVED'}
                   </div>
                   <div className="text-lg leading-tight font-medium mb-1">
                     {product.brandName} {product.foodDescription}
                   </div>
                   <div className="text-xs text-white/70 font-mono mt-1">
                     {product.categoryDescription} • {product.subCategoryDescription}
                   </div>
                   {eligibilityReason && (
                     <div className="mt-3 p-3 bg-black/30 rounded-lg text-sm text-stone-200 border border-white/10">
                       {eligibilityReason}
                     </div>
                   )}
                   {!selectedParticipant && (
                     <div className="mt-3 p-3 bg-black/40 rounded-lg text-xs text-stone-300 border border-white/10 flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                       Select a participant type to check eligibility
                     </div>
                   )}
                   <div className="text-xs text-white/50 font-mono mt-3">
                     UPC: {detectedBarcode}
                   </div>
                 </div>
               ) : (
                <div className="text-white animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2 mb-2 text-red-200 font-bold text-lg">
                    <div className="p-1 bg-red-500/20 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </div>
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
