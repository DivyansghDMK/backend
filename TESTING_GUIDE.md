# Complete Testing Guide

This guide shows you exactly how to test your API and where data is saved.

## Where Your Data is Saved

### 1. MongoDB Database

**Database Name:** `mehulapi` (or whatever you set in `MONGODB_URI`)

**Collections:**

#### DeviceData Collection
Stores all device data received from hardware.

**Document Structure:**
```javascript
{
  _id: ObjectId("..."),
  device_type: "CPAP",           // CPAP or BIPAP
  device_id: "24",               // Extracted from topic or provided
  device_status: 0,              // Device status code
  raw_data: "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
  parsed_data: {                 // Parsed structured data
    sections: {
      S: ["R", "141125", "1703", "MANUALMODE"],
      G: [13.6, 1.0],
      H: [12.4, 12.4, 20.0, 1.0],
      I: [5.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 12345678]
    },
    metadata: {
      date: "R",
      time: "141125"
    },
    pressure: {
      ipap: 13.6,
      ramp: 1.0
    },
    flow: {
      max_flow: 12.4,
      min_flow: 12.4,
      backup_rate: 20.0,
      mode: 1.0
    },
    settings: {
      humidity: 5.0,
      temperature: 1.0,
      // ... etc
    }
  },
  timestamp: ISODate("2025-11-15T17:38:50.000Z"),
  createdAt: ISODate("2025-11-15T17:38:50.000Z"),
  updatedAt: ISODate("2025-11-15T17:38:50.000Z")
}
```

#### DeviceConfig Collection
Stores device configuration updates.

**Document Structure:**
```javascript
{
  _id: ObjectId("..."),
  device_id: "24",               // Device identifier
  device_type: "CPAP",           // CPAP or BIPAP
  config_values: {               // Configuration values
    pressure: 15.0,
    humidity: 6.0,
    temperature: 2.0,
    mode: "MANUALMODE"
  },
  pending_update: true,          // true = not yet delivered to device
  last_updated: ISODate("2025-11-15T17:39:00.000Z"),
  createdAt: ISODate("2025-11-15T17:39:00.000Z"),
  updatedAt: ISODate("2025-11-15T17:39:00.000Z")
}
```

### 2. How to View Saved Data

#### Option 1: MongoDB Compass (GUI)
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to: `mongodb://localhost:27017`
3. Select database: `mehulapi`
4. View collections: `DeviceData` and `DeviceConfig`

#### Option 2: MongoDB Shell (CLI)
```bash
# Connect to MongoDB
mongosh

# Use your database
use mehulapi

# View all device data
db.devicedatas.find().pretty()

# View all configs
db.deviceconfigs.find().pretty()

# View data for specific device
db.devicedatas.find({ device_id: "24" }).pretty()

# View latest data
db.devicedatas.find().sort({ timestamp: -1 }).limit(5).pretty()
```

#### Option 3: Using API Endpoints
```bash
# Get device data history
curl http://localhost:3000/api/devices/24/data?limit=10

# Get device configuration
curl http://localhost:3000/api/devices/24/config
```

## Testing Steps

### Step 1: Start MongoDB

Make sure MongoDB is running:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# Or check if running
ps aux | grep mongod
```

### Step 2: Start Backend Server

```bash
cd /Users/deckmount/Documents/mehulapi
npm run dev
```

You should see:
```
Server running on port 3000 in development mode
MongoDB Connected: localhost
```

### Step 3: Test Health Endpoint

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-11-15T17:40:00.000Z"
}
```

### Step 4: Test Receiving Device Data (Direct API)

```bash
curl -X POST http://localhost:3000/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "24"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Device data received and saved successfully",
  "data": {
    "device_id": "24",
    "timestamp": "2025-11-15T17:40:00.000Z"
  },
  "config_update": {
    "available": false
  }
}
```

**Verify Data Saved:**
```bash
# Check MongoDB
mongosh mehulapi --eval "db.devicedatas.find({ device_id: '24' }).sort({ timestamp: -1 }).limit(1).pretty()"
```

