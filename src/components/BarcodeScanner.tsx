/**
 * Request camera permissions
 * Access device camera via getUserMedia API
 * Display camera feed in video element
 * Handle camera errors and permissions
 */
import { useEffect, useRef, useState } from "react";

function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices?.getUserMedia({
          video: true,
        });
        if (stream && videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        } else {
          setError("Failed to access camera");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }
    startCamera();
  }, []);

  return (
    <div 
      style={{ 
        position: 'relative',
        width: '100%',
        minHeight: '500px',
        height: '70vh'
      }}
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
          height: 'calc(50% - 128px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}></div>
        {/* Bottom overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'calc(50% - 128px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}></div>
        {/* Left overlay */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 'calc(50% - 128px)',
          bottom: 'calc(50% - 128px)',
          width: 'calc(50% - 128px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}></div>
        {/* Right overlay */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(50% - 128px)',
          bottom: 'calc(50% - 128px)',
          width: 'calc(50% - 128px)',
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
          width: '256px',
          height: '256px'
        }}>
          {/* Corner indicators */}
          {/* Top-left */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '32px',
            height: '32px',
            borderTop: '4px solid white',
            borderLeft: '4px solid white'
          }}></div>
          {/* Top-right */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '32px',
            height: '32px',
            borderTop: '4px solid white',
            borderRight: '4px solid white'
          }}></div>
          {/* Bottom-left */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '32px',
            height: '32px',
            borderBottom: '4px solid white',
            borderLeft: '4px solid white'
          }}></div>
          {/* Bottom-right */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '32px',
            height: '32px',
            borderBottom: '4px solid white',
            borderRight: '4px solid white'
          }}></div>

          {/* Scanning line animation */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: '#a855f7',
            animation: 'scan 2s linear infinite',
            top: '50%'
          }}></div>
        </div>
      </div>

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
