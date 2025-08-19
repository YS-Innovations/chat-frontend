// src/pages/chat/api/uploadService.ts

import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) throw new Error('VITE_BACKEND_URL is not defined');

/**
 * The shape we expect from the backend when requesting a presigned upload URL.
 * - uploadUrl: URL to PUT/POST the file to
 * - method: optional, either 'PUT' (default) or 'POST' for presigned-form uploads
 * - fields: for presigned POST (form) uploads
 * - publicUrl: final publicly accessible URL for the uploaded file (or a URL frontend can use)
 */
export interface PresignResponse {
  uploadUrl: string;
  method?: 'PUT' | 'POST';
  fields?: Record<string, string>;
  publicUrl: string;
}

/**
 * Request a presigned upload URL from your backend.
 * The backend should validate filename / contentType / size and return a short-lived presigned URL.
 */
export async function getPresignedUrl(
  fileName: string,
  contentType: string,
  size: number
): Promise<PresignResponse> {
  const res = await axios.post<PresignResponse>(`${API_BASE}/uploads/presign`, {
    fileName,
    contentType,
    size,
  });
  return res.data;
}

/**
 * Upload using a PUT presigned URL (most straightforward).
 * @param uploadUrl presigned PUT URL
 * @param file file to upload
 * @param onProgress optional progress callback (0-100)
 */
export async function uploadToS3WithPut(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void
) {
  // Use a safe fallback if file.type is empty (some browsers/files may not provide a MIME)
  const contentType = file.type || 'application/octet-stream';

  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': contentType },
    onUploadProgress: (ev) => {
      if (ev.total) onProgress?.(Math.round((ev.loaded / ev.total) * 100));
    },
  });
}

/**
 * Upload using a presigned POST (form) upload. Backend returns `fields` and an `uploadUrl` (the form action).
 */
export async function uploadToS3WithPost(
  uploadUrl: string,
  fields: Record<string, string>,
  file: File,
  onProgress?: (percent: number) => void
) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  form.append('file', file);

  await axios.post(uploadUrl, form, {
    onUploadProgress: (ev) => {
      if (ev.total) onProgress?.(Math.round((ev.loaded / ev.total) * 100));
    },
  });
}

/**
 * High-level helper that requests a presign and uploads the file. Returns the public URL.
 * Defaults to PUT when backend doesn't specify a method.
 */
export async function uploadFileToS3(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ publicUrl: string }> {
  const presign = await getPresignedUrl(file.name, file.type, file.size);

  if (!presign || !presign.uploadUrl) {
    throw new Error('Presign response missing uploadUrl');
  }

  if ((presign.method ?? 'PUT').toUpperCase() === 'POST' && presign.fields) {
    await uploadToS3WithPost(presign.uploadUrl, presign.fields, file, onProgress);
  } else {
    // default to PUT
    await uploadToS3WithPut(presign.uploadUrl, file, onProgress);
  }

  return { publicUrl: presign.publicUrl };
}
