import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

interface CameraProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraComponent: React.FC<CameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } // Prefer back camera for textbooks
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Clean base64 string (remove data URL prefix)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        onCapture(base64);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Overlay Guide */}
        <div className="absolute inset-0 border-2 border-white/30 pointer-events-none m-8 rounded-lg flex items-center justify-center">
             <p className="text-white/70 text-sm bg-black/50 px-3 py-1 rounded">Align text here</p>
        </div>
      </div>
      
      <div className="h-24 bg-luminary-900 flex items-center justify-around px-8">
        <button 
            onClick={onClose}
            className="text-white p-2 rounded-full hover:bg-white/10"
        >
            Cancel
        </button>
        
        <button 
            onClick={takePhoto}
            className="w-16 h-16 rounded-full bg-white border-4 border-luminary-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
            <div className="w-14 h-14 rounded-full bg-white border-2 border-black/10"></div>
        </button>
        
        <div className="w-12"></div> {/* Spacer for alignment */}
      </div>
    </div>
  );
};

export default CameraComponent;