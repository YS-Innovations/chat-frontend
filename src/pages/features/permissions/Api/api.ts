import type { PermissionTemplate } from "../types/types";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export async function fetchTemplates(token: string): Promise<PermissionTemplate[]> {
  const res = await fetch(`${backendUrl}/templates`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function fetchUser(token: string, userId: string) {
  const res = await fetch(`${backendUrl}/auth/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function fetchUserPermissions(token: string, userId: string): Promise<{ permissions: string[] }> {
  const res = await fetch(`${backendUrl}/auth/permissions/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch user permissions');
  return res.json();
}

export async function saveUserPermissions(token: string, userId: string, permissions: string[]) {
  const res = await fetch(`${backendUrl}/auth/permissions/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ permissions }),
  });
  if (!res.ok) throw new Error('Failed to save permissions');
  return res.json();
}

export async function updateTemplate(
  token: string, 
  templateId: string, 
  data: { policy: Record<string, boolean> }
) {
  const res = await fetch(`${backendUrl}/auth/permissions/templates/${templateId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update template');
  return res.json();
}

