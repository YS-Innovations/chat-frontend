"use client"

interface SelectionStatusProps {
  selectedCount: number
  totalCount: number
}

export function SelectionStatus({ selectedCount, totalCount }: SelectionStatusProps) {
  return (
    <div className="text-muted-foreground text-sm">
      {selectedCount} of {totalCount} member(s) selected.
    </div>
  )
}