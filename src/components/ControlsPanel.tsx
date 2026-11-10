import React from 'react';
import { Camera, Timer, LayoutGrid, Video } from 'lucide-react';
import { GridCount, TimerSeconds } from '../types';

interface ControlsPanelProps {
  gridCount: GridCount;
  setGridCount: (count: GridCount) => void;
  timer: TimerSeconds;
  setTimer: (timer: TimerSeconds) => void;
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
  isCapturing: boolean;
  disabled: boolean;
  onStartCapture: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  gridCount,
  setGridCount,
  timer,
  setTimer,
  devices,
  selectedDeviceId,
  setSelectedDeviceId,
  isCapturing,
  disabled,
  onStartCapture
}) => {
  return (
    <div className="w-full max-w-xl mx-auto bg-spider-grey/20 border border-spider-grey/50 rounded-2xl p-4 space-y-4 shadow-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Strip Grid Options (1, 2, 3 photos) */}
        <div className="bg-spider-dark/60 border border-spider-grey/60 rounded-xl p-3 space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <LayoutGrid className="w-3 h-3 text-spider-red" />
            Photo Strip
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {([1, 2, 3] as GridCount[]).map(count => (
              <button
                key={count}
                onClick={() => setGridCount(count)}
                disabled={isCapturing}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  gridCount === count
                    ? 'bg-spider-red text-white shadow'
                    : 'bg-spider-grey/40 text-slate-300 hover:bg-spider-grey hover:text-white'
                }`}
              >
                {count} {count === 1 ? 'Shot' : 'Shots'}
              </button>
            ))}
          </div>
        </div>

        {/* Timer Options (0, 3, 5s) */}
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
      </div>

      {/* Device Selector (jika kamera lebih dari satu) */}
      {devices.length > 1 && (
        <div className="bg-spider-dark/60 border border-spider-grey/60 rounded-xl p-3 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Video className="w-3 h-3 text-spider-red" />
            Camera Device
          </span>
          <select
            value={selectedDeviceId}
            onChange={e => setSelectedDeviceId(e.target.value)}
            disabled={isCapturing}
            className="bg-spider-grey/70 border border-spider-grey text-xs text-slate-200 rounded-lg px-2 py-1 outline-none focus:border-spider-red"
          >
            {devices.map((d, i) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Capture Button */}
      <button
        onClick={onStartCapture}
        disabled={disabled || isCapturing}
        className="w-full py-3.5 rounded-xl bg-spider-red hover:bg-red-600 text-white font-bold text-sm tracking-wide shadow-md active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 uppercase"
      >
        <Camera className="w-4 h-4" />
        {isCapturing ? 'Capturing Sequence...' : `Take ${gridCount} ${gridCount === 1 ? 'Photo' : 'Photos'}`}
      </button>
    </div>
  );
};