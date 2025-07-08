"use client";

import * as React from "react";
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
} from "@tanstack/react-table";
import { Table } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Member } from "../types/types";
import { columns } from "./components/table-column";
import { TablePagination } from "./components/table-pagination";
import { MemberTableHeader } from "./components/table-header";
import { MemberTableBody } from "./components/table-body";
import { SelectionStatus } from "./components/selection-status";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MemberDataTableProps {
  members: Member[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  onSelect: (member: Member) => void;
  searchQuery: string;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  selectedRoles: string[];
  setSelectedRoles: React.Dispatch<React.SetStateAction<string[]>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>; // Added this
}

const ROLE_OPTIONS = [
  { display: 'Admin', value: 'ADMIN' },
  { display: 'Co-admin', value: 'COADMIN' },
  { display: 'Agent', value: 'AGENT' },
];

export function MemberDataTable({
  members,
  totalCount,
  loading,
  error,
  onSelect,
  searchQuery,
  pageIndex,
  pageSize,
  setPageIndex,
  setPageSize,
  sorting,
  setSorting,
  selectedRoles,
  setSelectedRoles,
  setSearchQuery, // Added this
}: MemberDataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

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
    onSortingChange: (newSorting) => {
      setSorting(newSorting);
      setPageIndex(0);
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  React.useEffect(() => {
    setRowSelection({});
  }, [pageIndex, pageSize, sorting]);

  const pageCount = Math.ceil(totalCount / pageSize);

  const removeRole = (role: string) => {
    setSelectedRoles(prev => prev.filter(r => r !== role));
    setPageIndex(0);
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!loading && members.length === 0) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          No results{searchQuery ? ` found for "${searchQuery}"` : ""}.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full flex-col justify-start gap-6">
      {/* Active filters section */}
      {(searchQuery || selectedRoles.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
          
          {searchQuery && (
            <div className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm flex items-center">
              Search: {searchQuery}
              <X 
                className="ml-2 h-3 w-3 cursor-pointer" 
                onClick={() => {
                  setSearchQuery('');
                  setPageIndex(0);
                }}
              />
            </div>
          )}
          
          {selectedRoles.map(role => {
            const displayName = ROLE_OPTIONS.find(r => r.value === role)?.display || role;
            return (
              <div 
                key={role} 
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm flex items-center"
              >
                Role: {displayName}
                <X 
                  className="ml-2 h-3 w-3 cursor-pointer" 
                  onClick={() => removeRole(role)}
                />
              </div>
            );
          })}
          
          {(searchQuery || selectedRoles.length > 0) && (
            <Button 
              variant="link" 
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedRoles([]);
                setPageIndex(0);
              }}
              className="text-destructive"
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <MemberTableHeader table={table} searchQuery={searchQuery} />
          <MemberTableBody
            table={table}
            loading={loading}
            onSelect={onSelect}
            searchQuery={searchQuery}
          />
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
  );
}