import React from 'react';
import { RotateCcw } from 'lucide-react';

interface PhotoThumbnailsProps {
  photos: (string | null)[]; // one entry per slot, null = not taken yet
  currentIndex: number | null; // slot being shot right now
  isCapturing: boolean;
  onRetake: (index: number) => void;
}

/**
 * Shows every shot as soon as it is taken (cropped 4:3, exactly like the strip slot),
 * so you can judge it and retake just that one.
 */
export const PhotoThumbnails: React.FC<PhotoThumbnailsProps> = ({ photos, currentIndex, isCapturing, onRetake }) => {
  return (
    <div className="flex md:flex-col gap-2 md:w-32 shrink-0">
      {photos.map((photo, i) => {
        const isCurrent = isCapturing && currentIndex === i;
        return (
          <div
            key={i}
            className={`relative aspect-[4/3] flex-1 min-w-0 md:flex-none rounded-lg overflow-hidden border-2 bg-spider-grey/20 transition-colors ${
              isCurrent
                ? 'border-spider-red animate-pulse'
                : photo
                  ? 'border-spider-grey'
                  : 'border-dashed border-spider-grey/60'
            }`}
          >
            {photo ? (
              <img src={photo} alt={`Photo ${i + 1}`} draggable={false} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-lg font-bold">
                {i + 1}
              </div>
            )}

            {photo && (
              <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {i + 1}
              </span>
            )}

            {photo && !isCapturing && (
              <button
                onClick={() => onRetake(i)}
                aria-label={`Retake photo ${i + 1}`}
                title={`Retake photo ${i + 1}`}
                className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-spider-red text-white flex items-center justify-center transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
