// src/components/CannedResponseInput.tsx
import React, { type ChangeEvent, type KeyboardEvent } from 'react'
import { useCannedResponseInputLogic } from './useCannedResponseInputLogic'

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
  const { showDropdown, filteredResponses, inputRef, handleSelect } = useCannedResponseInputLogic(value, onChange)

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
      {showDropdown && filteredResponses.length > 0 && (
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
                handleSelect(resp, value, onChange)
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
