# CPAP/BIPAP Device Data API

A RESTful API for managing CPAP and BIPAP device data. This API receives data from hardware devices via cloud, stores it in a database, and allows pushing configuration updates back to devices.

## Features

- 📥 Receive and store device data from CPAP/BIPAP hardware
- 💾 Parse and store structured device data in MongoDB
- ⚙️ Push configuration updates to devices
- 📊 Retrieve device data history
- 🔄 Track pending configuration updates
- ☁️ AWS IoT Core integration for cloud-based device communication
- 🔗 Webhook endpoint for receiving IoT Core messages

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mehulapi

# AWS IoT Core Configuration (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_IOT_ENDPOINT=xxxxxx-ats.iot.us-east-1.amazonaws.com
```

3. Make sure MongoDB is running (or update `MONGODB_URI` to point to your MongoDB instance)

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```
Check if the API is running.

### Receive Device Data
```
POST /api/devices/data
```

Receives data from hardware devices and stores it in the database.

**Request Body:**
```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
  "device_type": "CPAP",
  "device_id": "device_001" // optional, will be auto-generated if not provided
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device data received and saved successfully",
  "data": {
    "device_id": "device_001",
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "config_update": {
    "available": true,
    "config_values": { ... }
  }
}
```

### Get Device Configuration
```
GET /api/devices/:deviceId/config
```

Retrieves the current configuration for a device.

**Response:**
```json
{
  "success": true,
  "data": {
    "device_id": "device_001",
    "device_type": "CPAP",
    "config_values": { ... },
    "last_updated": "2024-01-01T12:00:00.000Z",
    "pending_update": true
  }
}
```

### Set Device Configuration
```
POST /api/devices/:deviceId/config
```

Creates or updates device configuration that will be sent to the device.

**Request Body:**
```json
{
  "device_type": "CPAP",
  "config_values": {
    "pressure": 12.0,
    "humidity": 5.0,
    "temperature": 1.0,
    "mode": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device configuration saved successfully",
  "data": {
    "device_id": "device_001",
    "device_type": "CPAP",
    "config_values": { ... },
    "pending_update": true,
    "last_updated": "2024-01-01T12:00:00.000Z"
  }
}
```

### Mark Configuration as Delivered
```
POST /api/devices/:deviceId/config/delivered
```

Marks a configuration as delivered after the device has received it.

**Response:**
```json
{
  "success": true,
  "message": "Configuration marked as delivered",
  "data": {
    "device_id": "device_001",
    "pending_update": false
  }
}
```

### Get Device Data History
```
GET /api/devices/:deviceId/data?limit=100&offset=0
```

Retrieves historical data for a device with pagination.

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 100)
- `offset` (optional): Number of records to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "records": [ ... ],
    "pagination": {
      "total": 500,
      "limit": 100,
      "offset": 0,
      "has_more": true
    }
  }
}
```

## Device Data Format

### CPAP Device Data
The CPAP device sends data in the following format:
```
*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#
```

Where:
- `S` section: Date (141125) and Time (1447)
- `G` section: Pressure settings (IPAP: 12.2, Ramp: 1.0)
- `H` section: Flow settings
- `I` section: Device settings (humidity, temperature, etc.)

### BIPAP Device Data
The BIPAP device sends data in the following format:
```
*,S,141125,1447,A,12.2,1.0,B,29.6,10.8,10.6,40.0,10.0,10.0,13.0,1.0,C,16.0,10.0,10.0,10.0,10.0,10.0,0.0,200.0,1.0,D,11.0,10.0,10.0,10.0,10.0,10.0,10.0,200.0,1.0,E,20.0,10.0,5.0,10.0,20.0,20.0,1.0,200.0,1.0,170.0,500.0,F,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#
```

Where:
- `S` section: Date and Time
- `A` section: Pressure settings
- `B` section: Ventilation parameters
- `C`, `D`, `E`, `F` sections: Additional device-specific parameters

## Project Structure

```
mehulapi/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── deviceController.js  # Device data and config handlers
├── models/
│   ├── DeviceData.js        # Device data schema
│   └── DeviceConfig.js      # Device configuration schema
├── routes/
│   └── deviceRoutes.js      # API routes
├── utils/
│   └── dataParser.js        # CPAP/BIPAP data parsing logic
├── .env                     # Environment variables (create this)
├── .gitignore
├── package.json
├── README.md
└── server.js                # Express server entry point
```

## Workflow

1. **Device sends data**: Hardware sends data to cloud → Cloud forwards to API
2. **API receives data**: `POST /api/devices/data` endpoint receives the data
3. **Data parsing**: API parses the data string and extracts structured information
4. **Storage**: Parsed data is stored in MongoDB
5. **Config check**: API checks if there's a pending configuration update for the device
6. **Response**: API responds with confirmation and any pending config updates
7. **Device receives config**: Device processes the configuration update
8. **Acknowledge**: Device can call `POST /api/devices/:deviceId/config/delivered` to mark config as received

## Testing

You can test the API using curl or any HTTP client:

### Example: Send CPAP device data
```bash
curl -X POST http://localhost:3000/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 1,
    "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
    "device_type": "CPAP",
    "device_id": "cpap_001"
  }'
```

### Example: Set device configuration
```bash
curl -X POST http://localhost:3000/api/devices/cpap_001/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 14.0,
      "humidity": 6.0
    }
  }'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/mehulapi |

## AWS IoT Core Integration

This API supports AWS IoT Core for cloud-based device communication. Devices can send data through IoT Core, which forwards it to the backend API. Configuration updates are pushed back through IoT Core to the devices.

### Quick Setup

1. Configure AWS credentials in `.env` file (see Installation section)
2. Create IoT Core Rule to forward messages to `/api/iot/webhook`
3. Devices publish to topic: `devices/{device_id}/data`
4. Backend publishes config updates to topic: `devices/{device_id}/config/update`

For detailed setup instructions, see [AWS_IOT_SETUP.md](./AWS_IOT_SETUP.md).

### IoT Webhook Endpoint

**Endpoint:** `POST /api/iot/webhook`

Receives device data from AWS IoT Core Rule Action (HTTPS).

**Request:**
```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
  "device_type": "CPAP",
  "device_id": "cpap_001",
  "topic": "devices/cpap_001/data"
}
```

When a device configuration is set via `POST /api/devices/:deviceId/config`, it automatically publishes to AWS IoT Core topic `devices/{deviceId}/config/update` for the device to receive.

## License

ISC

