// src/lib/websocket.ts
import { io, Socket } from 'socket.io-client';

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
      const socketUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
      this.socket = io(socketUrl, {
        path: '/socket.io',
        transports: ['websocket', 'polling']
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
export const webSocketService = new WebSocketService();