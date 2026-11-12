import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { FrameConfig } from '../types';
import { renderPhotoStrip } from '../utils/canvasRenderer';

interface Props {
  frames: FrameConfig[];
  onSelect: (frame: FrameConfig) => void;
  onBack: () => void;
}

/** Renders the real frame (with empty grey slots) so the thumbnail is always accurate. */
function FrameThumbnail({ frame }: { frame: FrameConfig }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    renderPhotoStrip([], frame, { scale: 0.5, placeholder: true })
      .then(url => {
        if (active) setSrc(url);
      })
      .catch(err => console.error('Failed to render frame thumbnail:', err));
    return () => {
      active = false;
    };
  }, [frame]);

  if (!src) return <div className="h-full w-full animate-pulse rounded-lg bg-spider-grey/40" />;
  return <img src={src} alt={`${frame.name} preview`} className="h-full w-full object-contain" />;
}

export default function ChooseFrame({ frames, onSelect, onBack }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-4xl">
        <button
          onClick={onBack}
          className="mb-6 text-slate-400 hover:text-white font-medium flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-spider-white mb-2">Choose Your Layout</h1>
          <p className="text-slate-400 text-sm">The frame decides how many photos you will take.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {frames.map(frame => (
            <button
              key={frame.id}
              onClick={() => onSelect(frame)}
              className="group flex flex-col items-center text-left focus:outline-none"
            >
              <div className="relative w-full h-80 rounded-xl p-3 bg-spider-grey/20 border-2 border-spider-grey/50 group-hover:border-spider-red group-focus-visible:border-spider-red transition-all">
                <FrameThumbnail frame={frame} />
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {frame.slots} {frame.slots === 1 ? 'photo' : 'photos'}
                </div>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-200 group-hover:text-spider-red transition-colors">
                {frame.name}
              </h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
