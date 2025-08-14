import React, { useState } from 'react';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const refreshStats = () => {
    if ((window as any).debugLogger) {
      setStats((window as any).debugLogger.getStats());
    }
  };

  const handleUploadLogs = () => {
    if ((window as any).debugLogger) {
      (window as any).debugLogger.upload();
      console.log('📤 Manual log upload triggered');
    }
  };

  const handleClearLogs = () => {
    if ((window as any).debugLogger) {
      (window as any).debugLogger.clear();
      refreshStats();
    }
  };

  const handleDownloadLogs = () => {
    if ((window as any).debugLogger) {
      (window as any).debugLogger.downloadLogs();
    }
  };

  const handleViewLogs = () => {
    if ((window as any).debugLogger) {
      const logs = (window as any).debugLogger.getLogs();
      console.log('📋 Current captured logs:', logs);
    }
  };

  React.useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg cursor-pointer shadow-lg z-50 text-sm font-medium hover:bg-blue-700 transition-colors"
        onClick={() => setIsOpen(true)}
        title="Open Debug Panel"
      >
        🐛 DEBUG
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-xl z-50 min-w-80">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-blue-400">🐛 Debug Panel</h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>
      </div>
      
      {stats && (
        <div className="mb-3 text-sm">
          <div className="text-gray-300">
            📊 <strong>Logs:</strong> {stats.totalLogs} / {stats.maxLogs}
          </div>
          <div className="text-gray-300">
            ⏰ <strong>Upload:</strong> Every {Math.round(stats.uploadInterval / 1000)}s
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={handleUploadLogs}
          className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-medium transition-colors"
        >
          📤 Upload Logs Now
        </button>
        
        <button
          onClick={handleViewLogs}
          className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors"
        >
          👁️ View in Console
        </button>
        
        <button
          onClick={handleDownloadLogs}
          className="w-full bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm font-medium transition-colors"
        >
          💾 Download Logs
        </button>
        
        <button
          onClick={handleClearLogs}
          className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm font-medium transition-colors"
        >
          🗑️ Clear Logs
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        Use browser console for advanced controls:<br/>
        <code>debugLogger.upload()</code><br/>
        <code>debugLogger.getLogs()</code>
      </div>
    </div>
  );
} 