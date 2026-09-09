import { Signal, signal } from '@angular/core';

/**
 * Creates a debounced signal that updates only after the specified delay
 */
export function useDebounceSignal<T>(initialValue: T, delayMs: number = 300) {
  const source = signal<T>(initialValue);
  const debounced = signal<T>(initialValue);

  let timeoutId: any = null;

  const set = (value: T) => {
    source.set(value);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      debounced.set(value);
    }, delayMs);
  };

  return {
    value: debounced as Signal<T>,
    rawValue: source as Signal<T>,
    set
  };
}

/**
 * Debounce a standard callback function
 */
export function useDebounceFn<T extends (...args: any[]) => any>(fn: T, delayMs: number = 300): (...args: Parameters<T>) => void {
  let timeoutId: any = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
}
