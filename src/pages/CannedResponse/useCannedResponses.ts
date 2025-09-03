// src/hooks/useCannedResponses.ts
import { useState, useEffect, useCallback } from 'react'
import { useAuthShared } from '@/hooks/useAuthShared'
import { toast } from 'sonner'
import axios from 'axios'
import { io, Socket } from 'socket.io-client';
export type CannedResponse = {
  id: string
  name: string
  message: string
  visibility: 'PUBLIC' | 'PRIVATE'
  createdAt: string
  updatedAt: string
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private eventHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private isConnected = false;

  constructor() {
    this.connect();
  }

  connect() {
    try {
      // Use the same origin as your API with Socket.io path
      const socketUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
      this.socket = io(socketUrl, {
        path: '/socket.io', // This is the default Socket.io path
        transports: ['websocket', 'polling'] // Fallback to polling if websocket fails
      });

      this.socket.on('connect', () => {
        console.log('Socket.io connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emitEvent('connection:established', { timestamp: Date.now() });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket.io disconnected:', reason);
        this.isConnected = false;
        this.emitEvent('connection:lost', { timestamp: Date.now(), reason });
        this.handleReconnection();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error);
        this.emitEvent('connection:error', { error });
      });

      // Listen for all events from server
      this.socket.onAny((event, data) => {
        this.handleMessage({ type: event, data });
      });

    } catch (error) {
      console.error('Socket.io connection failed:', error);
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.emitEvent('connection:failed', { message: 'Max reconnection attempts reached' });
    }
  }

  private handleMessage(message: { type: string; data: any }) {
    const handlers = this.eventHandlers.get(message.type) || [];
    handlers.forEach(handler => handler(message.data));
  }

  on(event: string, handler: (data: any) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: (data: any) => void) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  emitEvent(event: string, data: any) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}
// Create a singleton instance
const webSocketService = new WebSocketService();

// Custom hook for using WebSocket
const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(webSocketService.getConnectionStatus());

  useEffect(() => {
    const handleConnectionEstablished = () => {
      setIsConnected(true);
    };

    const handleConnectionLost = () => {
      setIsConnected(false);
    };

    webSocketService.on('connection:established', handleConnectionEstablished);
    webSocketService.on('connection:lost', handleConnectionLost);

    return () => {
      webSocketService.off('connection:established', handleConnectionEstablished);
      webSocketService.off('connection:lost', handleConnectionLost);
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
};

// src/hooks/useCannedResponses.ts
export const useCannedResponses = () => {
  const { user, getAccessTokenSilently } = useAuthShared()
  const [responses, setResponses] = useState<CannedResponse[]>([])
  const [loading, setLoading] = useState(true)
  const { on } = useWebSocket();

  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true)
      const token = await getAccessTokenSilently()
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/canned-responses/available/${user?.sub}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setResponses(response.data)
    } catch (error) {
      toast.error('Failed to fetch canned responses')
      setResponses([])
    } finally {
      setLoading(false)
    }
  }, [user?.sub, getAccessTokenSilently])

  useEffect(() => {
    if (user?.sub) fetchResponses()
  }, [user?.sub, fetchResponses])

  useEffect(() => {
    // Handle creation events - use functional update to avoid stale state
    const handleCannedResponseCreated = (data: any) => {
  console.log('WebSocket received cannedResponseCreated:', data);

  setResponses(prev => {
    const exists = prev.find(r => r.id === data.id);
    if (!exists) {
      return [...prev, {
        id: data.id,
        name: data.name ?? '',
        message: data.message ?? '',
        visibility: data.visibility ?? 'PRIVATE',
        createdAt: data.createdAt ?? new Date().toISOString(),
        updatedAt: data.updatedAt ?? new Date().toISOString(),
      }];
    }
    return prev;
  });
      toast.success('New canned response created');
    }

    // Handle update events - use functional update
    const handleCannedResponseUpdated = (data: any) => {
      console.log('Received cannedResponseUpdated:', data); // Debug log

      setResponses(prev => prev.map(response =>
        response.id === data.id ? {
          ...response,
          name: data.name,
          message: data.message,
          visibility: data.visibility,
          updatedAt: data.updatedAt
        } : response
      ));
      toast.success('Canned response updated');
    }

    // Handle deletion events - use functional update
    const handleCannedResponseDeleted = (data: { id: string }) => {
      console.log('Received cannedResponseDeleted:', data); // Debug log

      setResponses(prev => prev.filter(response => response.id !== data.id));
      toast.success('Canned response deleted');
    }

    // Subscribe to WebSocket events
    const unsubscribeCreated = on('cannedResponseCreated', handleCannedResponseCreated);
    const unsubscribeUpdated = on('cannedResponseUpdated', handleCannedResponseUpdated);
    const unsubscribeDeleted = on('cannedResponseDeleted', handleCannedResponseDeleted);

    // Cleanup subscriptions
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [on]); // REMOVE 'responses' from dependencies array

  return {
    responses,
    loading,
    fetchResponses,
  }
}
