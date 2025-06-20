import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { PermissionHistory } from "../types";

export function PermissionHistorys({ history }: { history: PermissionHistory[] }) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-4">Permission Changes</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Changed At</TableHead>
            <TableHead>Changes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{new Date(entry.changedAt).toLocaleString()}</TableCell>
              <TableCell>
                <div className="space-y-2">
                  {Object.entries(entry.changes.previous).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <span className="font-medium mr-2">{key}:</span>
                      <Badge variant={value ? "default" : "destructive"}>
                        {value ? "Enabled" : "Disabled"}
                      </Badge>
                      <span className="mx-2">→</span>
                      <Badge 
                        variant={entry.changes.current[key] ? "default" : "destructive"}
                      >
                        {entry.changes.current[key] ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}