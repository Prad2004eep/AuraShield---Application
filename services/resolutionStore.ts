import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alert as AlertItem } from '@/types/alert';

const KEY = 'aura-resolved-alert-ids';
let loaded = false;
let cache = new Set<string>();

async function ensureLoaded() {
  if (loaded) return;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const arr: string[] = raw ? JSON.parse(raw) : [];
    cache = new Set(arr);
  } catch {}
  loaded = true;
}

async function persist() {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(Array.from(cache))); } catch {}
}

export async function markResolved(id: string) {
  await ensureLoaded();
  cache.add(String(id));
  await persist();
}

export async function isResolved(id: string) {
  await ensureLoaded();
  return cache.has(String(id));
}

export async function filterOutResolved<T extends { id: string }>(alerts: T[]): Promise<T[]> {
  await ensureLoaded();
  return alerts.filter(a => !cache.has(String(a.id)));
}

export async function getResolvedIds(): Promise<string[]> {
  await ensureLoaded();
  return Array.from(cache);
}

