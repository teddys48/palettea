declare module 'bun:test' {
  export function describe(name: string, fn: () => void | Promise<void>): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
  export function mock<T extends (...args: any[]) => any>(fn?: T): T & {
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
  };

  export interface Matchers<T> {
    toBe(expected: any): void;
    toEqual(expected: any): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeCloseTo(expected: number, precision?: number): void;
    toContain(item: any): void;
    toMatch(expected: RegExp | string): void;
    toBeGreaterThan(expected: number): void;
    toBeLessThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeLessThanOrEqual(expected: number): void;
    toThrow(expected?: any): void;
    rejects: Matchers<T>;
    resolves: Matchers<T>;
  }

  export function expect<T = any>(actual: T): Matchers<T>;
}
