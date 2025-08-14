import React from 'react';
import { useSocket } from '../contexts/SocketContext';

interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  className = '',
  showDetails = false 
}) => {
  const { isConnected, isConnecting, error, reconnectAttempts } = useSocket();

  if (!showDetails && isConnected && !error) {
    // Don't show status when everything is working fine and details not requested
    return null;
  }

  const getStatusColor = () => {
    if (error) return 'bg-red-500';
    if (isConnecting) return 'bg-yellow-500';
    if (isConnected) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (error) return 'Connection Error';
    if (isConnecting) {
      if (reconnectAttempts > 0) {
        return `Reconnecting... (${reconnectAttempts}/5)`;
      }
      return 'Connecting...';
    }
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (error) return '⚠️';
    if (isConnecting) return '🔄';
    if (isConnected) return '🟢';
    return '🔴';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${isConnecting ? 'animate-pulse' : ''}`} />
      
      {showDetails && (
        <div className="flex items-center space-x-1">
          <span className="text-xs">{getStatusIcon()}</span>
          <span className="text-xs font-medium">{getStatusText()}</span>
          
          {error && (
            <div className="text-xs text-red-400 max-w-48 truncate" title={error}>
              {error}
            </div>
          )}
        </div>
      )}
      
      {!showDetails && (isConnecting || error) && (
        <span className="text-xs text-gray-400">{getStatusText()}</span>
      )}
    </div>
  );
};

export default ConnectionStatus;