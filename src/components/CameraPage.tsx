import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { FilterId, FrameConfig, TimerSeconds } from '../types';
import { getFilterCss } from '../utils/filterConfigs';
import { useCamera } from '../hooks/useCamera';
import { useCountdown } from '../hooks/useCountdown';
import { CameraView } from './CameraView';
import { ControlsPanel } from './ControlsPanel';
import { PhotoThumbnails } from './PhotoThumbnails';
import { PreviewModal } from './PreviewModal';

interface Props {
  frame: FrameConfig;
  onBack: () => void;
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export default function CameraPage({ frame, onBack }: Props) {
  const camera = useCamera();
  const { countdown, startTimer, cancelTimer } = useCountdown();

  const [timer, setTimer] = useState<TimerSeconds>(3);
  const [filter, setFilter] = useState<FilterId>('none');
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);
  // One entry per slot; null = not taken yet
  const [photos, setPhotos] = useState<(string | null)[]>(() => Array<string | null>(frame.slots).fill(null));
  const [showPreview, setShowPreview] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const takenCount = photos.filter(Boolean).length;
  const finalPhotos = useMemo(
    () => (photos.every(p => p !== null) ? (photos as string[]) : null),
    [photos]
  );

  // Each capture run gets an id; bumping it abandons a run that is still in progress
  const runRef = useRef(0);
  useEffect(() => {
    return () => {
      runRef.current++;
    };
  }, []);

  const waitCountdown = (seconds: number) =>
    new Promise<void>(resolve => startTimer(seconds, resolve));

  const resetCaptureState = () => {
    setIsCapturing(false);
    setCurrentPhotoIndex(null);
  };

  /** Takes photos for the given slots, one after another, each with its own countdown. */
  const captureSlots = async (slots: number[]) => {
    const runId = ++runRef.current;
    setCaptureError(null);
    setIsCapturing(true);

    for (let n = 0; n < slots.length; n++) {
      const slot = slots[n];
      setCurrentPhotoIndex(slot);
      await waitCountdown(timer);
      if (runRef.current !== runId) return;

      const shot = camera.captureFrame(filter);
      if (!shot) {
        setCaptureError('Could not capture a photo. Please try again.');
        resetCaptureState();
        return;
      }
      setPhotos(prev => prev.map((p, i) => (i === slot ? shot : p)));

      // Short pause so people can reset their pose before the next shot
      if (n < slots.length - 1) {
        await sleep(timer === 0 ? 2000 : 1000);
        if (runRef.current !== runId) return;
      }
    }

    resetCaptureState();
  };

  const handleStartCapture = () => {
    const missing = photos.flatMap((p, i) => (p === null ? [i] : []));
    captureSlots(missing);
  };

  const handleRetakeOne = (index: number) => captureSlots([index]);

  const handleCancel = () => {
    runRef.current++;
    cancelTimer();
    resetCaptureState();
  };

  const handleRetakeAll = () => {
    setPhotos(Array<string | null>(frame.slots).fill(null));
    setCaptureError(null);
  };

  return (
    <div className="flex-1 w-full px-4 py-6 space-y-4">
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={isCapturing}
          className="text-slate-400 hover:text-white disabled:opacity-40 font-medium flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Change frame
        </button>
        <p className="text-xs text-slate-400">
          {frame.name} · {takenCount}/{frame.slots} taken
        </p>
      </div>

      <div className="w-full max-w-3xl mx-auto flex flex-col md:flex-row gap-3 md:items-start">
        <div className="flex-1 min-w-0">
          <CameraView
            videoRef={camera.videoRef}
            isLoading={camera.isLoading}
            error={camera.error}
            isMirrored={camera.isMirrored}
            filterCss={getFilterCss(filter)}
            countdown={countdown}
            currentPhotoIndex={currentPhotoIndex}
            totalPhotos={frame.slots}
            onRetry={camera.startCamera}
          />
        </div>

        <PhotoThumbnails
          photos={photos}
          currentIndex={currentPhotoIndex}
          isCapturing={isCapturing}
          onRetake={handleRetakeOne}
        />
      </div>

      {captureError && <p className="text-center text-xs text-rose-400">{captureError}</p>}

      <ControlsPanel
        photoCount={frame.slots}
        takenCount={takenCount}
        timer={timer}
        setTimer={setTimer}
        filter={filter}
        setFilter={setFilter}
        devices={camera.devices}
        selectedDeviceId={camera.selectedDeviceId || camera.activeDeviceId}
        setSelectedDeviceId={camera.setSelectedDeviceId}
        isCapturing={isCapturing}
        disabled={camera.isLoading || !!camera.error || !camera.stream}
        onStartCapture={handleStartCapture}
        onCancel={handleCancel}
        onRetakeAll={handleRetakeAll}
        onDone={() => setShowPreview(true)}
      />

      {showPreview && finalPhotos && (
        <PreviewModal photos={finalPhotos} frame={frame} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}
