import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConnectionStatus() {
  const { isConnected, socket } = useSocket();
  const [latency, setLatency] = useState<number | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Measure latency every 5 seconds
    const latencyInterval = setInterval(() => {
      if (isConnected && socket.connected) {
        const start = Date.now();
        socket.emit('ping', () => {
          const roundTrip = Date.now() - start;
          setLatency(roundTrip);
        });
      }
    }, 5000);

    // Listen for reconnection events
    const handleReconnectAttempt = () => {
      setIsReconnecting(true);
      setShowStatus(true);
    };

    const handleReconnect = () => {
      setIsReconnecting(false);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleDisconnect = () => {
      setShowStatus(true);
      setLatency(null);
    };

    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('reconnect', handleReconnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect', handleReconnect);

    return () => {
      clearInterval(latencyInterval);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('reconnect', handleReconnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect', handleReconnect);
    };
  }, [socket, isConnected]);

  // Always show if disconnected or reconnecting
  useEffect(() => {
    if (!isConnected || isReconnecting) {
      setShowStatus(true);
    }
  }, [isConnected, isReconnecting]);

  const getConnectionQuality = () => {
    if (!isConnected) return 'offline';
    if (isReconnecting) return 'reconnecting';
    if (latency === null) return 'measuring';
    if (latency < 50) return 'excellent';
    if (latency < 150) return 'good';
    if (latency < 300) return 'fair';
    return 'poor';
  };

  const quality = getConnectionQuality();

  const qualityConfig = {
    offline: {
      icon: WifiOff,
      color: 'text-red-600 bg-red-100',
      borderColor: 'border-red-300',
      message: 'Offline',
      pulse: false
    },
    reconnecting: {
      icon: AlertTriangle,
      color: 'text-yellow-600 bg-yellow-100',
      borderColor: 'border-yellow-300',
      message: 'Reconnecting...',
      pulse: true
    },
    measuring: {
      icon: Wifi,
      color: 'text-gray-600 bg-gray-100',
      borderColor: 'border-gray-300',
      message: 'Connecting...',
      pulse: true
    },
    excellent: {
      icon: Wifi,
      color: 'text-green-600 bg-green-100',
      borderColor: 'border-green-300',
      message: 'Excellent',
      pulse: false
    },
    good: {
      icon: Wifi,
      color: 'text-blue-600 bg-blue-100',
      borderColor: 'border-blue-300',
      message: 'Good',
      pulse: false
    },
    fair: {
      icon: Wifi,
      color: 'text-yellow-600 bg-yellow-100',
      borderColor: 'border-yellow-300',
      message: 'Fair',
      pulse: false
    },
    poor: {
      icon: AlertTriangle,
      color: 'text-orange-600 bg-orange-100',
      borderColor: 'border-orange-300',
      message: 'Poor',
      pulse: false
    }
  };

  const config = qualityConfig[quality as keyof typeof qualityConfig];
  const Icon = config.icon;

  // Don't show if excellent connection and not forced to show
  if (quality === 'excellent' && !showStatus && isConnected) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 transition-all duration-300" data-testid="connection-status">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border-2 backdrop-blur-sm",
          config.color,
          config.borderColor,
          config.pulse && "animate-pulse"
        )}
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {config.message}
        </span>
        {latency !== null && quality !== 'offline' && quality !== 'reconnecting' && (
          <span className="text-xs opacity-75">
            {latency}ms
          </span>
        )}
      </div>

      {/* Auto-reconnect message */}
      {quality === 'offline' && (
        <div className="mt-2 text-xs text-center text-gray-600">
          Auto-reconnecting...
        </div>
      )}
    </div>
  );
}

export default ConnectionStatus;