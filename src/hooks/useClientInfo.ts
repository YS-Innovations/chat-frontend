import { useEffect, useCallback, useRef } from "react";
import { UAParser } from "ua-parser-js";

export default function useClientInfo(user: any) {
  const lastUserIdRef = useRef<any>(null);

  const fetchClientInfo = useCallback(async () => {
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      const clientIp = ipData.ip;

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

      if (user) {
        await fetch("http://localhost:3000/auth/save-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...user,
            clientInfo,
          }),
        });
      }
    } catch (error) {
      console.error("Error getting client info:", error);

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

      if (user) {
        await fetch("http://localhost:3000/auth/save-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...user,
            clientInfo,
          }),
        });
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Assuming user has an 'id' property you can uniquely identify
    if (lastUserIdRef.current !== user.id) {
      lastUserIdRef.current = user.id;
      fetchClientInfo();
    }
    // else: same user id, do not re-fetch
  }, [user, fetchClientInfo]);
}
