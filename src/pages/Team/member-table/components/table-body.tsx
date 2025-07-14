"use client"

import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { usePermissions } from "@/context/permissions"
import type { Member } from "../../types/types"
import { flexRender, type Table } from "@tanstack/react-table"

interface TableBodyProps {
  table: Table<Member>
  loading: boolean
  searchQuery?: string;
  onSelect: (member: Member) => void
}

export function MemberTableBody({ table, loading, onSelect }: TableBodyProps) {
  const { hasPermission, role } = usePermissions()

  const onRowClick = (member: Member) => {
    if (role === 'OWNER' || hasPermission('member-details')) {
      onSelect(member)
    }
  }

  return (
    <TableBody>
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
            onClick={() => onRowClick(row.original)}
            className={`
              transition-colors
              ${(role === 'OWNER' || hasPermission('member-details')) 
                ? 'hover:bg-muted/50 cursor-pointer' 
                : ''}
            `}
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
            No members found
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  )
}