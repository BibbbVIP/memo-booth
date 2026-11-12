import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-spider-grey/40 bg-spider-dark/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-spider-white">
              MEMO BOOTH
            </h1>
          </div>
          <p className="text-[11px] text-slate-400">
            Capture the Real You!
          </p>
        </div>
        
        {/* Indikator "100% Private" sudah dihapus untuk tampilan yang lebih bersih */}
      </div>
    </header>
  );
};