import React from 'react';
import { RotateCcw, CheckSquare } from 'lucide-react';
import { FirebaseConnectionStatus } from '../utils/firebase';

interface HeaderProps {
  onClearAll: () => void;
  onFillAll: () => void;
  firebaseStatus: FirebaseConnectionStatus;
  lastSavedAt: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  onClearAll,
  onFillAll,
  firebaseStatus,
  lastSavedAt,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Real-time Auto-save status */}
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Penghitung Hadirin
              </h1>

              {/* Live Indicator: Hanya lampu/titik hijau saat live */}
              <div
                title={firebaseStatus.isConnected ? 'Live Real-time Terhubung' : 'Menghubungkan...'}
                className="flex items-center"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    firebaseStatus.isConnected
                      ? 'bg-emerald-400 animate-pulse ring-2 ring-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                      : 'bg-amber-400 animate-ping ring-2 ring-amber-500/40'
                  }`}
                />
              </div>
            </div>

            {lastSavedAt && (
              <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                Update: {new Date(lastSavedAt).toLocaleTimeString('id-ID')}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onFillAll}
            title="Tandai semua kursi sebagai terisi / dipakai"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Isi Semua</span>
          </button>

          <button
            onClick={onClearAll}
            title="Kosongkan semua kursi kembali ke 0"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-300 bg-slate-800/70 hover:bg-rose-950/40 rounded-lg border border-slate-700/80 hover:border-rose-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Kosongkan Semua</span>
          </button>
        </div>
      </div>
    </header>
  );
};
