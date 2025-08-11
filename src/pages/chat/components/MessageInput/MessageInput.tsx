// src/components/MessageInput/MessageInput.tsx
import React, { useState } from 'react'
import type { KeyboardEvent, FormEvent } from 'react'
import { sendMessageSocket } from '../../api/socket'

interface MessageInputProps {
  /** The currently selected conversation ID */
  conversationId: string | null
  /** The agent's own user ID (if you add agents later) */
  selfId?: string
}

const MessageInput: React.FC<MessageInputProps> = ({ conversationId, selfId }) => {
  const [text, setText] = useState('')

  const handleSend = () => {
    const content = text.trim()
    if (!content || !conversationId) return

    sendMessageSocket({
      conversationId,
      senderId: selfId ?? '', 
      content,
    })
    setText('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white flex items-center space-x-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder={conversationId ? 'Type your message...' : 'Select a conversation first'}
        disabled={!conversationId}
        className="flex-1 resize-none border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={!conversationId || !text.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition"
      >
        Send
      </button>
    </form>
  )
}

export default MessageInput
