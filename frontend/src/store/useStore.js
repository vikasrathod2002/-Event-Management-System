import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Get API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://event-management-system-backend-dpmx.onrender.com';

console.log('🔧 Store API URL:', `${API_BASE_URL}/api`);

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    let userMessage = 'An unexpected error occurred';
    
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      userMessage = 'Unable to connect to server. Please check your connection.';
    } else if (error.response?.status >= 500) {
      userMessage = 'Server error. Please try again later.';
    } else if (error.response?.status === 404) {
      userMessage = 'Requested resource not found.';
    } else if (error.response?.data?.message) {
      userMessage = error.response.data.message;
    }
    
    error.userMessage = userMessage;
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

      // Profile actions
      fetchProfiles: async () => {
        set({ loading: true, error: null });
        try {
          console.log('📞 Fetching profiles from:', '/profiles');
          const response = await api.get('/profiles');
          set({ 
            profiles: response.data, 
            loading: false,
            error: null 
          });
        } catch (error) {
          console.error('❌ Error fetching profiles:', error);
          set({ 
            loading: false, 
            error: error.userMessage || error.message || 'Failed to load profiles'
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
          const errorMsg = error.userMessage || error.response?.data?.message || error.message || 'Failed to create profile';
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
          const errorMsg = error.userMessage || error.response?.data?.message || error.message || 'Failed to update timezone';
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
            error: null 
          });
        } catch (error) {
          console.error('Error fetching events:', error);
          set({ 
            loading: false, 
            error: error.userMessage || error.message || 'Failed to load events'
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
          const errorMsg = error.userMessage || error.response?.data?.message || error.message || 'Failed to create event';
          set({ error: errorMsg });
          throw new Error(errorMsg);
        }
      },
      
      clearError: () => set({ error: null })
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