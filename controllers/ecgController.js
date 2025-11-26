import ECGData from '../models/ECGData.js';
import { uploadJSONToS3, uploadPDFToS3, generateECGFileKey } from '../config/awsS3.js';
import mongoose from 'mongoose';

/**
 * Receive and store ECG data (JSON + PDF)
 * POST /api/ecg/data
 * 
 * Accepts:
 * - JSON data as object or string
 * - PDF as base64 string or Buffer
 * - Device/patient metadata
 */
export const receiveECGData = async (req, res) => {
  const requestId = `ecg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[${requestId}] 📥 Received ECG data request`);

  try {
    // Check MongoDB connection
    const isMongoConnected = mongoose.connection.readyState === 1;
    if (!isMongoConnected) {
      console.error(`[${requestId}] ❌ MongoDB not connected!`);
      try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`[${requestId}] ✅ MongoDB reconnected`);
      } catch (reconnectError) {
        return res.status(503).json({
          success: false,
          message: 'Database unavailable',
          requestId,
        });
      }
    }

    const {
      device_id,
      patient_id,
      session_id,
      ecg_json_data,
      ecg_pdf_data, // base64 encoded PDF
      ecg_pdf_buffer, // PDF as Buffer (if sending binary)
      recording_date,
      recording_duration,
      sample_rate,
      leads,
      linked_device_id,
      linked_device_type,
      data_source = 'software',
    } = req.body;

    // Validation
    if (!device_id) {
      return res.status(400).json({
        success: false,
        message: 'device_id is required',
      });
    }

    if (!ecg_json_data) {
      return res.status(400).json({
        success: false,
        message: 'ecg_json_data is required',
      });
    }

    if (!ecg_pdf_data && !ecg_pdf_buffer) {
      return res.status(400).json({
        success: false,
        message: 'ecg_pdf_data (base64) or ecg_pdf_buffer is required',
      });
    }

    // Parse JSON data if it's a string
    let parsedECGData;
    try {
      parsedECGData = typeof ecg_json_data === 'string' 
        ? JSON.parse(ecg_json_data) 
        : ecg_json_data;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `Invalid JSON data: ${error.message}`,
      });
    }

    // Convert PDF from base64 to Buffer if needed
    let pdfBuffer;
    if (ecg_pdf_buffer) {
      pdfBuffer = Buffer.isBuffer(ecg_pdf_buffer) 
        ? ecg_pdf_buffer 
        : Buffer.from(ecg_pdf_buffer);
    } else if (ecg_pdf_data) {
      // Handle base64 encoded PDF
      const base64Data = ecg_pdf_data.replace(/^data:application\/pdf;base64,/, '');
      pdfBuffer = Buffer.from(base64Data, 'base64');
    }

    // Validate PDF buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PDF data',
      });
    }

    // Generate file keys
    const timestamp = recording_date ? new Date(recording_date) : new Date();
    const jsonKey = generateECGFileKey(device_id, 'json', timestamp);
    const pdfKey = generateECGFileKey(device_id, 'pdf', timestamp);

    console.log(`[${requestId}] 📤 Uploading files to S3...`);

    // Upload JSON to S3
    const jsonUploadResult = await uploadJSONToS3(
      parsedECGData,
      `${device_id}_ecg.json`,
      {
        device_id,
        patient_id: patient_id || '',
        session_id: session_id || '',
        recording_date: recording_date || timestamp.toISOString(),
      }
    );

    // Upload PDF to S3
    const pdfUploadResult = await uploadPDFToS3(
      pdfBuffer,
      `${device_id}_ecg.pdf`,
      {
        device_id,
        patient_id: patient_id || '',
        session_id: session_id || '',
        recording_date: recording_date || timestamp.toISOString(),
      }
    );

    console.log(`[${requestId}] ✅ Files uploaded to S3`);

    // Extract metadata from JSON data if available
    const extractedMetadata = {
      recording_date: recording_date || parsedECGData.recording_date || parsedECGData.timestamp || timestamp,
      recording_duration: recording_duration || parsedECGData.duration || parsedECGData.recording_duration,
      sample_rate: sample_rate || parsedECGData.sample_rate || parsedECGData.sampling_rate,
      leads: leads || parsedECGData.leads || parsedECGData.channels || [],
    };

    // Create ECG data record
    const ecgDataRecord = new ECGData({
      device_id,
      patient_id: patient_id || parsedECGData.patient_id || null,
      session_id: session_id || parsedECGData.session_id || null,
      ecg_data: parsedECGData,
      json_s3_key: jsonUploadResult.s3_key,
      json_s3_url: jsonUploadResult.s3_url,
      pdf_s3_key: pdfUploadResult.s3_key,
      pdf_s3_url: pdfUploadResult.s3_url,
      s3_bucket: jsonUploadResult.bucket,
      file_metadata: {
        json_size: Buffer.byteLength(JSON.stringify(parsedECGData)),
        pdf_size: pdfBuffer.length,
        json_content_type: 'application/json',
        pdf_content_type: 'application/pdf',
      },
      recording_date: extractedMetadata.recording_date ? new Date(extractedMetadata.recording_date) : timestamp,
      recording_duration: extractedMetadata.recording_duration,
      sample_rate: extractedMetadata.sample_rate,
      leads: extractedMetadata.leads,
      status: 'uploaded',
      data_source,
      linked_device_id: linked_device_id || null,
      linked_device_type: linked_device_type || null,
      timestamp,
    });

    await ecgDataRecord.save();
    console.log(`[${requestId}] 💾 ECG data saved to MongoDB: ${ecgDataRecord._id}`);

    return res.status(200).json({
      success: true,
      message: 'ECG data received and saved successfully',
      data: {
        ecg_record_id: ecgDataRecord._id,
        device_id: ecgDataRecord.device_id,
        patient_id: ecgDataRecord.patient_id,
        session_id: ecgDataRecord.session_id,
        json_s3_url: ecgDataRecord.json_s3_url,
        pdf_s3_url: ecgDataRecord.pdf_s3_url,
        recording_date: ecgDataRecord.recording_date,
        timestamp: ecgDataRecord.timestamp,
      },
      requestId,
    });
  } catch (error) {
    console.error(`[${requestId}] ❌ Error processing ECG data:`, error);
    return res.status(500).json({
      success: false,
      message: `Error processing ECG data: ${error.message}`,
      requestId,
    });
  }
};

