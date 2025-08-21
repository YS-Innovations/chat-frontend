// src/pages/chat/components/MessageInput/FileUploader.tsx
import React, { useRef, useState, useEffect } from 'react';
import type { FC, DragEvent, KeyboardEvent } from 'react';
import { validateFile, isImage } from '../../utils/fileUtils';
import type { ValidationResult } from '../../utils/fileUtils';
import { File as FileIcon, Upload, UploadCloud, X } from 'lucide-react';

interface FileUploaderProps {
  conversationId: string | null;
  /**
   * Called when the user selects a file (or clears it).
   * The component no longer uploads automatically; parent will upload on Send.
   */
  onSelectFile: (file: File | null) => void;
  disabled?: boolean;
  /**
   * If parent passes a file (selected), show it. This allows parent to control preview clearing.
   * If omitted, the component maintains preview internally until onSelectFile(null) is called.
   */
  selectedFile?: File | null;
}

const ACCEPT =
  '.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv';

const FileUploader: FC<FileUploaderProps> = ({
  conversationId,
  onSelectFile,
  disabled = false,
  selectedFile,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // preview will be either derived from selectedFile (prop) or internal selected file
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const file = selectedFile ?? internalFile;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // keep preview in sync with file
  useEffect(() => {
    if (!file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    if (isImage(file.name)) {
      try {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } catch {
        setPreviewUrl(null);
      }
    } else {
      // non-image: no blob preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }

    return () => {
      // cleanup will happen when file changes
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetInternal = () => {
    setInternalFile(null);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (inputRef.current) inputRef.current.value = '';
    // notify parent we cleared selection
    onSelectFile(null);
  };

  const handleFileSelected = (f: File) => {
    setError(null);
    const validation: ValidationResult = validateFile(f);
    if (!validation.ok) {
      setError(validation.reason ?? 'Invalid file');
      // do not call onSelectFile
      return;
    }

    // set internal file only when parent hasn't provided a selectedFile prop
    if (selectedFile === undefined) {
      setInternalFile(f);
    }
    onSelectFile(f);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelected(f);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || !conversationId) {
      setError('Select a conversation first');
      return;
    }
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFileSelected(f);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const clickInput = () => {
    if (disabled || !conversationId) {
      setError('Select a conversation first');
      return;
    }
    inputRef.current?.click();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || !conversationId) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div
        onClick={clickInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={0}
        aria-disabled={disabled || !conversationId}
        aria-label="Attach file"
        className={`flex items-center gap-3 cursor-pointer select-none p-2 rounded-md transition  ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'
        } ${disabled || !conversationId ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <div className="h-4 w-4 text-muted-foreground hover:text-foreground">
          <Upload className="w-4 h-4 text-gray-700" />
        </div>

        {/* <div className="flex flex-col text-sm">
          <span className="font-medium text-gray-700">Attach file</span>
          <span className="text-xs text-gray-500">Images & documents (.jpg, .png, .pdf, .docx) — max 10–20 MB</span>
        </div> */}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={handleFileInput}
          aria-hidden
        />
      </div>

      <div className="min-w-[120px] max-w-xs">
        {file ? (
          <div className="w-full flex items-center gap-2">
            {previewUrl ? (
              <div className="relative">
                <img src={previewUrl} alt={file.name ?? 'preview'} className="w-12 h-12 object-cover rounded-md" />
                <button
                  onClick={(e) => { e.stopPropagation(); resetInternal(); }}
                  title="Remove attachment"
                  className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border hover:bg-gray-100"
                >
                  <X className="w-3 h-3 text-gray-700" />
                </button>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                <FileIcon className="w-5 h-5" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{file.name}</div>
              <div className="text-xs text-gray-500 truncate">{file.type || 'File'}</div>
            </div>

            <div>
              <button
                onClick={() => resetInternal()}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white border hover:bg-gray-50"
                title="Remove attachment"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        ) : null}

        {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      </div>
    </div>
  );
};

export default FileUploader;
