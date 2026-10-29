import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SeatingLayout, SeatBlock, SimpleSeat, generateBlockSeats, INITIAL_DEFAULT_LAYOUT } from './types/seating';
import { loadLayout, saveLayout, calculateCounters } from './utils/storage';
import { Header } from './components/Header';
import { CounterDashboard } from './components/CounterDashboard';
import { StageBanner } from './components/StageBanner';
import { BlockSection } from './components/BlockSection';
import { AddBlockModal } from './components/AddBlockModal';
import { ExtraCounterSection } from './components/ExtraCounterSection';
import { RotateCcw, Sparkles, Plus, Minus, Layers } from 'lucide-react';
import {
  subscribeToFirebaseSeating,
  syncSeatToFirebase,
  syncFullLayoutToFirebase,
  syncExtraCountersToFirebase,
  fetchRemoteConfig,
  buildLayoutFromFirebaseConfig,
  FirebaseConnectionStatus,
  RemoteDbConfig,
} from './utils/firebase';

export default function App() {
  const [layout, setLayout] = useState<SeatingLayout>(() => loadLayout());
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<FirebaseConnectionStatus>({
    isConnected: false,
    statusText: 'Menghubungkan ke Firebase...',
    lastSyncAt: null,
  });
  const [remoteConfig, setRemoteConfig] = useState<RemoteDbConfig | null>(null);

  // Compute live counters whenever layout updates
  const counters = useMemo(() => calculateCounters(layout), [layout]);

  // Real-time automatic persistence to LocalStorage and BroadcastChannel
  const broadcastChannel = useMemo(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      return new BroadcastChannel('kursi_panggung_realtime_sync');
    }
    return null;
  }, []);

  const persistChanges = useCallback(
    (updatedLayout: SeatingLayout, syncToCloud = true) => {
      setLayout(updatedLayout);
      saveLayout(updatedLayout);
      const now = new Date().toISOString();
      setLastSavedAt(now);

      // Broadcast live update to other tabs/windows in real-time
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'LAYOUT_UPDATED', layout: updatedLayout, timestamp: now });
      }

      // Sync entire layout to Firebase Realtime Database
      if (syncToCloud) {
        syncFullLayoutToFirebase(updatedLayout);
      }
    },
    [broadcastChannel]
  );

  // 1. Subscribe to Firebase Realtime Database (WebSocket listener)
  useEffect(() => {
    // Check if user has remote config (e.g. 8 blocks config)
    fetchRemoteConfig().then((cfg) => {
      if (cfg) {
        setRemoteConfig(cfg);
      }
    });

    const unsubscribe = subscribeToFirebaseSeating(
      (remoteLayout) => {
        // When received from Firebase, update local state
        setLayout(remoteLayout);
        saveLayout(remoteLayout);
        setLastSavedAt(remoteLayout.updatedAt || new Date().toISOString());
      },
      (status) => {
        setFirebaseStatus(status);
      },
      () => {
        // If Firebase database has no seating_layout yet, upload current layout so all clients sync immediately
        syncFullLayoutToFirebase(layout);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Listen for real-time updates from other open tabs/windows
  useEffect(() => {
    if (!broadcastChannel) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'LAYOUT_UPDATED' && event.data.layout) {
        setLayout(event.data.layout);
        setLastSavedAt(event.data.timestamp || new Date().toISOString());
      }
    };

    broadcastChannel.addEventListener('message', handleMessage);

    // Also fallback to storage event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'penghitung_kursi_data_v2' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setLayout(parsed);
          setLastSavedAt(new Date().toISOString());
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      broadcastChannel.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [broadcastChannel]);

  // Initial load save indicator
  useEffect(() => {
    setLastSavedAt(layout.updatedAt || new Date().toISOString());
  }, [layout.updatedAt]);

  // Toggle single seat: Kosong <-> Terisi (Dipakai)
  // Fast granular update sent directly to Firebase!
  const handleToggleSeat = useCallback(
    (blockId: string, seat: SimpleSeat) => {
      const now = new Date().toISOString();
      let blockIndex = -1;
      let newOccupiedState = false;

      const updatedBlocks = layout.blocks.map((block, idx) => {
        if (block.id !== blockId) return block;
        blockIndex = idx;
        const key = `${seat.row}-${seat.col}`;
        const existing = block.seats[key];
        if (!existing) return block;

        newOccupiedState = !existing.isOccupied;
        const updatedSeat: SimpleSeat = {
          ...existing,
          isOccupied: newOccupiedState,
        };

        return {
          ...block,
          seats: {
            ...block.seats,
            [key]: updatedSeat,
          },
        };
      });

      const updatedLayout: SeatingLayout = {
        ...layout,
        blocks: updatedBlocks,
        updatedAt: now,
      };

      // Optimistic update locally
      setLayout(updatedLayout);
      saveLayout(updatedLayout);
      setLastSavedAt(now);

      // Fast granular sync to Firebase so everyone knows instantly
      if (blockIndex >= 0) {
        syncSeatToFirebase(blockIndex, `${seat.row}-${seat.col}`, newOccupiedState, now);
      } else {
        syncFullLayoutToFirebase(updatedLayout);
      }

      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'LAYOUT_UPDATED', layout: updatedLayout, timestamp: now });
      }
    },
    [layout, broadcastChannel]
  );

  // Toggle whole row (if any are empty, fill all; if all are filled, empty row)
  const handleToggleRow = useCallback(
    (blockId: string, rowIdx: number) => {
      const updatedBlocks = layout.blocks.map((block) => {
        if (block.id !== blockId) return block;

        // Check current row status
        let allOccupied = true;
        for (let c = 0; c < block.cols; c++) {
          const key = `${rowIdx}-${c}`;
          if (!block.seats[key]?.isOccupied) {
            allOccupied = false;
            break;
          }
        }

        const newStatus = !allOccupied;
        const updatedSeats = { ...block.seats };

        for (let c = 0; c < block.cols; c++) {
          const key = `${rowIdx}-${c}`;
          if (updatedSeats[key]) {
            updatedSeats[key] = {
              ...updatedSeats[key],
              isOccupied: newStatus,
            };
          }
        }

        return {
          ...block,
          seats: updatedSeats,
        };
      });

      persistChanges({
        ...layout,
        blocks: updatedBlocks,
      });
    },
    [layout, persistChanges]
  );

  // Fill all seats in a single block
  const handleFillBlock = useCallback(
    (blockId: string) => {
      const updatedBlocks = layout.blocks.map((block) => {
        if (block.id !== blockId) return block;
        const updatedSeats = { ...block.seats };
        for (const key in updatedSeats) {
          updatedSeats[key] = { ...updatedSeats[key], isOccupied: true };
        }
        return { ...block, seats: updatedSeats };
      });

      persistChanges({ ...layout, blocks: updatedBlocks });
    },
    [layout, persistChanges]
  );

  // Clear all seats in a single block
  const handleClearBlock = useCallback(
    (blockId: string) => {
      const updatedBlocks = layout.blocks.map((block) => {
        if (block.id !== blockId) return block;
        const updatedSeats = { ...block.seats };
        for (const key in updatedSeats) {
          updatedSeats[key] = { ...updatedSeats[key], isOccupied: false };
        }
        return { ...block, seats: updatedSeats };
      });

      persistChanges({ ...layout, blocks: updatedBlocks });
    },
    [layout, persistChanges]
  );

  // Dynamic row and column size updates for a block
  const handleUpdateBlockSize = useCallback(
    (blockId: string, newRows: number, newCols: number) => {
      const updatedBlocks = layout.blocks.map((block) => {
        if (block.id !== blockId) return block;
        const newSeats = generateBlockSeats(block.id, newRows, newCols, block.seats);
        return {
          ...block,
          rows: newRows,
          cols: newCols,
          seats: newSeats,
        };
      });

      persistChanges({ ...layout, blocks: updatedBlocks });
    },
    [layout, persistChanges]
  );

  // Rename a block
  const handleRenameBlock = useCallback(
    (blockId: string, newName: string) => {
      const updatedBlocks = layout.blocks.map((b) =>
        b.id === blockId ? { ...b, name: newName } : b
      );
      persistChanges({ ...layout, blocks: updatedBlocks });
    },
    [layout, persistChanges]
  );

  // Delete a block
  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      if (layout.blocks.length <= 1) return;
      const updatedBlocks = layout.blocks.filter((b) => b.id !== blockId);
      persistChanges({ ...layout, blocks: updatedBlocks });
    },
    [layout, persistChanges]
  );

  // Add new block with custom params
  const handleAddBlock = useCallback(
    (name: string, rows: number, cols: number) => {
      const newBlockId = `blok-${Date.now().toString(36)}`;
      const newBlock: SeatBlock = {
        id: newBlockId,
        name,
        rows,
        cols,
        seats: generateBlockSeats(newBlockId, rows, cols),
      };

      persistChanges({
        ...layout,
        blocks: [...layout.blocks, newBlock],
      });
    },
    [layout, persistChanges]
  );

  // Quick 1-click add block
  const handleQuickAddBlock = useCallback(() => {
    const nextChar = String.fromCharCode(65 + layout.blocks.length);
    const newName = `Blok ${nextChar}`;
    handleAddBlock(newName, 5, 6);
  }, [layout.blocks.length, handleAddBlock]);

  // Extra non-block counter handlers
  const handleUpdateExtraCount = useCallback(
    (id: string, newCount: number) => {
      const updatedCounters = (layout.extraCounters || []).map((item) =>
        item.id === id ? { ...item, count: newCount } : item
      );
      persistChanges({
        ...layout,
        extraCounters: updatedCounters,
      });
    },
    [layout, persistChanges]
  );

  const handleAddExtraCategory = useCallback(
    (name: string) => {
      const newCategory = {
        id: `extra-${Date.now().toString(36)}`,
        name,
        count: 0,
      };
      persistChanges({
        ...layout,
        extraCounters: [...(layout.extraCounters || []), newCategory],
      });
    },
    [layout, persistChanges]
  );

  const handleRenameExtraCategory = useCallback(
    (id: string, newName: string) => {
      const updatedCounters = (layout.extraCounters || []).map((item) =>
        item.id === id ? { ...item, name: newName } : item
      );
      persistChanges({
        ...layout,
        extraCounters: updatedCounters,
      });
    },
    [layout, persistChanges]
  );

  const handleDeleteExtraCategory = useCallback(
    (id: string) => {
      const updatedCounters = (layout.extraCounters || []).filter((item) => item.id !== id);
      persistChanges({
        ...layout,
        extraCounters: updatedCounters,
      });
    },
    [layout, persistChanges]
  );

  // Clear all seats across all blocks
  const handleClearAll = useCallback(() => {
    const updatedBlocks = layout.blocks.map((block) => {
      const updatedSeats = { ...block.seats };
      for (const key in updatedSeats) {
        updatedSeats[key] = { ...updatedSeats[key], isOccupied: false };
      }
      return { ...block, seats: updatedSeats };
    });

    // Also reset extra counters
    const resetExtra = (layout.extraCounters || []).map((item) => ({ ...item, count: 0 }));

    persistChanges({ ...layout, blocks: updatedBlocks, extraCounters: resetExtra });
  }, [layout, persistChanges]);

  // Fill all seats across all blocks
  const handleFillAll = useCallback(() => {
    const updatedBlocks = layout.blocks.map((block) => {
      const updatedSeats = { ...block.seats };
      for (const key in updatedSeats) {
        updatedSeats[key] = { ...updatedSeats[key], isOccupied: true };
      }
      return { ...block, seats: updatedSeats };
    });

    persistChanges({ ...layout, blocks: updatedBlocks });
  }, [layout, persistChanges]);

  // Update stage banner text
  const handleUpdateStageText = useCallback(
    (newText: string) => {
      persistChanges({
        ...layout,
        stageText: newText,
      });
    },
    [layout, persistChanges]
  );

  // Reset to default cinema preset
  const handleResetToDefaultPreset = () => {
    if (window.confirm('Kembalikan denah ke susunan bioskop standar awal?')) {
      persistChanges(INITIAL_DEFAULT_LAYOUT, true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header with live Firebase indicator */}
      <Header
        onClearAll={handleClearAll}
        onFillAll={handleFillAll}
        firebaseStatus={firebaseStatus}
        lastSavedAt={lastSavedAt}
      />

      {/* Main Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col">
        {/* Real-time Counter Dashboard (Occupied vs Empty & Extra) */}
        <CounterDashboard counters={counters} />

        {/* Hitung Tambahan (Non-Blok) Counter Section */}
        <ExtraCounterSection
          extraCounters={layout.extraCounters || []}
          onUpdateCount={handleUpdateExtraCount}
          onAddCategory={handleAddExtraCategory}
          onRenameCategory={handleRenameExtraCategory}
          onDeleteCategory={handleDeleteExtraCategory}
          totalExtraCount={counters.totalExtraCount}
        />

        {/* Visual Front Stage with "PANGGUNG" */}
        <StageBanner
          stageText={layout.stageText}
          onUpdateStageText={handleUpdateStageText}
        />

        {/* Blocks Display */}
        <div className="w-full flex-1 space-y-4 my-4">
          {/* Block Control Bar */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-bold text-white">
                Denah Kursi ({layout.blocks.length} Blok)
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400">
                Total {counters.totalBlockSeats} kursi di denah
              </span>
            </div>

            {/* Direct Stepper & Add Buttons to change number of blocks */}
            <div className="flex items-center gap-2">
              {/* Stepper: [-] Jumlah Blok: X [+] */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400 text-xs">Jumlah Blok:</span>
                <button
                  onClick={() => {
                    if (layout.blocks.length > 1) {
                      handleDeleteBlock(layout.blocks[layout.blocks.length - 1].id);
                    }
                  }}
                  disabled={layout.blocks.length <= 1}
                  title="Kurangi 1 blok terakhir"
                  className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold text-amber-300 w-6 text-center text-sm">
                  {layout.blocks.length}
                </span>
                <button
                  onClick={handleQuickAddBlock}
                  title="Tambah 1 blok cepat"
                  className="w-6 h-6 flex items-center justify-center rounded bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Button Tambah Blok Kustom */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Blok Baru</span>
              </button>
            </div>
          </div>

          {layout.blocks.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
              <p className="text-slate-400 mb-4">Belum ada blok kursi.</p>
              <button
                onClick={handleQuickAddBlock}
                className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-sm"
              >
                Tambah Blok Pertama
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                layout.blocks.length === 1
                  ? 'grid-cols-1 max-w-3xl mx-auto'
                  : layout.blocks.length === 2
                  ? 'grid-cols-1 lg:grid-cols-2'
                  : 'grid-cols-1 xl:grid-cols-3'
              }`}
            >
              {layout.blocks.map((block) => (
                <BlockSection
                  key={block.id}
                  block={block}
                  onToggleSeat={handleToggleSeat}
                  onToggleRow={handleToggleRow}
                  onFillBlock={handleFillBlock}
                  onClearBlock={handleClearBlock}
                  onUpdateBlockSize={handleUpdateBlockSize}
                  onRenameBlock={handleRenameBlock}
                  onDeleteBlock={handleDeleteBlock}
                  canDelete={layout.blocks.length > 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Venue Reset Utility Footer */}
        <div className="mt-8 border-t border-slate-900 pt-6 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Semua perubahan tersimpan otomatis di perangkat Anda secara real-time.</span>
          </div>
          <button
            onClick={handleResetToDefaultPreset}
            className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Denah</span>
          </button>
        </div>
      </main>

      {/* Modal to add a new block */}
      <AddBlockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBlock={handleAddBlock}
        existingBlockCount={layout.blocks.length}
      />
    </div>
  );
}
