import React, { useState, useEffect, useRef } from 'react';
import { Download, X, RotateCcw, Sparkles, Upload } from 'lucide-react';
import { FRAME_OPTIONS, renderPhotoStrip } from '../utils/canvasRenderer';

interface PreviewModalProps {
  photosDataUrl: string[];
  onClose: () => void;
  onRetake: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  photosDataUrl,
  onClose,
  onRetake
}) => {
  const [selectedFrameId, setSelectedFrameId] = useState<string>('classic-white');
  const [customUploadUrl, setCustomUploadUrl] = useState<string | null>(null);
  const [renderedStripUrl, setRenderedStripUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    setIsRendering(true);

    renderPhotoStrip(photosDataUrl, selectedFrameId, customUploadUrl)
      .then(url => {
        if (isMounted) {
          setRenderedStripUrl(url);
          setIsRendering(false);
        }
      })
      .catch(err => {
        console.error('Failed to render canvas strip:', err);
        if (isMounted) setIsRendering(false);
      });

    return () => {
      isMounted = false;
    };
  }, [photosDataUrl, selectedFrameId, customUploadUrl]);

  const handleFrameSelect = (frameId: string) => {
    if (frameId === 'upload-custom') {
      fileInputRef.current?.click();
    } else {
      setSelectedFrameId(frameId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomUploadUrl(url);
      setSelectedFrameId('upload-custom');
    }
  };

  const handleDownload = () => {
    if (!renderedStripUrl) return;
    const a = document.createElement('a');
    a.href = renderedStripUrl;
    a.download = `memo-booth-strip-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-2 flex flex-col items-center justify-center overflow-y-auto">
      
      {/* Hidden file input for custom frame upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg"
        className="hidden"
      />

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full bg-spider-grey/40 text-slate-300 hover:text-white hover:bg-spider-grey transition-all z-20"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Preview Image */}
      <div className="flex-1 flex items-center justify-center my-1 max-h-[84vh] w-full">
        {isRendering ? (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Sparkles className="w-8 h-8 animate-spin text-spider-red" />
            <p className="text-xs font-medium">Rendering Photo Strip...</p>
          </div>
        ) : renderedStripUrl ? (
          <img
            src={renderedStripUrl}
            alt="Photo Strip Preview"
            className="max-h-[82vh] w-auto object-contain rounded-2xl shadow-2xl"
          />
        ) : null}
      </div>

      {/* Frame Selection Pills */}
      <div className="mt-2 flex items-center justify-center gap-2 bg-spider-dark/80 backdrop-blur-sm p-1.5 rounded-2xl border border-spider-grey/40 flex-wrap">
        {FRAME_OPTIONS.map(frame => {
          const isSelected = selectedFrameId === frame.id;
          return (
            <button
              key={frame.id}
              onClick={() => handleFrameSelect(frame.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-spider-red text-white shadow-md'
                  : 'text-slate-300 hover:bg-spider-grey/50 hover:text-white'
              }`}
            >
              {frame.isUploadOption && <Upload className="w-3.5 h-3.5" />}
              {frame.id === 'upload-custom' && customUploadUrl ? 'Custom Frame (Loaded)' : frame.name}
            </button>
          );
        })}
      </div>

      {/* Action Buttons at Bottom */}
      <div className="w-full max-w-md grid grid-cols-2 gap-2.5 mt-2.5">
        <button
          onClick={onRetake}
          className="py-2.5 px-4 rounded-xl bg-spider-grey/40 hover:bg-spider-grey text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-spider-grey/50"
        >
          <RotateCcw className="w-4 h-4" />
          Close & Retake
        </button>

        <button
          onClick={handleDownload}
          disabled={isRendering || !renderedStripUrl}
          className="py-2.5 px-4 rounded-xl bg-spider-red hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

    </div>
  );
};