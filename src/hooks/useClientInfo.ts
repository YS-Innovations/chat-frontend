import { useEffect } from "react";
import { UAParser } from "ua-parser-js";

export default function useClientInfo(user: any) {
  useEffect(() => {
    const fetchClientInfo = async () => {
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
          fetch("http://localhost:3000/auth/save-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...user,
              clientInfo,
            }),
          }).catch(console.error);
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
          fetch("http://localhost:3000/auth/save-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...user,
              clientInfo,
            }),
          }).catch(console.error);
        }
      }
    };

    if (user) fetchClientInfo();
  }, [user]);
}
