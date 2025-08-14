import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  reconnectAttempts: 0,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) {
      console.log('[SOCKET] No authenticated user, skipping connection');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('[SOCKET] No token found, skipping connection');
      return;
    }

    console.log('[SOCKET] Initializing connection for user:', user.email);
    setIsConnecting(true);
    setError(null);

    // Create socket connection with authentication
    // In Replit, use relative URL since everything runs on the same domain
    const newSocket = io({
      auth: {
        token: token
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('[SOCKET] Connected successfully:', newSocket.id);
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      setReconnectAttempts(0);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected:', reason);
      setIsConnected(false);
      setIsConnecting(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected the client, manual reconnection needed
        setError('Server disconnected the connection');
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('[SOCKET] Connection error:', err.message);
      setIsConnecting(false);
      setError(`Connection failed: ${err.message}`);
      setReconnectAttempts(prev => prev + 1);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('[SOCKET] Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      setReconnectAttempts(0);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[SOCKET] Reconnection attempt:', attemptNumber);
      setIsConnecting(true);
      setReconnectAttempts(attemptNumber);
    });

    newSocket.on('reconnect_error', (err) => {
      console.error('[SOCKET] Reconnection error:', err.message);
      setError(`Reconnection failed: ${err.message}`);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('[SOCKET] Reconnection failed after maximum attempts');
      setIsConnecting(false);
      setError('Unable to reconnect to server. Please refresh the page.');
    });

    // Authentication error handler
    newSocket.on('auth_error', (errorMessage) => {
      console.error('[SOCKET] Authentication error:', errorMessage);
      setError(`Authentication failed: ${errorMessage}`);
      newSocket.disconnect();
    });

    setSocket(newSocket);

    // Cleanup function
    return () => {
      console.log('[SOCKET] Cleaning up connection');
      newSocket.removeAllListeners();
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
      setReconnectAttempts(0);
    };
  }, [user]); // Reconnect when user changes

  const value: SocketContextType = {
    socket,
    isConnected,
    isConnecting,
    error,
    reconnectAttempts,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};