import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { UserLoginHistory } from "../types";

export function LoginHistory({ history }: { history: UserLoginHistory[] }) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-4">Login History</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Login Time</TableHead>
            <TableHead>Logout Time</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Browser</TableHead>
            <TableHead>os</TableHead>
            <TableHead>device Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{new Date(entry.lastLogin).toLocaleString()}</TableCell>
              <TableCell>
                {entry.lastLogoutAt 
                  ? new Date(entry.lastLogoutAt).toLocaleString() 
                  : 'Active session'}
              </TableCell>
              <TableCell>{entry.lastIp}</TableCell>
              <TableCell>{entry.browserName}</TableCell>
              <TableCell>{entry.os}</TableCell>
              <TableCell>{entry.deviceType}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}