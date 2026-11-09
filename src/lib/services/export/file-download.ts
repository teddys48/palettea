export interface DownloadResult {
  success: boolean;
  error?: string;
}

/**
 * Downloads text-based file content in the browser using native Blob and URL.createObjectURL.
 * Cleans up the object URL after triggering the download.
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType = 'text/plain;charset=utf-8'
): DownloadResult {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      success: false,
      error: 'Download is only supported in a browser environment.',
    };
  }

  if (!content) {
    return {
      success: false,
      error: 'Cannot download empty content.',
    };
  }

  if (!filename || filename.trim().length === 0) {
    return {
      success: false,
      error: 'Filename must not be empty.',
    };
  }

  try {
    const blob = new Blob([content], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Revoke object URL after a short timeout so mobile/safari browsers complete the download stream
    setTimeout(() => {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        // Ignored
      }
    }, 1500);

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error during download.';
    return { success: false, error: message };
  }
}
