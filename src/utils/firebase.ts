import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  get,
  Database,
  onDisconnect,
} from 'firebase/database';
import { SeatingLayout, SimpleSeat, generateBlockSeats, SeatBlock } from '../types/seating';

export const FIREBASE_DB_URL =
  'https://hitung-hadiri-tatatertib-default-rtdb.asia-southeast1.firebasedatabase.app';

// Minimal Firebase app initialization using databaseURL
const firebaseConfig = {
  databaseURL: FIREBASE_DB_URL,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db: Database = getDatabase(app);

export interface FirebaseConnectionStatus {
  isConnected: boolean;
  statusText: string;
  lastSyncAt: string | null;
}

/**
 * Listen for real-time changes to the seating layout from Firebase
 */
export function subscribeToFirebaseSeating(
  onData: (layout: SeatingLayout) => void,
  onStatusChange: (status: FirebaseConnectionStatus) => void,
  onInitialEmpty?: () => void
): () => void {
  // Listen to connection state
  const connectedRef = ref(db, '.info/connected');
  const unsubConn = onValue(connectedRef, (snap) => {
    const isConnected = snap.val() === true;
    onStatusChange({
      isConnected,
      statusText: isConnected ? 'Terhubung ke Firebase (Real-time)' : 'Menghubungkan ke Firebase...',
      lastSyncAt: new Date().toISOString(),
    });
  });

  // Listen to main seating layout node
  const seatingRef = ref(db, 'seating_layout');
  const unsubData = onValue(
    seatingRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val && Array.isArray(val.blocks)) {
          onData(val);
          onStatusChange({
            isConnected: true,
            statusText: 'Terhubung ke Firebase (Real-time)',
            lastSyncAt: new Date().toISOString(),
          });
        }
      } else {
        if (onInitialEmpty) {
          onInitialEmpty();
        }
      }
    },
    (err) => {
      console.error('Firebase seating listener error:', err);
      onStatusChange({
        isConnected: false,
        statusText: 'Gagal terhubung ke Firebase',
        lastSyncAt: null,
      });
    }
  );

  return () => {
    unsubConn();
    unsubData();
  };
}

/**
 * Fast granular update for a single seat click
 * This ensures two different users clicking different seats at the exact same moment
 * do not overwrite each other!
 */
export async function syncSeatToFirebase(
  blockIndex: number,
  seatKey: string,
  isOccupied: boolean,
  updatedAt: string
): Promise<void> {
  try {
    const updates: Record<string, unknown> = {};
    updates[`seating_layout/blocks/${blockIndex}/seats/${seatKey}/isOccupied`] = isOccupied;
    updates[`seating_layout/updatedAt`] = updatedAt;
    await update(ref(db), updates);
  } catch (err) {
    console.error('Error syncing seat to Firebase:', err);
  }
}

/**
 * Save entire layout to Firebase
 */
export async function syncFullLayoutToFirebase(layout: SeatingLayout): Promise<void> {
  try {
    const seatingRef = ref(db, 'seating_layout');
    await set(seatingRef, layout);

    // Also update a quick summary node that other systems or monitors can read easily
    let totalSeats = 0;
    let occupiedSeats = 0;
    for (const b of layout.blocks) {
      for (const k in b.seats) {
        totalSeats++;
        if (b.seats[k].isOccupied) occupiedSeats++;
      }
    }
    const extraTotal = (layout.extraCounters || []).reduce((acc, c) => acc + (c.count || 0), 0);

    const summaryRef = ref(db, 'rekap_kehadiran');
    await set(summaryRef, {
      totalKapasitasBlok: totalSeats,
      kursiBlokTerisi: occupiedSeats,
      kursiBlokKosong: totalSeats - occupiedSeats,
      tambahanNonBlok: extraTotal,
      grandTotalHadir: occupiedSeats + extraTotal,
      persenOkupansi: totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0,
      terakhirUpdate: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error syncing full layout to Firebase:', err);
  }
}

/**
 * Update extra counter (non-block) in Firebase
 */
export async function syncExtraCountersToFirebase(extraCounters: SeatingLayout['extraCounters']): Promise<void> {
  try {
    const extraRef = ref(db, 'seating_layout/extraCounters');
    await set(extraRef, extraCounters);
  } catch (err) {
    console.error('Error syncing extra counters to Firebase:', err);
  }
}

export interface RemoteDbConfig {
  blok: number;
  kolom: number;
  blokKursi?: Record<string, number>;
}

/**
 * Fetch existing config node already present in the user's Firebase RTDB
 */
export async function fetchRemoteConfig(): Promise<RemoteDbConfig | null> {
  try {
    const configRef = ref(db, 'config');
    const snap = await get(configRef);
    if (snap.exists()) {
      return snap.val() as RemoteDbConfig;
    }
  } catch (err) {
    console.error('Error fetching remote config:', err);
  }
  return null;
}

/**
 * Generates blocks matching the user's Firebase config (A, B, C, D, E, F, G, H...)
 */
export function buildLayoutFromFirebaseConfig(config: RemoteDbConfig): SeatingLayout {
  const blocks: SeatBlock[] = [];
  const colCount = config.kolom || 13;

  if (config.blokKursi) {
    const blockLetters = Object.keys(config.blokKursi).sort();
    for (const letter of blockLetters) {
      const totalSeats = config.blokKursi[letter];
      const rows = Math.ceil(totalSeats / colCount);
      const blockId = `blok-${letter.toLowerCase()}`;
      blocks.push({
        id: blockId,
        name: `Blok ${letter}`,
        rows,
        cols: colCount,
        seats: generateBlockSeats(blockId, rows, colCount),
      });
    }
  } else {
    // If no blokKursi mapping, generate `config.blok` blocks
    const numBlocks = config.blok || 4;
    for (let i = 0; i < numBlocks; i++) {
      const letter = String.fromCharCode(65 + i);
      const blockId = `blok-${letter.toLowerCase()}`;
      blocks.push({
        id: blockId,
        name: `Blok ${letter}`,
        rows: 8,
        cols: colCount,
        seats: generateBlockSeats(blockId, 8, colCount),
      });
    }
  }

  return {
    id: 'firebase-synced-layout',
    title: 'Denah Kursi Hadirin & Tata Tertib',
    stageText: 'PANGGUNG',
    updatedAt: new Date().toISOString(),
    extraCounters: [
      { id: 'extra-kursi', name: 'Kursi Tambahan / Lipat', count: 0 },
      { id: 'extra-berdiri', name: 'Tamu Berdiri / Non-Blok', count: 0 },
    ],
    blocks,
  };
}
