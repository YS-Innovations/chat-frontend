import type { PermissionTemplate } from "../types/types";

export async function fetchTemplates(token: string): Promise<PermissionTemplate[]> {
  const res = await fetch('http://localhost:3000/templates', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function fetchUser(token: string, userId: string) {
  const res = await fetch(`http://localhost:3000/auth/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function fetchUserPermissions(token: string, userId: string): Promise<{ permissions: string[] }> {
  const res = await fetch(`http://localhost:3000/auth/permissions/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch user permissions');
  return res.json();
}

export async function saveUserPermissions(token: string, userId: string, permissions: string[]) {
  const res = await fetch(`http://localhost:3000/auth/permissions/${userId}`, {
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
