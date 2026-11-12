import React, { useRef } from 'react';
import { RotateCw, X } from 'lucide-react';
import { PlacedSticker } from '../types';

interface StickerLayerProps {
  stickers: PlacedSticker[];
  selectedUid: string | null;
  onSelect: (uid: string | null) => void;
  onChange: (uid: string, patch: Partial<PlacedSticker>) => void;
  onDelete: (uid: string) => void;
}

type DragState =
  | { mode: 'move'; uid: string; startPx: number; startPy: number; startX: number; startY: number }
  | { mode: 'transform'; uid: string; cx: number; cy: number; d0: number; a0: number; s0: number; r0: number };

const MIN_SIZE = 0.08;
const MAX_SIZE = 1;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Sits on top of the strip preview (same size as the image). Stickers are
 * positioned in percentages, so what you see here matches the exported canvas.
 */
export const StickerLayer: React.FC<StickerLayerProps> = ({
  stickers,
  selectedUid,
  onSelect,
  onChange,
  onDelete
}) => {
  const layerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const selected = stickers.find(s => s.uid === selectedUid) ?? null;

  const boxStyle = (s: PlacedSticker): React.CSSProperties => ({
    left: `${s.x * 100}%`,
    top: `${s.y * 100}%`,
    width: `${s.size * 100}%`,
    aspectRatio: `${s.aspect}`,
    transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`
  });

  const startMove = (e: React.PointerEvent<HTMLImageElement>, s: PlacedSticker) => {
    e.stopPropagation();
    onSelect(s.uid);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { mode: 'move', uid: s.uid, startPx: e.clientX, startPy: e.clientY, startX: s.x, startY: s.y };
  };

  // Corner handle: distance from the sticker centre scales it, angle rotates it
  const startTransform = (e: React.PointerEvent<HTMLDivElement>, s: PlacedSticker) => {
    e.stopPropagation();
    const layer = layerRef.current;
    if (!layer) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = layer.getBoundingClientRect();
    const cx = rect.left + s.x * rect.width;
    const cy = rect.top + s.y * rect.height;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    dragRef.current = {
      mode: 'transform',
      uid: s.uid,
      cx,
      cy,
      d0: Math.max(Math.hypot(dx, dy), 1),
      a0: Math.atan2(dy, dx),
      s0: s.size,
      r0: s.rotation
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    const layer = layerRef.current;
    if (!drag || !layer) return;
    const rect = layer.getBoundingClientRect();

    if (drag.mode === 'move') {
      onChange(drag.uid, {
        x: clamp(drag.startX + (e.clientX - drag.startPx) / rect.width, 0.02, 0.98),
        y: clamp(drag.startY + (e.clientY - drag.startPy) / rect.height, 0.02, 0.98)
      });
    } else {
      const dx = e.clientX - drag.cx;
      const dy = e.clientY - drag.cy;
      onChange(drag.uid, {
        size: clamp((drag.s0 * Math.hypot(dx, dy)) / drag.d0, MIN_SIZE, MAX_SIZE),
        rotation: drag.r0 + ((Math.atan2(dy, dx) - drag.a0) * 180) / Math.PI
      });
    }
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const dragHandlers = {
    onPointerMove: handlePointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag
  };

  return (
    <div ref={layerRef} className="absolute inset-0" onPointerDown={() => onSelect(null)}>
      {/* Stickers are clipped to the strip, exactly like the exported image */}
      <div className="absolute inset-0 overflow-hidden">
        {stickers.map(s => (
          <img
            key={s.uid}
            src={s.src}
            alt=""
            draggable={false}
            onPointerDown={e => startMove(e, s)}
            {...dragHandlers}
            className="absolute cursor-move select-none touch-none"
            style={boxStyle(s)}
          />
        ))}
      </div>

      {/* Selection box + handles live outside the clip so they stay reachable at the edges */}
      {selected && (
        <div
          className="absolute pointer-events-none border border-dashed border-white/80"
          style={boxStyle(selected)}
        >
          <button
            aria-label="Delete sticker"
            onPointerDown={e => e.stopPropagation()}
            onClick={() => onDelete(selected.uid)}
            className="pointer-events-auto absolute -top-3 -right-3 w-6 h-6 rounded-full bg-spider-red text-white flex items-center justify-center shadow"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div
            aria-label="Resize and rotate sticker"
            onPointerDown={e => startTransform(e, selected)}
            {...dragHandlers}
            className="pointer-events-auto absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-white text-spider-dark flex items-center justify-center shadow cursor-nwse-resize touch-none"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
};
