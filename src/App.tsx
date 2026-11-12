import { useState } from 'react';
import { ViewState, FrameConfig } from './types';
import { FRAMES } from './utils/frameConfigs';
import { Header } from './components/Header';
import ChooseFrame from './components/ChooseFrame';
import CameraPage from './components/CameraPage';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedFrame, setSelectedFrame] = useState<FrameConfig | null>(null);

  return (
    <>
      <Header />

      {currentView === 'home' && (
        <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-4xl font-extrabold text-spider-white mb-4 tracking-tight">Memo Booth</h1>
          <p className="text-slate-400 mb-8 max-w-md">
            Capture the moment, cherish the magic. Turn a few poses into a photo strip that feels like you.
          </p>
          <button
            onClick={() => setCurrentView('choose-frame')}
            className="bg-spider-red hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold transition-transform active:scale-95 shadow-lg"
          >
            Start Photobooth →
          </button>
        </main>
      )}

      {currentView === 'choose-frame' && (
        <ChooseFrame
          frames={FRAMES}
          onSelect={frame => {
            setSelectedFrame(frame);
            setCurrentView('camera');
          }}
          onBack={() => setCurrentView('home')}
        />
      )}

      {currentView === 'camera' && selectedFrame && (
        <CameraPage frame={selectedFrame} onBack={() => setCurrentView('choose-frame')} />
      )}
    </>
  );
}
