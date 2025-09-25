import { useMemo } from 'react';
import type { FC } from 'react';
import { X as CloseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sanitize } from '../../utils/sanitize';
import type { Message } from '../../types/ChatApiTypes';

interface ReplyBannerProps {
  /** The message being replied to; null hides the banner */
  replyTo: Message | null;

  /** current user id (optional) so we can render "You" when appropriate */
  selfId?: string | null;

  /** Called when the user cancels replying (clicks the X) */
  onCancel: () => void;

  /**
   * When user clicks the banner body, optionally focus editor (parent may pass).
   * If omitted, clicking the banner does nothing special.
   */
  onFocus?: () => void;

  /** Maximum characters to show from the original message text */
  maxPreviewLength?: number;
}

/**
 * ReplyBanner
 *
 * Small, accessible "Replying to" bar that appears above the editor when
 * the user is replying to a specific message. It displays a short preview
 * of the original message (or attachment name) and a cancel button.
 *
 * - Uses the same Message type exported by src/pages/chat/api/chatService.ts
 * - Uses the project's sanitize util to safely extract text from HTML content.
 *
 * Drop-in ready: styles use Tailwind classes consistent with the app.
 */
const ReplyBanner: FC<ReplyBannerProps> = ({
  replyTo,
  selfId = null,
  onCancel,
  onFocus,
  maxPreviewLength = 200,
}) => {
  // Nothing to render when there is no reply target
  if (!replyTo) return null;

  // Helper: extract safe plain-text preview from message content (HTML => text)
  const previewText = useMemo(() => {
    // If the message has content (HTML), sanitize it then strip tags to plain text.
    if (replyTo.content && typeof replyTo.content === 'string' && replyTo.content.trim() !== '') {
      try {
        const safeHtml = sanitize(replyTo.content);
        // Strip any remaining tags to get a plain-text preview
        const text = safeHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        if (!text) return '(message)';
        return text.length > maxPreviewLength ? `${text.slice(0, maxPreviewLength).trim()}…` : text;
      } catch {
        // Fallback to raw trimmed text if sanitize unexpectedly fails
        const fallback = replyTo.content.replace(/<[^>]*>/g, '').trim();
        return fallback.length > maxPreviewLength ? `${fallback.slice(0, maxPreviewLength).trim()}…` : fallback;
      }
    }

    // If no text content, but fileName exists (attachment with caption absent)
    if (replyTo.fileName && typeof replyTo.fileName === 'string') {
      return replyTo.fileName.length > maxPreviewLength
        ? `${replyTo.fileName.slice(0, maxPreviewLength).trim()}…`
        : replyTo.fileName;
    }

    // If only mediaUrl exists, show a generic label
    if (replyTo.mediaUrl) {
      return '(attachment)';
    }

    // Last-resort fallback
    return '(message)';
  }, [replyTo, maxPreviewLength]);

  const senderLabel = useMemo(() => {
    if (!replyTo) return '';
    if (replyTo.senderId && selfId && replyTo.senderId === selfId) return 'You';
    // If backend/frontend expose sender display name, prefer that; otherwise show shortened id
    // We avoid reading fields that may not exist; keep it generic.
    if ((replyTo as any).senderName) return (replyTo as any).senderName as string;
    if (replyTo.senderId) return `User ${String(replyTo.senderId).slice(0, 8)}`;
    return 'System';
  }, [replyTo, selfId]);

  return (
    <div
      role="region"
      aria-label="Replying to message"
      className="mb-2 rounded-md bg-gray-100 border border-gray-200 px-3 py-2 flex items-start gap-3"
    >
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => {
          // Let parent optionally focus the editor when clicking the banner
          if (onFocus) onFocus();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onFocus) onFocus();
          }
        }}
        role={onFocus ? 'button' : undefined}
        tabIndex={onFocus ? 0 : -1}
        aria-pressed="false"
      >
        <div className="text-xs text-gray-500 mb-1">
          Replying to <span className="font-medium text-gray-700">{senderLabel}</span>
        </div>

        <div className="text-sm text-gray-700 truncate break-words">
          {previewText}
        </div>
      </div>

      <div className="flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          aria-label="Cancel reply"
          className="h-8 w-8 p-0 rounded-full"
        >
          <CloseIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ReplyBanner;
