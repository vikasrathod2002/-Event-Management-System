import React, { useEffect } from 'react';
import ProfileManager from './components/ProfileManager';
import EventList from './components/EventList';
import ErrorBoundary from './components/ErrorBoundary';
import useStore from './store/useStore';

function App() {
  const { selectedProfile, fetchProfiles, error, clearError } = useStore();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleRetry = () => {
    clearError();
    fetchProfiles();
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Event Management System</h1>
        <p>Create and manage events across multiple timezones</p>
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
    </div>
  );
}

export default App;