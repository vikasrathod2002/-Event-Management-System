import React, { useEffect, useCallback } from 'react';
import ProfileManager from './components/ProfileManager';
import EventList from './components/EventList';
import ErrorBoundary from './components/ErrorBoundary';
import useStore from './store/useStore';
import { RefreshCw } from 'lucide-react';

function App() {
  const { 
    selectedProfile, 
    fetchProfiles, 
    error, 
    clearError, 
    loading,
    refetchAll 
  } = useStore();

  // Memoized fetch function to prevent unnecessary re-renders
  const loadData = useCallback(async () => {
    await fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRetry = useCallback(() => {
    clearError();
    loadData();
  }, [clearError, loadData]);

  const handleRefreshAll = useCallback(() => {
    refetchAll();
  }, [refetchAll]);

  return (
    <div className="container">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Event Management System</h1>
            <p>Create and manage events across multiple timezones</p>
          </div>
          <button 
            onClick={handleRefreshAll}
            disabled={loading}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <ErrorBoundary error={error} onRetry={handleRetry} />

      <div className="grid">
        <ProfileManager />
        <EventList />
      </div>

      {!error && !selectedProfile && (
        <div className="card" style={{ textAlign: 'center', background: '#fff3cd', borderColor: '#ffeaa7' }}>
          <p>Please select or create a profile to start managing events</p>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
}

export default App;