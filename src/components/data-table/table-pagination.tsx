"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react"

interface TablePaginationProps {
  pageIndex: number
  pageSize: number
  pageCount: number
  setPageIndex: (index: number) => void
  setPageSize: (size: number) => void
}

export function TablePagination({
  pageIndex,
  pageSize,
  pageCount,
  setPageIndex,
  setPageSize,
}: TablePaginationProps) {
  const canPrevious = pageIndex > 0
  const canNext = pageIndex < pageCount - 1

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex items-center gap-2">
        <Label htmlFor="rows-per-page" className="text-sm font-medium">
          Rows per page
        </Label>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            setPageSize(Number(value))
            setPageIndex(0)
          }}
        >
          <SelectTrigger size="sm" className="w-20" id="rows-per-page">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center justify-center text-sm font-medium">
        Page {pageIndex + 1} of {pageCount}
      </div>
      
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          className="hidden size-8 p-0 sm:flex"
          onClick={() => setPageIndex(0)}
          disabled={!canPrevious}
        >
          <span className="sr-only">Go to first page</span>
          <IconChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="size-8"
          size="icon"
          onClick={() => setPageIndex(pageIndex - 1)}
          disabled={!canPrevious}
        >
          <span className="sr-only">Go to previous page</span>
          <IconChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="size-8"
          size="icon"
          onClick={() => setPageIndex(pageIndex + 1)}
          disabled={!canNext}
        >
          <span className="sr-only">Go to next page</span>
          <IconChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden size-8 sm:flex"
          size="icon"
          onClick={() => setPageIndex(pageCount - 1)}
          disabled={!canNext}
        >
          <span className="sr-only">Go to last page</span>
          <IconChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}