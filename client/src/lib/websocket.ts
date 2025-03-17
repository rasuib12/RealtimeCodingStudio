import { create } from 'zustand';
import type { Message } from '@shared/schema';

interface WebSocketStore {
  socket: WebSocket | null;
  connected: boolean;
  connect: (documentId: number, userId: number) => void;
  disconnect: () => void;
  sendMessage: (message: unknown) => void;
}

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${protocol}//${window.location.host}/ws`;

export const useWebSocket = create<WebSocketStore>((set, get) => ({
  socket: null,
  connected: false,

  connect: (documentId: number, userId: number) => {
    // Cleanup existing connection if any
    const { socket: existingSocket } = get();
    if (existingSocket) {
      existingSocket.close();
    }

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected');
      set({ connected: true });
      socket.send(JSON.stringify({ 
        type: "join", 
        documentId, 
        userId 
      }));
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      set({ connected: false });
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, connected: false });
    }
  },

  sendMessage: (message: unknown) => {
    const { socket, connected } = get();
    if (socket && connected) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('Tried to send message but WebSocket is not connected');
    }
  }
}));