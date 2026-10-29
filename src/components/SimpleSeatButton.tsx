import React from 'react';
import { SimpleSeat } from '../types/seating';
import { Check } from 'lucide-react';

interface SimpleSeatButtonProps {
  seat: SimpleSeat;
  onToggle: (seat: SimpleSeat) => void;
}

export const SimpleSeatButton: React.FC<SimpleSeatButtonProps> = ({ seat, onToggle }) => {
  const isOccupied = seat.isOccupied;

  return (
    <button
      onClick={() => onToggle(seat)}
      title={`Kursi ${seat.id}: ${isOccupied ? 'TERISI (DIPAKAI)' : 'KOSONG'} (Klik untuk ubah)`}
      aria-label={`Kursi ${seat.id} - ${isOccupied ? 'Terisi' : 'Kosong'}`}
      className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded flex flex-col items-center justify-between p-0.5 cursor-pointer select-none transition-all duration-150 active:scale-95 ${
        isOccupied
          ? 'shadow-sm shadow-emerald-950/50'
          : 'hover:-translate-y-0.5'
      }`}
    >
      {/* Chair Backrest */}
      <div
        className={`w-full h-3 rounded-t transition-colors border-t border-x flex items-center justify-center ${
          isOccupied
            ? 'bg-emerald-600 border-emerald-500'
            : 'bg-slate-800 border-slate-700 hover:border-slate-500'
        }`}
      >
        {isOccupied && <Check className="w-2.5 h-2.5 text-white" />}
      </div>

      {/* Cushion and Armrests */}
      <div className="w-full flex-1 flex items-center justify-between gap-0.5 mt-[1px]">
        {/* Left armrest */}
        <div
          className={`w-[2.5px] h-full rounded-sm ${
            isOccupied ? 'bg-emerald-700' : 'bg-slate-900'
          }`}
        />

        {/* Center cushion with seat number */}
        <div
          className={`flex-1 h-full rounded-sm flex items-center justify-center text-[10px] sm:text-[11px] font-mono font-medium leading-none tracking-tight transition-colors ${
            isOccupied
              ? 'bg-emerald-500 text-white font-bold'
              : 'bg-slate-850 bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {seat.colLabel}
        </div>

        {/* Right armrest */}
        <div
          className={`w-[2.5px] h-full rounded-sm ${
            isOccupied ? 'bg-emerald-700' : 'bg-slate-900'
          }`}
        />
      </div>
    </button>
  );
};
