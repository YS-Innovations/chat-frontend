import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import type { Member } from "../../types/types";
import { useSocket } from "@/context/SocketContext";
import { StatusDot } from "@/components/StatusDot";

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
  cell: ({ row }) => {
    const { userStatuses } = useSocket();
    const isOnline = userStatuses[row.original.id]?.isOnline ?? false;

    return (
      <div className="relative flex items-center gap-x-2">
        <Avatar className="relative h-8 w-8">
          {row.original.picture ? (
            <AvatarImage src={row.original.picture} alt={row.original.name || row.original.email} />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(row.original.name || row.original.email)}
            </AvatarFallback>
          )}
          <StatusDot isOnline={isOnline} />
        </Avatar>
        <div>
          <div className="font-medium">{row.original.name || "No name"}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
          {userStatuses[row.original.id] && (
                <p className="text-xs font-bold">
                  {userStatuses[row.original.id].isOnline
                    ? <span className="text-green-600">Online now</span>
                    : null
                    //  userStatuses[row.original.id].lastSeen
                    //   ? `Last seen: ${new Date(userStatuses[row.original.id].lastSeen!).toLocaleTimeString()}`
                    //   : 'Offline'
                      }
                </p>
              )}
        </div>
      </div>
    );
  },
},

  {
    accessorKey: "role",
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
  },

  {
    accessorKey: "lastLogin",
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
        ? new Date(row.original.lastLogin).toLocaleDateString()
        : "Never",
  },

  {
    accessorKey: "status",
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
          <span>Status</span>
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
      <Badge variant={row.original.blocked ? "destructive" : "default"}>
        {row.original.blocked ? "Blocked" : "Active"}
      </Badge>
    ),
  },
];