/**
 * Get ECG data records
 * GET /api/ecg/data?device_id=xxx&patient_id=xxx&limit=100&offset=0
 */
export const getECGData = async (req, res) => {
  try {
    const {
      device_id,
      patient_id,
      session_id,
      limit = 100,
      offset = 0,
      status,
      start_date,
      end_date,
    } = req.query;

    const query = {};

    if (device_id) query.device_id = device_id;
    if (patient_id) query.patient_id = patient_id;
    if (session_id) query.session_id = session_id;
    if (status) query.status = status;

    // Date range filter
    if (start_date || end_date) {
      query.recording_date = {};
      if (start_date) query.recording_date.$gte = new Date(start_date);
      if (end_date) query.recording_date.$lte = new Date(end_date);
    }

    const records = await ECGData.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('-ecg_data') // Exclude large JSON data from list view
      .lean();

    const total = await ECGData.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: records,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + records.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching ECG data:', error);
    return res.status(500).json({
      success: false,
      message: `Error fetching ECG data: ${error.message}`,
    });
  }
};

/**
 * Get single ECG record by ID
 * GET /api/ecg/data/:recordId
 */
export const getECGDataById = async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await ECGData.findById(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'ECG record not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error fetching ECG record:', error);
    return res.status(500).json({
      success: false,
      message: `Error fetching ECG record: ${error.message}`,
    });
  }
};

/**
 * Get presigned URLs for accessing S3 files
 * POST /api/ecg/data/:recordId/presigned-urls
 */
export const getPresignedURLs = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { expiresIn = 3600 } = req.body; // Default 1 hour

    const record = await ECGData.findById(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'ECG record not found',
      });
    }

    const { getPresignedURL } = await import('../config/awsS3.js');

    const [jsonUrl, pdfUrl] = await Promise.all([
      getPresignedURL(record.json_s3_key, parseInt(expiresIn)),
      getPresignedURL(record.pdf_s3_key, parseInt(expiresIn)),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        json_presigned_url: jsonUrl,
        pdf_presigned_url: pdfUrl,
        expires_in: expiresIn,
      },
    });
  } catch (error) {
    console.error('Error generating presigned URLs:', error);
    return res.status(500).json({
      success: false,
      message: `Error generating presigned URLs: ${error.message}`,
    });
  }
};

