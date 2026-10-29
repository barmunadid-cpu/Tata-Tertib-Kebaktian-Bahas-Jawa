export type SeatState = 'kosong' | 'terisi';

export interface SimpleSeat {
  id: string; // e.g. "A1", "B4"
  row: number; // 0-indexed
  col: number; // 0-indexed
  rowLabel: string; // "A", "B", "C" or "1", "2"
  colLabel: string; // "1", "2", "3"
  isOccupied: boolean; // true = dipakai / terisi, false = kosong
}

export interface SeatBlock {
  id: string;
  name: string; // e.g. "Blok A", "Blok Tengah"
  rows: number;
  cols: number;
  seats: Record<string, SimpleSeat>; // key: `${row}-${col}`
}

export interface ExtraCounter {
  id: string;
  name: string;
  count: number;
}

export interface SeatingLayout {
  id: string;
  title: string;
  stageText: string;
  blocks: SeatBlock[];
  extraCounters: ExtraCounter[];
  updatedAt: string;
}

export function getRowLetter(index: number): string {
  let res = '';
  let n = index;
  while (n >= 0) {
    res = String.fromCharCode((n % 26) + 65) + res;
    n = Math.floor(n / 26) - 1;
  }
  return res;
}

export function generateBlockSeats(
  blockId: string,
  rows: number,
  cols: number,
  existingSeats?: Record<string, SimpleSeat>
): Record<string, SimpleSeat> {
  const seats: Record<string, SimpleSeat> = {};

  for (let r = 0; r < rows; r++) {
    const rowLabel = getRowLetter(r);
    for (let c = 0; c < cols; c++) {
      const colLabel = String(c + 1);
      const key = `${r}-${c}`;
      // Preserve existing occupied state if expanding or editing
      const wasOccupied = existingSeats?.[key]?.isOccupied ?? false;

      seats[key] = {
        id: `${rowLabel}${colLabel}`,
        row: r,
        col: c,
        rowLabel,
        colLabel,
        isOccupied: wasOccupied,
      };
    }
  }

  return seats;
}

export const INITIAL_DEFAULT_LAYOUT: SeatingLayout = {
  id: 'layout-utama',
  title: 'Denah Kursi Bioskop & Acara',
  stageText: 'PANGGUNG',
  updatedAt: new Date().toISOString(),
  extraCounters: [
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
  ],
  blocks: [
    {
      id: 'blok-kiri',
      name: 'Blok Kiri',
      rows: 5,
      cols: 4,
      seats: generateBlockSeats('blok-kiri', 5, 4),
    },
    {
      id: 'blok-tengah',
      name: 'Blok Tengah',
      rows: 5,
      cols: 8,
      seats: generateBlockSeats('blok-tengah', 5, 8),
    },
    {
      id: 'blok-kanan',
      name: 'Blok Kanan',
      rows: 5,
      cols: 4,
      seats: generateBlockSeats('blok-kanan', 5, 4),
    },
  ],
};

// Seed a few occupied seats as an initial demo
INITIAL_DEFAULT_LAYOUT.blocks[0].seats['0-0'].isOccupied = true;
INITIAL_DEFAULT_LAYOUT.blocks[0].seats['0-1'].isOccupied = true;
INITIAL_DEFAULT_LAYOUT.blocks[1].seats['2-3'].isOccupied = true;
INITIAL_DEFAULT_LAYOUT.blocks[1].seats['2-4'].isOccupied = true;
INITIAL_DEFAULT_LAYOUT.blocks[1].seats['3-3'].isOccupied = true;
INITIAL_DEFAULT_LAYOUT.blocks[1].seats['3-4'].isOccupied = true;
