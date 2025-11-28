import express from 'express';
import {
  receiveOCData,
  getOCDataHistory,
  getLatestOCData,
  updateOCData,
} from '../controllers/ocController.js';

const router = express.Router();

/**
 * @route   POST /api/oc/data
 * @desc    Receive OC data from mobile app or machine
 * @access  Public
 * 
 * Formats:
 * - Mobile request: { device_status: 1, device_data: 0/1/2/3, device_id: "12345678" }
 * - Machine ack: { device_status: 0, device_data: 0/1/2/3, device_id: "12345678" }
 * - Data storage: { device_data: "power_status, alm_status", device_id: "device_id" }
 */
router.post('/data', receiveOCData);

/**
 * @route   GET /api/oc/data/:deviceId
 * @desc    Get OC data history for a device
 * @access  Public
 * @query   limit, source, device_status
 */
router.get('/data/:deviceId', getOCDataHistory);

/**
 * @route   GET /api/oc/data/:deviceId/latest
 * @desc    Get latest OC data for a device
 * @access  Public
 */
router.get('/data/:deviceId/latest', getLatestOCData);

/**
 * @route   PUT /api/oc/data/:deviceId
 * @desc    Update device data (data storage format)
 * @access  Public
 * @body    { device_data: "power_status, alm_status" }
 */
router.put('/data/:deviceId', updateOCData);

export default router;

