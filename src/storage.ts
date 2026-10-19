import { useEffect, useState } from 'react';

// Keep the existing device's data namespace; unlocking never changes profiles.
export function deviceKey(field: string) {
  let profile = localStorage.getItem('expense_deviceProfile');
  if (!profile) {
    profile = localStorage.getItem('expense_currentUser') || 'guest';
    localStorage.setItem('expense_deviceProfile', profile);
  }
  return `expense_${field}_${profile}`;
}
export function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function useLocalState<T>(key: string, fallback: T, onError: (message: string) => void) {
  const [state, setState] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    try {
      const value = JSON.parse(raw);
      if (typeof fallback === 'string' && typeof value !== 'string') return raw as T;
      return value as T;
    }
    catch {
      // Older versions saved strings without JSON encoding.
      if (typeof fallback === 'string' || fallback === null) return raw as T;
      throw new Error(`Saved data could not be read: ${key}. Your original data has been preserved.`);
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch { onError('Changes could not be saved. Free some space and download a backup before closing the app.'); }
  }, [key, state, onError]);
  return [state, setState] as const;
}
