import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./empty-state";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import type { Member } from "../types/types";
import { columns } from "./components/table-column";
import { TablePagination } from "./components/table-pagination";
import { MemberTableHeader } from "./components/table-header";
import { MemberTableBody } from "./components/table-body";
import { SelectionStatus } from "./components/selection-status";
import {
  useReactTable,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import React from "react";

const ROLE_OPTIONS = [
  { value: 'ADMIN', display: 'Admin' },
  { value: 'COADMIN', display: 'Co-admin' },
  { value: 'AGENT', display: 'Agent' },
];

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
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  clearAllFilters: () => void;
}

const FilterChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
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
  setSearchQuery,
  clearAllFilters,
  
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
    getRowId: (row) => row.id,
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
      {(searchQuery || selectedRoles.length > 0 || sorting.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Filters:</span>
          
          {searchQuery && (
            <FilterChip 
              label={`Search: "${searchQuery}"`}
              onRemove={() => {
                setSearchQuery('');
                setPageIndex(0);
              }}
            />
          )}
          
          {selectedRoles.map(role => (
            <FilterChip
              key={role}
              label={`Role: ${ROLE_OPTIONS.find(r => r.value === role)?.display || role}`}
              onRemove={() => {
                setSelectedRoles(prev => prev.filter(r => r !== role));
                setPageIndex(0);
              }}
            />
          ))}
          
{sorting.map(sort => (
  <FilterChip
    key={sort.id}
    label={`${sort.id} (${sort.desc ? 'Desc' : 'Asc'})`}
    onRemove={() => {
      setSorting(prev => prev.filter(s => s.id !== sort.id));
      setPageIndex(0);
    }}
  />
))}


          
          <Button 
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-primary hover:text-primary"
          >
            Clear all
          </Button>
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
          {members.length === 0 ? (
            <EmptyState 
              hasSearch={!!searchQuery}
              hasFilters={selectedRoles.length > 0 || sorting.length > 0}
              onClearFilters={clearAllFilters}
            />
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <MemberTableHeader table={table} />
                  <MemberTableBody
                  loading={loading}
                    table={table}
                    onSelect={onSelect}
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
            </>
          )}
        </>
      )}
    </div>
  );
}