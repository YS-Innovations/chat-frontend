// src/components/CannedResponseInput.tsx
import React, { useState, useEffect, useRef, type ChangeEvent,type  KeyboardEvent } from 'react'
import { useCannedResponses, type CannedResponse } from './useCannedResponses'

type CannedResponseInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
}

export const CannedResponseInput: React.FC<CannedResponseInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  onKeyDown,
}) => {
  const { responses, loading } = useCannedResponses()
  const [showDropdown, setShowDropdown] = useState(false)
  const [filter, setFilter] = useState('') // text after /
  const [filteredResponses, setFilteredResponses] = useState<CannedResponse[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Detect slash command and filter text
  useEffect(() => {
    const lastSlashIndex = value.lastIndexOf('/')
    if (lastSlashIndex !== -1) {
      const afterSlash = value.substring(lastSlashIndex + 1)
      if (!afterSlash.includes(' ')) {
        setFilter(afterSlash)
        setShowDropdown(true)
        return
      }
    }
    setShowDropdown(false)
    setFilter('')
  }, [value])

  // Filter responses based on filter text
  useEffect(() => {
    if (filter === '') {
      setFilteredResponses(responses)
    } else {
      const filtered = responses.filter((r) =>
        r.name.toLowerCase().includes(filter.toLowerCase())
      )
      setFilteredResponses(filtered)
    }
  }, [filter, responses])

  // Insert canned response message replacing slash command
  const handleSelect = (response: CannedResponse) => {
    const lastSlashIndex = value.lastIndexOf('/')
    if (lastSlashIndex === -1) return

    const newValue = value.substring(0, lastSlashIndex) + response.message + ' '
    onChange(newValue)
    setShowDropdown(false)

    // Focus input and move cursor to end
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(newValue.length, newValue.length)
      }
    }, 0)
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        ref={inputRef}
      />
      {showDropdown && !loading && filteredResponses.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            zIndex: 1000,
          }}
        >
          {filteredResponses.map((resp) => (
            <li
              key={resp.id}
              style={{
                padding: '8px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
              }}
              onMouseDown={(e) => {
                e.preventDefault() // prevent blur
                handleSelect(resp)
              }}
            >
              {resp.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
