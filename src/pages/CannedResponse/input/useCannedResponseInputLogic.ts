// src/hooks/useCannedResponseInputLogic.ts
import { useState, useEffect, useRef } from 'react'
import { useCannedResponses, type CannedResponse } from '../useCannedResponses'

type UseCannedResponseInputLogicReturn = {
  showDropdown: boolean
  filteredResponses: CannedResponse[]
  inputRef: React.RefObject<HTMLInputElement | null>  // allow null here
  handleSelect: (
    response: CannedResponse,
    value: string,
    onChange: (val: string) => void
  ) => void
}

export function useCannedResponseInputLogic(
  value: string,
  onChange: (val: string) => void
): UseCannedResponseInputLogicReturn {
  const { responses, loading } = useCannedResponses()
  const [showDropdown, setShowDropdown] = useState(false)
  const [filter, setFilter] = useState('')
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
  const handleSelect = (
    response: CannedResponse,
    currentValue: string,
    onChangeCallback: (val: string) => void
  ) => {
    const lastSlashIndex = currentValue.lastIndexOf('/')
    if (lastSlashIndex === -1) return

    const newValue = currentValue.substring(0, lastSlashIndex) + response.message + ' '
    onChangeCallback(newValue)

    setShowDropdown(false)

    // Focus input and move cursor to end
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(newValue.length, newValue.length)
      }
    }, 0)
  }

  return { showDropdown, filteredResponses, inputRef, handleSelect }
}
