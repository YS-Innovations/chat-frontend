// src/components/CannedResponseInput.tsx
import React, { type ChangeEvent, type KeyboardEvent } from 'react'
import { useCannedResponseInputLogic } from './useCannedResponseInputLogic'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

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
    <div className="relative w-full">
      {/* Dropdown list appears above this input */}
      {showDropdown && filteredResponses.length > 0 && (
        <ul
          className={cn(
            'absolute bottom-full left-0 right-0 z-50 mb-2 max-h-60 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-lg',
            'animate-in fade-in-0 slide-in-from-bottom-1 transition-all duration-200 ease-out'
          )}
        >
          {filteredResponses.map((resp) => (
            <li
              key={resp.id}
              className={cn(
                'cursor-pointer select-none px-4 py-2 text-sm transition-colors duration-150',
                'hover:bg-muted hover:text-foreground border-b last:border-b-0 border-border'
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(resp, value, onChange)
              }}
            >
              {resp.name}
            </li>
          ))}
        </ul>
      )}

      <Input
        type="text"
        ref={inputRef}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          'w-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          className
        )}
      />
    </div>
  )
}
