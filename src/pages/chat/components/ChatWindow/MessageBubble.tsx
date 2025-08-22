// src/components/ChatWindow/MessageBubble.tsx
import React from 'react';
import type { Message } from '../../api/chatService';
import { sanitize } from '../../utils/sanitize';
import { Download, File as FileIcon, CornerUpLeft as ReplyIcon } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  selfId?: string;
  /** optional callback when user clicks the reply icon */
  onReply?: (message: Message) => void;
}

/** Small double-check icon (two strokes) */
const DoubleCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="M1 14l4 4 7-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.95"
    />
    <path
      d="M9 14l4 4 7-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.95"
    />
  </svg>
);

/**
 * determine whether a mediaUrl + mediaType corresponds to an image
 * fall back to extension check when mediaType is not available
 */
const isImageMedia = (mediaUrl?: string, mediaType?: string) => {
  if (!mediaUrl) return false;
  if (mediaType && mediaType.startsWith('image/')) return true;
  // fallback to extension check
  return /\.(jpe?g|png|gif|webp|bmp|tiff)$/i.test(mediaUrl);
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, selfId, onReply }) => {
  const isMe = message.senderId === selfId;
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // debug logs (remove in production)
  // eslint-disable-next-line no-console
  console.log('[MessageBubble] raw message.content:', message.content);
  const safeHtml = message.content ? sanitize(message.content) : '';
  // eslint-disable-next-line no-console
  console.log('[MessageBubble] after sanitize:', safeHtml);

  // outer wrapper aligns the whole group left or right
  const wrapperClass = `w-full flex ${isMe ? 'justify-end' : 'justify-start'} px-3 py-1`;

  const hasMedia = Boolean(message.mediaUrl);
  const mediaIsImage = isImageMedia(message.mediaUrl, message.mediaType);

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReply) onReply(message);
  };

  return (
    <div className={wrapperClass}>
      {/*
        group wrapper contains bubble + reply button so we can show the button on hover of the group.
        Use flex-row for incoming (bubble then button), and flex-row-reverse for outgoing (so button stays on right).
      */}
      <div className={`inline-flex items-center group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* message bubble */}
        <div
          className={`${isMe ? 'chat-bubble-outgoing' : 'chat-bubble-incoming'} shadow-sm max-w-full`}
          // make bubble focusable for keyboard hover equivalent
          tabIndex={0}
          aria-label={safeHtml ? undefined : '(empty)'}
        >
          {/* Media preview (image) or file card */}
          {hasMedia && (
            <div className="chat-bubble-media mb-2">
              {mediaIsImage ? (
                <a
                  href={message.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                  title={message.fileName ?? 'Open image'}
                >
                  <img
                    src={message.mediaUrl}
                    alt={message.fileName ?? 'image'}
                    className="rounded-md max-w-xs max-h-60 object-contain border"
                    style={{ display: 'block' }}
                  />
                </a>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border">
                  <div className="w-10 h-10 flex items-center justify-center bg-white rounded-md border">
                    <FileIcon className="w-5 h-5 text-gray-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{message.fileName ?? message.mediaUrl}</div>
                    <div className="text-xs text-gray-500 truncate">{message.mediaType ?? 'File'}</div>
                  </div>

                  <div>
                    <a
                      href={message.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border rounded-md text-sm hover:bg-gray-100"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message content (sanitized HTML) or fallback */}
          <div
            className="chat-bubble-content"
            style={{ textAlign: isMe ? 'right' : 'left', margin: 0 }}
          >
            {safeHtml ? (
              <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
            ) : hasMedia ? (
              // if there's media but no caption/content, show nothing here (media shown above)
              null
            ) : (
              <span className="text-gray-500">(empty)</span>
            )}
          </div>

          <div className="chat-bubble-time mt-2" aria-hidden>
            <span className="chat-bubble-time-text text-xs text-gray-400">{time}</span>
            {isMe && (
              <span className="chat-bubble-status ml-2" title="Sent / Delivered">
                <DoubleCheckIcon className="inline-block w-4 h-4 text-gray-400" />
              </span>
            )}
          </div>
        </div>

        {/* reply button shown only on hover/focus of the group */}
        <button
          type="button"
          onClick={handleReply}
          aria-label="Reply to message"
          title="Reply"
          // hidden by default, visible on group hover/focus; small overlap outside bubble via negative margin if desired
          className="ml-2 -mr-1 w-6 h-6 flex items-center justify-center rounded-full bg-white border text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-150"
        >
          <ReplyIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default MessageBubble;
