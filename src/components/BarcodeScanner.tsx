/**
 * Request camera permissions
 * Access device camera via getUserMedia API
 * Display camera feed in video element
 * Handle camera errors and permissions
 */
import { useEffect, useRef, useState } from "react";
import { detectBarcodeFromVideo } from "../lib/barcodeDetection";
import type { Household, Product } from "../lib/db";
import { lookupProduct } from "../lib/productLookup";
import { productDisplayName } from "../lib/productName";
import {
  productVerdict,
  type ProductVerdict as Verdict,
} from "../lib/productVerdict";
import { ProductVerdict } from "./ProductVerdict";

interface BarcodeScannerProps {
  onClose?: () => void;
  household: Household;
}

interface ScanResult {
  barcode: string;
  product: Product | null;
  verdict: Verdict;
}

function BarcodeScanner({ onClose, household }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const _scanIntervalRef = useRef<number | null>(null);
  const lastScannedBarcode = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = (type: "success" | "error") => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === "success") {
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          1500,
          ctx.currentTime + 0.1,
        );
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
      } else {
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(
          150,
          ctx.currentTime + 0.3,
        );
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const triggerFeedback = (isSuccess: boolean) => {
    playSound(isSuccess ? "success" : "error");

    if (navigator.vibrate) {
      if (isSuccess) {
        navigator.vibrate(200);
      } else {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setLastScan(null);
    lastScannedBarcode.current = null;
  };

  const startCamera = async () => {
    try {
      let stream: MediaStream | null = null;
      try {
        stream =
          (await navigator.mediaDevices?.getUserMedia({
            video: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          })) || null;
      } catch (envError) {
        console.warn(
          "Back camera not available, trying default camera:",
          envError,
        );
        stream =
          (await navigator.mediaDevices?.getUserMedia({
            video: true,
          })) || null;
      }

      if (stream && videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
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
      startCamera();
    } else {
      stopCamera();
    }
    setIsPaused((prev) => !prev);
  };

  useEffect(() => {
    if (!isPaused) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isPaused]);

  // Continuous barcode scanning
  useEffect(() => {
    if (!isScanning || !videoRef.current || isPaused) return;

    let isActive = true;
    let animationFrameId: number;

    const scan = async () => {
      if (!isActive) return;

      if (
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
        try {
          const barcode = await detectBarcodeFromVideo(videoRef.current);
          if (barcode && barcode !== lastScannedBarcode.current) {
            lastScannedBarcode.current = barcode;

            const foundProduct = await lookupProduct(barcode);
            const verdict = productVerdict(foundProduct, household);
            setLastScan({ barcode, product: foundProduct, verdict });
            triggerFeedback(
              verdict.status === "eligible" || verdict.status === "approved",
            );
          }
        } catch (_err) {
          // Silently handle frame scan errors
        }
      }

      if (isActive) {
        setTimeout(() => {
          if (isActive) {
            animationFrameId = requestAnimationFrame(scan);
          }
        }, 100);
      }
    };

    animationFrameId = requestAnimationFrame(scan);

    return () => {
      isActive = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isScanning, isPaused, household]);

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <button
          onClick={togglePause}
          className={`px-5 py-2.5 rounded-full font-semibold text-sm backdrop-blur-md transition-all shadow-xl border border-white/10 ${
            isPaused
              ? "bg-wic-approved hover:bg-wic-approved/90 text-white"
              : "bg-white/90 text-stone-900 hover:bg-white"
          }`}
        >
          {isPaused ? "▶ Resume" : "⏸ Pause"}
        </button>
      </div>

      {/* Focus Overlay (Hollow Box) */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        <div className="w-64 h-64 sm:w-80 sm:h-80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-2xl"></div>
      </div>

      {/* Scanning Frame & Animation */}
      <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 border border-white/20 rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-sm"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-sm"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-sm"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-sm"></div>

          {!isPaused && (
            <div className="absolute left-0 right-0 h-[3px] bg-wic-sage shadow-[0_0_12px_rgba(129,178,154,0.9)] top-1/2 animate-[scan_2s_linear_infinite]"></div>
          )}

          {!isPaused && (
            <div className="absolute bottom-4 w-full text-center text-white/90 text-sm font-medium drop-shadow-md">
              Align barcode within frame
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-wic-error/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-xl z-30 max-w-[90%] text-center font-medium">
          {error}
        </div>
      )}

      {/* Result Overlay */}
      {lastScan && (
        <div className="absolute bottom-8 left-4 right-4 z-30 animate-in slide-in-from-bottom-10 fade-in duration-500 ease-out-back">
          <ProductVerdict
            verdict={lastScan.verdict}
            variant="overlay"
            footer={
              <div
                className={`text-xs font-mono ${lastScan.product ? "text-white/50 mt-3" : "text-wic-error-ink/70 mt-2"}`}
              >
                UPC: {lastScan.barcode}
              </div>
            }
          >
            {lastScan.product ? (
              <>
                <div className="text-lg leading-tight font-medium mb-1">
                  {productDisplayName(lastScan.product)}
                </div>
                <div className="text-xs text-white/70 font-mono mt-1">
                  {lastScan.product.categoryDescription} •{" "}
                  {lastScan.product.subCategoryDescription}
                </div>
              </>
            ) : (
              <div className="text-white/90 mb-1">
                Product not found in WIC database
              </div>
            )}
          </ProductVerdict>
        </div>
      )}
    </div>
  );
}

export default BarcodeScanner;
