export interface InviteUserPayload {
  email: string;
  role: string;
  permissions: Record<string, boolean>;
  token: string;
}
const backendUrl = import.meta.env.VITE_BACKEND_URL;
export async function sendInvite({
  email,
  role,
  permissions,
  token,
}: InviteUserPayload): Promise<Response> {
  return fetch(`${backendUrl}/auth/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, role, permissions }),
  });
}
