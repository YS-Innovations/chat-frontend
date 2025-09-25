// src/pages/chat/components/ConversationList/AgentAssignmentDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, User, UserCheck, UserX } from 'lucide-react';
import { useAgentAssignment } from '../../hooks/useAgentAssignment';
import type { Agent } from '../../types/AgentTypes';

interface AgentAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  currentAgent?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  onAssignmentChange?: () => void;
}

const AgentAssignmentDialog: React.FC<AgentAssignmentDialogProps> = ({
  open,
  onOpenChange,
  conversationId,
  currentAgent,
  onAssignmentChange,
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const { fetchAvailableAgents, assignAgent, loading, error } = useAgentAssignment();

  useEffect(() => {
    if (open) {
      loadAgents();
      setSelectedAgentId(currentAgent?.id || null);
    }
  }, [open, currentAgent]);

  const loadAgents = async () => {
    try {
      const availableAgents = await fetchAvailableAgents();
      setAgents(availableAgents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedAgentId) return;

    try {
      await assignAgent(conversationId, selectedAgentId);
      onAssignmentChange?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to assign agent:', error);
    }
  };

  const handleUnassign = async () => {
    try {
      // You'll need to add unassign functionality to the hook
      // For now, we'll just close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to unassign agent:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentAgent ? 'Reassign Agent' : 'Assign Agent'}
          </DialogTitle>
          <DialogDescription>
            {currentAgent 
              ? `Currently assigned to ${currentAgent.name || currentAgent.email}`
              : 'Select an agent to assign to this conversation'
            }
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Available Agents</label>
            <div className="border rounded-md max-h-60 overflow-y-auto">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                    selectedAgentId === agent.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedAgentId(agent.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">
                    {agent.name ? getInitials(agent.name) : <User className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{agent.name || 'Unknown Agent'}</div>
                    <div className="text-sm text-gray-500 truncate">{agent.email}</div>
                    <div className="text-xs text-gray-400 capitalize">{agent.role.toLowerCase()}</div>
                  </div>
                  {selectedAgentId === agent.id && (
                    <UserCheck className="w-4 h-4 text-green-500" />
                  )}
                </div>
              ))}
              
              {agents.length === 0 && !loading && (
                <div className="p-4 text-center text-gray-500">
                  No agents available
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            {currentAgent && (
              <Button
                variant="outline"
                onClick={handleUnassign}
                disabled={loading}
              >
                <UserX className="w-4 h-4 mr-2" />
                Unassign
              </Button>
            )}
            <Button
              onClick={handleAssignAgent}
              disabled={loading || !selectedAgentId}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {currentAgent ? 'Reassign' : 'Assign'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default AgentAssignmentDialog;