### Step 5: Test IoT Webhook Endpoint

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "topic": "esp32/data24"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "IoT data received and processed successfully",
  "data": {
    "device_id": "24",
    "timestamp": "2025-11-15T17:40:00.000Z"
  },
  "config_update": {
    "available": false
  }
}
```

### Step 6: Set Device Configuration

```bash
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 15.0,
      "humidity": 6.0,
      "temperature": 2.0,
      "mode": "MANUALMODE"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Device configuration saved successfully",
  "data": {
    "device_id": "24",
    "device_type": "CPAP",
    "config_values": {
      "pressure": 15.0,
      "humidity": 6.0,
      "temperature": 2.0,
      "mode": "MANUALMODE"
    },
    "pending_update": true,
    "last_updated": "2025-11-15T17:41:00.000Z"
  }
}
```

**Verify Config Saved:**
```bash
# Check MongoDB
mongosh mehulapi --eval "db.deviceconfigs.find({ device_id: '24' }).pretty()"
```

### Step 7: Test Config Publishing (Send Data Again)

After setting config, send data again - backend should publish config to IoT Core:

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "topic": "esp32/data24"
  }'
```

**Check Backend Logs** - You should see:
```
Config published to IoT Core topic: esp32/config24 for device: 24
```

**Verify in AWS IoT Test Client:**
1. Subscribe to topic: `esp32/config24`
2. You should see the config message!

### Step 8: Get Device Data History

```bash
curl "http://localhost:3000/api/devices/24/data?limit=5&offset=0"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "_id": "...",
        "device_type": "CPAP",
        "device_id": "24",
        "device_status": 0,
        "parsed_data": { ... },
        "timestamp": "2025-11-15T17:40:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 5,
      "offset": 0,
      "has_more": false
    }
  }
}
```

### Step 9: Get Device Configuration

```bash
curl http://localhost:3000/api/devices/24/config
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "device_id": "24",
    "device_type": "CPAP",
    "config_values": {
      "pressure": 15.0,
      "humidity": 6.0,
      "temperature": 2.0,
      "mode": "MANUALMODE"
    },
    "pending_update": true,
    "last_updated": "2025-11-15T17:41:00.000Z"
  }
}
```

## Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:3000"

echo "1. Testing Health..."
curl -s $API_URL/health | jq .

echo -e "\n2. Sending Device Data..."
curl -s -X POST $API_URL/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "test_device_001"
  }' | jq .

echo -e "\n3. Setting Configuration..."
curl -s -X POST $API_URL/api/devices/test_device_001/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 16.0,
      "humidity": 7.0
    }
  }' | jq .

echo -e "\n4. Getting Device Data History..."
curl -s "$API_URL/api/devices/test_device_001/data?limit=5" | jq .

echo -e "\n5. Getting Configuration..."
curl -s $API_URL/api/devices/test_device_001/config | jq .

echo -e "\n✅ Tests Complete!"
```

Run it:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Data Storage Summary

| Data Type | Collection | Location |
|-----------|-----------|----------|
| Device Data | `DeviceData` | MongoDB: `mehulapi.devicedatas` |
| Device Config | `DeviceConfig` | MongoDB: `mehulapi.deviceconfigs` |
| Raw Data String | `raw_data` field | Stored in DeviceData collection |
| Parsed Data | `parsed_data` field | Stored in DeviceData collection |

## MongoDB Connection

**Local MongoDB:**
```
mongodb://localhost:27017/mehulapi
```

**Check if MongoDB is running:**
```bash
mongosh mehulapi --eval "db.stats()"
```

## Viewing Data in Real-Time

### Using API Endpoints

```bash
# Watch latest data (refresh every 2 seconds)
watch -n 2 'curl -s http://localhost:3000/api/devices/24/data?limit=1 | jq .'
```

### Using MongoDB Shell

```bash
# Connect and watch
mongosh mehulapi

# Then run queries:
db.devicedatas.find().sort({ timestamp: -1 }).limit(10).pretty()
db.deviceconfigs.find().pretty()
```

That's it! Your data is saved in MongoDB and you can test everything using these steps.

