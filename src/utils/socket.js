import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8585';

let socket = null;

export const initSocket = () => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected');
    toast.success('Real-time sync enabled', { duration: 2000 });
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket disconnected');
    toast.error('Real-time sync lost', { duration: 2000 });
  });

  // Listen for inventory updates
  socket.on('inventory:update', (data) => {
    toast(`📦 Inventory updated: ${data.itemCode}`, { duration: 3000 });
    // Trigger UI refresh here
  });

  socket.on('movement:created', (data) => {
    toast(`🚚 New movement: ${data.type}`, { duration: 3000 });
  });

  return socket;
};

export const emitEvent = (event, data) => {
  if (socket) {
    socket.emit(event, data);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
