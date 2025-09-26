// src/components/ChatWindow/MessageBubble.tsx
import React from 'react';
import { sanitize } from '../../../utils/sanitize';
import { Download, File as FileIcon, CornerUpLeft as ReplyIcon } from 'lucide-react';
import type { Message } from '@/pages/chat/types/ChatApiTypes';

interface MessageBubbleProps {
  message: Message;
  selfId: string;
  onReply?: (message: Message) => void;
  searchTerm?: string;
}


const generateUserColor = (userId: string) => {
  const hash = [...userId].reduce((acc, char) => acc + char.charCodeAt(0), 0); // simple hash
  const hue = hash % 360; // Generate a unique hue based on the hash
  return `hsl(${hue}, 70%, 60%)`; // Use HSL for a wide color range
};


// Default profile picture component
const DefaultProfileIcon: React.FC<{ className?: string; name?: string; userId: string }> = ({ className, name, userId }) => {
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const userColor = generateUserColor(userId); // Generate color based on user ID

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${className}`}
      style={{ backgroundColor: userColor }} // Apply the generated color
    >
      {initials}
    </div>
  );
};

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

const stripTags = (html?: string | null) => {
  if (!html) return '';
  // sanitize() returns safe html; we still strip tags for the preview text
  const safe = sanitize(html);
  // preserve spacing/newlines, collapse runs of whitespace into single spaces
  return safe.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onReply, searchTerm = '' }) => {
  // Extract sender information from message
  const senderName = (message as any).senderName || (message as any).sender?.name || 'You';
  const senderPicture = (message as any).senderPicture || (message as any).sender?.picture || null;

  // Support comparing either the internal DB senderId *or* an Auth0 ID if backend provides it
  const senderAuth0Id = (message as any).senderAuth0Id ?? (message as any).sender?.auth0Id ?? undefined;
  const isMe = senderAuth0Id;

  // Only show profile picture if it's a "me" message AND has auth0Id
  const showProfilePicture = isMe && senderAuth0Id;

  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Normalize potentially-null fields to undefined so React/TSX props accept them.
  const safeMediaUrl: string | undefined =
    typeof message.mediaUrl === 'string' && message.mediaUrl ? message.mediaUrl : undefined;
  const safeMediaType: string | undefined =
    typeof message.mediaType === 'string' && message.mediaType ? message.mediaType : undefined;
  const safeFileName: string | undefined =
    typeof message.fileName === 'string' && message.fileName ? message.fileName : undefined;

  const safeHtml = message.content ? sanitize(message.content) : '';
  const wrapperClass = `w-full flex ${isMe ? 'justify-end' : 'justify-start'} px-3 py-1`;
  const hasMedia = Boolean(safeMediaUrl);
  const mediaIsImage = isImageMedia(safeMediaUrl, safeMediaType);

  // Prefer backend `parentMessage` (threaded API). Fall back to older `parentPreview`.
  const parentObj = (message as any).parentMessage ?? (message as any).parentPreview;
  const hasParent = Boolean(message.parentId || parentObj);

  // Build preview text for parent: do NOT truncate here (show full/plain text), wrap instead.
  let previewText = '';
  if (parentObj?.content && typeof parentObj.content === 'string') {
    previewText = stripTags(parentObj.content as string);
  } else if (parentObj?.fileName) {
    previewText = String(parentObj.fileName);
  } else if (parentObj?.mediaUrl) {
    previewText = '(attachment)';
  } else {
    previewText = '';
  }

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReply) onReply(message);
  };

  // Jump-to-parent behavior (click or keyboard)
  const handleJumpToParent = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    const parentId =
      (parentObj && (parentObj.id ?? (parentObj as any).clientMsgId)) ?? message.parentId ?? null;
    if (!parentId) return;
    const selector = `[data-message-id="${String(parentId)}"]`;
    const el = document.querySelector(selector) as HTMLElement | null;
    const target = el ?? (document.getElementById(String(parentId)) as HTMLElement | null);
    if (!target) return;
    try {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      try {
        target.focus?.();
      } catch {
        // ignore
      }
      const originalBg = target.style.backgroundColor ?? '';
      target.style.backgroundColor = 'rgba(253, 232, 138, 0.45)';
      target.style.transition = 'background-color 700ms ease';
      window.setTimeout(() => {
        target.style.backgroundColor = originalBg;
        window.setTimeout(() => {
          target.style.transition = '';
        }, 300);
      }, 1400);
    } catch {
      // ignore scroll errors
    }
  };

  // keyboard handler for preview button
  const handlePreviewKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleJumpToParent(e);
    }
  };

  // Determine stable message id for data attribute (support clientMsgId fallback)
  const stableMessageId = message.id ?? (message as any).clientMsgId ?? undefined;

  // Function to highlight search terms in content
  const highlightSearchTerms = (html: string, term: string) => {
    if (!term || !html) return sanitize(html);

    const safeHtml = sanitize(html);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = safeHtml;

    const highlightTextNodes = (node: Node, searchRegex: RegExp) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (searchRegex.test(text)) {
          const frag = document.createDocumentFragment();
          let lastIndex = 0;

          text.replace(searchRegex, (match, offset) => {
            if (offset > lastIndex) {
              frag.appendChild(document.createTextNode(text.substring(lastIndex, offset)));
            }

            const highlightSpan = document.createElement('span');
            highlightSpan.className = 'bg-yellow-200 font-semibold';
            highlightSpan.textContent = match;
            frag.appendChild(highlightSpan);

            lastIndex = offset + match.length;
            return match;
          });

          if (lastIndex < text.length) {
            frag.appendChild(document.createTextNode(text.substring(lastIndex)));
          }

          if (node.parentNode) {
            node.parentNode.replaceChild(frag, node);
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(child =>
          highlightTextNodes(child, searchRegex)
        );
      }
    };

    const searchRegex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    highlightTextNodes(tempDiv, searchRegex);

    return tempDiv.innerHTML;
  };

  // Use highlighted content if search term exists
  const displayHtml = searchTerm
    ? highlightSearchTerms(message.content || '', searchTerm)
    : sanitize(message.content || '');

  return (
    <div className={wrapperClass} data-message-id={stableMessageId}>
      <div className={`inline-flex items-end group ${isMe ? 'flex-row-reverse' : 'flex-row'} ${showProfilePicture ? 'gap-2' : ''}`}>
        {/* Profile picture - only show for "me" messages that have auth0Id */}
        {showProfilePicture && (
          <div className="flex-shrink-0" title={`Sent by: ${senderName}`}>
            {senderPicture ? (
              <img
                src={senderPicture}
                alt={senderName}
                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <DefaultProfileIcon
                className="w-8 h-8 text-sm"
                name={senderName}
                userId={senderAuth0Id || 'default'} // Pass userId or fallback to 'default' if none exists
              />
            )}
          </div>
        )}


        <div className={`inline-flex items-center ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          <div
            className={`${isMe ? 'chat-bubble-outgoing' : 'chat-bubble-incoming'} shadow-sm max-w-full`}
            tabIndex={0}
            aria-label={safeHtml ? undefined : '(empty)'}
          >
            {/* Reply preview/header */}
            {(hasParent || previewText) && (
              <div className="mb-2 rounded-md bg-gray-50 border border-gray-100 px-3 py-1 text-xs text-gray-600">
                <div className="font-medium text-xs text-gray-500">Replying to</div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleJumpToParent}
                  onKeyDown={handlePreviewKey}
                  title={previewText || undefined}
                  aria-label="Jump to original message"
                  className="mt-1 text-xs leading-tight text-gray-700 cursor-pointer focus:outline-none"
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                >
                  {previewText ? previewText : 'a message'}
                </div>
              </div>
            )}

            {/* Media preview (image) or file card */}
            {hasMedia && (
              <div className="chat-bubble-media mb-2">
                {mediaIsImage ? (
                  <a
                    href={safeMediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                    title={safeFileName ?? 'Open image'}
                  >
                    {safeMediaUrl && (
                      <img
                        src={safeMediaUrl}
                        alt={safeFileName ?? 'image'}
                        className="rounded-md max-w-xs max-h-60 object-contain border"
                        style={{ display: 'block' }}
                      />
                    )}
                  </a>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border">
                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-md border">
                      <FileIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{safeFileName ?? safeMediaUrl}</div>
                      <div className="text-xs text-gray-500 truncate">{safeMediaType ?? 'File'}</div>
                    </div>
                    <div>
                      <a
                        href={safeMediaUrl}
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

            {/* Message content */}
            <div className="chat-bubble-content" style={{ textAlign: isMe ? 'right' : 'left', margin: 0 }}>
              {displayHtml ? (
                <div dangerouslySetInnerHTML={{ __html: displayHtml }} />
              ) : hasMedia ? null : (
                <span className="text-gray-500">(empty)</span>
              )}
            </div>

            <div className="chat-bubble-time mt-2" aria-hidden>
              <span className="chat-bubble-time-text text-xs text-gray-400">{time}</span>

            </div>
          </div>

          {/* reply button */}
          <button
            type="button"
            onClick={handleReply}
            aria-label="Reply to message"
            title="Reply"
            className="ml-2 mr-2 w-6 h-6 flex items-center justify-center rounded-full bg-white border text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-150"
          >
            <ReplyIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;