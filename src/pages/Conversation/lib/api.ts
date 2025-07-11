import axios from 'axios'

// Base URL for your backend API
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Uploads a file to the backend and returns the media URL.
 *
 * @param file - The File object to upload.
 * @returns An object containing the `mediaUrl` string.
 * @throws Error if the upload fails.
 */
export async function uploadFile(file: File): Promise<{ mediaUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await axios.post(
      // Note: include the global '/api' prefix
      `${API_BASE}/api/uploads/file`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return res.data // Expected shape: { mediaUrl: string }
  } catch (error) {
    console.error('[❌ File Upload Error]', error)
    throw new Error('File upload failed')
  }
}
