import { create } from 'zustand';
import axios from 'axios';

const useStore = create((set, get) => ({
  profiles: [],
  events: [],
  selectedProfile: null,
  loading: false,
  
  // Profile actions
  fetchProfiles: async () => {
    set({ loading: true });
    try {
      const response = await axios.get('/api/profiles');
      set({ profiles: response.data, loading: false });
    } catch (error) {
      console.error('Error fetching profiles:', error);
      set({ loading: false });
    }
  },
  
  createProfile: async (name) => {
    try {
      const response = await axios.post('/api/profiles', { name });
      set(state => ({ profiles: [...state.profiles, response.data] }));
      return response.data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },
  
  updateProfileTimezone: async (profileId, timezone) => {
    try {
      const response = await axios.put(`/api/profiles/${profileId}/timezone`, { timezone });
      set(state => ({
        profiles: state.profiles.map(p => 
          p._id === profileId ? response.data : p
        ),
        selectedProfile: state.selectedProfile?._id === profileId ? response.data : state.selectedProfile
      }));
    } catch (error) {
      console.error('Error updating timezone:', error);
      throw error;
    }
  },
  
  setSelectedProfile: (profile) => {
    set({ selectedProfile: profile });
  },
  
  // Event actions
  fetchEvents: async (profileId = null) => {
    set({ loading: true });
    try {
      const url = profileId ? `/api/events/profile/${profileId}` : '/api/events';
      const response = await axios.get(url);
      set({ events: response.data, loading: false });
    } catch (error) {
      console.error('Error fetching events:', error);
      set({ loading: false });
    }
  },
  
  createEvent: async (eventData) => {
    try {
      const response = await axios.post('/api/events', eventData);
      set(state => ({ events: [...state.events, response.data] }));
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },
  
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await axios.put(`/api/events/${eventId}`, eventData);
      set(state => ({
        events: state.events.map(e => 
          e._id === eventId ? response.data : e
        )
      }));
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },
  
  getEventLogs: async (eventId) => {
    try {
      const response = await axios.get(`/api/events/${eventId}/logs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event logs:', error);
      throw error;
    }
  }
}));

export default useStore;