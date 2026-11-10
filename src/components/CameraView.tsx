import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isLoading: boolean;
  error: string | null;
  isMirrored: boolean;
  countdown: number | null;
  currentPhotoIndex: number | null;
  totalPhotos: number;
  onRetry: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  isLoading,
  error,
  isMirrored,
  countdown,
  currentPhotoIndex,
  totalPhotos,
  onRetry
}) => {
  return (
    <div className="relative w-full max-w-xl aspect-[4/3] bg-spider-grey/30 rounded-2xl overflow-hidden border border-spider-grey shadow-lg flex items-center justify-center mx-auto">
      {/* Live Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-spider-dark/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-slate-300">
          <RefreshCw className="w-6 h-6 animate-spin text-spider-red" />
          <p className="text-xs font-medium">Starting Camera...</p>
        </div>
      )}

      {/* Error Display */}
      {error && !isLoading && (
        <div className="absolute inset-0 bg-spider-dark/95 p-4 flex flex-col items-center justify-center text-center gap-3 text-rose-400">
          <AlertCircle className="w-10 h-10 text-spider-red" />
          <div>
            <h3 className="font-bold text-sm text-white mb-1">Camera Access Issue</h3>
            <p className="text-xs text-slate-300 max-w-xs">{error}</p>
          </div>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-spider-red hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all"
          >
            Retry Permission
          </button>
        </div>
      )}

      {/* Photo Shot Progress Indicator */}
      {currentPhotoIndex !== null && (
        <div className="absolute top-3 left-3 bg-spider-dark/80 backdrop-blur-md px-3 py-1 rounded-full border border-spider-grey text-xs font-bold text-white flex items-center gap-2 shadow">
          <span className="w-2 h-2 rounded-full bg-spider-red animate-ping" />
          Shooting {currentPhotoIndex + 1} of {totalPhotos}
        </div>
      )}

      {/* Big Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 bg-spider-dark/50 backdrop-blur-[2px] flex items-center justify-center">
          <span className="text-7xl sm:text-8xl font-extrabold text-white drop-shadow-md animate-pulse">
            {countdown}
          </span>
        </div>
      )}
    </div>
  );
};