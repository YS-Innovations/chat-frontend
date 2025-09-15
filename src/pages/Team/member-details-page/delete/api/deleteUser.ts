const backendUrl = import.meta.env.VITE_BACKEND_URL;

export async function deleteUser(userId: string, token: string): Promise<void> {
  const response = await fetch(`${backendUrl}/auth/members/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.message || 'Failed to delete user');
  }
}
