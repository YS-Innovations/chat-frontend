import type { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"
import type { Member } from "../../types/types"
import { ArrowUpDown } from "lucide-react"

export const columns: ColumnDef<Member>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "name",
    header: ({ column }) => (
      <div
        className="flex items-center space-x-1 cursor-pointer select-none"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Member</span>
        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        <Avatar className="h-8 w-8">
          {row.original.picture && (
            <AvatarImage
              src={row.original.picture}
              alt={row.original.name || row.original.email}
            />
          )}
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(row.original.name || row.original.email)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.original.name || "No name"}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
    enableHiding: false,
  },

  {
    accessorKey: "role",
    header: ({ column }) => (
      <div
        className="flex items-center space-x-1 cursor-pointer select-none"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Role</span>
        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
      </div>
    ),
    cell: ({ row }) => (
      <Badge variant={row.original.role === "ADMIN" ? "destructive" : "default"}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "lastLogin",
    header: ({ column }) => (
      <div
        className="flex items-center space-x-1 cursor-pointer select-none"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Last Login</span>
        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
      </div>
    ),
    cell: ({ row }) =>
      row.original.lastLogin
        ? new Date(row.original.lastLogin).toLocaleDateString()
        : "Never",
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div
        className="flex items-center space-x-1 cursor-pointer select-none"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Status</span>
        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
      </div>
    ),
    cell: ({ row }) => (
      <Badge variant={row.original.blocked ? "destructive" : "default"}>
        {row.original.blocked ? "Blocked" : "Active"}
      </Badge>
    ),
  },
];