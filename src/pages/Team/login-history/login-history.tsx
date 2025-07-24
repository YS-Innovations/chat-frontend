// src/pages/contacts/components/login-history/login-history.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import type { UserLoginHistory } from "../types/types";
import { useAuth0 } from "@auth0/auth0-react";

interface LoginHistoryProps {
  history: UserLoginHistory[];
  total: number;
  memberId: string;
}

export function LoginHistory({ history, total, memberId }: LoginHistoryProps) {
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [displayedHistory, setDisplayedHistory] = useState(history);
  const itemsPerPage = 5;
  const hasMore = page * itemsPerPage < total;
  const { getAccessTokenSilently } = useAuth0();
  
  // Use ref to track if we're already loading more
  const isLoadingMoreRef = useRef(false);

  const loadMore = async () => {
    if (isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const token = await getAccessTokenSilently();
      const nextPage = page + 1;
      const res = await fetch(
        `http://localhost:3000/auth/user/${memberId}/login-history?skip=${(nextPage - 1) * itemsPerPage}&take=${itemsPerPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!res.ok) throw new Error('Failed to fetch more history');
      
      const data = await res.json();
      setDisplayedHistory(prev => [...prev, ...data.history]);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      isLoadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Login History</h3>
        {total > itemsPerPage && (
          <p className="text-sm text-muted-foreground">
            Showing {displayedHistory.length} of {total} entries
          </p>
        )}
      </div>
      
      {displayedHistory.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No login history available.
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Login Time</TableHead>
                <TableHead>Logout Time</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Browser</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Device Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {new Date(entry.lastLogin).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {entry.lastLogoutAt
                      ? new Date(entry.lastLogoutAt).toLocaleString()
                      : "Active session"}
                  </TableCell>
                  <TableCell>{entry.lastIp}</TableCell>
                  <TableCell>{entry.browserName}</TableCell>
                  <TableCell>{entry.os}</TableCell>
                  <TableCell>{entry.deviceType}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Show More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}