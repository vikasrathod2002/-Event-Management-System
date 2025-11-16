import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import profileRoutes from './routes/profiles.js';
import eventRoutes from './routes/events.js';

dotenv.config();

const app = express();

// Enhanced CORS for production
app.use(cors({
  origin: [
    'https://your-frontend-app.vercel.app', // Your frontend URL
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/profiles', profileRoutes);
app.use('/api/events', eventRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    const Profile = (await import('./models/Profile.js')).default;
    const profilesCount = await Profile.countDocuments();
    
    res.json({
      message: 'API is working!',
      database: 'Connected',
      profiles: profilesCount,
      endpoints: [
        'GET /api/health',
        'GET /api/profiles',
        'POST /api/profiles',
        'GET /api/events',
        'POST /api/events'
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MongoDB connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('💡 Check your MongoDB Atlas connection string and network access');
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 ===== EVENT MANAGEMENT BACKEND =====');
  console.log(`📍 Server running on port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 MongoDB: ${MONGODB_URI ? 'Configured' : 'Not configured'}`);
  console.log('🔗 Test URLs:');
  console.log(`   ➜ Health: http://localhost:${PORT}/api/health`);
  console.log(`   ➜ Test:   http://localhost:${PORT}/api/test`);
  console.log('==========================================\n');
});

export default app;