"use client"

import { TableHeader, TableHead, TableRow } from "@/components/ui/table"
import { flexRender } from "@tanstack/react-table"
import type { Table } from "@tanstack/react-table"
import type { Member } from "../../types/types"

interface TableHeaderProps {
  table: Table<Member>
  searchQuery?: string;
}

export function MemberTableHeader({ table }: TableHeaderProps) {
  return (
    <TableHeader className="bg-muted sticky top-0 z-10">
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id} colSpan={header.colSpan}>
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  )
}