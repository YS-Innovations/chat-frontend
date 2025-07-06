export interface InviteUserPayload {
  email: string;
  role: string;
  permissions: Record<string, boolean>;
  token: string;
}

export async function sendInvite({
  email,
  role,
  permissions,
  token,
}: InviteUserPayload): Promise<Response> {
  return fetch('http://localhost:3000/auth/invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, role, permissions }),
  });
}
