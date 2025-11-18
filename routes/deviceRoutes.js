import express from 'express';
import {
  receiveDeviceData,
  getDeviceConfig,
  setDeviceConfig,
  markConfigDelivered,
  getDeviceDataHistory,
} from '../controllers/deviceController.js';

const router = express.Router();

// Receive device data from hardware
router.post('/data', receiveDeviceData);

// Get device configuration
router.get('/:deviceId/config', getDeviceConfig);

// Set/update device configuration
router.post('/:deviceId/config', setDeviceConfig);

// Mark configuration as delivered
router.post('/:deviceId/config/delivered', markConfigDelivered);

// Get device data history
router.get('/:deviceId/data', getDeviceDataHistory);

export default router;

