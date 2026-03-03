import { BrowserMultiFormatReader, NotFoundException, DecodeHintType } from '@zxing/library';

// Type definitions for the native BarcodeDetector API
declare global {
  class BarcodeDetector {
    constructor(options?: { formats: string[] });
    detect(imageSource: ImageBitmapSource): Promise<{ rawValue: string }[]>;
    static getSupportedFormats(): Promise<string[]>;
  }
  interface Window {
    BarcodeDetector: typeof BarcodeDetector;
  }
}

let zxingReader: BrowserMultiFormatReader | null = null;
let nativeDetector: BarcodeDetector | null = null;
let isNativeDetectorSupported = false;
let checkNativeSupportDone = false;

async function initNativeDetector() {
  if (checkNativeSupportDone) return;
  checkNativeSupportDone = true;
  
  if ('BarcodeDetector' in window) {
    try {
      const formats = await window.BarcodeDetector.getSupportedFormats();
      if (formats.includes('upc_a') || formats.includes('ean_13')) {
        nativeDetector = new window.BarcodeDetector({ formats: ['upc_a', 'upc_e', 'ean_13', 'ean_8'] });
        isNativeDetectorSupported = true;
      }
    } catch (e) {
      console.warn('Native BarcodeDetector not supported or failed to init', e);
    }
  }
}

/**
 * Processes an image source to detect barcodes using hardware acceleration if available
 * @param imageSource - HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement
 * @returns Promise<string | null> - The detected barcode value, or null if none found
 */
export async function detectBarcode(
  imageSource: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): Promise<string | null> {
  await initNativeDetector();

  // Try native BarcodeDetector first (extremely fast, hardware accelerated)
  if (isNativeDetectorSupported && nativeDetector) {
    try {
      const barcodes = await nativeDetector.detect(imageSource);
      if (barcodes && barcodes.length > 0) {
        return barcodes[0].rawValue;
      }
      return null;
    } catch (error) {
      // Fall back if native fails
    }
  }

  // Fallback: ZXing direct decode
  if (!zxingReader) {
    zxingReader = new BrowserMultiFormatReader();
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    zxingReader.hints = hints;
  }

  try {
    const result = zxingReader.decode(imageSource as any);
    return result ? result.getText() : null;
  } catch (error) {
    if (error instanceof NotFoundException) {
      return null;
    }
    // Only log actual unexpected errors
    return null;
  }
}

/**
 * Captures a frame from a video element and processes it for barcodes
 * @param videoElement - The video element to capture from
 * @returns Promise<string | null> - The detected barcode value, or null if none found
 */
export async function detectBarcodeFromVideo(
  videoElement: HTMLVideoElement
): Promise<string | null> {
  return detectBarcode(videoElement);
}