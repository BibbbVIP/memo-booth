import React, { useState, useEffect } from 'react';
import { Download, X, RotateCcw, Sparkles } from 'lucide-react';
import { renderPhotoStrip } from '../utils/canvasRenderer';
import { STICKERS, StickerConfig } from '../utils/stickerConfigs';
import { FrameConfig, PlacedSticker } from '../types';
import { StickerLayer } from './StickerLayer';

interface PreviewModalProps {
  photos: string[];
  frame: FrameConfig;
  onClose: () => void;
}

const MAX_STICKERS = 20;

export const PreviewModal: React.FC<PreviewModalProps> = ({ photos, frame, onClose }) => {
  const [renderedStripUrl, setRenderedStripUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);

  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [failedStickerIds, setFailedStickerIds] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // The base strip (photos + frame) is rendered once; stickers are an overlay on top
  useEffect(() => {
    let isMounted = true;
    setIsRendering(true);
    setRenderError(null);

    renderPhotoStrip(photos, frame)
      .then(url => {
        if (isMounted) {
          setRenderedStripUrl(url);
          setIsRendering(false);
        }
      })
      .catch(err => {
        console.error('Failed to render photo strip:', err);
        if (isMounted) {
          setRenderError('Could not render your photo strip. Please retake.');
          setIsRendering(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [photos, frame]);

  const addSticker = (sticker: StickerConfig) => {
    const img = new Image();
    img.onload = () => {
      const placed: PlacedSticker = {
        uid: `${sticker.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        src: sticker.src,
        aspect: img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1,
        x: 0.5,
        y: 0.5,
        size: 0.3,
        rotation: 0
      };
      setStickers(prev => (prev.length >= MAX_STICKERS ? prev : [...prev, placed]));
      setSelectedUid(placed.uid);
    };
    img.onerror = () => setFailedStickerIds(prev => [...prev, sticker.id]);
    img.src = sticker.src;
  };

  const updateSticker = (uid: string, patch: Partial<PlacedSticker>) =>
    setStickers(prev => prev.map(s => (s.uid === uid ? { ...s, ...patch } : s)));

  const deleteSticker = (uid: string) => {
    setStickers(prev => prev.filter(s => s.uid !== uid));
    setSelectedUid(null);
  };

  const clearStickers = () => {
    setStickers([]);
    setSelectedUid(null);
  };

  const handleDownload = async () => {
    if (!renderedStripUrl || isDownloading) return;
    setIsDownloading(true);
    try {
      // Without stickers the base strip is already the final image
      const url = stickers.length ? await renderPhotoStrip(photos, frame, { stickers }) : renderedStripUrl;
      const a = document.createElement('a');
      a.href = url;
      a.download = `memo-booth-${frame.id}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Failed to export photo strip:', err);
      setRenderError('Could not export your photo strip. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const visibleStickers = STICKERS.filter(s => !failedStickerIds.includes(s.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-3 flex flex-col items-center overflow-y-auto">
      {/* Close = back to the photo review, where shots can be retaken */}
      <button
        onClick={onClose}
        aria-label="Close preview"
        className="absolute top-3 right-3 p-2 rounded-full bg-spider-grey/40 text-slate-300 hover:text-white hover:bg-spider-grey transition-all z-20"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Strip preview with sticker layer */}
      <div className="flex-1 min-h-0 flex items-center justify-center w-full py-2">
        {isRendering ? (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Sparkles className="w-8 h-8 animate-spin text-spider-red" />
            <p className="text-xs font-medium">Rendering Photo Strip...</p>
          </div>
        ) : renderError && !renderedStripUrl ? (
          <p className="text-sm text-rose-400">{renderError}</p>
        ) : renderedStripUrl ? (
          <div className="relative inline-block shadow-2xl">
            <img
              src={renderedStripUrl}
              alt="Photo strip preview"
              draggable={false}
              className="block max-h-[calc(100vh_-_270px)] w-auto select-none"
            />
            <StickerLayer
              stickers={stickers}
              selectedUid={selectedUid}
              onSelect={setSelectedUid}
              onChange={updateSticker}
              onDelete={deleteSticker}
            />
          </div>
        ) : null}
      </div>

      {renderError && renderedStripUrl && <p className="text-xs text-rose-400 mb-1">{renderError}</p>}

      {/* Sticker tray */}
      {visibleStickers.length > 0 && (
        <div className="w-full max-w-md mt-1 bg-spider-dark/80 border border-spider-grey/40 rounded-2xl p-2">
          <div className="flex items-center justify-between px-1 pb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Stickers ({stickers.length}/{MAX_STICKERS})
            </span>
            {stickers.length > 0 && (
              <button
                onClick={clearStickers}
                className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {visibleStickers.map(sticker => (
              <button
                key={sticker.id}
                onClick={() => addSticker(sticker)}
                disabled={stickers.length >= MAX_STICKERS}
                className="shrink-0 w-14 h-14 rounded-xl bg-spider-grey/40 hover:bg-spider-grey p-1.5 transition-all active:scale-95 disabled:opacity-40"
              >
                <img src={sticker.src} alt={sticker.alt} draggable={false} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full max-w-md grid grid-cols-2 gap-2.5 mt-2.5">
        <button
          onClick={onClose}
          className="py-2.5 px-4 rounded-xl bg-spider-grey/40 hover:bg-spider-grey text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-spider-grey/50"
        >
          <RotateCcw className="w-4 h-4" />
          Back & Retake
        </button>

        <button
          onClick={handleDownload}
          disabled={isRendering || !renderedStripUrl || isDownloading}
          className="py-2.5 px-4 rounded-xl bg-spider-red hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? 'Exporting...' : 'Download'}
        </button>
      </div>
    </div>
  );
};
