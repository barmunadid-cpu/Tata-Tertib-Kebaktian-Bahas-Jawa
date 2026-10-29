import { SeatingLayout, INITIAL_DEFAULT_LAYOUT } from '../types/seating';

const STORAGE_KEY = 'penghitung_kursi_data_v2';

export function loadLayout(): SeatingLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
        // Ensure extraCounters exists for backward compatibility
        if (!parsed.extraCounters || !Array.isArray(parsed.extraCounters)) {
          parsed.extraCounters = [
            {
              id: 'extra-kursi',
              name: 'Kursi Tambahan / Lipat',
              count: 0,
            },
            {
              id: 'extra-berdiri',
              name: 'Tamu Berdiri / Non-Blok',
              count: 0,
            },
          ];
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Gagal memuat layout kursi dari localStorage', err);
  }
  return INITIAL_DEFAULT_LAYOUT;
}

export function saveLayout(layout: SeatingLayout): void {
  try {
    const dataToSave = {
      ...layout,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.error('Gagal menyimpan layout kursi ke localStorage', err);
  }
}

export interface SeatCounters {
  totalBlockSeats: number;
  occupiedBlockSeats: number; // Kursi Terisi di Blok
  emptyBlockSeats: number;    // Kursi Kosong di Blok
  totalExtraCount: number;    // Total Tambahan di luar blok
  grandTotalOccupied: number; // Terisi di Blok + Tambahan
  percentOccupied: number;
}

export function calculateCounters(layout: SeatingLayout): SeatCounters {
  let totalBlockSeats = 0;
  let occupiedBlockSeats = 0;

  for (const block of layout.blocks) {
    for (const key in block.seats) {
      totalBlockSeats++;
      if (block.seats[key].isOccupied) {
        occupiedBlockSeats++;
      }
    }
  }

  const emptyBlockSeats = Math.max(0, totalBlockSeats - occupiedBlockSeats);

  let totalExtraCount = 0;
  if (layout.extraCounters && Array.isArray(layout.extraCounters)) {
    for (const item of layout.extraCounters) {
      totalExtraCount += item.count || 0;
    }
  }

  const grandTotalOccupied = occupiedBlockSeats + totalExtraCount;
  const percentOccupied =
    totalBlockSeats > 0 ? Math.round((occupiedBlockSeats / totalBlockSeats) * 100) : 0;

  return {
    totalBlockSeats,
    occupiedBlockSeats,
    emptyBlockSeats,
    totalExtraCount,
    grandTotalOccupied,
    percentOccupied,
  };
}
