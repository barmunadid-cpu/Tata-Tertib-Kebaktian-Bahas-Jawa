import React, { useState } from 'react';
import { X, Plus, Layers } from 'lucide-react';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (name: string, rows: number, cols: number) => void;
  existingBlockCount: number;
}

export const AddBlockModal: React.FC<AddBlockModalProps> = ({
  isOpen,
  onClose,
  onAddBlock,
  existingBlockCount,
}) => {
  const [name, setName] = useState(`Blok ${String.fromCharCode(65 + existingBlockCount)}`);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && rows > 0 && cols > 0) {
      onAddBlock(name.trim(), rows, cols);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Tambah Blok Kursi Baru</h3>
            <p className="text-xs text-slate-400">
              Tentukan nama, jumlah baris, dan jumlah kolom kursi
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nama Blok
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Blok VIP, Blok Samping, Sayap Kiri"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Jumlah Baris (A, B, C...)
              </label>
              <input
                type="number"
                min={1}
                max={25}
                value={rows}
                onChange={(e) => setRows(Math.max(1, Math.min(25, parseInt(e.target.value) || 1)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition-colors"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Maksimal 25 baris</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Jumlah Kolom (1, 2, 3...)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={cols}
                onChange={(e) => setCols(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition-colors"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Maksimal 30 kolom</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center justify-between">
            <span>Total kursi baru:</span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {rows * cols} kursi
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Blok</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
