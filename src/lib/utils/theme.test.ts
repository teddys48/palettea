import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { getInitialTheme, applyTheme } from './theme';

describe('theme utils', () => {
  const originalWindow = (globalThis as unknown as { window?: unknown }).window;
  const originalDocument = (globalThis as unknown as { document?: unknown }).document;
  const originalLocalStorage = globalThis.localStorage;

  let mockClassList: Set<string>;
  let mockStorageStore: Record<string, string>;

  beforeEach(() => {
    mockClassList = new Set();
    mockStorageStore = {};

    const mockDoc = {
      documentElement: {
        classList: {
          add: (cls: string) => mockClassList.add(cls),
          remove: (cls: string) => mockClassList.delete(cls),
          contains: (cls: string) => mockClassList.has(cls),
        },
      },
    };

    const mockStorage = {
      getItem: (key: string) => mockStorageStore[key] || null,
      setItem: (key: string, val: string) => {
        mockStorageStore[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorageStore[key];
      },
    };

    (globalThis as unknown as { window: unknown }).window = {
      matchMedia: (query: string) =>
        ({
          matches: false,
          media: query,
        } as MediaQueryList),
    };
    (globalThis as unknown as { document: unknown }).document = mockDoc;
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    (globalThis as unknown as { window?: unknown }).window = originalWindow;
    (globalThis as unknown as { document?: unknown }).document = originalDocument;
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    }
  });

  it('returns stored theme when present and valid', () => {
    mockStorageStore['palettea-theme'] = 'dark';
    expect(getInitialTheme()).toBe('dark');
  });

  it('falls back to light when matchMedia prefers light', () => {
    (globalThis as unknown as { window: unknown }).window = {
      matchMedia: () => ({ matches: false } as unknown as MediaQueryList),
    };
    expect(getInitialTheme()).toBe('light');
  });

  it('falls back to dark when matchMedia prefers dark and no theme is saved', () => {
    (globalThis as unknown as { window: unknown }).window = {
      matchMedia: () => ({ matches: true } as unknown as MediaQueryList),
    };
    expect(getInitialTheme()).toBe('dark');
  });

  it('handles restricted localStorage throwing errors without crashing', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: () => {
          throw new Error('SecurityError: The operation is insecure.');
        },
        setItem: () => {
          throw new Error('SecurityError: The operation is insecure.');
        },
      },
      writable: true,
      configurable: true,
    });

    (globalThis as unknown as { window: unknown }).window = {
      matchMedia: () => ({ matches: true } as unknown as MediaQueryList),
    };

    expect(() => getInitialTheme()).not.toThrow();
    expect(getInitialTheme()).toBe('dark');
  });

  it('applyTheme applies class and writes to localStorage safely', () => {
    applyTheme('dark');
    expect(mockStorageStore['palettea-theme']).toBe('dark');
    expect(mockClassList.has('dark')).toBe(true);

    applyTheme('light');
    expect(mockStorageStore['palettea-theme']).toBe('light');
    expect(mockClassList.has('dark')).toBe(false);
  });
});
