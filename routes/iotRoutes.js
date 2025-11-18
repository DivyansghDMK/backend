import express from 'express';
import { receiveIoTData } from '../controllers/iotController.js';

const router = express.Router();

// Webhook endpoint for AWS IoT Core
// This is called by AWS IoT Core Rule Action (HTTPS)
router.post('/webhook', receiveIoTData);

export default router;

