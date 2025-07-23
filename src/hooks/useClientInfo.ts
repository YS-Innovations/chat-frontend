import { useEffect, useCallback, useRef } from "react";
import { UAParser } from "ua-parser-js";

export default function useClientInfo(user: { id?: string; [key: string]: any }) {
  const lastUserIdRef = useRef<string | null>(null);

  const fetchClientInfo = useCallback(async () => {
    try {
      // Get client IP address
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      const clientIp = ipData.ip;

      // Parse user-agent
      const parser = new UAParser();
      const result = parser.getResult();

      const clientInfo = {
        browser: `${result.browser.name} ${result.browser.version}`,
        os: `${result.os.name} ${result.os.version || ""}`.trim(),
        deviceType: result.device.type || "desktop",
        ip: clientIp,
        rawUA: navigator.userAgent,
        loginTime: new Date().toISOString(),
      };

      // Send to backend
      await fetch("http://localhost:3000/auth/save-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...user,
          clientInfo,
        }),
      });
    } catch (error) {
      console.error("Error fetching client info:", error);

      // Fallback info if IP fetch fails
      const parser = new UAParser();
      const result = parser.getResult();

      const clientInfo = {
        browser: `${result.browser.name} ${result.browser.version}`,
        os: `${result.os.name} ${result.os.version || ""}`.trim(),
        deviceType: result.device.type || "desktop",
        ip: "unknown",
        rawUA: navigator.userAgent,
        loginTime: new Date().toISOString(),
      };

      // Still send user info without IP
      await fetch("http://localhost:3000/auth/save-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...user,
          clientInfo,
        }),
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user || !user.id) return;

    // Only fetch if this user hasn't been handled yet
    if (lastUserIdRef.current !== user.id) {
      lastUserIdRef.current = user.id;
      fetchClientInfo();
    }
  }, [user, fetchClientInfo]);
}
