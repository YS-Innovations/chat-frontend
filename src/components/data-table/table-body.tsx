"use client"

import { TableBody as UITableBody, TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { flexRender, type Table } from "@tanstack/react-table"

interface TableBodyProps<TData> {
  table: Table<TData>
  loading: boolean
  onRowClick?: (item: TData) => void
}

export function TableBody<TData>({ table, loading, onRowClick }: TableBodyProps<TData>) {
  return (
    <UITableBody>
      {loading ? (
        [...Array(5)].map((_, i) => (
          <TableRow key={i}>
            {table.getAllColumns().map(column => (
              <TableCell key={column.id}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            onClick={() => onRowClick?.(row.original)}
            className={onRowClick ? 'hover:bg-muted/50 cursor-pointer' : ''}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell 
            colSpan={table.getAllColumns().length} 
            className="h-24 text-center"
          >
            No results found
          </TableCell>
        </TableRow>
      )}
    </UITableBody>
  )
}
