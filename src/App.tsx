import { useState } from 'react';
import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { ControlsPanel } from './components/ControlsPanel';
import { PreviewModal } from './components/PreviewModal';
import { useCamera } from './hooks/useCamera';
import { useCountdown } from './hooks/useCountdown';
import { GridCount, TimerSeconds } from './types';

export default function App() {
  const {
    videoRef, isLoading, error, devices, selectedDeviceId,
    setSelectedDeviceId, isMirrored, startCamera, captureFrame
  } = useCamera();

  const { countdown, startTimer } = useCountdown();

  const [gridCount, setGridCount] = useState<GridCount>(2);
  const [timer, setTimer] = useState<TimerSeconds>(3);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const handleStartCaptureSequence = () => {
    if (isCapturing || isLoading || error) return;
    setIsCapturing(true);
    setCapturedPhotos([]);

    const photos: string[] = [];
    let shotCount = 0;

    const takeNextShot = () => {
      setCurrentPhotoIndex(shotCount);
      startTimer(timer, () => {
        const frameData = captureFrame();
        if (frameData) photos.push(frameData);
        shotCount++;

        if (shotCount < gridCount) {
          setTimeout(takeNextShot, 600);
        } else {
          setCapturedPhotos(photos);
          setIsCapturing(false);
          setCurrentPhotoIndex(null);
          setShowPreview(true);
        }
      });
    };

    takeNextShot();
  };

  const handleRetake = () => {
    setShowPreview(false);
    setCapturedPhotos([]);
  };

  return (
    <div className="h-screen w-screen bg-spider-dark text-slate-100 flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 max-w-lg w-full mx-auto p-3 flex flex-col justify-center items-center gap-3 overflow-hidden">
        <CameraView
          videoRef={videoRef}
          isLoading={isLoading}
          error={error}
          isMirrored={isMirrored}
          countdown={countdown}
          currentPhotoIndex={currentPhotoIndex}
          totalPhotos={gridCount}
          onRetry={startCamera}
        />

        <ControlsPanel
          gridCount={gridCount}
          setGridCount={setGridCount}
          timer={timer}
          setTimer={setTimer}
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          setSelectedDeviceId={setSelectedDeviceId}
          isCapturing={isCapturing}
          disabled={isLoading || !!error}
          onStartCapture={handleStartCaptureSequence}
        />
      </main>

      <footer className="py-2 text-center text-[10px] text-slate-500 border-t border-spider-grey/20">
        Memo Booth by AL • Clean, Fast & Local Photobooth
      </footer>

      {showPreview && (
        <PreviewModal
          photosDataUrl={capturedPhotos}
          onClose={() => setShowPreview(false)}
          onRetake={handleRetake}
        />
      )}
    </div>
  );
}