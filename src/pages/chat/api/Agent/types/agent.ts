// src/types/agent.ts
export interface Agent {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
}

export interface AssignAgentRequest {
  agentId: string;
}

export interface AssignmentEntry {
  id: string;
  action: 'ASSIGNED' | 'UNASSIGNED';
  timestamp: string; // ISO string
  agent: Pick<Agent, 'id' | 'name' | 'email'>;
  assignedBy?: { id: string; name: string | null; email: string | null } | null;
}
