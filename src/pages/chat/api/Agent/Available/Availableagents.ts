import axios from 'axios';
import type { Agent } from '../../../types/AgentTypes';

const API_BASE = import.meta.env.VITE_BACKEND_URL;
if (!API_BASE) {
  throw new Error('VITE_BACKEND_URL is not defined');
}

export async function getAvailableAgents(token: string): Promise<Agent[]> {
  const res = await axios.get<Agent[]>(`${API_BASE}/conversations/available-agents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
