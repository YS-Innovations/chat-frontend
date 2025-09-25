// src/hooks/useMessages.ts
import { useState, useEffect } from 'react';
import socket, {
  joinConversation,
  SOCKET_EVENT_NAMES,
  sendDeliveredReceipt,
  sendSeenReceipt,
} from '../../api/socket';
import { fetchMessages } from '../../api/chatService';
import type { Message as ApiMessage } from '../../api/chatService';

export interface UseMessagesResult {
  messages: ApiMessage[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Options for loading messages.
 * - threads: 'flat' | 'nested' (nested will include replies[] on root messages)
 * - threadPageSize: when requesting nested threads, max replies per parent (backend uses this)
 */
export interface UseMessagesOptions {
  threads?: 'flat' | 'nested';
  threadPageSize?: number;
}

/**
 * Read receipt update shape received from the server via `receipt:updated`.
 */
interface ReadReceiptUpdate {
  messageId: string;
  status: 'DELIVERED' | 'SEEN' | string;
  deliveredAt?: string;
  seenAt?: string;
}

/**
 * Recursively check whether a message id already exists in the tree.
 */
function containsMessage(tree: ApiMessage[], id: string): boolean {
  for (const m of tree) {
    if (m.id === id) return true;
    if (m.replies && m.replies.length > 0) {
      if (containsMessage(m.replies, id)) return true;
    }
  }
  return false;
}

/**
 * Append a reply under the parentId in a nested message tree.
 * Returns a tuple: [newTree, inserted]
 */
function appendReplyToParent(
  tree: ApiMessage[],
  parentId: string,
  reply: ApiMessage
): [ApiMessage[], boolean] {
  let inserted = false;

  const mapped = tree.map((m) => {
    if (m.id === parentId) {
      // insert under this message
      const existingReplies = Array.isArray(m.replies) ? m.replies : [];
      // avoid duplication if reply already present
      if (existingReplies.some((r) => r.id === reply.id)) {
        inserted = true;
        return m;
      }
      const updatedMsg: ApiMessage = {
        ...m,
        replies: [...existingReplies, reply],
      };
      inserted = true;
      return updatedMsg;
    }

    if (m.replies && m.replies.length > 0) {
      const [newReplies, childInserted] = appendReplyToParent(
        m.replies,
        parentId,
        reply
      );
      if (childInserted) {
        inserted = true;
        return { ...m, replies: newReplies };
      }
    }

    return m;
  });

  return [mapped, inserted];
}

/**
 * Flatten nested messages into a simple array (roots and replies).
 * Used for dedupe checks and to produce a flat list when needed.
 */
function flattenMessages(tree: ApiMessage[]): ApiMessage[] {
  const out: ApiMessage[] = [];
  for (const m of tree) {
    out.push(m);
    if (m.replies && m.replies.length > 0) {
      out.push(...flattenMessages(m.replies));
    }
  }
  return out;
}

/**
 * Hook: useMessages
 *
 * - Loads message history for a conversation (flat or nested/threaded view).
 * - Joins the socket conversation room.
 * - Listens for incoming socket messages and merges them into local state.
 *   * In nested mode: replies (msg.parentId present) are attached under their parent if found.
 *   * In flat mode: messages are appended to the end if not present.
 * - Emits delivered/seen receipts after loading history and when new messages arrive.
 * - Listens for server `receipt:updated` events and merges deliveredAt/seenAt timestamps.
 */
export function useMessages(
  conversationId: string | null,
  options: UseMessagesOptions = { threads: 'flat', threadPageSize: 50 }
): UseMessagesResult {
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load (and reload) function exposed to callers
  const load = async () => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const history = await fetchMessages(conversationId, {
        threads: options.threads,
        threadPageSize: options.threadPageSize,
      });
      setMessages(history ?? []);

      // after loading, emit delivered (for all) and seen (up to last)
      const allMsgs = history ?? [];
      const flat = flattenMessages(allMsgs);
      const messageIds = flat.map((m) => m.id);
      if (messageIds.length > 0) {
        try {
          sendDeliveredReceipt({ conversationId, messageIds });
        } catch (e) {
          // swallow - non-fatal
          // eslint-disable-next-line no-console
          console.error('[useMessages] failed to send delivered receipt', e);
        }
        const lastId = messageIds[messageIds.length - 1];
        try {
          sendSeenReceipt({ conversationId, uptoMessageId: lastId });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[useMessages] failed to send seen receipt', e);
        }
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Join & load when conversationId changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    setMessages([]);

    joinConversation(conversationId);

    // load history
    (async () => {
      try {
        const history = await fetchMessages(conversationId, {
          threads: options.threads,
          threadPageSize: options.threadPageSize,
        });
        if (!active) return;
        setMessages(history ?? []);

        // after loading, emit delivered (for all) and seen (up to last)
        const allMsgs = history ?? [];
        const flat = flattenMessages(allMsgs);
        const messageIds = flat.map((m) => m.id);
        if (messageIds.length > 0) {
          try {
            sendDeliveredReceipt({ conversationId, messageIds });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('[useMessages] failed to send delivered receipt', e);
          }
          const lastId = messageIds[messageIds.length - 1];
          try {
            sendSeenReceipt({ conversationId, uptoMessageId: lastId });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('[useMessages] failed to send seen receipt', e);
          }
        }
      } catch (err: any) {
        if (!active) return;
        setError(err);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
    // note: options intentionally left out of deps to treat options as configuration at hook call time.
    // If you need dynamic options, include options in deps and ensure stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Socket handlers: new messages + receipt updates
  useEffect(() => {
    if (!conversationId) return;

    function handleNew(msg: ApiMessage) {
      if (msg.conversationId !== conversationId) return;

      setMessages((prev) => {
        // If nested/threaded mode
        if (options.threads === 'nested') {
          // if message already exists anywhere, skip
          if (containsMessage(prev, msg.id)) return prev;

          // If message is a reply, try to attach under parent
          if (msg.parentId) {
            const [newTree, inserted] = appendReplyToParent(prev, msg.parentId, msg);
            if (inserted) {
              return newTree;
            }
            // parent not found in current tree -> fallback: append as root
            return [...prev, msg];
          }

          // Root message: append to root level
          return [...prev, msg];
        }

        // Flat mode: simple array of messages
        // Check presence in flat (prev could be nested or flat depending on earlier loads)
        const flat = flattenMessages(prev);
        if (flat.some((m) => m.id === msg.id)) return prev;

        // In flat mode, we want a flat array as result.
        // If prev currently contains nested replies (because server earlier returned nested), we convert to flat list.
        // Prefer to keep root messages order, then append new msg.
        if (prev.length > 0 && prev[0].replies) {
          // flatten existing tree to preserve earlier nested responses
          return [...flattenMessages(prev), msg];
        }

        return [...prev, msg];
      });

      // Emit delivered receipt for the newly arrived message
      try {
        sendDeliveredReceipt({ conversationId, messageIds: [msg.id] });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[useMessages] failed to send delivered receipt for new message', e);
      }
    }

    // Handle receipt updates (array of receipts) from server
    function handleReceiptsUpdate(receipts: ReadReceiptUpdate[]) {
      if (!Array.isArray(receipts) || receipts.length === 0) return;

      setMessages((prev) => {
        const updateTree = (tree: ApiMessage[]): ApiMessage[] => {
          return tree.map((m) => {
            // Check if any receipt applies to this message
            const rec = receipts.find((r) => r.messageId === m.id);
            if (rec) {
              const updated: ApiMessage = { ...m };
              // If delivered or seen, update deliveredAt
              if (rec.status === 'DELIVERED' || rec.status === 'SEEN') {
                updated.deliveredAt = rec.deliveredAt ?? updated.deliveredAt;
              }
              // If seen, update seenAt
              if (rec.status === 'SEEN') {
                updated.seenAt = rec.seenAt ?? updated.seenAt;
              }
              // Merge replies as well
              if (updated.replies) {
                updated.replies = updateTree(updated.replies);
              }
              return updated;
            }
            // No receipt for this message; still check replies
            if (m.replies && m.replies.length > 0) {
              return { ...m, replies: updateTree(m.replies) };
            }
            return m;
          });
        };
        return updateTree(prev);
      });
    }

    socket.on(SOCKET_EVENT_NAMES.MESSAGE_NEW, handleNew);
    socket.on(SOCKET_EVENT_NAMES.RECEIPT_UPDATED, handleReceiptsUpdate);

    return () => {
      socket.off(SOCKET_EVENT_NAMES.MESSAGE_NEW, handleNew);
      socket.off(SOCKET_EVENT_NAMES.RECEIPT_UPDATED, handleReceiptsUpdate);
    };
  }, [conversationId, options.threads]);

  return { messages, loading, error, refresh: load };
}
