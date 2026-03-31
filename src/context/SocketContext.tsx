"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/';
    const socketUrl = apiUrl.replace(/\/api\/?$/, '');
    
    console.log(`[Socket] Connecting to: ${socketUrl}`);
    
    const socketInstance = io(socketUrl, {
      transports: ['polling', 'websocket'], // Start with polling, then upgrade to websocket
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log(`[Socket] ✅ Connected with ID: ${socketInstance.id} to ${socketUrl}`);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('[Socket] ❌ Connection Error Path:', socketUrl);
      console.error('[Socket] ❌ Detailed Error:', err.message);
      // If it's a websocket error, Socket.io will automatically try polling if in transports
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('[Socket] ⚠️ Disconnected:', reason);
    });

    socketInstance.on('reconnect_attempt', () => {
      console.log('[Socket] 🔄 Reconnecting...');
    });

    setSocket(socketInstance);

    return () => {
      console.log('[Socket] Cleaning up connection...');
      socketInstance.disconnect();
    };
  }, []);


  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
