import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorBoundary = ({ error, onRetry }) => {
  if (!error) return null;

  return (
    <div style={{
      background: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    }}>
      <AlertCircle size={20} />
      <div style={{ flex: 1 }}>
        <strong>Connection Error</strong>
        <p style={{ margin: '8px 0', fontSize: '14px' }}>{error}</p>
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>
          <strong>To fix this:</strong>
          <ol style={{ marginLeft: '20px', marginTop: '4px' }}>
            <li>Open terminal in the <code>backend</code> folder</li>
            <li>Run <code>npm run dev</code></li>
            <li>Wait for "Server running on port 5000" message</li>
            <li>Refresh this page</li>
          </ol>
        </div>
        {onRetry && (
          <button 
            onClick={onRetry}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} />
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;