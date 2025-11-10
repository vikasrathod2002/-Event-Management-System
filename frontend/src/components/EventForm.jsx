import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { timezones, timezoneLabels, formatDateTime } from '../utils/timezone';
import { Calendar, Clock, X } from 'lucide-react';

const EventForm = ({ event, onSave, onCancel }) => {
  const { profiles, selectedProfile } = useStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    profiles: [],
    timezone: 'America/New_York',
    startDateTime: '',
    endDateTime: ''
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        profiles: event.profiles.map(p => p._id),
        timezone: event.timezone,
        startDateTime: formatDateTime(event.startDateTime, event.timezone),
        endDateTime: formatDateTime(event.endDateTime, event.timezone)
      });
    } else {
      // Set default timezone to selected profile's timezone
      const defaultTimezone = selectedProfile?.timezone || 'America/New_York';
      const defaultProfiles = selectedProfile ? [selectedProfile._id] : [];
      
      setFormData(prev => ({
        ...prev,
        timezone: defaultTimezone,
        profiles: defaultProfiles,
        startDateTime: formatDateTime(new Date(), defaultTimezone),
        endDateTime: formatDateTime(new Date(Date.now() + 60 * 60 * 1000), defaultTimezone)
      }));
    }
  }, [event, selectedProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (new Date(formData.endDateTime) <= new Date(formData.startDateTime)) {
      alert('End date/time must be after start date/time');
      return;
    }

    if (formData.profiles.length === 0) {
      alert('Please select at least one profile');
      return;
    }

    try {
      const eventData = {
        ...formData,
        startDateTime: new Date(formData.startDateTime).toISOString(),
        endDateTime: new Date(formData.endDateTime).toISOString(),
        createdBy: selectedProfile?._id,
        updatedBy: selectedProfile?._id
      };

      await onSave(eventData);
    } catch (error) {
      alert('Error saving event: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleProfileChange = (profileId) => {
    setFormData(prev => ({
      ...prev,
      profiles: prev.profiles.includes(profileId)
        ? prev.profiles.filter(id => id !== profileId)
        : [...prev.profiles, profileId]
    }));
  };

  const selectedProfilesCount = formData.profiles.length;

  return (
    <div className="card">
      <h2>
        <Calendar size={20} />
        {event ? 'Edit Event' : 'Create New Event'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Event Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter event title"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter event description"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>
            Profiles *
            {selectedProfilesCount > 0 && (
              <span className="text-sm text-gray-600"> ({selectedProfilesCount} selected)</span>
            )}
          </label>
          <div className="checkbox-group">
            {profiles.map(profile => (
              <label key={profile._id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.profiles.includes(profile._id)}
                  onChange={() => handleProfileChange(profile._id)}
                />
                <span>{profile.name}</span>
                <span className="text-xs text-gray-600">({timezoneLabels[profile.timezone] || profile.timezone})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Event Timezone *</label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
            required
          >
            {timezones.map(tz => (
              <option key={tz} value={tz}>
                {timezoneLabels[tz] || tz}
              </option>
            ))}
          </select>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>
              <Clock size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.startDateTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startDateTime: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Clock size={16} style={{ display: 'inline', marginRight: '8px' }} />
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.endDateTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endDateTime: e.target.value }))}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            <X size={16} />
            Cancel
          </button>
          <button type="submit" className="btn">
            <Calendar size={16} />
            {event ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;