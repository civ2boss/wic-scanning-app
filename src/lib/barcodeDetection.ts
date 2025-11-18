import { BrowserMultiFormatReader, NotFoundException, DecodeHintType } from '@zxing/library';

/**
 * Processes an image source (canvas, image element, or video frame) to detect barcodes
 * Supports barcodes in any orientation and position within the frame
 * @param imageSource - HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement
 * @returns Promise<string | null> - The detected barcode value, or null if none found
 */
export async function detectBarcode(
  imageSource: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): Promise<string | null> {
  try {
    const codeReader = new BrowserMultiFormatReader();
    
    // Configure hints for better rotation/orientation detection
    // TRY_HARDER enables more thorough scanning which helps with rotated barcodes
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    codeReader.hints = hints;
    
    let result;
    
    if (imageSource instanceof HTMLImageElement) {
      result = await codeReader.decodeFromImageElement(imageSource);
    } else {
      // For canvas or video elements, convert to image element
      let canvas: HTMLCanvasElement;
      
      if (imageSource instanceof HTMLCanvasElement) {
        canvas = imageSource;
      } else {
        // For video elements, capture frame to canvas first
        canvas = document.createElement('canvas');
        canvas.width = imageSource.videoWidth;
        canvas.height = imageSource.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return null;
        }
        ctx.drawImage(imageSource, 0, 0);
      }
      
      // Convert canvas to image element
      const img = new Image();
      img.src = canvas.toDataURL();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      result = await codeReader.decodeFromImageElement(img);
    }
    
    return result ? result.getText() : null;
  } catch (error) {
    if (error instanceof NotFoundException) {
      // No barcode found - this is expected, not an error
      return null;
    }
    console.error('Failed to detect barcode:', error);
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
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return null;
  }
  
  ctx.drawImage(videoElement, 0, 0);
  return detectBarcode(canvas);
}