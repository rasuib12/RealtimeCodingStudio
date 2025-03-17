import { create } from 'zustand';
import type { Message } from '@shared/schema';

interface WebSocketStore {
  socket: WebSocket | null;
  connected: boolean;
  connecting: boolean;
  connect: (documentId: number, userId: number) => void;
  disconnect: () => void;
  sendMessage: (message: unknown) => void;
}

// Get the WebSocket URL based on the current protocol and host
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}/ws`;

const RECONNECT_DELAY = 2000; // 2 seconds
const MAX_RETRIES = 5;

export const useWebSocket = create<WebSocketStore>((set, get) => ({
  socket: null,
  connected: false,
  connecting: false,

  connect: (documentId: number, userId: number) => {
    const store = get();
    if (store.connecting) {
      console.log('Already attempting to connect...');
      return;
    }

    let retryCount = 0;

    const connectWebSocket = () => {
      try {
        // Cleanup existing connection if any
        const { socket: existingSocket } = get();
        if (existingSocket) {
          existingSocket.close();
        }

        set({ connecting: true });
        console.log('Connecting to WebSocket:', wsUrl);
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          console.log('WebSocket connected');
          set({ connected: true, connecting: false, socket });
          retryCount = 0; // Reset retry count on successful connection
          socket.send(JSON.stringify({ 
            type: "join", 
            documentId, 
            userId 
          }));
        };

        socket.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          set({ connected: false, connecting: false, socket: null });

          // Attempt to reconnect unless it was a normal closure or max retries reached
          if (event.code !== 1000 && retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Attempting to reconnect (${retryCount}/${MAX_RETRIES}) in ${RECONNECT_DELAY}ms...`);
            setTimeout(() => {
              const currentStore = get();
              if (!currentStore.connected && !currentStore.connecting) {
                connectWebSocket();
              }
            }, RECONNECT_DELAY);
          } else if (retryCount >= MAX_RETRIES) {
            console.error('Max reconnection attempts reached');
          }
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          set({ connected: false, connecting: false });
        };

      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        set({ connected: false, connecting: false, socket: null });
      }
    };

    connectWebSocket();
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      console.log('Disconnecting WebSocket');
      socket.close(1000, 'Normal closure');
      set({ socket: null, connected: false, connecting: false });
    }
  },

  sendMessage: (message: unknown) => {
    const { socket, connected } = get();
    if (socket && connected) {
      try {
        console.log('Sending message:', message);
        socket.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send message:', error);

        // If there's an error sending, attempt to reconnect
        const { connect } = get();
        if (typeof message === 'object' && message !== null && 'documentId' in message && 'userId' in message) {
          connect(message.documentId as number, message.userId as number);
        }
      }
    } else {
      console.warn('Cannot send message: WebSocket is not connected');
    }
  }
}));