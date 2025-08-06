import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { CannedResponseInput } from '../CannedResponse/input/CannedResponseInput';
// import Picker from '@emoji-mart/react';
// import data from '@emoji-mart/data';

interface ChatMessage {
  id?: string;
  text: string;
  content?: string;
  sender: string;
  timestamp: string;
  recipient?: string;
  originalMessage?: string;
  isAdmin?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  reactions?: { [emoji: string]: string[] };
  senderName?: string;
}

interface UserStatus {
  userId: string;
  isOnline: boolean;
  isActive: boolean;
  isAdmin: boolean;
  lastSeen?: string;
  displayName?: string;
}

const ChatDashboard = () => {
  const [messagesByUser, setMessagesByUser] = useState<{ [key: string]: ChatMessage[] }>({});
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [userStatus, setUserStatus] = useState<UserStatus[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: boolean }>({});
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [pickerMessageId, setPickerMessageId] = useState<string | null>(null);

  const socketRef = useRef< Socket | null>(null);

  useEffect(() => {
    const socket = io('https://l5fzr1b9-5000.inc1.devtunnels.ms/', {
      query: { token: 'admin', isAdmin: true },
      reconnection: true,
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('receiveMessage', (message: ChatMessage) => {
      setMessagesByUser((prev) => {
        const newState = { ...prev };
        const key = message.isAdmin ? message.recipient! : message.sender;
        newState[key] = [...(newState[key] || []), message];
        return newState;
      });

      if (!message.isAdmin && message.sender) {
        setUserStatus((prev) => {
          const exists = prev.find((u) => u.userId === message.sender);
          if (!exists) {
            return [
              ...prev,
              {
                userId: message.sender,
                isOnline: true,
                isActive: true,
                isAdmin: false,
                displayName: message.senderName || message.sender,
              },
            ];
          } else if (!exists.displayName && message.senderName) {
            return prev.map((u) =>
              u.userId === message.sender ? { ...u, displayName: message.senderName } : u
            );
          }
          return prev;
        });
      }
    });

    socket.on('userInfoUpdated', ({ userId, name }: { userId: string; name?: string }) => {
      setUserStatus((prev) =>
        prev.map((user) =>
          user.userId === userId ? { ...user, displayName: name || userId } : user
        )
      );
    });

    socket.on('userTyping', ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: true }));

      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }, 3000);
    });

    socket.on('userActivated', (user: UserStatus) => {
      setUserStatus((prev) => {
        const existing = prev.find((u) => u.userId === user.userId);
        if (existing) {
          return prev.map((u) =>
            u.userId === user.userId ? { ...u, isOnline: true, isActive: true } : u
          );
        }
        return [...prev, user];
      });
    });

    socket.on('userStatusChanged', (status: UserStatus) => {
      setUserStatus((prev) => {
        const existing = prev.find((u) => u.userId === status.userId);
        if (existing) {
          return prev.map((u) =>
            u.userId === status.userId ? { ...u, ...status } : u
          );
        }
        return [...prev, status];
      });
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('requestUserList');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('userList', ({ users }: { users: { userId: string; isActive: boolean }[] }) => {
      setUserStatus((prev) => [
        ...prev.filter((u) => users.some((user) => user.userId === u.userId)),
        ...users.map((user) => ({
          userId: user.userId,
          isOnline: true,
          isActive: user.isActive,
          isAdmin: false,
          lastSeen: new Date().toISOString(),
        })),
      ]);
    });

    socket.on('reactionUpdated', ({ messageId, reactions }: { messageId: string; reactions: { [emoji: string]: string[] } }) => {
      setMessagesByUser(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(userId => {
          updated[userId] = updated[userId].map(msg =>
            msg.id === messageId ? { ...msg, reactions } : msg
          );
        });
        return updated;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (currentUser && socketRef.current) {
      socketRef.current.emit('getMessagesByUser', { userId: currentUser });

      const listener = (messages: ChatMessage[]) => {
        setMessagesByUser((prev) => ({
          ...prev,
          [currentUser]: messages,
        }));

        messages.forEach((msg) => {
          if (!msg.isAdmin && msg.sender) {
            setUserStatus((prev) => {
              const exists = prev.find((u) => u.userId === msg.sender);
              if (!exists) {
                return [
                  ...prev,
                  {
                    userId: msg.sender,
                    isOnline: true,
                    isActive: true,
                    isAdmin: false,
                    displayName: msg.senderName || msg.sender,
                  },
                ];
              } else if (!exists.displayName && msg.senderName) {
                return prev.map((u) =>
                  u.userId === msg.sender ? { ...u, displayName: msg.senderName } : u
                );
              }
              return prev;
            });
          }
        });
      };

      socketRef.current.on('receiveMessagesForUser', listener);

      return () => {
        socketRef.current?.off('receiveMessagesForUser', listener);
      };
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !socketRef.current) return;

    const unreadMessages = messagesByUser[currentUser].filter(
      (msg) => !msg.isAdmin && msg.status !== 'read'
    );

    unreadMessages.forEach((msg) => {
      if (msg.id) {
        setMessagesByUser((prevMessages) => {
          const updatedMessages = { ...prevMessages };
          const userMessages = updatedMessages[currentUser] || [];
          updatedMessages[currentUser] = userMessages.map((message) =>
            message.id === msg.id ? { ...message, status: 'read' } : message
          );
          return updatedMessages;
        });

        socketRef.current!.emit('messageRead', { messageId: msg.id });
      }
    });
  }, [messagesByUser, currentUser]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on('messageStatusUpdated', ({ messageId, status }: { messageId: string; status: ChatMessage['status'] }) => {
      if (!currentUser) return;
      setMessagesByUser((prevMessages) => {
        const updatedMessages = { ...prevMessages };
        const userMessages = updatedMessages[currentUser] || [];

        updatedMessages[currentUser] = userMessages.map((msg: ChatMessage) =>
          msg.id === messageId ? { ...msg, status } : msg
        );

        return updatedMessages;
      });
    });

    return () => {
      socket.off('messageStatusUpdated');
    };
  }, [currentUser]);

  const handleSendMessage = () => {
    if (!socketRef.current || !currentUser || !messageInput.trim()) return;

    const messageData = {
      text: messageInput,
      sender: 'admin',
      recipient: currentUser,
      isAdmin: true,
      timestamp: new Date().toISOString(),
      originalMessage: replyTo?.text || undefined,
    };

    socketRef.current.emit('sendMessage', messageData);
    setMessageInput('');
    setReplyTo(null);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    socketRef.current?.emit('addReaction', { messageId, emoji, userId: 'admin' });
  };

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    socketRef.current?.emit('removeReaction', { messageId, emoji, userId: 'admin' });
  };

  const renderUserList = () => {
    return userStatus
      .filter((user) => !user.isAdmin)
      .map((user) => {
        const displayName = user.displayName || user.userId;
        const userMessages = messagesByUser[user.userId] || [];
        const lastMessage = userMessages[userMessages.length - 1];
        const isTyping = typingUsers[user.userId];

        return (
          <div
            key={user.userId}
            onClick={() => setCurrentUser(user.userId)}
            className={`p-3 border-b cursor-pointer ${
              user.isActive
                ? 'bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800'
                : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
            } ${currentUser === user.userId ? 'border-l-4 border-blue-500' : ''}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${
                    user.isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                ></span>
                <span className="font-medium">{displayName}</span>
              </div>
              {lastMessage && (
                <div className="text-xs text-gray-500">
                  {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </div>
            {isTyping ? (
              <div className="text-sm text-blue-500 mt-1 italic">Typing...</div>
            ) : lastMessage ? (
              <div className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                {lastMessage.isAdmin ? 'You: ' : ''}
                {lastMessage.text}
              </div>
            ) : (
              <div className="text-xs text-gray-500 mt-1">No messages</div>
            )}
            {!user.isActive && <div className="text-xs text-gray-500 mt-1">Not yet active</div>}
          </div>
        );
      });
  };

  const renderMessages = () => {
    if (!currentUser || !messagesByUser[currentUser]?.length) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          No messages yet.
        </div>
      );
    }

    return messagesByUser[currentUser].map((msg, index) => {
      const messageContent = msg.text || msg.content || 'No content available';
      const userReacted = (emoji: string) => msg.reactions?.[emoji]?.includes('admin');

      return (
        <div
          key={index}
          onMouseEnter={() => setHoveredMessageId(msg.id!)}
          onMouseLeave={() => {
            setHoveredMessageId(null);
            setPickerMessageId(null);
          }}
          className={`p-3 mb-2 relative rounded-lg max-w-xs ${
            msg.sender === 'admin'
              ? 'ml-auto bg-blue-100 dark:bg-blue-700'
              : 'mr-auto bg-gray-100 dark:bg-gray-600'
          }`}
        >
          {msg.originalMessage && (
            <div className="text-xs text-gray-500 mb-1 italic">
              Replying to: "{msg.originalMessage}"
            </div>
          )}

          <div className="text-sm">{messageContent}</div>

          <div className="text-xs text-gray-500 mt-1 text-right">
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            • {msg.sender === 'admin' ? 'You' : 'User'}
          </div>

          <div className="reactions-container">
            {Object.entries(msg.reactions || {}).map(([emoji, users]) => (
              <button
                key={emoji}
                className={`reaction ${users.includes('admin') ? 'admin-reacted' : ''}`}
                onClick={() =>
                  users.includes('admin')
                    ? handleRemoveReaction(msg.id!, emoji)
                    : handleAddReaction(msg.id!, emoji)
                }
              >
                {emoji} {users.length}
              </button>
            ))}
          </div>

          {hoveredMessageId === msg.id && (
            <div className="mt-2 flex items-center space-x-2">
              {['👍', '❤️', '😂', '😢', '😡'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() =>
                    userReacted(emoji)
                      ? handleRemoveReaction(msg.id!, emoji)
                      : handleAddReaction(msg.id!, emoji)
                  }
                  className="text-lg hover:scale-110 transition-transform"
                >
                  {emoji}
                </button>
              ))}
              <button onClick={() => setPickerMessageId(msg.id!)}>➕</button>
            </div>
          )}
          {/* {pickerMessageId === msg.id && (
            <div className="absolute z-50">
              <Picker
                data={data}
                onEmojiSelect={(e: any) => {
                  handleAddReaction(msg.id!, e.native);
                  setPickerMessageId(null);
                }}
              />
            </div>
          )} */}

          {!msg.isAdmin && (
            <button
              onClick={() => setReplyTo(msg)}
              className="text-xs text-blue-500 mt-1"
            >
              Reply
            </button>
          )}

          {msg.sender === 'admin' && (
            <div className="text-right text-xs mt-1">
              {msg.status === 'read' ? (
                <span className="text-blue-500">✓✓</span>
              ) : msg.status === 'delivered' ? (
                <span>✓✓</span>
              ) : (
                <span>✓</span>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-75 border-r dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">Chat Dashboard</h2>
          <div className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {userStatus.filter((u) => u.isActive && !u.isAdmin).length} active users
          </div>
        </div>
        <div className="divide-y dark:divide-gray-700">{renderUserList()}</div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col w-175">
        {currentUser && (
          <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="font-bold flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  userStatus.find((u) => u.userId === currentUser)?.isActive
                    ? 'bg-green-500'
                    : 'bg-gray-400'
                }`}
              ></span>
              {userStatus.find((u) => u.userId === currentUser)?.displayName || currentUser}
            </h3>
          </div>
        )}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-700">
          {renderMessages()}
        </div>

        {currentUser && typingUsers[currentUser] && (
          <div className="px-4 py-1 text-sm text-gray-500 italic">
            User is typing...
          </div>
        )}

        {currentUser && (
          <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
            {replyTo && (
              <div className="p-2 bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 rounded mb-2">
                Replying to: "{replyTo.text}"
                <button
                  onClick={() => setReplyTo(null)}
                  className="ml-2 text-xs text-red-500"
                >
                  Cancel
                </button>
              </div>
            )}
            <div className="flex">
              <CannedResponseInput
  value={messageInput}
  onChange={setMessageInput}
  placeholder="Type a message..."
  className="flex-1 p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
  onKeyDown={(e) => {
    if (e.key === 'Enter') handleSendMessage()
  }}
/>

              <button
                onClick={handleSendMessage}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard;
