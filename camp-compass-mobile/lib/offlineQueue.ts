/**
 * offlineQueue.ts — Offline-first sync engine
 *
 * How it works:
 * 1. Every mutating API call (POST/PUT/DELETE) is intercepted.
 * 2. If the device is OFFLINE → action is saved to AsyncStorage queue.
 * 3. When the device comes back ONLINE → queue is drained in order.
 * 4. Read (GET) calls fall back to the last cached response if offline.
 *
 * Usage:
 *   import { queuedFetch } from '@/lib/offlineQueue';
 *   const data = await queuedFetch('/api/notifications', { method: 'GET' });
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// ── Types ──────────────────────────────────────────────────────────────────
export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
}

export interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSyncAt: number | null;
  isSyncing: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────
const QUEUE_KEY = '@cc_sync_queue';
const CACHE_PREFIX = '@cc_cache_';
const MAX_RETRIES = 5;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── Helpers ────────────────────────────────────────────────────────────────
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function cacheKey(url: string): string {
  return `${CACHE_PREFIX}${url.replace(/[^a-z0-9]/gi, '_')}`;
}

// ── Queue Management ───────────────────────────────────────────────────────
async function getQueue(): Promise<QueuedRequest[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: QueuedRequest[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

async function enqueue(req: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>): Promise<void> {
  const queue = await getQueue();
  queue.push({ ...req, id: generateId(), timestamp: Date.now(), retries: 0 });
  await saveQueue(queue);
  console.log(`[OfflineQueue] Queued: ${req.method} ${req.url} (${queue.length} pending)`);
}

// ── Cache Management ───────────────────────────────────────────────────────
async function cacheResponse(url: string, data: any): Promise<void> {
  try {
    await AsyncStorage.setItem(cacheKey(url), JSON.stringify({ data, cachedAt: Date.now() }));
  } catch {}
}

async function getCachedResponse(url: string): Promise<any | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(url));
    if (!raw) return null;
    const { data, cachedAt } = JSON.parse(raw);
    if (Date.now() - cachedAt > CACHE_TTL_MS) return null; // stale
    return data;
  } catch {
    return null;
  }
}

// ── Sync Engine ────────────────────────────────────────────────────────────
let _isSyncing = false;
let _statusListeners: Array<(s: SyncStatus) => void> = [];
let _isOnline = true;
let _lastSyncAt: number | null = null;

export function addSyncListener(cb: (s: SyncStatus) => void): () => void {
  _statusListeners.push(cb);
  return () => { _statusListeners = _statusListeners.filter((l) => l !== cb); };
}

async function broadcastStatus(): Promise<void> {
  const queue = await getQueue();
  const status: SyncStatus = {
    isOnline: _isOnline,
    pendingCount: queue.length,
    lastSyncAt: _lastSyncAt,
    isSyncing: _isSyncing,
  };
  _statusListeners.forEach((l) => l(status));
}

export async function drainQueue(baseUrl: string, token?: string): Promise<void> {
  if (_isSyncing) return;
  const queue = await getQueue();
  if (queue.length === 0) return;

  _isSyncing = true;
  await broadcastStatus();
  console.log(`[OfflineQueue] Draining ${queue.length} queued requests…`);

  const remaining: QueuedRequest[] = [];

  for (const req of queue) {
    try {
      const res = await fetch(`${baseUrl}${req.url}`, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(req.headers ?? {}),
        },
        body: req.body,
      });

      if (res.ok) {
        console.log(`[OfflineQueue] ✅ Synced: ${req.method} ${req.url}`);
        _lastSyncAt = Date.now();
      } else if (res.status >= 400 && res.status < 500) {
        // Client error — don't retry (bad request won't fix itself)
        console.warn(`[OfflineQueue] ❌ Dropped (${res.status}): ${req.method} ${req.url}`);
      } else {
        // Server error — retry later
        remaining.push({ ...req, retries: req.retries + 1 });
      }
    } catch (e) {
      // Network still down — keep in queue if under max retries
      if (req.retries < MAX_RETRIES) {
        remaining.push({ ...req, retries: req.retries + 1 });
      } else {
        console.warn(`[OfflineQueue] ❌ Max retries hit, dropping: ${req.url}`);
      }
    }
  }

  await saveQueue(remaining);
  _isSyncing = false;
  await broadcastStatus();
  console.log(`[OfflineQueue] Drain complete. ${remaining.length} still pending.`);
}

// ── Network Monitor ────────────────────────────────────────────────────────
let _baseUrl = '';
let _tokenGetter: (() => string | undefined) | null = null;

export function initOfflineSync(baseUrl: string, tokenGetter: () => string | undefined): void {
  _baseUrl = baseUrl;
  _tokenGetter = tokenGetter;

  NetInfo.addEventListener((state: NetInfoState) => {
    const wasOffline = !_isOnline;
    _isOnline = !!(state.isConnected && state.isInternetReachable !== false);

    broadcastStatus();

    if (wasOffline && _isOnline) {
      console.log('[OfflineQueue] 🌐 Back online — draining queue…');
      drainQueue(_baseUrl, _tokenGetter?.());
    }
  });
}

// ── Main Fetch Wrapper ─────────────────────────────────────────────────────
export async function queuedFetch(
  url: string,
  options: RequestInit & { skipCache?: boolean } = {}
): Promise<any> {
  const method = (options.method ?? 'GET').toUpperCase();
  const fullUrl = `${_baseUrl}${url}`;
  const token = _tokenGetter?.();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  // ── GET: try network, fall back to cache ──────────────────────────────
  if (method === 'GET') {
    try {
      const res = await fetch(fullUrl, { ...options, headers });
      if (res.ok) {
        const data = await res.json();
        if (!options.skipCache) await cacheResponse(url, data);
        return data;
      }
    } catch {
      // network error — try cache
    }

    const cached = await getCachedResponse(url);
    if (cached !== null) {
      console.log(`[OfflineQueue] 📦 Serving from cache: ${url}`);
      return cached;
    }
    throw new Error('Offline and no cached data available.');
  }

  // ── Mutations: try network, queue if offline ──────────────────────────
  try {
    const netState = await NetInfo.fetch();
    const online = !!(netState.isConnected && netState.isInternetReachable !== false);

    if (!online) throw new Error('offline');

    const res = await fetch(fullUrl, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e: any) {
    // Queue the write for later sync
    if (method !== 'GET') {
      await enqueue({
        url,
        method,
        body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
        headers,
      });
      await broadcastStatus();
      // Return an optimistic "queued" response so UI doesn't break
      return { __queued: true, message: 'Saved locally. Will sync when online.' };
    }
    throw e;
  }
}

// ── Pending count helper ───────────────────────────────────────────────────
export async function getPendingCount(): Promise<number> {
  const q = await getQueue();
  return q.length;
}

export async function clearQueue(): Promise<void> {
  await saveQueue([]);
  await broadcastStatus();
}
