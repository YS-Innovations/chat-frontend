// src/utils/fileUtils.ts

/**
 * File utility helpers: allowed extensions, size limits, and validation helpers.
 *
 * Keep these values in sync with server-side validation (VERY IMPORTANT).
 */

export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
export const DOC_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv'];

// Configure limits here (frontend validation). Server must enforce the same or stricter limits.
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MIN_IMAGE_SIZE_BYTES = 1; // 1 byte (no empty files)
export const MAX_DOC_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export type ValidationResult = { ok: true } | { ok: false; reason: string; code?: string };

/**
 * Return the extension (including leading dot) in lowercase, or empty string if none.
 */
export function getExt(filename: string): string {
  const idx = filename.lastIndexOf('.');
  if (idx === -1) return '';
  return filename.slice(idx).toLowerCase();
}

export function isImage(filenameOrPath: string): boolean {
  return IMAGE_EXTENSIONS.includes(getExt(filenameOrPath));
}

export function isDocument(filenameOrPath: string): boolean {
  return DOC_EXTENSIONS.includes(getExt(filenameOrPath));
}

/**
 * Human readable bytes (e.g. 2.3 MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file by extension and size. Returns { ok: true } or { ok: false, reason }
 * Note: always run server-side validation too — this is only for faster client feedback.
 */
export function validateFile(file: File): ValidationResult {
  if (!file) return { ok: false, reason: 'No file provided', code: 'NO_FILE' };

  const ext = getExt(file.name);
  if (!ext) return { ok: false, reason: 'File has no extension', code: 'NO_EXTENSION' };

  const size = file.size || 0;
  if (size <= 0) return { ok: false, reason: 'File is empty', code: 'EMPTY_FILE' };

  // Images
  if (isImage(file.name)) {
    if (size < MIN_IMAGE_SIZE_BYTES) {
      return { ok: false, reason: `Image is too small`, code: 'IMAGE_TOO_SMALL' };
    }
    if (size > MAX_IMAGE_SIZE_BYTES) {
      return {
        ok: false,
        reason: `Image is too large (max ${formatBytes(MAX_IMAGE_SIZE_BYTES)})`,
        code: 'IMAGE_TOO_LARGE',
      };
    }
    return { ok: true };
  }

  // Documents
  if (isDocument(file.name)) {
    if (size > MAX_DOC_SIZE_BYTES) {
      return {
        ok: false,
        reason: `Document is too large (max ${formatBytes(MAX_DOC_SIZE_BYTES)})`,
        code: 'DOC_TOO_LARGE',
      };
    }
    return { ok: true };
  }

  return { ok: false, reason: 'Unsupported file type', code: 'UNSUPPORTED_TYPE' };
}
