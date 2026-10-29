import React, { useState } from 'react';
import { ExtraCounter } from '../types/seating';
import { Plus, Minus, RotateCcw, Trash2, UserPlus, Users, Edit2, Check } from 'lucide-react';

interface ExtraCounterSectionProps {
  extraCounters: ExtraCounter[];
  onUpdateCount: (id: string, newCount: number) => void;
  onAddCategory: (name: string) => void;
  onRenameCategory: (id: string, newName: string) => void;
  onDeleteCategory: (id: string) => void;
  totalExtraCount: number;
}

export const ExtraCounterSection: React.FC<ExtraCounterSectionProps> = ({
  extraCounters,
  onUpdateCount,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  totalExtraCount,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingNew(false);
    }
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      onRenameCategory(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mb-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Hitung Tambahan (Di Luar Blok)
              </h2>
              <p className="text-xs text-slate-400">
                Untuk menghitung Area diluar Blok
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              Total Tambahan: <strong className="text-sky-400 text-sm">{totalExtraCount}</strong> Orang
            </span>
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kategori</span>
            </button>
          </div>
        </div>

        {/* New category input row */}
        {isAddingNew && (
          <form onSubmit={handleCreateCategory} className="mb-4 p-3 bg-slate-950 rounded-xl border border-sky-500/40 flex items-center gap-2">
            <input
              type="text"
              placeholder="Contoh: Kursi Plastik Lorong, Tamu VIP Khusus, Kru"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              autoFocus
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-sky-400 text-slate-950 text-xs font-bold rounded-lg hover:bg-sky-300 cursor-pointer"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700 cursor-pointer"
            >
              Batal
            </button>
          </form>
        )}

        {/* Counter cards list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {extraCounters.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              {/* Category Name & Rename */}
              <div className="flex items-center justify-between gap-2 mb-2">
                {editingId === item.id ? (
                  <div className="flex items-center gap-1 w-full">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(item.id)}
                      autoFocus
                      className="flex-1 bg-slate-800 border border-sky-400 text-white text-xs px-2 py-1 rounded focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveRename(item.id)}
                      className="text-emerald-400 hover:text-emerald-300 p-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {item.name}
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditName(item.name);
                      }}
                      title="Ubah nama"
                      className="text-slate-500 hover:text-sky-400 p-0.5 rounded cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {extraCounters.length > 1 && (
                  <button
                    onClick={() => onDeleteCategory(item.id)}
                    title="Hapus kategori"
                    className="text-slate-600 hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Number and Tally Controls */}
              <div className="flex items-center justify-between mt-1">
                {/* Big number counter */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-sky-400">
                    {item.count}
                  </span>
                  <span className="text-[11px] text-slate-500">terhitung</span>
                </div>

                {/* Quick Buttons: -1, +1, +5, Reset */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateCount(item.id, Math.max(0, item.count - 1))}
                    disabled={item.count <= 0}
                    title="Kurang 1"
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 cursor-pointer active:scale-95 transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onUpdateCount(item.id, item.count + 1)}
                    title="Tambah 1"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 cursor-pointer active:scale-95 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onUpdateCount(item.id, item.count + 5)}
                    title="Tambah 5 cepat"
                    className="px-1.5 h-7 text-[11px] font-mono font-bold flex items-center justify-center rounded-lg bg-slate-800 text-sky-400 hover:bg-slate-700 cursor-pointer active:scale-95 transition-all"
                  >
                    +5
                  </button>

                  <button
                    onClick={() => onUpdateCount(item.id, 0)}
                    disabled={item.count === 0}
                    title="Reset ke 0"
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/60 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 disabled:opacity-20 cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
