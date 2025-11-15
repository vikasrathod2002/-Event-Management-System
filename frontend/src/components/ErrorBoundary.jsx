import React from 'react';
import { AlertCircle, RefreshCw, WifiOff, Server } from 'lucide-react';

const ErrorBoundary = ({ error, onRetry }) => {
  if (!error) return null;

  const getErrorDetails = () => {
    if (error.includes('ECONNREFUSED') || error.includes('Network Error')) {
      return {
        icon: <WifiOff size={20} />,
        title: 'Connection Error',
        message: 'Unable to connect to the server.',
        instructions: 'Please check your internet connection and ensure the backend server is running.'
      };
    } else if (error.includes('5')) {
      return {
        icon: <Server size={20} />,
        title: 'Server Error',
        message: 'The server encountered an error.',
        instructions: 'Please try again later or contact support if the problem persists.'
      };
    } else {
      return {
        icon: <AlertCircle size={20} />,
        title: 'Error',
        message: error,
        instructions: 'Please try again or refresh the page.'
      };
    }
  };

  const { icon, title, message, instructions } = getErrorDetails();

  return (
    <div className="error-boundary">
      <div className="error-content">
        {icon}
        <div className="error-details">
          <h3>{title}</h3>
          <p className="error-message">{message}</p>
          <p className="error-instructions">{instructions}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="btn btn-error"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;