import React, { useState } from 'react';
import { Sparkles, Edit2, Check } from 'lucide-react';

interface StageBannerProps {
  stageText: string;
  onUpdateStageText: (newText: string) => void;
}

export const StageBanner: React.FC<StageBannerProps> = ({ stageText, onUpdateStageText }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [textVal, setTextVal] = useState(stageText);

  const handleSave = () => {
    if (textVal.trim()) {
      onUpdateStageText(textVal.trim().toUpperCase());
    }
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <div className="relative flex flex-col items-center">
        {/* Cinema projector / stage spotlight ambient glow */}
        <div className="absolute -top-3 w-4/5 h-16 bg-gradient-to-b from-amber-400/20 via-amber-400/5 to-transparent blur-xl pointer-events-none rounded-full" />

        {/* Curved Screen / Stage Bar */}
        <div className="w-full relative h-12 flex items-center justify-center">
          <svg
            viewBox="0 0 1000 60"
            className="w-full h-full text-slate-800 drop-shadow-[0_2px_14px_rgba(245,158,11,0.35)]"
            preserveAspectRatio="none"
          >
            {/* Ambient fill */}
            <path
              d="M 20 45 Q 500 5 980 45 L 960 55 Q 500 18 40 55 Z"
              fill="currentColor"
              className="text-slate-800/90"
            />
            {/* Glowing luminous curved line */}
            <path
              d="M 20 45 Q 500 5 980 45"
              fill="none"
              stroke="url(#screenGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.2" />
                <stop offset="25%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#fef08a" stopOpacity="1" />
                <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Stage Wordmark Badge */}
          <div className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center">
            {isEditing ? (
              <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-400 rounded-full px-3 py-1 shadow-2xl">
                <input
                  type="text"
                  value={textVal}
                  onChange={(e) => setTextVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  autoFocus
                  className="bg-transparent text-amber-300 font-bold text-xs sm:text-sm tracking-widest text-center focus:outline-none uppercase w-44"
                />
                <button
                  onClick={handleSave}
                  className="text-emerald-400 hover:text-emerald-300 p-0.5 rounded cursor-pointer"
                  title="Simpan"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTextVal(stageText);
                  setIsEditing(true);
                }}
                title="Klik untuk ubah teks panggung"
                className="group flex items-center gap-2.5 px-6 py-2 bg-slate-900/95 border border-amber-400/50 rounded-full shadow-lg hover:border-amber-400 transition-all cursor-pointer backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-amber-300 uppercase">
                  {stageText || 'PANGGUNG'}
                </span>
                <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Subtitle guidance */}
        <div className="mt-1 text-[11px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-2">
          <span>▲ Bagian Depan / Arah Menghadap Panggung ▲</span>
        </div>
      </div>
    </div>
  );
};
