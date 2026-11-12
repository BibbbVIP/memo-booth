import React from 'react';
import { Camera, Timer, Video, Sparkles, RotateCcw, Check } from 'lucide-react';
import { FilterId, TimerSeconds } from '../types';
import { FILTERS } from '../utils/filterConfigs';

interface ControlsPanelProps {
  photoCount: number;
  takenCount: number;
  timer: TimerSeconds;
  setTimer: (timer: TimerSeconds) => void;
  filter: FilterId;
  setFilter: (filter: FilterId) => void;
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
  isCapturing: boolean;
  disabled: boolean;
  onStartCapture: () => void;
  onCancel: () => void;
  onRetakeAll: () => void;
  onDone: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  photoCount,
  takenCount,
  timer,
  setTimer,
  filter,
  setFilter,
  devices,
  selectedDeviceId,
  setSelectedDeviceId,
  isCapturing,
  disabled,
  onStartCapture,
  onCancel,
  onRetakeAll,
  onDone
}) => {
  const allTaken = takenCount === photoCount;
  const filterLocked = isCapturing || takenCount > 0; // keep one consistent look across the strip

  const captureLabel =
    takenCount === 0
      ? `Take ${photoCount} ${photoCount === 1 ? 'Photo' : 'Photos'}`
      : `Take Remaining ${photoCount - takenCount}`;

  return (
    <div className="w-full max-w-xl mx-auto bg-spider-grey/20 border border-spider-grey/50 rounded-2xl p-4 space-y-4 shadow-md">
      {/* Timer Options (Off, 3s, 5s) */}
      <div className="bg-spider-dark/60 border border-spider-grey/60 rounded-xl p-3 space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Timer className="w-3 h-3 text-spider-red" />
          Timer Delay
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {([0, 3, 5] as TimerSeconds[]).map(t => (
            <button
              key={t}
              onClick={() => setTimer(t)}
              disabled={isCapturing}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                timer === t
                  ? 'bg-spider-red text-white shadow'
                  : 'bg-spider-grey/40 text-slate-300 hover:bg-spider-grey hover:text-white'
              }`}
            >
              {t === 0 ? 'Off' : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Options (applied live and baked into each photo) */}
      <div className="bg-spider-dark/60 border border-spider-grey/60 rounded-xl p-3 space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-spider-red" />
          Filter
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              disabled={filterLocked}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                filter === f.id
                  ? 'bg-spider-red text-white shadow'
                  : 'bg-spider-grey/40 text-slate-300 hover:bg-spider-grey hover:text-white'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
        {takenCount > 0 && !isCapturing && (
          <p className="text-[11px] text-slate-500">Retake all photos to change the filter.</p>
        )}
      </div>

      {/* Device Selector (only when there is more than one camera) */}
      {devices.length > 1 && (
        <div className="bg-spider-dark/60 border border-spider-grey/60 rounded-xl p-3 flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 shrink-0">
            <Video className="w-3 h-3 text-spider-red" />
            Camera Device
          </span>
          <select
            value={selectedDeviceId}
            onChange={e => setSelectedDeviceId(e.target.value)}
            disabled={isCapturing}
            className="min-w-0 bg-spider-grey/70 border border-spider-grey text-xs text-slate-200 rounded-lg px-2 py-1 outline-none focus:border-spider-red"
          >
            {devices.map((d, i) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main actions */}
      {allTaken && !isCapturing ? (
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onRetakeAll}
            className="py-3.5 rounded-xl bg-spider-grey/40 hover:bg-spider-grey text-slate-200 hover:text-white font-bold text-sm border border-spider-grey/50 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retake All
          </button>
          <button
            onClick={onDone}
            className="py-3.5 rounded-xl bg-spider-red hover:bg-red-600 text-white font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Done
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={onStartCapture}
            disabled={disabled || isCapturing}
            className="w-full py-3.5 rounded-xl bg-spider-red hover:bg-red-600 text-white font-bold text-sm tracking-wide shadow-md active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 uppercase"
          >
            <Camera className="w-4 h-4" />
            {isCapturing ? 'Capturing...' : captureLabel}
          </button>

          {isCapturing && (
            <button
              onClick={onCancel}
              className="w-full py-2 rounded-xl bg-spider-grey/40 hover:bg-spider-grey text-slate-300 hover:text-white text-xs font-semibold transition-all border border-spider-grey/50"
            >
              Cancel
            </button>
          )}

          {!isCapturing && takenCount > 0 && (
            <button
              onClick={onRetakeAll}
              className="w-full py-2 rounded-xl bg-spider-grey/40 hover:bg-spider-grey text-slate-300 hover:text-white text-xs font-semibold transition-all border border-spider-grey/50"
            >
              Clear & Start Over
            </button>
          )}
        </>
      )}
    </div>
  );
};
