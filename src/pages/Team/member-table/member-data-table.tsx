"use client"

import * as React from "react"
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import { Table } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Member } from "../types/types"
import { columns } from "./components/table-column"
import { TablePagination } from "./components/table-pagination"
import { MemberTableHeader } from "./components/table-header"
import { MemberTableBody } from "./components/table-body"
import { SelectionStatus } from "./components/selection-status"

interface MemberDataTableProps {
  members: Member[]
  totalCount: number
  loading: boolean
  error: string | null
  onSelect: (member: Member) => void
  pageIndex: number
  pageSize: number
  setPageIndex: (index: number) => void
  setPageSize: (size: number) => void
}

export function MemberDataTable({
  members,
  totalCount,
  loading,
  error,
  onSelect,
  pageIndex,
  pageSize,
  setPageIndex,
  setPageSize
}: MemberDataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data: members,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Reset row selection when page changes
  React.useEffect(() => {
    setRowSelection({})
  }, [pageIndex, pageSize])

  // Calculate page count
  const pageCount = Math.ceil(totalCount / pageSize)

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <MemberTableHeader table={table} />
          <MemberTableBody table={table} loading={loading} onSelect={onSelect} />
        </Table>
      </div>
      
      <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <SelectionStatus 
          selectedCount={table.getFilteredSelectedRowModel().rows.length}
          totalCount={table.getFilteredRowModel().rows.length}
        />
        
        <TablePagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
        />
      </div>
    </div>
  )
}