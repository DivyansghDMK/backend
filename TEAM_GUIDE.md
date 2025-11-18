# Team Guide - CPAP/BIPAP API

This guide provides essential information for team members working with the CPAP/BIPAP device data API.

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or cloud instance)
- npm or yarn

### Setup Steps
1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/mehulapi
   ```
4. Start MongoDB (if using local instance)
5. Run the server: `npm run dev`

The API will be available at `http://localhost:3000`

## Project Architecture

### File Structure
```
mehulapi/
├── config/
│   └── database.js          # MongoDB connection setup
├── controllers/
│   └── deviceController.js  # Business logic for device operations
├── models/
│   ├── DeviceData.js        # Schema for device data storage
│   └── DeviceConfig.js      # Schema for device configuration
├── routes/
│   └── deviceRoutes.js      # API route definitions
├── utils/
│   └── dataParser.js        # CPAP/BIPAP data string parsing
├── examples/
│   └── test-api.js          # Example API test script
├── server.js                # Express server entry point
└── package.json             # Dependencies and scripts
```

## Data Flow

### 1. Receiving Device Data
```
Hardware Device → Cloud → API (POST /api/devices/data)
                     ↓
              Parse Data String
                     ↓
              Store in MongoDB
                     ↓
         Check for Pending Config
                     ↓
        Return Response + Config
```

### 2. Pushing Configuration Updates
```
Admin/System → API (POST /api/devices/:deviceId/config)
                    ↓
         Save Config (pending_update: true)
                    ↓
    Next Device Data Request Returns Config
                    ↓
    Device Receives Config & Processes
                    ↓
    Device Confirms (POST /api/devices/:deviceId/config/delivered)
```

## API Endpoints Reference

### 1. Receive Device Data
**Endpoint:** `POST /api/devices/data`

**Request:**
```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
  "device_type": "CPAP",
  "device_id": "cpap_001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device data received and saved successfully",
  "data": {
    "device_id": "cpap_001",
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "config_update": {
    "available": true,
    "config_values": { ... }
  }
}
```

### 2. Get Device Configuration
**Endpoint:** `GET /api/devices/:deviceId/config`

**Response:**
```json
{
  "success": true,
  "data": {
    "device_id": "cpap_001",
    "device_type": "CPAP",
    "config_values": { ... },
    "pending_update": true,
    "last_updated": "2024-01-01T12:00:00.000Z"
  }
}
```

### 3. Set Device Configuration
**Endpoint:** `POST /api/devices/:deviceId/config`

**Request:**
```json
{
  "device_type": "CPAP",
  "config_values": {
    "pressure": 14.0,
    "humidity": 6.0,
    "temperature": 2.0,
    "mode": 1
  }
}
```

### 4. Mark Config as Delivered
**Endpoint:** `POST /api/devices/:deviceId/config/delivered`

**Response:**
```json
{
  "success": true,
  "message": "Configuration marked as delivered",
  "data": {
    "device_id": "cpap_001",
    "pending_update": false
  }
}
```

### 5. Get Device Data History
**Endpoint:** `GET /api/devices/:deviceId/data?limit=100&offset=0`

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

## Data Format Specifications

### CPAP Device Data Format
**Example:**
```
*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#
```

**Structure:**
- `S` section: Date (141125) and Time (1447)
- `G` section: Pressure settings (IPAP: 12.2, Ramp: 1.0)
- `H` section: Flow settings (Max Flow, Min Flow, Backup Rate, Mode)
- `I` section: Device settings (Humidity, Temperature, Tube Type, Mask Type, Trigger, Cycle, Mode)

### BIPAP Device Data Format
**Example:**
```
*,S,141125,1447,A,12.2,1.0,B,29.6,10.8,10.6,40.0,10.0,10.0,13.0,1.0,C,16.0,10.0,10.0,10.0,10.0,10.0,0.0,200.0,1.0,D,11.0,10.0,10.0,10.0,10.0,10.0,10.0,200.0,1.0,E,20.0,10.0,5.0,10.0,20.0,20.0,1.0,200.0,1.0,170.0,500.0,F,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#
```

**Structure:**
- `S` section: Date and Time
- `A` section: Pressure settings
- `B` section: Ventilation parameters (IPAP, EPAP, Backup Rate, Tidal Volume, Insp Time, Rise Time, Trigger, Mode)
- `C`, `D`, `E` sections: Additional device-specific parameters
- `F` section: Device settings (similar to CPAP section I)

**Parser Location:** `utils/dataParser.js`

## Database Schema

### DeviceData Collection
```javascript
{
  device_type: String (CPAP | BIPAP),
  device_id: String,
  device_status: Number,
  raw_data: String,
  parsed_data: Object,
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### DeviceConfig Collection
```javascript
{
  device_id: String (unique),
  device_type: String (CPAP | BIPAP),
  config_values: Object,
  last_updated: Date,
  pending_update: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port number | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/mehulapi |

## Common Tasks

### Testing the API
Use the example test script:
```bash
node examples/test-api.js
```

Or use curl:
```bash
# Test health endpoint
curl http://localhost:3000/health

# Send CPAP data
curl -X POST http://localhost:3000/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 1,
    "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
    "device_type": "CPAP",
    "device_id": "test_cpap_001"
  }'
```

### Adding New Data Fields
1. Update the parser in `utils/dataParser.js`
2. Update the model schema if needed in `models/DeviceData.js`
3. Update the controller logic in `controllers/deviceController.js`

### Debugging
- Check server logs in the terminal running `npm run dev`
- Verify MongoDB connection status
- Check environment variables are set correctly
- Use MongoDB Compass or CLI to inspect database collections

## Deployment Checklist

- [ ] Set `NODE_ENV=production` in production `.env`
- [ ] Update `MONGODB_URI` to production database
- [ ] Configure proper CORS settings if needed
- [ ] Set up proper error logging/monitoring
- [ ] Configure reverse proxy (nginx) if needed
- [ ] Set up process manager (PM2) for production
- [ ] Configure environment-specific ports
- [ ] Set up database backups

## Troubleshooting

### Server won't start
- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Check port 3000 is not already in use

### MongoDB connection errors
- Verify MongoDB is installed and running
- Check `MONGODB_URI` is correct
- For local MongoDB: `mongod --dbpath /path/to/data`

### Data parsing errors
- Verify data string format matches expected structure
- Check device_type is correct (CPAP or BIPAP)
- Review parser logs for specific errors

## Team Contacts & Resources

- **API Documentation:** See `README.md`
- **Test Examples:** See `examples/test-api.js`
- **Code Parser Logic:** See `utils/dataParser.js`

## Next Steps for New Team Members

1. Read this guide and `README.md`
2. Set up local development environment
3. Run the test script to verify setup
4. Review the code structure
5. Test with sample CPAP/BIPAP data
6. Familiarize yourself with MongoDB queries

