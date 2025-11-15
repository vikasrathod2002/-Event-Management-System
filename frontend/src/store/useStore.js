import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Create axios instance with production configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and error handling
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    
    if (error.code === 'ECONNREFUSED') {
      error.message = 'Unable to connect to server. Please check your connection.';
    } else if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    }
    
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: errorMessage
    });
    
    return Promise.reject(error);
  }
);

const useStore = create(
  persist(
    (set, get) => ({
      profiles: [],
      events: [],
      selectedProfile: null,
      loading: false,
      error: null,
      lastFetch: null,

      // Profile actions
      fetchProfiles: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/profiles');
          set({ 
            profiles: response.data, 
            loading: false, 
            lastFetch: Date.now(),
            error: null 
          });
        } catch (error) {
          console.error('Error fetching profiles:', error);
          set({ 
            loading: false, 
            error: error.message || 'Failed to load profiles'
          });
        }
      },
      
      createProfile: async (name) => {
        try {
          const response = await api.post('/profiles', { name });
          set(state => ({ 
            profiles: [...state.profiles, response.data],
            error: null 
          }));
          return response.data;
        } catch (error) {
          console.error('Error creating profile:', error);
          const errorMsg = error.response?.data?.message || error.message || 'Failed to create profile';
          set({ error: errorMsg });
          throw new Error(errorMsg);
        }
      },
      
      updateProfileTimezone: async (profileId, timezone) => {
        try {
          const response = await api.put(`/profiles/${profileId}/timezone`, { timezone });
          set(state => ({
            profiles: state.profiles.map(p => 
              p._id === profileId ? response.data : p
            ),
            selectedProfile: state.selectedProfile?._id === profileId ? response.data : state.selectedProfile,
            error: null
          }));
        } catch (error) {
          console.error('Error updating timezone:', error);
          const errorMsg = error.response?.data?.message || error.message || 'Failed to update timezone';
          set({ error: errorMsg });
          throw new Error(errorMsg);
        }
      },
      
      setSelectedProfile: (profile) => {
        set({ selectedProfile: profile });
      },
      
      // Event actions
      fetchEvents: async (profileId = null) => {
        set({ loading: true, error: null });
        try {
          const url = profileId ? `/events/profile/${profileId}` : '/events';
          const response = await api.get(url);
          set({ 
            events: response.data, 
            loading: false,
            lastFetch: Date.now(),
            error: null 
          });
        } catch (error) {
          console.error('Error fetching events:', error);
          set({ 
            loading: false, 
            error: error.message || 'Failed to load events'
          });
        }
      },
      
      createEvent: async (eventData) => {
        try {
          const response = await api.post('/events', eventData);
          set(state => ({ 
            events: [...state.events, response.data],
            error: null 
          }));
          return response.data;
        } catch (error) {
          console.error('Error creating event:', error);
          const errorMsg = error.response?.data?.message || error.message || 'Failed to create event';
          set({ error: errorMsg });
          throw new Error(errorMsg);
        }
      },
      
      updateEvent: async (eventId, eventData) => {
        try {
          const response = await api.put(`/events/${eventId}`, eventData);
          set(state => ({
            events: state.events.map(e => 
              e._id === eventId ? response.data : e
            ),
            error: null
          }));
          return response.data;
        } catch (error) {
          console.error('Error updating event:', error);
          const errorMsg = error.response?.data?.message || error.message || 'Failed to update event';
          set({ error: errorMsg });
          throw new Error(errorMsg);
        }
      },
      
      getEventLogs: async (eventId) => {
        try {
          const response = await api.get(`/events/${eventId}/logs`);
          return response.data;
        } catch (error) {
          console.error('Error fetching event logs:', error);
          const errorMsg = error.response?.data?.message || error.message || 'Failed to load event logs';
          throw new Error(errorMsg);
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),
      refetchAll: () => {
        const { fetchProfiles, fetchEvents } = get();
        fetchProfiles();
        fetchEvents();
      }
    }),
    {
      name: 'event-management-storage',
      partialize: (state) => ({
        selectedProfile: state.selectedProfile,
        profiles: state.profiles,
      })
    }
  )
);

export default useStore;