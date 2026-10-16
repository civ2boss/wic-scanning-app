/**
 * Request camera permissions
 * Access device camera via getUserMedia API
 * Display camera feed in video element
 * Handle camera errors and permissions
 */
import { useEffect, useRef, useState } from "react";
import { detectBarcodeFromVideo } from "../lib/barcodeDetection";
import {
  PARTICIPANT_LABELS,
  type ParticipantType,
  type Product,
} from "../lib/db";
import {
  checkEligibility,
  type HouseholdMemberEligibility,
} from "../lib/eligibility";
import { lookupProduct } from "../lib/productLookup";
import type { WicFoodSubCategory } from "../lib/wicFoodsGuide";
import { getGuideInfoForProduct } from "../lib/wicFoodsGuide";

interface BarcodeScannerProps {
  onClose?: () => void;
  selectedParticipant?: ParticipantType | null;
  household?: ParticipantType[];
}

function BarcodeScanner({
  onClose,
  selectedParticipant = null,
  household,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(
    null,
  );
  const [memberResults, setMemberResults] = useState<
    HouseholdMemberEligibility[]
  >([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [guideInfo, setGuideInfo] = useState<WicFoodSubCategory | null>(null);
  const [showGuideInfo, setShowGuideInfo] = useState(false);
  const _scanIntervalRef = useRef<number | null>(null);
  const lastScannedBarcode = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const activeHousehold: ParticipantType[] =
    household !== undefined
      ? household
      : selectedParticipant
        ? [selectedParticipant]
        : [];

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
    setDetectedBarcode(null);
    setProduct(null);
    setMemberResults([]);
    setGuideInfo(null);
    setShowGuideInfo(false);
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
            setDetectedBarcode(barcode);

            const foundProduct = await lookupProduct(barcode);
            setProduct(foundProduct);

            if (foundProduct) {
              const guide = getGuideInfoForProduct(
                foundProduct.categoryDescription,
                foundProduct.subCategoryDescription,
              );
              setGuideInfo(guide);
              setShowGuideInfo(false);

              let isProductEligible = true;
              if (activeHousehold.length > 0) {
                const results: HouseholdMemberEligibility[] =
                  activeHousehold.map((memberType) => {
                    const res =
                      activeHousehold.length === 1
                        ? checkEligibility(
                            foundProduct.categoryDescription,
                            foundProduct.subCategoryDescription,
                            memberType,
                          )
                        : checkEligibility(
                            foundProduct.categoryDescription,
                            foundProduct.subCategoryDescription,
                            memberType,
                            {
                              householdHasFullyBreastfeeding:
                                activeHousehold.includes("BREASTFEEDING"),
                            },
                          );
                    return {
                      type: memberType,
                      label: PARTICIPANT_LABELS?.[memberType] ?? memberType,
                      eligible: res.eligible,
                      reason: res.reason,
                    };
                  });

                setMemberResults(results);
                const eligibleMembers = results.filter((r) => r.eligible);
                isProductEligible = eligibleMembers.length > 0;
                setIsEligible(isProductEligible);

                if (isProductEligible) {
                  const note = eligibleMembers.find((m) => m.reason)?.reason;
                  setEligibilityReason(note || null);
                } else {
                  const reasons = Array.from(
                    new Set(results.map((r) => r.reason).filter(Boolean)),
                  );
                  setEligibilityReason(reasons.join(" • ") || null);
                }
              } else {
                setMemberResults([]);
                setIsEligible(null);
                setEligibilityReason(null);
              }

              triggerFeedback(isProductEligible);
            } else {
              setMemberResults([]);
              setIsEligible(null);
              setEligibilityReason(null);
              triggerFeedback(false);
            }
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
  }, [isScanning, isPaused, selectedParticipant, household]);

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
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
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
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-xl z-30 max-w-[90%] text-center font-medium">
          {error}
        </div>
      )}

      {/* Result Overlay */}
      {detectedBarcode && (
        <div className="absolute bottom-8 left-4 right-4 z-30 animate-in slide-in-from-bottom-10 fade-in duration-500 ease-out-back">
          <div
            className={`p-5 rounded-2xl shadow-2xl backdrop-blur-md border transform transition-all duration-300 ${
              product
                ? isEligible === false
                  ? "bg-amber-900/90 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                  : "bg-emerald-900/90 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                : "bg-red-900/90 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
            }`}
          >
            {product ? (
              <div className="text-white animate-in zoom-in-95 duration-300">
                <div
                  className={`flex items-center gap-2 mb-2 font-bold text-lg ${
                    isEligible === false ? "text-amber-200" : "text-emerald-200"
                  }`}
                >
                  <div
                    className={`p-1 rounded-full ${
                      isEligible === false
                        ? "bg-amber-500/20"
                        : "bg-emerald-500/20"
                    }`}
                  >
                    {isEligible === false ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-amber-400"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-emerald-400"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  {isEligible === false ? "NOT ELIGIBLE" : "WIC APPROVED"}
                </div>
                <div className="text-lg leading-tight font-medium mb-1">
                  {product.brandName} {product.foodDescription}
                </div>
                <div className="text-xs text-white/70 font-mono mt-1">
                  {product.categoryDescription} •{" "}
                  {product.subCategoryDescription}
                </div>

                {/* Per-member household badges when multiple participants are selected */}
                {memberResults.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {memberResults.map((member) => (
                      <span
                        key={member.type}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          member.eligible
                            ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/40"
                            : "bg-black/30 text-white/60 border-white/15"
                        }`}
                      >
                        <span>{member.eligible ? "✓" : "✕"}</span>
                        <span>{member.label}</span>
                      </span>
                    ))}
                  </div>
                )}

                {eligibilityReason && (
                  <div className="mt-3 p-3 bg-black/30 rounded-lg text-sm text-stone-200 border border-white/10">
                    {eligibilityReason}
                  </div>
                )}
                {guideInfo && (
                  <div className="mt-3">
                    <button
                      onClick={() => setShowGuideInfo(!showGuideInfo)}
                      className="flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                      {showGuideInfo ? "Hide Guide Info" : "View Guide Info"}
                    </button>
                    {showGuideInfo && (
                      <div className="mt-2 p-3 bg-black/40 rounded-lg border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        {guideInfo.doNotBuy.length > 0 && (
                          <div>
                            <div className="text-xs font-bold text-red-300 uppercase tracking-wider mb-1.5">
                              Do Not Buy
                            </div>
                            <ul className="space-y-1">
                              {guideInfo.doNotBuy.slice(0, 3).map((item, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-1.5 text-xs text-stone-300"
                                >
                                  <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                              {guideInfo.doNotBuy.length > 3 && (
                                <li className="text-xs text-stone-400 pl-2.5">
                                  +{guideInfo.doNotBuy.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                        {guideInfo.approved.length > 0 && (
                          <div>
                            <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                              Approved Sizes
                            </div>
                            <ul className="space-y-1">
                              {guideInfo.approved.slice(0, 2).map((item, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-1.5 text-xs text-stone-300"
                                >
                                  <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {guideInfo.shoppingTips.length > 0 && (
                          <div>
                            <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                              Tip
                            </div>
                            <p className="text-xs text-stone-300">
                              {guideInfo.shoppingTips[0]}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {activeHousehold.length === 0 && (
                  <div className="mt-3 p-3 bg-black/40 rounded-lg text-xs text-stone-300 border border-white/10 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Select your household participants to check eligibility
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-red-400"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
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
    </div>
  );
}

export default BarcodeScanner;
