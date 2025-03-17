
import { create } from 'zustand';

interface WebSocketStore {
  socket: WebSocket | null;
  connected: boolean;
  connecting: boolean;
  connect: (documentId: number, userId: number) => void;
  disconnect: () => void;
  sendMessage: (message: unknown) => void;
}

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}/ws`;

export const useWebSocket = create<WebSocketStore>((set, get) => ({
  socket: null,
  connected: false,
  connecting: false,

  connect: (documentId, userId) => {
    if (get().connected || get().connecting) return;

    set({ connecting: true });
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      set({ socket, connected: true, connecting: false });
      socket.send(JSON.stringify({
        type: 'join',
        documentId,
        userId
      }));
    };

    socket.onclose = () => {
      set({ socket: null, connected: false, connecting: false });
    };

    socket.onerror = () => {
      set({ socket: null, connected: false, connecting: false });
    };
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, connected: false });
    }
  },

  sendMessage: (message) => {
    const { socket, connected } = get();
    if (socket && connected) {
      socket.send(JSON.stringify(message));
    }
  }
}));
