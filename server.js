import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/database.js';
import deviceRoutes from './routes/deviceRoutes.js';
import iotRoutes from './routes/iotRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to database (non-blocking - won't crash server if MongoDB unavailable)
connectDB().catch(err => {
  console.warn('MongoDB connection attempted but server will continue');
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Root endpoint - API information
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CPAP/BIPAP Device Data API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /health',
      receiveDeviceData: 'POST /api/devices/data',
      getDeviceConfig: 'GET /api/devices/:deviceId/config',
      setDeviceConfig: 'POST /api/devices/:deviceId/config',
      markConfigDelivered: 'POST /api/devices/:deviceId/config/delivered',
      getDeviceDataHistory: 'GET /api/devices/:deviceId/data',
      iotWebhook: 'POST /api/iot/webhook',
    },
    documentation: 'See README.md for full API documentation',
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/iot', iotRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

