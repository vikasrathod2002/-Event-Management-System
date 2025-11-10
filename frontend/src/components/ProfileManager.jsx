import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { timezones, timezoneLabels } from '../utils/timezone';
import { User, Plus, Users } from 'lucide-react';

const ProfileManager = () => {
  const { profiles, selectedProfile, fetchProfiles, createProfile, setSelectedProfile, updateProfileTimezone } = useStore();
  const [newProfileName, setNewProfileName] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    
    try {
      const profile = await createProfile(newProfileName);
      setNewProfileName('');
      // Auto-select the newly created profile
      setSelectedProfile(profile);
    } catch (error) {
      alert('Error creating profile');
    }
  };

  const handleTimezoneChange = async (timezone) => {
    if (!selectedProfile) return;
    
    try {
      await updateProfileTimezone(selectedProfile._id, timezone);
    } catch (error) {
      alert('Error updating timezone');
    }
  };

  return (
    <div className="card">
      <h2>
        <Users size={20} />
        Profile Management
      </h2>
      
      {/* Create Profile Form */}
      <form onSubmit={handleCreateProfile} style={{ marginBottom: '24px' }}>
        <div className="form-group">
          <label>Create New Profile</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Enter profile name"
              required
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn">
              <Plus size={16} />
              Create
            </button>
          </div>
        </div>
      </form>

      {/* Profile Selection */}
      <div className="profile-selector">
        <User size={18} className="text-gray-600" />
        <div style={{ flex: 1 }}>
          <label>Select Active Profile</label>
          <select
            value={selectedProfile?._id || ''}
            onChange={(e) => {
              const profile = profiles.find(p => p._id === e.target.value);
              setSelectedProfile(profile || null);
            }}
          >
            <option value="">Select a profile...</option>
            {profiles.map(profile => (
              <option key={profile._id} value={profile._id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timezone Selection */}
      {selectedProfile && (
        <div className="timezone-selector">
          <div style={{ flex: 1 }}>
            <label>Timezone for {selectedProfile.name}</label>
            <select
              value={selectedProfile.timezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>
                  {timezoneLabels[tz] || tz}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Profiles List */}
      {profiles.length > 0 && (
        <div>
          <label>All Profiles ({profiles.length})</label>
          <div className="checkbox-group">
            {profiles.map(profile => (
              <div key={profile._id} className="checkbox-item">
                <User size={16} className="text-gray-600" />
                <span>{profile.name}</span>
                <span className="text-xs text-gray-600">({timezoneLabels[profile.timezone] || profile.timezone})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManager;