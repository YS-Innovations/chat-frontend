import axios from 'axios';
import type { AssignmentEntry } from '../../../types/AgentTypes';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) {
  throw new Error('VITE_BACKEND_URL is not defined');
}


export async function assignAgentToConversation(
  conversationId: string, 
  agentId: string, 
  token: string
): Promise<any> {
  const res = await axios.patch(
    `${API_BASE}/conversations/${conversationId}/assign-agent`,
    { agentId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data;
}

export async function unassignAgentFromConversation(
  conversationId: string, 
  token: string
): Promise<any> {
  const res = await axios.patch(
    `${API_BASE}/conversations/${conversationId}/unassign-agent`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data;
}

export async function getAssignmentHistory(
  conversationId: string,
  token: string
): Promise<AssignmentEntry[]> {
  const res = await axios.get<AssignmentEntry[]>(
    `${API_BASE}/conversations/${conversationId}/assignment-history`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}