const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const blockUser = async (userId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/block/${userId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to block user');
  }

  return response.json();
};

export const unblockUser = async (userId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/unblock/${userId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to unblock user');
  }

  return response.json();
};