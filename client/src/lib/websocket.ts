import { create } from 'zustand';
import type { Message } from '@shared/schema';

interface WebSocketStore {
  socket: WebSocket | null;
  connected: boolean;
  connect: (documentId: number, userId: number) => void;
  disconnect: () => void;
  sendMessage: (message: unknown) => void;
}

// Get the WebSocket URL based on the current protocol and host
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}/ws`;

export const useWebSocket = create<WebSocketStore>((set, get) => ({
  socket: null,
  connected: false,

  connect: (documentId: number, userId: number) => {
    try {
      // Cleanup existing connection if any
      const { socket: existingSocket } = get();
      if (existingSocket) {
        existingSocket.close();
      }

      console.log('Connecting to WebSocket:', wsUrl);
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connected');
        set({ connected: true, socket });
        socket.send(JSON.stringify({ 
          type: "join", 
          documentId, 
          userId 
        }));
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        set({ connected: false, socket: null });
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        set({ connected: false });
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      set({ connected: false, socket: null });
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      console.log('Disconnecting WebSocket');
      socket.close();
      set({ socket: null, connected: false });
    }
  },

  sendMessage: (message: unknown) => {
    const { socket, connected } = get();
    if (socket && connected) {
      try {
        socket.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    } else {
      console.warn('Cannot send message: WebSocket is not connected');
    }
  }
}));