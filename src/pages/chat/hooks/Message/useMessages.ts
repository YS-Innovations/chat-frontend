// src/hooks/useMessages.ts
import { useState, useEffect } from 'react';
import socket, {
  joinConversation,
  SOCKET_EVENT_NAMES,
} from '../../socket/socket';
import { fetchMessages } from '../../api/Chat/chatService';
import type { Message as ApiMessage } from '../../types/ChatApiTypes';

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

  // Socket handlers: new messages 
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
    }


    socket.on(SOCKET_EVENT_NAMES.MESSAGE_NEW, handleNew);

    return () => {
      socket.off(SOCKET_EVENT_NAMES.MESSAGE_NEW, handleNew);
    };
  }, [conversationId, options.threads]);

  return { messages, loading, error, refresh: load };
}
