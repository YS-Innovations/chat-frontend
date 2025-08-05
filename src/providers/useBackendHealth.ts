// useBackendHealth.ts
import { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function useBackendHealth() {
  const [isBackendUp, setIsBackendUp] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/health`);
        if (response.ok) {
          const data = await response.json();
          setIsBackendUp(data.status === 'ok');
        } else {
          setIsBackendUp(false);
        }
      } catch (error) {
        setIsBackendUp(false);
      } finally {
        setChecking(false);
      }
    };

    checkBackend();
  }, []);

  return { isBackendUp, checking };
}