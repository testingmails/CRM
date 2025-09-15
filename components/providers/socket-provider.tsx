'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('lead-updated', (leadData) => {
      toast.success('Lead updated in real-time', {
        description: `${leadData.companyName} was updated`
      });
      // Trigger page refresh or data refetch
      window.dispatchEvent(new CustomEvent('lead-updated', { detail: leadData }));
    });

    newSocket.on('lead-created', (leadData) => {
      toast.success('New lead created', {
        description: `${leadData.companyName} was added`
      });
      window.dispatchEvent(new CustomEvent('lead-created', { detail: leadData }));
    });

    newSocket.on('lead-deleted', (data) => {
      toast.info('Lead deleted', {
        description: 'A lead was removed from the system'
      });
      window.dispatchEvent(new CustomEvent('lead-deleted', { detail: data }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  return useContext(SocketContext);
};