import React, { useEffect, useMemo, useState } from 'react';
import { useAuthShared } from '@/hooks/useAuthShared';
import { getAssignmentHistory, type AssignmentEntry } from '../../api/agentService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { ConversationListItem } from '../../api/Chat/chatService';

interface ConversationDetailsPanelProps {
  conversationId: string;
  conversation?: ConversationListItem | null;
}

const ConversationDetailsPanel: React.FC<ConversationDetailsPanelProps> = ({ conversationId, conversation }) => {
  const { user, getAccessTokenSilently } = useAuthShared();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AssignmentEntry[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const token = await getAccessTokenSilently();
        const data = await getAssignmentHistory(conversationId, token);
        if (mounted) setHistory(data);
      } catch (err: any) {
        if (mounted) setError(err?.response?.data?.message || 'Failed to load assignment history');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [conversationId, getAccessTokenSilently]);

  const currentAssignee = useMemo(() => {
    // Assuming the last entry without unassignedAt is current, else the last by assignedAt
    const active = history.find((h) => !h.unassignedAt);
    if (active) return active.agent;
    if (history.length > 0) return history[history.length - 1].agent;
    return undefined;
  }, [history]);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Guest profile summary */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            {getInitials(conversation?.guestName || conversation?.guestId || 'Guest')}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="font-medium truncate">{conversation?.guestName || (conversation?.guestId ? `Guest ${conversation.guestId.slice(0, 8)}` : 'Guest User')}</div>
          {conversation?.guestId && (
            <div className="text-muted-foreground text-sm truncate">{conversation.guestId}</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Conversation ID:</span>
        <code className="px-1.5 py-0.5 bg-muted rounded text-xs truncate">{conversationId}</code>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <div className="text-muted-foreground">Created at</div>
          <div className="font-medium">{conversation?.createdAt ? new Date(conversation.createdAt).toLocaleString() : 'null'}</div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground">Updated at</div>
          <div className="font-medium">{conversation?.updatedAt ? new Date(conversation.updatedAt).toLocaleString() : 'null'}</div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground">Guest email</div>
          <div className="font-medium">{conversation?.guest?.email ?? 'null'}</div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground">Guest phone</div>
          <div className="font-medium">{(conversation as any)?.guest?.phoneNumber ?? 'null'}</div>
        </div>
      </div>

      {currentAssignee && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Assigned to</Badge>
          <span className="font-medium">{currentAssignee.name || currentAssignee.email || 'Agent'}</span>
        </div>
      )}

      <Separator />

      <div className="font-semibold">Assignment history</div>

      {loading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-4/6" />
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="text-sm text-muted-foreground">No assignments yet.</div>
      )}

      {!loading && !error && history.length > 0 && (
        <ul className="space-y-3">
          {history.map((entry) => {
            const ts = new Date(entry.timestamp).toLocaleString();
            const assignedByDisplay = entry.assignedBy?.name || entry.assignedBy?.email || 'null';
            return (
              <li key={entry.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarFallback>
                    {getInitials(entry.agent.name || entry.agent.email || 'A')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="text-sm">
                    <span className="font-medium">{entry.agent.name || entry.agent.email || 'Agent'}</span>
                    <span className="ml-2 inline-block rounded px-1.5 py-0.5 text-xs bg-muted text-muted-foreground">
                      {entry.action}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {ts}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    by: {assignedByDisplay}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default ConversationDetailsPanel;


