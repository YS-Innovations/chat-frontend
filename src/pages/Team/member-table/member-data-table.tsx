import { usePermissions } from "@/context/permissions"
import type { Member } from "../types/types"
import { columns } from "./components/table-column"
import { DataTable } from "@/components/data-table/data-table"
import { EmptyState } from "../../../components/data-table/empty-state"
import { type SortingState } from "@tanstack/react-table"

interface MemberDataTableProps {
  members: Member[]
  totalCount: number
  loading: boolean
  error: string | null
  onSelect: (member: Member) => void
  searchQuery: string
  setSearchQuery: React.Dispatch<React.SetStateAction<string>> // Add this line
  pageIndex: number
  pageSize: number
  setPageIndex: (index: number) => void
  setPageSize: (size: number) => void
  sorting: SortingState
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>
  selectedRoles: string[]
  setSelectedRoles: React.Dispatch<React.SetStateAction<string[]>>
  clearAllFilters: () => void
}

const ROLE_OPTIONS = [
  { value: 'OWNER', display: 'Owner' },
  { value: 'ADMIN', display: 'Admin' },
  { value: 'AGENT', display: 'Agent' },
];

export function MemberDataTable({
  members,
  totalCount,
  loading,
  error,
  onSelect,
  searchQuery,
  setSearchQuery, // Add this destructuring
  pageIndex,
  pageSize,
  setPageIndex,
  setPageSize,
  sorting,
  setSorting,
  selectedRoles,
  setSelectedRoles,
  clearAllFilters,
}: MemberDataTableProps) {
  const { hasPermission, role } = usePermissions()
  
  const filters = [
    ...(searchQuery ? [{
      label: `Search: "${searchQuery}"`,
      onRemove: () => setSearchQuery('')
    }] : []),
    ...selectedRoles.map(role => ({
      label: `Role: ${ROLE_OPTIONS.find(r => r.value === role)?.display || role}`,
      onRemove: () => setSelectedRoles(prev => prev.filter(r => r !== role))
    })),
    ...sorting.map(sort => ({
      label: `${sort.id} (${sort.desc ? 'Desc' : 'Asc'})`,
      onRemove: () => setSorting(prev => prev.filter(s => s.id !== sort.id))
    }))
  ];

  const handleRowSelect = (member: Member) => {
    if (role === 'OWNER' || hasPermission('member-details')) {
      onSelect(member)
    }
  }

  return (
    <DataTable<Member>
      columns={columns}
      data={members}
      totalCount={totalCount}
      loading={loading}
      error={error}
      onRowSelect={handleRowSelect}
      pageIndex={pageIndex}
      pageSize={pageSize}
      setPageIndex={setPageIndex}
      setPageSize={setPageSize}
      sorting={sorting}
      setSorting={setSorting}
      filters={filters}
      onClearAllFilters={clearAllFilters}
      enableRowSelection={true}
      emptyState={
        <EmptyState
          hasSearch={!!searchQuery}
          hasFilters={selectedRoles.length > 0 || sorting.length > 0}
          onClearFilters={clearAllFilters}
        />
      }
    />
  );
}