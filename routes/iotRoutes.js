import express from 'express';
import { receiveIoTData } from '../controllers/iotController.js';

const router = express.Router();

// GET endpoint for AWS IoT HTTP destination confirmation
// AWS IoT sends a GET request with query params to confirm destination ownership
router.get('/webhook', (req, res) => {
  console.log('📧 AWS IoT destination confirmation request received');
  console.log('Query params:', req.query);
  
  // AWS IoT sends confirmation with x-amzn-trace-id or similar query params
  // Return 200 OK to confirm ownership
  res.status(200).json({
    success: true,
    message: 'AWS IoT destination confirmed',
    endpoint: '/api/iot/webhook',
    timestamp: new Date().toISOString(),
  });
});

// POST endpoint for receiving actual device data from AWS IoT Core
// This is called by AWS IoT Core Rule Action (HTTPS)
router.post('/webhook', receiveIoTData);

export default router;

