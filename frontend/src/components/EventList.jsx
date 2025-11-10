import React, { useState } from 'react';
import useStore from '../store/useStore';
import { formatDisplayDateTime, formatDisplayDate, formatDisplayTime, getCalendarDays, timezoneLabels } from '../utils/timezone';
import EventForm from './EventForm';
import EventLogs from './EventLogs';
import { Calendar, Plus, Edit, Clock, Users, MapPin } from 'lucide-react';

const EventList = () => {
  const { events, selectedProfile, fetchEvents, createEvent, updateEvent } = useStore();
  const [editingEvent, setEditingEvent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLogsEvent, setShowLogsEvent] = useState(null);

  React.useEffect(() => {
    if (selectedProfile) {
      fetchEvents(selectedProfile._id);
    } else {
      fetchEvents();
    }
  }, [selectedProfile]);

  const handleCreateEvent = async (eventData) => {
    try {
      await createEvent(eventData);
      setShowCreateForm(false);
    } catch (error) {
      alert('Error creating event');
    }
  };

  const handleEditEvent = async (eventData) => {
    try {
      await updateEvent(editingEvent._id, {
        ...eventData,
        updatedBy: selectedProfile?._id
      });
      setEditingEvent(null);
    } catch (error) {
      alert('Error updating event');
    }
  };

  const userEvents = selectedProfile 
    ? events.filter(event => event.profiles.some(p => p._id === selectedProfile._id))
    : events;

  const calendarDays = selectedProfile ? getCalendarDays(selectedProfile.timezone) : [];

  return (
    <div className="card">
      <div className="event-header">
        <h2>
          <Calendar size={20} />
          {selectedProfile ? `Events for ${selectedProfile.name}` : 'All Events'}
        </h2>
        <button 
          className="btn"
          onClick={() => setShowCreateForm(true)}
          disabled={!selectedProfile}
        >
          <Plus size={16} />
          Create Event
        </button>
      </div>

      {!selectedProfile && (
        <div className="empty-state">
          <Users size={48} className="text-gray-400" style={{ margin: '0 auto 16px' }} />
          <h3>No Profile Selected</h3>
          <p>Please select or create a profile to view and manage events</p>
        </div>
      )}

      {selectedProfile && (
        <>
          {/* Timezone Display */}
          <div className="timezone-selector">
            <MapPin size={18} className="text-gray-600" />
            <div>
              <label>Viewing in Timezone</label>
              <div className="font-semibold">
                {timezoneLabels[selectedProfile.timezone] || selectedProfile.timezone}
              </div>
            </div>
          </div>

          {/* Calendar Preview */}
          <div>
            <label>Calendar Overview</label>
            <div className="calendar-preview">
              <div className="calendar-header">
                {selectedProfile && new Date().toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric',
                  timeZone: selectedProfile.timezone 
                })}
              </div>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="calendar-day text-xs text-gray-600 font-semibold">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`calendar-day text-xs ${
                    day.isToday ? 'current' : ''
                  } ${!day.isCurrentMonth ? 'text-gray-400' : ''}`}
                >
                  {day.date.getDate()}
                </div>
              ))}
            </div>
          </div>

          {/* Create Event Form */}
          {showCreateForm && (
            <EventForm
              onSave={handleCreateEvent}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          {/* Edit Event Form */}
          {editingEvent && (
            <EventForm
              event={editingEvent}
              onSave={handleEditEvent}
              onCancel={() => setEditingEvent(null)}
            />
          )}

          {/* Event Logs Modal */}
          {showLogsEvent && (
            <EventLogs
              event={showLogsEvent}
              onClose={() => setShowLogsEvent(null)}
            />
          )}

          {/* Events List */}
          <div className="event-list">
            {userEvents.map(event => (
              <div key={event._id} className="event-item">
                <div className="event-header">
                  <div style={{ flex: 1 }}>
                    <div className="event-title">{event.title}</div>
                    {event.description && (
                      <p className="text-sm text-gray-600" style={{ marginBottom: '8px' }}>
                        {event.description}
                      </p>
                    )}
                    <div className="event-meta">
                      <div>
                        <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                        <strong>Start:</strong> {formatDisplayDateTime(event.startDateTime, selectedProfile.timezone)}
                      </div>
                      <div>
                        <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                        <strong>End:</strong> {formatDisplayDateTime(event.endDateTime, selectedProfile.timezone)}
                      </div>
                      <div>
                        <MapPin size={14} style={{ display: 'inline', marginRight: '6px' }} />
                        <strong>Timezone:</strong> {timezoneLabels[event.timezone] || event.timezone}
                      </div>
                      <div>
                        <Users size={14} style={{ display: 'inline', marginRight: '6px' }} />
                        <strong>Assigned to:</strong> {event.profiles.map(p => p.name).join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="event-actions">
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => setEditingEvent(event)}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    {event.updateLogs && event.updateLogs.length > 0 && (
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => setShowLogsEvent(event)}
                      >
                        View Logs
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {userEvents.length === 0 && !showCreateForm && (
              <div className="empty-state">
                <Calendar size={48} className="text-gray-400" style={{ margin: '0 auto 16px' }} />
                <h3>No Events Found</h3>
                <p>Create your first event to get started</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EventList;