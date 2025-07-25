import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import type { Member } from "../../types/types";
import { useSocket } from "@/context/SocketContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { UserStatusSwitch } from "./UserStatusSwitch";
import { DeleteUserButton } from "../../member-details-page/delete/components/DeleteUserButton";
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
    id: "name",
    header: "Name",
    accessorFn: (row) => `${row.name} ${row.email}`,
    cell: ({ row }) => {
      const { userStatuses } = useSocket();
      const isOnline = userStatuses[row.original.id]?.isOnline ?? false;

      return (
        <div className="flex items-center gap-x-3">
          <div className="relative">
            <Avatar className="h-8 w-8">
              {row.original.picture ? (
                <AvatarImage
                  src={row.original.picture}
                  alt={row.original.name || row.original.email}
                />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(row.original.name || row.original.email)}
                </AvatarFallback>
              )}
            </Avatar>
            <span
              className={cn(
                "absolute bottom-0 right-0 block rounded-full border-2 border-background",
                "h-2.5 w-2.5",
                isOnline ? "bg-green-500" : "bg-gray-400"
              )}
              title={isOnline ? "Online" : "Offline"}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium">{row.original.name || "No name"}</span>
              {isOnline && (
                <span className="text-xs text-green-600 font-medium">Online</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    id: "role",
    header: ({ column, table }) => {
      const sorting = table.getState().sorting;
      const sortIndex = sorting.findIndex((s) => s.id === column.id);
      const isSorted = sortIndex > -1;
      const sortDirection = isSorted ? (sorting[sortIndex].desc ? "desc" : "asc") : null;

      return (
        <div
          className="flex items-center space-x-1 cursor-pointer select-none"
          onClick={column.getToggleSortingHandler()}
        >
          <span>Role</span>
          {isSorted && (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              {sortDirection === "asc" ? "▲" : "▼"}
              <span className="text-[10px]">{sortIndex + 1}</span>
            </div>
          )}
        </div>
      );
    },
    cell: ({ row }) => (
      <Badge variant={row.original.role === "OWNER" ? "destructive" : "default"}>
        {row.original.role}
      </Badge>
    ),
    accessorFn: (row) => row.role,
  },
  {
    id: "lastLogin",
    header: ({ column, table }) => {
      const sorting = table.getState().sorting;
      const sortIndex = sorting.findIndex((s) => s.id === column.id);
      const isSorted = sortIndex > -1;
      const sortDirection = isSorted ? (sorting[sortIndex].desc ? "desc" : "asc") : null;

      return (
        <div
          className="flex items-center space-x-1 cursor-pointer select-none"
          onClick={column.getToggleSortingHandler()}
        >
          <span>Last Login</span>
          {isSorted && (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              {sortDirection === "asc" ? "▲" : "▼"}
              <span className="text-[10px]">{sortIndex + 1}</span>
            </div>
          )}
        </div>
      );
    },
    cell: ({ row }) =>
      row.original.lastLogin
        ? new Date(row.original.lastLogin).toLocaleString()
        : "Never",
    accessorFn: (row) => row.lastLogin,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <UserStatusSwitch member={row.original} />,
    enableSorting: false,
  },
{
  id: "actions",
  cell: ({ row }) => {
    const member = row.original;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit</DropdownMenuItem>

          <DropdownMenuItem asChild onClick={e => e.stopPropagation()}>
            <DeleteUserButton
              userId={member.id}
              userRole={member.role}
              onSuccess={() => {}}
              className="w-full text-left" 
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
  enableSorting: false,
}


];