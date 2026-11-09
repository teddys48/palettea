import { describe, it, expect, beforeEach } from 'bun:test';
import { downloadFile } from './file-download';

describe('file-download service', () => {
  let createdObjectURLs: string[] = [];
  let clicksTriggered = 0;

  beforeEach(() => {
    createdObjectURLs = [];
    clicksTriggered = 0;

    const mockAnchor = {
      href: '',
      download: '',
      style: { display: '' },
      click: () => {
        clicksTriggered++;
      },
    };

    const mockBody = {
      appendChild: (_child: unknown) => {},
      removeChild: (_child: unknown) => {},
    };

    const mockDocument = {
      createElement: (tag: string) => {
        if (tag === 'a') return mockAnchor;
        return { style: {} };
      },
      body: mockBody,
    };

    (globalThis as unknown as { window: unknown }).window = globalThis;
    (globalThis as unknown as { document: unknown }).document = mockDocument;

    if (typeof globalThis.URL === 'undefined' || !globalThis.URL.createObjectURL) {
      globalThis.URL.createObjectURL = (_blob: unknown) => {
        const url = `blob:test-${Math.random()}`;
        createdObjectURLs.push(url);
        return url;
      };
      globalThis.URL.revokeObjectURL = (url: string) => {
        const idx = createdObjectURLs.indexOf(url);
        if (idx !== -1) createdObjectURLs.splice(idx, 1);
      };
    }
  });

  it('rejects empty content', () => {
    const res = downloadFile('', 'test.css');
    expect(res.success).toBe(false);
    expect(res.error).toContain('empty content');
  });

  it('rejects empty filename', () => {
    const res = downloadFile('body { color: red; }', '');
    expect(res.success).toBe(false);
    expect(res.error).toContain('Filename must not be empty');
  });

  it('triggers download with valid arguments', () => {
    const res = downloadFile('body { color: red; }', 'styles.css', 'text/css');
    expect(res.success).toBe(true);
    expect(clicksTriggered).toBe(1);
  });
});
