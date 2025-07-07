import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { UserLoginHistory, PermissionHistory } from "../types/types";

export function useHistories(memberId: string) {
  const [loginHistory, setLoginHistory] = useState<UserLoginHistory[]>([]);
  const [permissionHistory, setPermissionHistory] = useState<PermissionHistory[]>([]);

  const fetchHistories = useCallback(async (getAccessTokenSilently: () => Promise<string>) => {
    try {
      const token = await getAccessTokenSilently();

      const [loginRes, permRes] = await Promise.all([
        fetch(`http://localhost:3000/auth/user/${memberId}/login-history`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://localhost:3000/auth/permissions/${memberId}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const [loginData, permData] = await Promise.all([
        loginRes.json(),
        permRes.json()
      ]);

      setLoginHistory(loginData);
      setPermissionHistory(permData);
    } catch (error) {
      console.error('Error fetching histories:', error);
      toast.error("Error loading history data");
    }
  }, [memberId]);

  return { loginHistory, permissionHistory, fetchHistories };
}
