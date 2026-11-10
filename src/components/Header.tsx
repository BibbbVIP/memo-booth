import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-spider-grey/40 bg-spider-dark/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-spider-white">
              MEMO BOOTH
            </h1>
            <span className="text-xs font-semibold text-spider-red tracking-wider uppercase">
              by AL
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Capture the Real You!
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-spider-grey/50 border border-spider-grey px-3 py-1.5 rounded-full text-xs text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-spider-red" />
          <span className="hidden sm:inline">100% Private • Local Processing</span>
          <span className="sm:hidden">Local</span>
        </div>
      </div>
    </header>
  );
};