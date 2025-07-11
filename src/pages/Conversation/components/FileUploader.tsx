import { useRef, useState, useCallback } from 'react'
import { Paperclip, FileText, FileWarning } from 'lucide-react'
import { uploadFile } from '@/pages/Conversation/lib/api'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'

interface Props {
  disabled?: boolean
  onUpload: (data: { mediaUrl: string; metadata: any }) => void
}

const MAX_FILE_SIZE_MB = 10
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

export default function FileUploader({ onUpload, disabled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const validateFile = (file: File) => {
    const isAllowedType = ALLOWED_TYPES.includes(file.type)
    const isAllowedSize = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024
    return isAllowedType && isAllowedSize
  }

  const showToast = (message: string, type: 'error' | 'success' = 'success') => {
    toast[type === 'success' ? 'success' : 'error'](message)
  }

  const handleUpload = async (file: File) => {
    if (!validateFile(file)) {
      showToast(`Only JPG, PNG, WEBP, SVG, PDF, DOC, DOCX, or TXT files under ${MAX_FILE_SIZE_MB}MB are allowed.`, 'error')
      return
    }

    setPreviewFile(file)

    try {
      const { mediaUrl } = await uploadFile(file)

      onUpload({
        mediaUrl,
        metadata: {
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        },
      })

      showToast('File uploaded successfully!')
    } catch (err) {
      console.error('Upload failed:', err)
      showToast('File upload failed. Please try again.', 'error')
    } finally {
      setPreviewFile(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await handleUpload(file)
  }

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) await handleUpload(file)
    },
    []
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`relative group cursor-pointer ${
        dragOver ? 'bg-muted border border-dashed border-primary' : ''
      } rounded-md p-1 transition`}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Attach file</TooltipContent>
      </Tooltip>

      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.svg,.pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Preview */}
      {previewFile && (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-zinc-800 rounded-md shadow-lg p-2 text-sm w-52 z-50">
          <div className="flex items-center gap-2">
            {previewFile.type.startsWith('image') ? (
              <img
                src={URL.createObjectURL(previewFile)}
                alt="preview"
                className="w-10 h-10 object-cover rounded-sm border"
              />
            ) : previewFile.type.includes('pdf') ||
              previewFile.type.includes('doc') ||
              previewFile.type.includes('text') ? (
              <FileText className="w-6 h-6 text-muted-foreground" />
            ) : (
              <FileWarning className="w-6 h-6 text-yellow-500" />
            )}
            <div className="truncate max-w-[140px]">{previewFile.name}</div>
          </div>
        </div>
      )}
    </div>
  )
}
