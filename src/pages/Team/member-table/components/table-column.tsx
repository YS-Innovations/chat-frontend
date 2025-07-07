import type { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"
import type { Member } from "../../types"

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
        accessorKey: "avatar",
        header: "",
        cell: ({ row }) => (
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
        ),
    },
    {
        accessorKey: "name",
        header: "Member",
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.name || "No name"}</div>
                <div className="text-sm text-muted-foreground">{row.original.email}</div>
            </div>
        ),
        enableHiding: false,
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
            <Badge variant={row.original.role === "ADMIN" ? "destructive" : "default"}>
                {row.original.role}
            </Badge>
        ),
    },
    {
        accessorKey: "lastLogin",
        header: "Last Login",
        cell: ({ row }) =>
            row.original.lastLogin
                ? new Date(row.original.lastLogin).toLocaleDateString()
                : "Never",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.original.blocked ? "destructive" : "default"}>
                {row.original.blocked ? "Blocked" : "Active"}
            </Badge>
        ),
    },
]
