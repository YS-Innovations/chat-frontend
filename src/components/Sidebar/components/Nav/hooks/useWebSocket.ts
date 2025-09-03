// src/hooks/useWebSocket.ts
import { useState, useEffect, useCallback } from 'react';
import { webSocketService } from './websocket'; // Your WebSocket service

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(webSocketService.getConnectionStatus());

  useEffect(() => {
    const handleConnectionChange = () => {
      setIsConnected(webSocketService.getConnectionStatus());
    };

    webSocketService.on('connection:established', handleConnectionChange);
    webSocketService.on('connection:lost', handleConnectionChange);

    return () => {
      webSocketService.off('connection:established', handleConnectionChange);
      webSocketService.off('connection:lost', handleConnectionChange);
    };
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    webSocketService.on(event, handler);
    return () => webSocketService.off(event, handler);
  }, []);

  const emit = useCallback((event: string, data: any) => {
    webSocketService.emit(event, data);
  }, []);

  return {
    isConnected,
    on,
    emit,
    webSocketService
  };
}