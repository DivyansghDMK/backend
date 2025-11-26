import express from 'express';
import {
  receiveECGData,
  getECGData,
  getECGDataById,
  getPresignedURLs,
} from '../controllers/ecgController.js';

const router = express.Router();

/**
 * @route   POST /api/ecg/data
 * @desc    Receive and store ECG data (JSON + PDF) to S3 and MongoDB
 * @access  Public (add authentication as needed)
 */
router.post('/data', receiveECGData);

/**
 * @route   GET /api/ecg/data
 * @desc    Get ECG data records with filtering and pagination
 * @access  Public (add authentication as needed)
 */
router.get('/data', getECGData);

/**
 * @route   GET /api/ecg/data/:recordId
 * @desc    Get single ECG record by ID
 * @access  Public (add authentication as needed)
 */
router.get('/data/:recordId', getECGDataById);

/**
 * @route   POST /api/ecg/data/:recordId/presigned-urls
 * @desc    Get presigned URLs for accessing S3 files
 * @access  Public (add authentication as needed)
 */
router.post('/data/:recordId/presigned-urls', getPresignedURLs);

export default router;

