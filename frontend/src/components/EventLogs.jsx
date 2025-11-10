import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { formatDisplayDateTime } from '../utils/timezone';
import { X, History } from 'lucide-react';

const EventLogs = ({ event, onClose }) => {
  const { selectedProfile, getEventLogs } = useStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const eventLogs = await getEventLogs(event._id);
        setLogs(eventLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [event._id]);

  const getChangeDescription = (log) => {
    const changes = [];
    
    if (log.previousValues.title !== log.updatedValues.title) {
      changes.push(`Title changed from "${log.previousValues.title}" to "${log.updatedValues.title}"`);
    }
    
    if (log.previousValues.description !== log.updatedValues.description) {
      changes.push('Description updated');
    }
    
    if (JSON.stringify(log.previousValues.profiles) !== JSON.stringify(log.updatedValues.profiles)) {
      changes.push('Profiles assigned updated');
    }
    
    if (log.previousValues.timezone !== log.updatedValues.timezone) {
      changes.push(`Timezone changed from ${log.previousValues.timezone} to ${log.updatedValues.timezone}`);
    }
    
    if (new Date(log.previousValues.startDateTime).getTime() !== new Date(log.updatedValues.startDateTime).getTime()) {
      changes.push('Start date/time updated');
    }
    
    if (new Date(log.previousValues.endDateTime).getTime() !== new Date(log.updatedValues.endDateTime).getTime()) {
      changes.push('End date/time updated');
    }

    return changes.length > 0 ? changes.join(', ') : 'General updates';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>
            <History size={20} />
            Event Update History
          </h2>
          <button onClick={onClose} className="btn btn-outline btn-sm">
            <X size={16} />
          </button>
        </div>

        <div className="update-logs">
          {loading ? (
            <div className="empty-state">
              <p>Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <History size={32} className="text-gray-400" style={{ margin: '0 auto 16px' }} />
              <h3>No Update History</h3>
              <p>This event hasn't been updated yet</p>
            </div>
          ) : (
            logs.slice().reverse().map((log, index) => (
              <div key={index} className="log-item">
                <div className="log-time">
                  {formatDisplayDateTime(log.updatedAt, selectedProfile?.timezone || 'UTC')}
                </div>
                <div className="log-change">
                  {getChangeDescription(log)}
                </div>
                {log.updatedBy && (
                  <div className="text-xs text-gray-600" style={{ marginTop: '4px' }}>
                    Updated by: {log.updatedBy.name}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EventLogs;