import React from 'react';
import { SeatCounters } from '../utils/storage';
import { UserCheck, Armchair, LayoutGrid, Users } from 'lucide-react';

interface CounterDashboardProps {
  counters: SeatCounters;
}

export const CounterDashboard: React.FC<CounterDashboardProps> = ({ counters }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-6">
      {/* Featured Prominent Hero Card: TOTAL HADIRIN (DIPERBESAR) */}
      <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden mb-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-widest">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              TOTAL HADIRIN
            </div>

            <div className="mt-2 sm:mt-3 flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl md:text-7xl font-extrabold font-mono tabular-nums text-emerald-300 tracking-tight drop-shadow-[0_2px_12px_rgba(16,185,129,0.3)]">
                {counters.grandTotalOccupied}
              </span>
              <span className="text-lg sm:text-2xl font-bold text-slate-300">
                Orang
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-400 mt-2 font-mono flex flex-wrap items-center gap-2">
              <span>{counters.occupiedBlockSeats} kursi di blok</span>
              <span className="text-slate-600">·</span>
              <span className="text-sky-400 font-semibold">{counters.totalExtraCount} orang tambahan non-blok</span>
            </div>
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shadow-lg shrink-0">
            <UserCheck className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
        </div>
      </div>

      {/* 3 Secondary Detail Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Kursi Blok Kosong */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-700/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Kursi Blok Kosong
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
              <Armchair className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-white">
              {counters.emptyBlockSeats}
            </span>
            <span className="text-xs font-medium text-slate-400">tersedia</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Kursi siap digunakan
          </div>
        </div>

        {/* Card 2: Hitung Tambahan (Non-Blok) */}
        <div className="bg-slate-900/90 border border-sky-500/30 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Tambahan Non-Blok
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-sky-300">
              {counters.totalExtraCount}
            </span>
            <span className="text-xs font-medium text-slate-400">Orang</span>
          </div>
          <div className="text-[11px] text-sky-400/80 mt-1">
            Di luar nomor denah
          </div>
        </div>

        {/* Card 3: Total Kursi di Blok */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Kapasitas Denah Blok
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-amber-300">
              {counters.totalBlockSeats}
            </span>
            <span className="text-xs font-medium text-slate-400">kursi</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total seluruh blok denah
          </div>
        </div>
      </div>

      {/* Ringkasan Status Kursi */}
      <div className="mt-3 bg-slate-900/70 border border-slate-800/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Terisi Blok: {counters.occupiedBlockSeats}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-600 inline-block" /> Kosong: {counters.emptyBlockSeats}
          </span>
          {counters.totalExtraCount > 0 && (
            <span className="flex items-center gap-1.5 font-medium text-sky-400">
              <span className="w-3 h-3 rounded bg-sky-500 inline-block" /> Tambahan Non-Blok: +{counters.totalExtraCount}
            </span>
          )}
        </div>
        <div className="text-xs font-mono text-slate-300">
          Total Hadir: <span className="text-emerald-400 font-bold text-sm">{counters.grandTotalOccupied} Orang</span>
        </div>
      </div>
    </div>
  );
};
