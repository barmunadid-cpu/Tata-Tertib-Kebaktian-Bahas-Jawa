import React, { useState } from 'react';
import { SeatBlock, SimpleSeat, getRowLetter } from '../types/seating';
import { SimpleSeatButton } from './SimpleSeatButton';
import { Trash2, Plus, Minus, CheckSquare, RotateCcw, Edit2, Check } from 'lucide-react';

interface BlockSectionProps {
  block: SeatBlock;
  onToggleSeat: (blockId: string, seat: SimpleSeat) => void;
  onToggleRow: (blockId: string, rowIdx: number) => void;
  onFillBlock: (blockId: string) => void;
  onClearBlock: (blockId: string) => void;
  onUpdateBlockSize: (blockId: string, newRows: number, newCols: number) => void;
  onRenameBlock: (blockId: string, newName: string) => void;
  onDeleteBlock: (blockId: string) => void;
  canDelete: boolean;
}

export const BlockSection: React.FC<BlockSectionProps> = ({
  block,
  onToggleSeat,
  onToggleRow,
  onFillBlock,
  onClearBlock,
  onUpdateBlockSize,
  onRenameBlock,
  onDeleteBlock,
  canDelete,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(block.name);

  // Calculate stats for this block
  let occupiedCount = 0;
  const totalInBlock = block.rows * block.cols;
  for (const key in block.seats) {
    if (block.seats[key].isOccupied) {
      occupiedCount++;
    }
  }

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onRenameBlock(block.id, nameInput.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col shadow-xl">
      {/* Block Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
        {/* Left: Name and Quick Stats */}
        <div className="flex items-center gap-2">
          {isRenaming ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
                className="bg-slate-800 border border-amber-400 text-white font-bold text-sm px-2.5 py-1 rounded focus:outline-none"
              />
              <button
                onClick={handleSaveName}
                className="text-emerald-400 hover:text-emerald-300 p-1 rounded cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {block.name}
              </h2>
              <button
                onClick={() => {
                  setNameInput(block.name);
                  setIsRenaming(true);
                }}
                title="Ubah nama blok"
                className="text-slate-500 hover:text-amber-400 p-0.5 rounded transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 font-mono">
              <strong className="text-emerald-400">{occupiedCount}</strong>/{totalInBlock} terisi
            </span>
          </div>
        </div>

        {/* Right: Quick Dimension Adjusters (+/- Baris & Kolom) and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Baris Adjuster */}
          <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Baris:</span>
            <button
              onClick={() => onUpdateBlockSize(block.id, Math.max(1, block.rows - 1), block.cols)}
              disabled={block.rows <= 1}
              title="Kurang 1 Baris"
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-mono font-bold text-amber-300 w-5 text-center">
              {block.rows}
            </span>
            <button
              onClick={() => onUpdateBlockSize(block.id, Math.min(25, block.rows + 1), block.cols)}
              disabled={block.rows >= 25}
              title="Tambah 1 Baris"
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Kolom Adjuster */}
          <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Kolom:</span>
            <button
              onClick={() => onUpdateBlockSize(block.id, block.rows, Math.max(1, block.cols - 1))}
              disabled={block.cols <= 1}
              title="Kurang 1 Kolom"
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-mono font-bold text-amber-300 w-5 text-center">
              {block.cols}
            </span>
            <button
              onClick={() => onUpdateBlockSize(block.id, block.rows, Math.min(30, block.cols + 1))}
              disabled={block.cols >= 30}
              title="Tambah 1 Kolom"
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Block Actions: Fill, Clear, Delete */}
          <button
            onClick={() => onFillBlock(block.id)}
            title="Isi semua kursi di blok ini"
            className="p-1.5 text-xs text-slate-300 hover:text-emerald-400 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onClearBlock(block.id)}
            title="Kosongkan semua kursi di blok ini"
            className="p-1.5 text-xs text-slate-300 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {canDelete && (
            <button
              onClick={() => onDeleteBlock(block.id)}
              title="Hapus blok ini"
              className="p-1.5 text-xs text-slate-500 hover:text-rose-400 bg-slate-800/40 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Seating Grid Container (scrollable horizontally if many columns) */}
      <div className="overflow-x-auto pb-2 flex justify-center">
        <div className="inline-flex flex-col gap-1.5">
          {/* Column number headers */}
          <div className="flex items-center gap-1.5 pl-7 sm:pl-8">
            {Array.from({ length: block.cols }).map((_, c) => (
              <div
                key={`header-col-${c}`}
                className="w-8 sm:w-9 text-center text-[10px] font-mono text-slate-500 font-semibold"
              >
                {c + 1}
              </div>
            ))}
          </div>

          {/* Rows of Seats */}
          {Array.from({ length: block.rows }).map((_, r) => {
            const rowLetter = getRowLetter(r);
            return (
              <div key={`row-${r}`} className="flex items-center gap-1.5">
                {/* Row Letter Header Button (Click row letter to toggle entire row!) */}
                <button
                  onClick={() => onToggleRow(block.id, r)}
                  title={`Klik baris ${rowLetter} untuk ubah/isi semua`}
                  className="w-6 sm:w-7 h-8 sm:h-9 flex items-center justify-center text-xs font-mono font-bold text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 rounded transition-colors cursor-pointer"
                >
                  {rowLetter}
                </button>

                {/* Seat buttons in this row */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: block.cols }).map((_, c) => {
                    const key = `${r}-${c}`;
                    const seat = block.seats[key];
                    if (!seat) return null;
                    return (
                      <SimpleSeatButton
                        key={seat.id}
                        seat={seat}
                        onToggle={(st) => onToggleSeat(block.id, st)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-[11px] text-slate-400 text-center">
        Tips: Klik kursi untuk ganti status (Kosong ↔ Terisi), atau klik huruf baris (A, B, C) untuk ubah 1 baris.
      </div>
    </div>
  );
};
