import { signal, WritableSignal } from '@angular/core';

/**
 * Creates a reactive signal synchronized with localStorage
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [WritableSignal<T>, (val: T) => void] {
  let initial = defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      initial = JSON.parse(stored);
    }
  } catch (e) {
    console.warn(`Failed to read key "${key}" from localStorage:`, e);
  }

  const s = signal<T>(initial);

  const setValue = (value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      s.set(value);
    } catch (e) {
      console.warn(`Failed to write key "${key}" to localStorage:`, e);
    }
  };

  return [s, setValue];
}
