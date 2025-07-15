"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import { TablePagination } from "./table-pagination";
import { TableHeader } from "./table-header";
import { TableBody } from "./table-body";
import { SelectionStatus } from "./selection-status";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import React from "react";

export interface DataTableFilter {
  label: string;
  onRemove: () => void;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  onRowSelect?: (item: TData) => void;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  filters?: DataTableFilter[];
  onClearAllFilters?: () => void;
  enableRowSelection?: boolean;
  getRowId?: (row: TData) => string;
  emptyState?: React.ReactNode;
}

const FilterChip = ({ label, onRemove }: DataTableFilter) => (
  <div className="flex items-center gap-1 px-3 py-1 bg-white border rounded-full text-sm shadow-xs">
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="p-0.5 rounded-full hover:bg-gray-100"
      aria-label="Remove filter"
    >
      <X className="h-3 w-3" />
    </button>
  </div>
);

export function DataTable<TData>({
  columns,
  data,
  totalCount,
  loading,
  error,
  onRowSelect,
  pageIndex,
  pageSize,
  setPageIndex,
  setPageSize,
  sorting,
  setSorting,
  filters = [],
  onClearAllFilters,
  enableRowSelection = false,
  getRowId = (row: any) => row.id,
  emptyState,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    getRowId,
    enableRowSelection,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    onSortingChange: (newSorting) => {
      setSorting(newSorting);
      setPageIndex(0);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  React.useEffect(() => {
    setRowSelection({});
  }, [pageIndex, pageSize, sorting]);

  const pageCount = Math.ceil(totalCount / pageSize);

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full flex-col justify-start gap-6">
      {/* Active filters section */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Filters:</span>
          {filters.map((filter, index) => (
            <FilterChip
              key={index}
              label={filter.label}
              onRemove={filter.onRemove}
            />
          ))}
          {onClearAllFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAllFilters}
              className="text-primary hover:text-primary"
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          {/* Empty State */}
          {data.length === 0 ? (
            emptyState || (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <h3 className="text-lg font-medium mb-2">
                  No data found
                </h3>
                <p className="text-muted-foreground">
                  No records available
                </p>
              </div>
            )
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader table={table} />
                  <TableBody
                    loading={loading}
                    table={table}
                    onRowClick={onRowSelect}
                  />
                </Table>
              </div>

              <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
                {enableRowSelection && (
                  <SelectionStatus
                    selectedCount={table.getSelectedRowModel().rows.length}
                    totalCount={table.getFilteredRowModel().rows.length}
                  />
                )}
                <TablePagination
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  pageCount={pageCount}
                  setPageIndex={setPageIndex}
                  setPageSize={setPageSize}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}