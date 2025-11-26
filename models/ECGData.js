import mongoose from 'mongoose';

const ecgDataSchema = new mongoose.Schema({
  device_id: {
    type: String,
    required: true,
    index: true,
  },
  patient_id: {
    type: String,
    index: true,
  },
  session_id: {
    type: String,
    index: true,
  },
  // Metadata from JSON data
  ecg_data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  // S3 file references
  json_s3_key: {
    type: String,
    required: true,
  },
  json_s3_url: {
    type: String,
    required: true,
  },
  pdf_s3_key: {
    type: String,
    required: true,
  },
  pdf_s3_url: {
    type: String,
    required: true,
  },
  s3_bucket: {
    type: String,
    required: true,
  },
  // File metadata
  file_metadata: {
    json_size: Number,
    pdf_size: Number,
    json_content_type: { type: String, default: 'application/json' },
    pdf_content_type: { type: String, default: 'application/pdf' },
  },
  // Recording metadata
  recording_date: {
    type: Date,
    index: true,
  },
  recording_duration: Number, // in seconds
  sample_rate: Number, // Hz
  leads: [String], // e.g., ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', ...]
  // Status and processing
  status: {
    type: String,
    enum: ['uploaded', 'processed', 'analyzed', 'error'],
    default: 'uploaded',
    index: true,
  },
  data_source: {
    type: String,
    enum: ['software', 'api', 'webhook', 'direct'],
    default: 'software',
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  // Optional: Link to CPAP/BIPAP data if same patient/device
  linked_device_id: {
    type: String,
    index: true,
  },
  linked_device_type: {
    type: String,
    enum: ['CPAP', 'BIPAP'],
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
ecgDataSchema.index({ device_id: 1, timestamp: -1 });
ecgDataSchema.index({ patient_id: 1, timestamp: -1 });
ecgDataSchema.index({ recording_date: -1 });
ecgDataSchema.index({ status: 1, timestamp: -1 });

export default mongoose.model('ECGData', ecgDataSchema);

