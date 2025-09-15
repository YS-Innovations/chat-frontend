import { useEffect, useCallback, useRef } from "react";
import { UAParser } from "ua-parser-js";

interface User {
  id: string;
  uuid?: string;
  auth0Id?: string;
  email?: string;
  name?: string;
  nickname?: string;
  phoneNumber?: string;
  picture?: string;
  createdAt?: Date;
  updatedAt?: Date;
  organizationId?: string;
  role?: string;
  hasOnboarded?: boolean;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  blocked?: boolean | null;
  identities?: unknown; // JSON type
  metadata?: unknown;   // JSON type
  channelId?: string;
  // You can add other related fields if needed, but usually you only send what's needed
}

interface ClientInfo {
  browser: string;
  os: string;
  deviceType: string;
  ip: string;
  rawUA: string;
  loginTime: string;
}

export default function useClientInfo(user: User | null) {
  const lastUserIdRef = useRef<string | null>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const fetchClientInfo = useCallback(async () => {
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      const clientIp = ipData.ip;

      const parser = new UAParser();
      const result = parser.getResult();

      const clientInfo: ClientInfo = {
        browser: `${result.browser.name} ${result.browser.version}`,
        os: `${result.os.name} ${result.os.version || ""}`.trim(),
        deviceType: result.device.type || "desktop",
        ip: clientIp,
        rawUA: navigator.userAgent,
        loginTime: new Date().toISOString(),
      };


      if (user) {
        await fetch(`${backendUrl}/auth/save-user`, {
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

      const clientInfo: ClientInfo = {
        browser: `${result.browser.name} ${result.browser.version}`,
        os: `${result.os.name} ${result.os.version || ""}`.trim(),
        deviceType: result.device.type || "desktop",
        ip: "unknown",
        rawUA: navigator.userAgent,
        loginTime: new Date().toISOString(),
      };

      if (user) {
        await fetch(`${backendUrl}/auth/save-user`, {
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

    if (lastUserIdRef.current !== user.id) {
      lastUserIdRef.current = user.id;
      fetchClientInfo();
    }
  }, [user, fetchClientInfo]);
}
