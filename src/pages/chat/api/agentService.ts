// src/pages/chat/api/agentService.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) {
  throw new Error('VITE_BACKEND_URL is not defined');
}

export interface Agent {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
}

export interface AssignAgentRequest {
  agentId: string;
}

export async function getAvailableAgents(token: string): Promise<Agent[]> {
  const res = await axios.get<Agent[]>(`${API_BASE}/conversations/available-agents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
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