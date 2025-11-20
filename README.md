# 📚 Complete Documentation

**Generated:** Thu Nov 20 13:44:38 IST 2025

---

## 📋 Table of Contents


---

## # 📖 README

*Source: README.md*

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



---

## # 🏗️ Architecture

*Source: ARCHITECTURE.md*

# 🏗️ System Architecture Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Data Flow](#data-flow)
4. [Component Breakdown](#component-breakdown)
5. [Technology Stack](#technology-stack)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [AWS IoT Core Integration](#aws-iot-core-integration)
9. [Deployment Architecture](#deployment-architecture)

---

## 🎯 System Overview

This is a **CPAP/BIPAP Device Data Management API** that enables:
- **Real-time data ingestion** from medical devices via AWS IoT Core
- **Data persistence** in MongoDB Atlas
- **Bidirectional communication** with devices (data → cloud, config → device)
- **Data source tracking** (cloud vs software vs direct)
- **RESTful API** for applications to interact with device data

### Key Features
- ✅ Real-time MQTT data reception from AWS IoT Core
- ✅ Automatic data parsing for CPAP/BIPAP devices
- ✅ Device configuration management
- ✅ Push configuration updates to devices via AWS IoT Core
- ✅ Data source identification (cloud/software/direct)
- ✅ Retry logic for database operations
- ✅ Resilient MongoDB connection handling

---

## 🏛️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEVICE LAYER (Hardware)                          │
│                                                                           │
│  ┌──────────────┐                                                        │
│  │  ESP32 Device │  (CPAP/BIPAP Device)                                  │
│  │  (Arduino)    │                                                        │
│  └──────┬───────┘                                                        │
│         │ MQTT Publish                                                    │
│         │ Topic: esp32/data24                                             │
│         │ Payload: {device_status, device_data, device_type}             │
└─────────┼─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        AWS IoT CORE (Message Broker)                      │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │  AWS IoT Core                                                 │        │
│  │  • Receives MQTT messages from devices                        │        │
│  │  • IoT Rule: SQL query filters messages                       │        │
│  │  • IoT Rule Action: HTTPS POST to API webhook                 │        │
│  └───────────────────────────────┬──────────────────────────────┘        │
│                                  │ HTTPS POST                             │
│                                  │ https://api.../api/iot/webhook         │
└──────────────────────────────────┼────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER (Node.js API)                   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │  Express.js Server (server.js)                                │        │
│  │  • Port: 3000 (configurable via PORT env)                     │        │
│  │  • Host: 0.0.0.0 (Railway compatible)                         │        │
│  │  • CORS enabled for cross-origin requests                     │        │
│  └───────────────────────────────┬──────────────────────────────┘        │
│                                  │                                        │
│        ┌─────────────────────────┼─────────────────────────┐             │
│        │                         │                         │             │
│        ▼                         ▼                         ▼             │
│  ┌─────────────┐        ┌──────────────┐        ┌─────────────┐          │
│  │ iotRoutes   │        │ deviceRoutes │        │ Middleware  │          │
│  │ /api/iot/*  │        │ /api/devices/*│       │ • CORS      │          │
│  └─────┬───────┘        └──────┬───────┘        │ • JSON      │          │
│        │                       │                 │ • Morgan    │          │
│        │                       │                 └─────────────┘          │
│        ▼                       ▼                                           │
│  ┌──────────────────────────────────────────┐                            │
│  │         CONTROLLERS LAYER                 │                            │
│  │                                           │                            │
│  │  ┌─────────────────────────────────────┐  │                            │
│  │  │  iotController.js                   │  │                            │
│  │  │  • receiveIoTData()                 │  │                            │
│  │  │    - Receives from AWS IoT Core     │  │                            │
│  │  │    - Extracts device ID from topic  │  │                            │
│  │  │    - Auto-detects device type       │  │                            │
│  │  │    - Marks data_source: 'cloud'     │  │                            │
│  │  │    - Retry logic for DB saves       │  │                            │
│  │  └─────────────────────────────────────┘  │                            │
│  │                                           │                            │
│  │  ┌─────────────────────────────────────┐  │                            │
│  │  │  deviceController.js                │  │                            │
│  │  │  • receiveDeviceData()              │  │                            │
│  │  │    - Direct API calls               │  │                            │
│  │  │    - Marks data_source: 'software'  │  │                            │
│  │  │  • getDeviceConfig()                │  │                            │
│  │  │  • setDeviceConfig()                │  │                            │
│  │  │  • getDeviceDataHistory()           │  │                            │
│  │  │    - Supports data_source filter    │  │                            │
│  │  └─────────────────────────────────────┘  │                            │
│  └───────────────────────┬───────────────────┘                            │
│                          │                                                 │
│        ┌─────────────────┴─────────────────┐                              │
│        │                                   │                              │
│        ▼                                   ▼                              │
│  ┌──────────────┐              ┌──────────────────────┐                  │
│  │ dataParser.js│              │  awsIoT.js           │                  │
│  │              │              │  • publishToIoT()    │                  │
│  │ parseCPAPData()             │  • publishDeviceConfig()│               │
│  │ parseBIPAPData()            │  • publishAcknowledgment()│             │
│  │ parseDeviceData()           └──────────┬───────────┘                  │
│  └──────────────┘                         │                               │
│                                            │ AWS SDK                       │
│                                            │ Publish to IoT Core           │
└────────────────────────────────────────────┼───────────────────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │   AWS IoT Core  │
                                    │  Topic: esp32/  │
                                    │     config24    │
                                    └─────────────────┘
                                             │
                                             │ MQTT Subscribe
                                             ▼
                                    ┌─────────────────┐
                                    │   ESP32 Device  │
                                    │  (Receives Config)│
                                    └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE LAYER                            │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │  database.js                                                  │        │
│  │  • Non-blocking MongoDB connection                            │        │
│  │  • Connection state tracking (isConnected)                    │        │
│  │  • Auto-reconnection on disconnect                            │        │
│  └───────────────────────────────┬──────────────────────────────┘        │
│                                  │ Mongoose ORM                           │
│                                  ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐        │
│  │  MongoDB Atlas (Cloud Database)                               │        │
│  │                                                               │        │
│  │  ┌─────────────────────────────────────────────────────┐     │        │
│  │  │  DeviceData Collection                               │     │        │
│  │  │  • device_type (CPAP/BIPAP)                          │     │        │
│  │  │  • device_id (indexed)                               │     │        │
│  │  │  • device_status                                     │     │        │
│  │  │  • raw_data                                          │     │        │
│  │  │  • parsed_data (JSON)                                │     │        │
│  │  │  • data_source ('cloud'/'software'/'direct')         │     │        │
│  │  │  • timestamp (indexed)                               │     │        │
│  │  └─────────────────────────────────────────────────────┘     │        │
│  │                                                               │        │
│  │  ┌─────────────────────────────────────────────────────┐     │        │
│  │  │  DeviceConfig Collection                             │     │        │
│  │  │  • device_id (unique, indexed)                       │     │        │
│  │  │  • device_type (CPAP/BIPAP)                          │     │        │
│  │  │  • config_values (JSON)                              │     │        │
│  │  │  • last_updated                                      │     │        │
│  │  │  • pending_update (boolean)                          │     │        │
│  │  └─────────────────────────────────────────────────────┘     │        │
│  └───────────────────────────────────────────────────────────────┘        │
└───────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTERFACES                                │
│                                                                           │
│  • Web Applications  →  REST API (/api/devices/*)                       │
│  • Mobile Apps       →  REST API (/api/devices/*)                       │
│  • Third-party APIs  →  REST API (/api/devices/*)                       │
│  • AWS IoT Core      →  Webhook (/api/iot/webhook)                      │
│  • ESP32 Devices     →  AWS IoT Core MQTT                               │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### **Forward Flow: Device → Cloud → API → Database**

1. **Device Publishes Data**
   - ESP32 device sends MQTT message to AWS IoT Core
   - Topic: `esp32/data24` (or `devices/{device_id}/data`)
   - Payload: `{device_status: 0, device_data: "*,S,141125,...", device_type: "CPAP"}`

2. **AWS IoT Core Processes**
   - IoT Rule receives message on topic `esp32/data24`
   - SQL query filters/transforms the message
   - Rule Action: HTTPS POST to API webhook
   - Endpoint: `https://backend-production-9c17.up.railway.app/api/iot/webhook`

3. **API Receives & Processes**
   - `iotController.receiveIoTData()` handles the webhook
   - Extracts device ID from topic (`esp32/data24` → `24`)
   - Auto-detects device type from data string
   - Parses raw data using `dataParser.js`
   - Marks `data_source: 'cloud'`

4. **Data Persistence**
   - Saves to MongoDB `DeviceData` collection
   - Retry logic (3 attempts with exponential backoff)
   - Creates indexes on `device_id` and `timestamp`

5. **Configuration Check**
   - Checks for pending configuration updates
   - If found, publishes to IoT Core config topic
   - Topic: `esp32/config24` (or `devices/{device_id}/config/update`)

6. **Device Receives Config**
   - ESP32 subscribes to config topic
   - Receives configuration update via MQTT
   - Updates device settings accordingly

---

### **Reverse Flow: Software → API → AWS IoT → Device**

1. **Application Sets Configuration**
   - Software calls API: `POST /api/devices/24/config`
   - Payload: `{config_values: {...}, device_type: "CPAP"}`

2. **API Stores Configuration**
   - `deviceController.setDeviceConfig()` saves to MongoDB
   - Marks `pending_update: true`

3. **API Publishes to IoT Core**
   - `awsIoT.publishDeviceConfigToTopic()` publishes MQTT message
   - Topic: `esp32/config24`
   - Payload: `{device_id: "24", config: {...}, action: "config_update"}`

4. **Device Receives & Acknowledges**
   - ESP32 receives configuration update
   - Updates device settings
   - Optionally publishes acknowledgment to `esp32/ack24`

---

### **Direct API Data Flow: Software → API → Database**

1. **Application Sends Data**
   - Software calls API: `POST /api/devices/data`
   - Payload: `{device_status: 1, device_data: "...", device_type: "CPAP"}`

2. **API Processes**
   - `deviceController.receiveDeviceData()` handles request
   - Parses data using `dataParser.js`
   - Marks `data_source: 'software'`

3. **Data Persistence**
   - Saves to MongoDB `DeviceData` collection
   - Checks for pending config updates
   - Publishes config if available

---

## 🧩 Component Breakdown

### **1. Entry Point (`server.js`)**
- Initializes Express.js application
- Configures middleware (CORS, JSON parser, Morgan logger)
- Connects to MongoDB (non-blocking)
- Registers routes (`/api/devices`, `/api/iot`)
- Starts HTTP server on port 3000 (or `PORT` env var)

### **2. Routes Layer**

#### **`routes/deviceRoutes.js`**
- `POST /api/devices/data` - Receive device data
- `GET /api/devices/:deviceId/config` - Get device configuration
- `POST /api/devices/:deviceId/config` - Set device configuration
- `POST /api/devices/:deviceId/config/delivered` - Mark config as delivered
- `GET /api/devices/:deviceId/data` - Get device data history

#### **`routes/iotRoutes.js`**
- `POST /api/iot/webhook` - Webhook for AWS IoT Core
- `GET /api/iot/webhook` - Info endpoint (browser access)

### **3. Controllers Layer**

#### **`controllers/iotController.js`**
**Function: `receiveIoTData()`**
- Receives webhook from AWS IoT Core
- Handles various payload formats (base64, nested, direct)
- Extracts device ID from topic (`esp32/data24` → `24`)
- Auto-detects device type (CPAP/BIPAP) from data string
- Parses raw data using `dataParser.js`
- Marks `data_source: 'cloud'`
- Retry logic for MongoDB saves (3 attempts)
- Publishes config updates if available
- Publishes acknowledgment to IoT Core

#### **`controllers/deviceController.js`**
**Function: `receiveDeviceData()`**
- Receives direct API calls from software
- Validates request payload
- Parses device data
- Marks `data_source: 'software'`
- Saves to MongoDB
- Publishes config updates if available

**Function: `getDeviceConfig()`**
- Retrieves device configuration from MongoDB
- Returns current config values and pending status

**Function: `setDeviceConfig()`**
- Creates/updates device configuration
- Marks `pending_update: true`
- Publishes to IoT Core config topic

**Function: `getDeviceDataHistory()`**
- Retrieves historical device data
- Supports pagination (`limit`, `offset`)
- Supports filtering by `data_source` parameter
- Returns sorted by timestamp (newest first)

### **4. Data Layer**

#### **`models/DeviceData.js`**
Mongoose schema for device data:
```javascript
{
  device_type: String (enum: ['CPAP', 'BIPAP']),
  device_id: String (indexed),
  device_status: Number,
  raw_data: String,
  parsed_data: Mixed (JSON),
  data_source: String (enum: ['cloud', 'software', 'direct'], indexed),
  timestamp: Date (indexed, auto)
}
```

#### **`models/DeviceConfig.js`**
Mongoose schema for device configuration:
```javascript
{
  device_id: String (unique, indexed),
  device_type: String (enum: ['CPAP', 'BIPAP']),
  config_values: Mixed (JSON),
  last_updated: Date (auto),
  pending_update: Boolean (default: false)
}
```

### **5. Utilities**

#### **`utils/dataParser.js`**
- `parseCPAPData()` - Parses CPAP data strings
  - Sections: S (metadata), G (pressure), H (flow), I (settings)
- `parseBIPAPData()` - Parses BIPAP data strings
  - Sections: S (metadata), A (pressure), B (ventilation), C-F (advanced)
- `parseDeviceData()` - Main parser (auto-detects type)

### **6. AWS Integration**

#### **`config/awsIoT.js`**
- `publishToIoT()` - Generic MQTT publisher
- `publishDeviceConfig()` - Publishes config to default topic
- `publishDeviceConfigToTopic()` - Publishes to custom topic
- `publishAcknowledgment()` - Publishes acknowledgment messages

#### **`config/database.js`**
- `connectDB()` - MongoDB connection handler
- Non-blocking (server continues if MongoDB unavailable)
- Connection state tracking
- Auto-reconnection on disconnect

---

## 🛠️ Technology Stack

### **Backend Framework**
- **Node.js** (v18+)
- **Express.js** (v4.18.2) - Web framework
- **ES6 Modules** (`import/export`)

### **Database**
- **MongoDB Atlas** (Cloud database)
- **Mongoose** (v8.0.3) - ODM (Object Document Mapper)

### **AWS Services**
- **AWS IoT Core** - MQTT message broker
- **AWS SDK for JavaScript** (v3.490.0)
  - `@aws-sdk/client-iot-data-plane` - MQTT publishing
  - `@aws-sdk/client-iot` - IoT Core management

### **Middleware**
- **cors** - Cross-Origin Resource Sharing
- **morgan** - HTTP request logger
- **dotenv** - Environment variable management
- **express-validator** - Request validation

### **Development Tools**
- **nodemon** - Auto-restart on file changes
- **npm** - Package manager

### **Deployment**
- **Railway** - Cloud hosting platform
- **MongoDB Atlas** - Managed database

---

## 📊 Database Schema

### **DeviceData Collection**

```javascript
{
  _id: ObjectId,
  device_type: "CPAP" | "BIPAP",
  device_id: "24",  // Indexed
  device_status: 0 | 1,
  raw_data: "*,S,141125,1447,G,12.2,1.0,...",
  parsed_data: {
    sections: { S: [...], G: [...], H: [...], I: [...] },
    metadata: { date: "141125", time: "1447" },
    pressure: { ipap: 12.2, ramp: 1.0 },
    flow: { max_flow: 10.6, min_flow: 10.6, ... },
    settings: { humidity: 5.0, temperature: 1.0, ... }
  },
  data_source: "cloud" | "software" | "direct",  // Indexed
  timestamp: ISODate,  // Indexed
  createdAt: ISODate,
  updatedAt: ISODate
}

// Indexes:
// - { device_id: 1, timestamp: -1 }  (Compound index for queries)
// - { device_id: 1 }
// - { timestamp: -1 }
// - { data_source: 1 }
```

### **DeviceConfig Collection**

```javascript
{
  _id: ObjectId,
  device_id: "24",  // Unique, Indexed
  device_type: "CPAP" | "BIPAP",
  config_values: {
    pressure: 12.0,
    ramp: 1.0,
    humidity: 5.0,
    // ... other config values
  },
  last_updated: ISODate,
  pending_update: true | false,
  createdAt: ISODate,
  updatedAt: ISODate
}

// Indexes:
// - { device_id: 1 }  (Unique index)
```

---

## 🔌 API Endpoints

### **Device Data Endpoints**

#### `POST /api/devices/data`
Receive device data directly from software.
- **Body:**
  ```json
  {
    "device_status": 0,
    "device_data": "*,S,141125,1447,G,12.2,1.0,...",
    "device_type": "CPAP",
    "device_id": "24"  // Optional
  }
  ```
- **Response:** `201 Created`
- **Data Source:** `software`

#### `GET /api/devices/:deviceId/data`
Get device data history.
- **Query Parameters:**
  - `limit` (default: 100) - Number of records
  - `offset` (default: 0) - Pagination offset
  - `data_source` (optional) - Filter by `cloud`, `software`, or `direct`
- **Response:** `200 OK` with pagination info

### **Device Configuration Endpoints**

#### `GET /api/devices/:deviceId/config`
Get device configuration.
- **Response:** `200 OK` with config values

#### `POST /api/devices/:deviceId/config`
Set/update device configuration.
- **Body:**
  ```json
  {
    "config_values": {
      "pressure": 12.0,
      "ramp": 1.0
    },
    "device_type": "CPAP"
  }
  ```
- **Response:** `200 OK` or `201 Created`
- **Action:** Publishes to IoT Core config topic

#### `POST /api/devices/:deviceId/config/delivered`
Mark configuration as delivered.
- **Action:** Sets `pending_update: false`

### **IoT Webhook Endpoint**

#### `POST /api/iot/webhook`
Webhook endpoint for AWS IoT Core.
- **Called by:** AWS IoT Core Rule Action (HTTPS)
- **Payload:** IoT Core message format (supports base64, nested, direct)
- **Response:** `200 OK`
- **Data Source:** `cloud`
- **Action:** Saves to MongoDB, publishes config if available

#### `GET /api/iot/webhook`
Info endpoint (for browser access).
- **Response:** JSON with endpoint information

---

## ☁️ AWS IoT Core Integration

### **IoT Rule Configuration**

**Rule Name:** `ForwardDeviceDataToAPI` (or similar)

**SQL Statement:**
```sql
SELECT 
  device_status,
  device_data,
  device_type,
  device_id,
  topic()
FROM 'esp32/data+'
```

**Action Type:** HTTPS

**Action URL:** `https://backend-production-9c17.up.railway.app/api/iot/webhook`

**Action Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Message Payload:**
```json
{
  "device_status": ${device_status},
  "device_data": "${device_data}",
  "device_type": "${device_type}",
  "device_id": "${device_id}",
  "topic": "${topic()}"
}
```

### **MQTT Topics**

#### **Device Data Topics (Subscribed by IoT Rule)**
- `esp32/data24` - Device 24 data
- `esp32/data+` - Pattern for all devices (wildcard)
- `devices/{device_id}/data` - Alternative format

#### **Configuration Topics (Published by API)**
- `esp32/config24` - Device 24 configuration
- `devices/{device_id}/config/update` - Alternative format

#### **Acknowledgment Topics**
- `esp32/ack24` - Device 24 acknowledgment
- `devices/{device_id}/ack` - Alternative format

---

## 🚀 Deployment Architecture

### **Production Environment (Railway)**

```
┌─────────────────────────────────────────────────────────┐
│  Railway Platform                                       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Node.js Application                             │  │
│  │  • Port: Injected by Railway (PORT env)          │  │
│  │  • Host: 0.0.0.0 (all interfaces)                │  │
│  │  • Environment Variables:                        │  │
│  │    - MONGODB_URI                                  │  │
│  │    - AWS_IOT_ENDPOINT                             │  │
│  │    - AWS_ACCESS_KEY_ID                            │  │
│  │    - AWS_SECRET_ACCESS_KEY                        │  │
│  │    - AWS_REGION                                   │  │
│  │    - NODE_ENV=production                          │  │
│  └────────────────────┬──────────────────────────────┘  │
│                       │                                   │
│                       │ HTTPS                             │
│                       ▼                                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Public URL                                      │  │
│  │  https://backend-production-9c17.up.railway.app │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### **Database (MongoDB Atlas)**

```
┌─────────────────────────────────────────────────────────┐
│  MongoDB Atlas (Cloud)                                  │
│                                                         │
│  • Cluster: Free tier (M0)                              │
│  • Region: Same as Railway/AWS                          │
│  • Network Access: 0.0.0.0/0 (Railway dynamic IPs)     │
│  • Database: mehulapi (or custom)                       │
│  • Collections:                                         │
│    - DeviceData                                         │
│    - DeviceConfig                                       │
└─────────────────────────────────────────────────────────┘
```

### **AWS IoT Core**

```
┌─────────────────────────────────────────────────────────┐
│  AWS IoT Core                                           │
│                                                         │
│  • Region: us-east-1                                    │
│  • Endpoint: xxxxxx-ats.iot.us-east-1.amazonaws.com    │
│  • Rules: ForwardDeviceDataToAPI                        │
│  • Things: ESP32 devices (optional)                     │
│  • Certificates: Device certificates (optional)         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Environment Variables

Required environment variables (`.env` or Railway Variables):

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database

# AWS IoT Core
AWS_IOT_ENDPOINT=xxxxxx-ats.iot.us-east-1.amazonaws.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

---

## 🔄 Error Handling & Resilience

### **MongoDB Connection**
- Non-blocking connection (server starts even if DB unavailable)
- Connection state tracking
- Auto-reconnection on disconnect
- Graceful degradation (logs warnings, continues operation)

### **Data Saving**
- Retry logic in `iotController` (3 attempts with exponential backoff)
- Detailed error logging with unique `requestId`
- 503 response if MongoDB unavailable

### **AWS IoT Publishing**
- Error handling with try-catch blocks
- Logs errors but doesn't crash the API
- Graceful failure if AWS credentials invalid

### **Data Validation**
- Express-validator for request validation
- Device type validation (CPAP/BIPAP only)
- Required field checks
- Data parsing error handling

---

## 📈 Performance Considerations

### **Database Indexes**
- Compound index on `{device_id: 1, timestamp: -1}` for efficient queries
- Separate indexes on `device_id`, `timestamp`, `data_source`

### **Pagination**
- Default limit: 100 records
- Offset-based pagination for large datasets
- Efficient queries with `.sort()`, `.limit()`, `.skip()`

### **Caching** (Future Enhancement)
- Device configurations can be cached
- Redis integration for frequently accessed data

---

## 🔒 Security Considerations

1. **Environment Variables**: Secrets stored in Railway Variables (not in code)
2. **CORS**: Configured for cross-origin requests (customize as needed)
3. **Input Validation**: All inputs validated before processing
4. **Error Messages**: Production errors don't expose stack traces
5. **AWS Credentials**: Stored securely, never in git repository

---

## 📝 Future Enhancements

1. **Authentication/Authorization**: JWT tokens, API keys
2. **Rate Limiting**: Prevent abuse of API endpoints
3. **WebSocket Support**: Real-time bidirectional communication
4. **Data Analytics**: Aggregated statistics and reports
5. **Multi-tenancy**: Support multiple organizations/users
6. **Device Management**: CRUD operations for devices
7. **Alerting**: Notifications for device anomalies
8. **Data Export**: CSV/Excel export functionality

---

## 📚 Related Documentation

- `README.md` - Quick start guide
- `API_FOR_TEAM.md` - API usage for team members
- `HOW_TO_IDENTIFY_DATA_SOURCE.md` - Data source filtering guide
- `AWS_IOT_SETUP.md` - AWS IoT Core setup instructions

---

**Last Updated:** December 2024  
**Version:** 1.0.0



---

## # 🏗️ Architecture Quick Reference

*Source: ARCHITECTURE_QUICK_REFERENCE.md*

# 🏗️ Architecture Quick Reference

## 📊 System Overview

```
ESP32 Device → AWS IoT Core → Node.js API → MongoDB Atlas
                              ↕
                        REST API (for applications)
                              ↕
                       AWS IoT Core → ESP32 Device (config)
```

---

## 🔄 Data Flow Summary

### **Device Data Flow (Hardware → Database)**
1. ESP32 publishes MQTT to AWS IoT Core (`esp32/data24`)
2. AWS IoT Rule forwards to API webhook (`/api/iot/webhook`)
3. API parses data and saves to MongoDB (`data_source: 'cloud'`)

### **Configuration Flow (Software → Device)**
1. Application calls API (`POST /api/devices/24/config`)
2. API saves config to MongoDB (`pending_update: true`)
3. API publishes to AWS IoT Core (`esp32/config24`)
4. ESP32 receives config via MQTT and updates device

### **Direct API Flow (Software → Database)**
1. Application calls API (`POST /api/devices/data`)
2. API parses data and saves to MongoDB (`data_source: 'software'`)

---

## 🧩 Key Components

### **1. Server (`server.js`)**
- Express.js application
- Middleware: CORS, JSON parser, Morgan logger
- Routes: `/api/devices/*`, `/api/iot/*`
- MongoDB connection (non-blocking)

### **2. Controllers**

**`iotController.js`** - Webhook handler
- Receives data from AWS IoT Core
- Extracts device ID from topic
- Auto-detects device type
- Marks `data_source: 'cloud'`
- Retry logic for DB saves

**`deviceController.js`** - Direct API handler
- Receives data from applications
- Marks `data_source: 'software'`
- Config management (get/set)
- Data history with filtering

### **3. Models**

**`DeviceData`** - Stores device readings
- `device_type`, `device_id`, `device_status`
- `raw_data`, `parsed_data`
- `data_source` (cloud/software/direct)
- `timestamp` (indexed)

**`DeviceConfig`** - Stores device settings
- `device_id` (unique)
- `config_values` (JSON)
- `pending_update` (boolean)

### **4. Utilities**

**`dataParser.js`** - Parses CPAP/BIPAP data strings
- `parseCPAPData()` - Sections: S, G, H, I
- `parseBIPAPData()` - Sections: S, A, B, C, D, E, F

**`awsIoT.js`** - AWS IoT Core publisher
- `publishDeviceConfig()` - Send config to device
- `publishAcknowledgment()` - Send ack to device

---

## 📡 API Endpoints

### **Device Data**
- `POST /api/devices/data` - Receive device data (software)
- `GET /api/devices/:deviceId/data` - Get history (filter by `data_source`)

### **Device Configuration**
- `GET /api/devices/:deviceId/config` - Get config
- `POST /api/devices/:deviceId/config` - Set config (publishes to IoT)
- `POST /api/devices/:deviceId/config/delivered` - Mark delivered

### **IoT Webhook**
- `POST /api/iot/webhook` - AWS IoT Core webhook (receives from hardware)

---

## 🗄️ Database Schema

### **DeviceData**
```
{
  device_type: "CPAP" | "BIPAP",
  device_id: "24",
  device_status: 0 | 1,
  raw_data: "*,S,141125,...",
  parsed_data: { sections: {...}, metadata: {...} },
  data_source: "cloud" | "software" | "direct",
  timestamp: Date
}
```

### **DeviceConfig**
```
{
  device_id: "24" (unique),
  device_type: "CPAP" | "BIPAP",
  config_values: { ... },
  pending_update: true | false,
  last_updated: Date
}
```

---

## ☁️ AWS IoT Core Topics

### **Device → Cloud**
- `esp32/data24` - Device 24 data (subscribed by Rule)
- `esp32/data+` - All devices (wildcard)

### **Cloud → Device**
- `esp32/config24` - Device 24 configuration (published by API)
- `esp32/ack24` - Device 24 acknowledgment (published by API)

---

## 🔧 Technology Stack

- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Cloud:** AWS IoT Core (MQTT)
- **Deployment:** Railway
- **SDK:** AWS SDK for JavaScript v3

---

## 🔑 Environment Variables

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# AWS IoT Core
AWS_IOT_ENDPOINT=xxxxxx-ats.iot.us-east-1.amazonaws.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Server
PORT=3000
NODE_ENV=production
```

---

## 🚀 Deployment

**Production URL:** `https://backend-production-9c17.up.railway.app`

**Health Check:** `GET /health`

**API Info:** `GET /`

---

For detailed architecture, see `ARCHITECTURE.md`.



---

## # ⚙️ Setup Guides

*Source: QUICK_START.md*

# Quick Start Guide

## Current Status

✅ **API Server**: Running on http://localhost:3000
❓ **MongoDB**: Not installed yet (see setup below)

## Step 1: Set Up MongoDB

You have 2 options:

### Option A: MongoDB Atlas (Cloud - Recommended) ⭐

**Easiest way - no installation needed!**

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Create free cluster (M0 - Free tier)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Update your `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mehulapi?retryWrites=true&w=majority
```

7. Replace username/password with your Atlas credentials
8. Go to "Network Access" → "Add IP Address" → "Allow Access from Anywhere"

**That's it! No local installation needed.**

### Option B: Install MongoDB Locally

See `SETUP_MONGODB.md` for detailed instructions.

## Step 2: Restart Server

After setting up MongoDB:

```bash
# Stop current server (Ctrl+C or kill process)
# Then restart:
cd /Users/deckmount/Documents/mehulapi
npm run dev
```

You should see:
```
MongoDB Connected: ...
Server running on port 3000
```

## Step 3: Test the API

### Quick Test

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Send device data
curl -X POST http://localhost:3000/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "test_24"
  }'

# 3. Set configuration
curl -X POST http://localhost:3000/api/devices/test_24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {"pressure": 15.0, "humidity": 6.0}
  }'

# 4. Get data history
curl "http://localhost:3000/api/devices/test_24/data?limit=5"

# 5. Get configuration
curl http://localhost:3000/api/devices/test_24/config
```

### Run Test Script

```bash
./quick-test.sh
```

## Where Your Data is Saved

### MongoDB Database

- **Database Name**: `mehulapi` (or whatever you set)
- **Collections**:
  - `devicedatas` - All device data
  - `deviceconfigs` - All device configurations

### View Data

#### If using MongoDB Atlas:
1. Go to Atlas dashboard
2. Click "Browse Collections"
3. Select `mehulapi` database
4. View collections: `devicedatas` and `deviceconfigs`

#### If using local MongoDB:
```bash
# Install MongoDB Shell first (if not installed)
# Then connect:
mongosh mongodb://localhost:27017/mehulapi

# View data:
db.devicedatas.find().pretty()
db.deviceconfigs.find().pretty()
```

#### Or use API:
```bash
# Get device data
curl "http://localhost:3000/api/devices/test_24/data?limit=10"

# Get configuration
curl http://localhost:3000/api/devices/test_24/config
```

## Testing Without MongoDB (Limited)

If MongoDB isn't set up yet, you can still test endpoints, but data won't be saved:

```bash
# These will work but data won't persist:
curl http://localhost:3000/health
curl http://localhost:3000/
```

**But you need MongoDB for:**
- Saving device data
- Storing configurations
- Retrieving data history

## Next Steps

1. ✅ Set up MongoDB (Atlas recommended)
2. ✅ Update `.env` with MongoDB connection string
3. ✅ Restart server
4. ✅ Run test script
5. ✅ Verify data in MongoDB

## Need Help?

- MongoDB Atlas setup: See `SETUP_MONGODB.md`
- API testing: See `TESTING_GUIDE.md`
- Complete flow: See `COMPLETE_FLOW.md`



---

## # ⚙️ Setup Guides

*Source: MONGODB_SETUP_SIMPLE.md*

# MongoDB Setup - Simple Guide

Choose the easiest option for you:

## Option 1: MongoDB Atlas (Cloud - Recommended) ⭐⭐⭐

**Best option!** No installation needed, free tier available, works from anywhere.

### Step-by-Step Setup (5 minutes)

#### Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Click "Try Free"
3. Sign up with:
   - Email
   - Password
   - Name
4. Click "Get started free"

#### Step 2: Create Free Cluster

1. On the welcome screen, choose:
   - **Cloud Provider:** AWS
   - **Region:** Choose closest to you (e.g., `N. Virginia (us-east-1)`)
   - **Cluster Tier:** Select **M0 FREE** (it's free forever!)
   - **Cluster Name:** Leave default or change to `mehulapi-cluster`
2. Click "Create Cluster"
3. Wait 3-5 minutes for cluster to be created

#### Step 3: Create Database User

1. On the security screen, click "Create Database User"
2. Choose "Password" authentication
3. Enter:
   - **Username:** (e.g., `mehulapi_user`)
   - **Password:** (Create a strong password - **SAVE THIS!**)
   - Click "Create Database User"

**⚠️ Important:** Save your username and password! You'll need them.

#### Step 4: Configure Network Access

1. On "Network Access" screen, click "Add IP Address"
2. Click "Allow Access from Anywhere" button (for testing)
   - This allows connection from any IP address
   - For production, you can restrict to specific IPs later
3. Click "Confirm"

#### Step 5: Get Connection String

1. Click "Finish and Close" (cluster is ready!)
2. On the Atlas dashboard, click "Connect" button
3. Choose "Connect your application"
4. Select:
   - **Driver:** Node.js
   - **Version:** 5.5 or later
5. Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

#### Step 6: Update Your .env File

1. Open your `.env` file:
   ```bash
   cd /Users/deckmount/Documents/mehulapi
   nano .env
   # or use your editor
   ```

2. Update or add `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mehulapi?retryWrites=true&w=majority
   ```

   **Replace:**
   - `username` with your database username
   - `password` with your database password
   - `cluster0.xxxxx` with your actual cluster address
   - **Important:** Add `/mehulapi` before `?retryWrites` (this is your database name)

3. Save the file (Ctrl+X, then Y, then Enter in nano)

#### Step 7: Test the Connection

1. Restart your server:
   ```bash
   # Stop server (Ctrl+C if running)
   npm run dev
   ```

2. You should see:
   ```
   ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
   Server running on port 3000
   ```

3. Test it:
   ```bash
   curl http://localhost:3000/health
   ```

**Done!** ✅ Your MongoDB is now set up and connected!

---

## Option 2: Install MongoDB Locally (macOS)

If you prefer local MongoDB installation:

### Step 1: Install MongoDB

#### Using Homebrew (Easiest)

```bash
# Tap MongoDB formula
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0
```

#### Manual Installation

1. Download MongoDB Community Server:
   - Go to: https://www.mongodb.com/try/download/community
   - Select: macOS, ARM64 (for M1/M2 Macs) or x86_64 (for Intel Macs)
   - Download `.tgz` file

2. Extract and install:
   ```bash
   # Extract
   tar -zxvf mongodb-macos-*.tgz
   
   # Move to /usr/local
   sudo mv mongodb-macos-* /usr/local/mongodb
   
   # Add to PATH (add to ~/.zshrc)
   echo 'export PATH=/usr/local/mongodb/bin:$PATH' >> ~/.zshrc
   source ~/.zshrc
   ```

3. Create data directory:
   ```bash
   sudo mkdir -p /data/db
   sudo chown $(whoami) /data/db
   ```

4. Start MongoDB:
   ```bash
   mongod --dbpath /data/db
   ```

### Step 2: Verify MongoDB is Running

```bash
# Check if MongoDB is running
ps aux | grep mongod

# Or test connection
mongosh
# Should connect successfully
```

### Step 3: Update Your .env File

```env
MONGODB_URI=mongodb://localhost:27017/mehulapi
```

### Step 4: Test Connection

Restart your server:
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
Server running on port 3000
```

---

## Option 3: Using Docker (Alternative)

If you have Docker installed:

```bash
# Run MongoDB in Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  mongo:7.0

# Update .env
MONGODB_URI=mongodb://localhost:27017/mehulapi
```

---

## Verification Checklist

After setup, verify:

- [ ] ✅ MongoDB Atlas cluster created (or local MongoDB running)
- [ ] ✅ Database user created
- [ ] ✅ Network access configured
- [ ] ✅ Connection string added to `.env`
- [ ] ✅ Server restarted
- [ ] ✅ See "MongoDB Connected" in server logs

## Test Your MongoDB Connection

### Test 1: Check Server Logs

When you start your server (`npm run dev`), you should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

If you see an error, check:
- Connection string is correct
- Username and password are correct
- Network access is configured

### Test 2: Test API Endpoint

```bash
# Test saving data
curl -X POST http://localhost:3000/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "test_001"
  }'
```

If successful, data is saved to MongoDB!

### Test 3: View Data in MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. You should see:
   - Database: `mehulapi`
   - Collection: `devicedatas`
   - Your saved data!

## Troubleshooting

### Connection Error: Authentication Failed

**Problem:** Wrong username or password

**Solution:**
1. Check username and password in connection string
2. Verify user exists in Atlas → Database Access
3. Make sure password doesn't have special characters (or URL-encode them)

### Connection Error: Timeout

**Problem:** Network access not configured

**Solution:**
1. Go to Atlas → Network Access
2. Add IP Address: "Allow Access from Anywhere" (for testing)
3. Wait a few minutes for changes to propagate

### Connection Error: ECONNREFUSED

**Problem:** Local MongoDB not running

**Solution:**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# If not running, start it:
brew services start mongodb-community@7.0
# OR
mongod --dbpath /data/db
```

### Can't See Data in Atlas

**Problem:** Wrong database name or collection name

**Solution:**
1. Make sure database name in connection string is `/mehulapi`
2. Check collection names: `devicedatas` and `deviceconfigs`
3. Wait a few seconds for data to appear

## Recommended: MongoDB Atlas

**Why MongoDB Atlas is recommended:**
- ✅ **No installation** needed
- ✅ **Free tier** (512MB storage - enough for testing)
- ✅ **Automatic backups**
- ✅ **Works from anywhere**
- ✅ **Easy to scale** later
- ✅ **Built-in monitoring**

**Free Tier Includes:**
- 512MB storage
- Shared RAM
- Basic features
- Perfect for development/testing

## Next Steps

After MongoDB is set up:

1. ✅ Restart your server: `npm run dev`
2. ✅ Test saving data via API
3. ✅ View data in MongoDB Atlas dashboard
4. ✅ Continue with IoT Core testing

---

**Need help?** 
- MongoDB Atlas docs: https://docs.atlas.mongodb.com
- See `SETUP_MONGODB.md` for detailed instructions
- See `QUICK_FIX_MONGODB.md` for quick troubleshooting



---

## # ⚙️ Setup Guides

*Source: SETUP_MONGODB.md*

# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended, Free)

MongoDB Atlas is the easiest way to get started. It's free and doesn't require local installation.

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a free cluster (M0 - Free tier)

### Step 2: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Step 3: Update .env File

Edit your `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mehulapi?retryWrites=true&w=majority
```

Replace:
- `username` with your MongoDB Atlas username
- `password` with your MongoDB Atlas password
- `cluster0.xxxxx` with your actual cluster address

### Step 4: Create Database User

In MongoDB Atlas:
1. Go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password
5. Set privileges to "Atlas admin" or "Read and write to any database"
6. Use these credentials in your connection string

### Step 5: Configure Network Access

In MongoDB Atlas:
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for testing)
   OR add your specific IP address

That's it! No local installation needed.

## Option 2: Install MongoDB Locally (macOS)

### Using Homebrew

If you have Homebrew installed:

```bash
# Tap MongoDB formula
brew tap mongodb/brew

# Install MongoDB
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0

# Verify it's running
ps aux | grep mongod
```

### Manual Installation

1. Download MongoDB Community Server:
   - Go to: https://www.mongodb.com/try/download/community
   - Select: macOS, x86_64 (or ARM64 for M1/M2 Macs)
   - Download the `.tgz` file

2. Extract and install:
```bash
# Extract
tar -zxvf mongodb-macos-x86_64-7.0.0.tgz

# Move to /usr/local
sudo mv mongodb-macos-x86_64-7.0.0 /usr/local/mongodb

# Add to PATH (add to ~/.zshrc)
export PATH=/usr/local/mongodb/bin:$PATH

# Create data directory
sudo mkdir -p /data/db
sudo chown $(whoami) /data/db
```

3. Start MongoDB:
```bash
mongod --dbpath /data/db
```

## Option 3: Use Docker (Alternative)

If you have Docker installed:

```bash
# Run MongoDB in Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  mongo:7.0

# Your MONGODB_URI stays the same
MONGODB_URI=mongodb://localhost:27017/mehulapi
```

## Verify MongoDB Connection

### For MongoDB Atlas:

```bash
# Update .env with your Atlas connection string
# Then test the connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mehulapi')
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch(err => console.error('❌ Connection error:', err));
"
```

### For Local MongoDB:

```bash
# Check if MongoDB is running
ps aux | grep mongod

# Test connection (if mongosh is installed)
mongosh mongodb://localhost:27017/mehulapi
```

## Recommended: MongoDB Atlas

**Why MongoDB Atlas?**
- ✅ Free tier available (512MB storage)
- ✅ No installation needed
- ✅ Automatic backups
- ✅ Accessible from anywhere
- ✅ Easy to scale later

**Free Tier Limits:**
- 512MB storage (enough for testing)
- Shared RAM (sufficient for development)
- Basic features (all you need)

## Next Steps

1. Choose one of the options above
2. Update your `.env` file with the correct `MONGODB_URI`
3. Restart your backend server
4. Test the API

## Troubleshooting

### Connection Refused (Local MongoDB)

```bash
# Check if MongoDB is running
ps aux | grep mongod

# If not running, start it:
brew services start mongodb-community@7.0
# OR
mongod --dbpath /data/db
```

### Authentication Failed (Atlas)

- Check username and password in connection string
- Verify database user exists in Atlas
- Check network access allows your IP

### Cannot Connect (Atlas)

- Verify cluster is running (check Atlas dashboard)
- Check network access includes your IP
- Verify connection string is correct



---

## # ⚙️ Setup Guides

*Source: AWS_IOT_SETUP.md*

# AWS IoT Core Integration Guide

This guide explains how to integrate AWS IoT Core with the CPAP/BIPAP API backend.

## Architecture Flow

```
Device → AWS IoT Core → Backend API → MongoDB
                            ↓
                    Check for Pending Config
                            ↓
                    AWS IoT Core → Device
```

## Prerequisites

1. AWS Account with IoT Core enabled
2. AWS IAM user/role with IoT Core permissions
3. Backend API deployed and accessible via HTTPS (required for IoT Core HTTPS action)
4. Device certificates for AWS IoT Core (for device connection)

## Setup Steps

### 1. Configure AWS Credentials

Add to your `.env` file:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_IOT_ENDPOINT=xxxxxx-ats.iot.us-east-1.amazonaws.com
```

**How to find your IoT Endpoint:**
1. Go to AWS Console → IoT Core → Settings
2. Copy the "Device data endpoint" (without `https://`)

### 2. Set Up Device Topics

Configure your devices to publish to these topics:

**Device Data:**
- Topic: `devices/{device_id}/data`
- Example: `devices/cpap_001/data`

**Device Config (for receiving updates):**
- Topic: `devices/{device_id}/config/update`
- Example: `devices/cpap_001/config/update`

**Device Acknowledgment:**
- Topic: `devices/{device_id}/ack`
- Example: `devices/cpap_001/ack`

### 3. Create IoT Core Rule (Option A: HTTPS Action)

This is the recommended approach for production.

#### Step 1: Create IoT Core Rule

1. Go to AWS Console → IoT Core → Rules
2. Click "Create rule"
3. Name: `ForwardDeviceDataToBackend`
4. SQL Version: 2016-03-23
5. SQL Statement:
```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'devices/+/data'
```

#### Step 2: Configure HTTPS Action

1. Under "Actions", click "Add action" → "Send a message to an HTTPS endpoint"
2. Configure:
   - **URL**: `https://your-api-domain.com/api/iot/webhook`
   - **HTTP Header**: 
     - Key: `Content-Type`
     - Value: `application/json`
   - **Authentication**: 
     - Use SigV4 if your API is behind AWS API Gateway
     - Or configure custom headers with API key if needed

3. Click "Create role" if needed (IoT Core will create IAM role for HTTPS action)
4. Save the rule

#### Step 3: Test the Rule

1. Use AWS IoT Test client or MQTT client to publish a test message:
   - Topic: `devices/test_device/data`
   - Message:
```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
  "device_type": "CPAP",
  "device_id": "test_device"
}
```

2. Check your backend API logs to verify the message was received

### 4. Create IoT Core Rule (Option B: Lambda Function)

Alternative approach using Lambda function.

#### Step 1: Create Lambda Function

1. Go to AWS Lambda → Create function
2. Use the code from `aws-iot/lambda-function.js`
3. Set environment variable:
   - `BACKEND_API_URL`: `https://your-api-domain.com`
4. Configure timeout: 30 seconds (or more if needed)
5. Set memory: 256 MB (or more)

#### Step 2: Create IoT Core Rule

1. Go to IoT Core → Rules → Create rule
2. SQL Statement (same as Option A)
3. Action: "Send a message to a Lambda function"
4. Select your Lambda function
5. Save

### 5. Configure Device Publishing

Your hardware devices should publish messages to AWS IoT Core in this format:

```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
  "device_type": "CPAP",
  "device_id": "cpap_001"
}
```

**Topic:** `devices/{device_id}/data`

### 6. Configure Device Subscription

Devices need to subscribe to config update topics to receive configuration changes:

**Subscribe to:** `devices/{device_id}/config/update`

When the backend has a configuration update, it will publish to this topic, and your device will receive it.

## API Endpoints

### 1. IoT Webhook (for AWS IoT Core)

**Endpoint:** `POST /api/iot/webhook`

This endpoint receives data from AWS IoT Core Rule Action (HTTPS).

**Request Format (from IoT Core):**
```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
  "device_type": "CPAP",
  "device_id": "cpap_001",
  "topic": "devices/cpap_001/data",
  "timestamp": "2024-01-01T12:00:00Z",
  "messageId": "msg-12345"
}
```

### 2. Set Device Configuration (Publishes to IoT Core)

**Endpoint:** `POST /api/devices/:deviceId/config`

When you set a device configuration, it automatically publishes to AWS IoT Core:

**Request:**
```json
{
  "device_type": "CPAP",
  "config_values": {
    "pressure": 14.0,
    "humidity": 6.0
  }
}
```

**What happens:**
1. Config is saved to MongoDB
2. Config is published to IoT Core topic: `devices/{deviceId}/config/update`
3. Device receives the config update

## Testing

### Test IoT Webhook Locally

You can test the webhook endpoint directly:

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 1,
    "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
    "device_type": "CPAP",
    "device_id": "test_cpap_001",
    "topic": "devices/test_cpap_001/data"
  }'
```

### Test Config Publishing

```bash
# Set configuration (will publish to IoT Core)
curl -X POST http://localhost:3000/api/devices/test_cpap_001/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 14.0,
      "humidity": 6.0
    }
  }'
```

Check your IoT Core logs to verify the message was published.

## Troubleshooting

### Messages not reaching backend

1. **Check IoT Core Rule:**
   - Verify rule SQL matches your topic pattern
   - Check rule status (should be Active)
   - Review CloudWatch logs for rule errors

2. **Check HTTPS Action:**
   - Verify URL is correct and accessible
   - Check IAM role permissions
   - Review API Gateway logs if using API Gateway

3. **Check Backend API:**
   - Verify endpoint `/api/iot/webhook` is accessible
   - Check server logs for incoming requests
   - Verify CORS settings if accessing from browser

### Config not being published

1. **Check Environment Variables:**
   - Verify `AWS_IOT_ENDPOINT` is set
   - Check `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
   - Verify `AWS_REGION` matches your IoT Core region

2. **Check IAM Permissions:**
   - Verify IAM user/role has `iot:Publish` permission
   - Check IoT Core policy allows publishing to topics

3. **Check Backend Logs:**
   - Look for error messages about IoT publishing
   - Verify config exists and `pending_update` is true

### Device not receiving config

1. **Check Device Subscription:**
   - Verify device is subscribed to `devices/{device_id}/config/update`
   - Check device certificate permissions allow subscribing

2. **Check IoT Core Publishing:**
   - Verify config was published successfully
   - Check IoT Core test client to see if message is in topic
   - Review CloudWatch logs for IoT Core

## Security Best Practices

1. **Use IAM Roles:** Instead of access keys, use IAM roles when possible
2. **Secure Device Certificates:** Keep device certificates secure
3. **Use TLS/SSL:** Always use HTTPS for IoT Core connections
4. **Topic Policies:** Restrict device access to their own topics only
5. **API Authentication:** Add API key or JWT authentication to webhook endpoint if needed
6. **Encryption:** Enable encryption at rest and in transit

## Cost Optimization

1. **Rule Filtering:** Use SQL WHERE clauses to filter unnecessary messages
2. **Batch Processing:** Process multiple messages together if possible
3. **Message Size:** Keep message payloads small
4. **Monitor Usage:** Set up CloudWatch alarms for IoT Core usage

## Next Steps

1. Set up device certificates in AWS IoT Core
2. Configure device firmware to connect to IoT Core
3. Set up CloudWatch monitoring and alarms
4. Configure backup and disaster recovery
5. Set up logging and monitoring

## Additional Resources

- [AWS IoT Core Documentation](https://docs.aws.amazon.com/iot/)
- [AWS IoT Core Rules](https://docs.aws.amazon.com/iot/latest/developerguide/iot-rules.html)
- [AWS IoT SDKs](https://docs.aws.amazon.com/iot/latest/developerguide/iot-sdks.html)



---

## # ⚙️ Setup Guides

*Source: QUICK_START_AWS_IOT.md*

# Quick Start: AWS IoT Core Integration

## Complete Data Flow

```
┌─────────┐         ┌──────────────┐         ┌──────────┐         ┌─────────┐
│ Device  │ ────>   │ AWS IoT Core │ ────>   │ Backend  │ ────>   │ MongoDB │
│         │ Publish │              │ Rule    │   API    │         │         │
│         │         │              │ HTTPS   │          │         │         │
└─────────┘         └──────────────┘         └──────────┘         └─────────┘
                           │                         │
                           │                         │ Publish Config
                           │                         │
                           v                         v
                    ┌──────────────┐         ┌──────────┐
                    │  Device      │ <────   │  IoT     │
                    │  Receives    │         │  Core    │
                    │  Config      │         │  Topic   │
                    └──────────────┘         └──────────┘
```

## Step 1: Configure Environment

Add to your `.env` file:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_IOT_ENDPOINT=xxxxxx-ats.iot.us-east-1.amazonaws.com
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up AWS IoT Core Rule

### Create IoT Core Rule

1. Go to AWS Console → IoT Core → Rules
2. Click "Create rule"
3. Configure:
   - **Name**: `ForwardDeviceDataToBackend`
   - **SQL Version**: 2016-03-23
   - **SQL Statement**:
   ```sql
   SELECT 
       *,
       topic() as topic,
       timestamp() as timestamp,
       messageId() as messageId
   FROM 
       'devices/+/data'
   ```

4. **Add Action**: "Send a message to an HTTPS endpoint"
   - **URL**: `https://your-api-domain.com/api/iot/webhook`
   - **HTTP Header**: `Content-Type: application/json`
   - Create IAM role if prompted

## Step 4: Device Configuration

### Device Publishing (Send Data)

Devices should publish to topic: `devices/{device_id}/data`

**Message Format:**
```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
  "device_type": "CPAP",
  "device_id": "cpap_001"
}
```

### Device Subscription (Receive Config)

Devices should subscribe to topic: `devices/{device_id}/config/update`

When backend sets a configuration, it will publish to this topic automatically.

## Step 5: Test the Integration

### Test 1: Send Device Data via IoT Core

Use AWS IoT Test Client or MQTT client:

1. Connect to IoT Core
2. Publish to topic: `devices/test_device/data`
3. Use the message format above
4. Check backend API logs - data should be saved

### Test 2: Set Device Configuration

```bash
curl -X POST http://localhost:3000/api/devices/test_device/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 14.0,
      "humidity": 6.0
    }
  }'
```

Check IoT Core Test Client - message should appear on topic `devices/test_device/config/update`

## What Happens Automatically

1. **Device sends data** → IoT Core receives it
2. **IoT Core Rule** → Forwards to backend `/api/iot/webhook`
3. **Backend** → Parses, saves to MongoDB
4. **Backend** → Checks for pending config updates
5. **If config exists** → Publishes to IoT Core topic
6. **Device receives** → Config update on subscribed topic

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/iot/webhook` | POST | Receive data from IoT Core |
| `/api/devices/data` | POST | Direct device data (alternative) |
| `/api/devices/:id/config` | POST | Set config (publishes to IoT Core) |
| `/api/devices/:id/config` | GET | Get current config |
| `/api/devices/:id/data` | GET | Get device data history |

## Troubleshooting

**Data not reaching backend:**
- Check IoT Core Rule is active
- Verify webhook URL is correct and accessible
- Check IAM role permissions

**Config not being published:**
- Verify `AWS_IOT_ENDPOINT` in `.env`
- Check AWS credentials are valid
- Review backend logs for errors

**Device not receiving config:**
- Verify device is subscribed to `devices/{id}/config/update`
- Check device certificate permissions
- Verify message published in IoT Core test client

## Next Steps

1. Deploy backend API to production (required for IoT Core HTTPS action)
2. Set up device certificates in IoT Core
3. Configure device firmware to use IoT Core
4. Set up monitoring and alerts
5. See [AWS_IOT_SETUP.md](./AWS_IOT_SETUP.md) for detailed configuration



---

## # ⚙️ Setup Guides

*Source: ESP32_SETUP.md*

# ESP32 Device Setup Guide

This guide shows how to configure the backend to work with ESP32 devices that publish to `esp32/*` topics.

## Topic Format

ESP32 devices use this topic format:
- **Data Publishing**: `esp32/data24` (or `esp32/24`)
- **Config Subscription**: `esp32/config24` (or `esp32/config24`)

## Device Data Format

Your ESP32 device is sending data like this:

```json
{
  "device_status": 1,
  "device_data": "*,S,151125,1734,VAPS_MODE,A,15.0,1.0,B,6.0,4.0,4.0,2.0,30.0,1.0,50.0,1.0,C,6.0,4.0,4.0,10.0,10.0,20.0,0.0,200.0,1.0,D,11.4,10.0,10.0,10.0,10.0,10.0,10.0,200.0,1.0,E,20.0,10.0,5.0,10.0,10.0,20.0,1.0,200.0,1.0,170.0,500.0,F,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
}
```

## Setup Steps

### 1. Create AWS IoT Core Rule

1. Go to AWS Console → IoT Core → Rules
2. Click "Create rule"
3. Configure:
   - **Name**: `ForwardESP32DataToBackend`
   - **SQL Version**: 2016-03-23
   - **SQL Statement**:
   ```sql
   SELECT 
       *,
       topic() as topic,
       timestamp() as timestamp,
       messageId() as messageId
   FROM 
       'esp32/+'
   ```

4. **Add Action**: "Send a message to an HTTPS endpoint"
   - **URL**: `https://your-api-domain.com/api/iot/webhook`
   - **HTTP Header**: `Content-Type: application/json`
   - Create IAM role if prompted

5. Save the rule

### 2. Configure ESP32 Device

Your ESP32 device should:
- **Publish to**: `esp32/data24` (or `esp32/24`)
- **Subscribe to**: `esp32/config24` (to receive config updates)

### 3. How It Works

1. **Device sends data** → Publishes to `esp32/data24`
2. **IoT Core Rule** → Forwards to backend `/api/iot/webhook`
3. **Backend** → 
   - Extracts device ID from topic (e.g., `24` from `esp32/data24`)
   - Auto-detects device type (BIPAP from VAPS_MODE)
   - Parses and saves data to MongoDB
   - Checks for pending config updates
4. **If config exists** → Publishes to `esp32/config24`
5. **Device receives** → Config update on subscribed topic

## Setting Configuration for ESP32 Device

### Option 1: Using Device ID

```bash
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "BIPAP",
    "config_values": {
      "pressure": 16.0,
      "humidity": 6.0,
      "mode": "VAPS_MODE"
    }
  }'
```

This will:
1. Save config to MongoDB with `device_id: "24"`
2. When device sends next data, backend publishes to `esp32/config24`

### Option 2: Using API to Publish Directly

You can also publish directly to the esp32 topic:

```javascript
// In your backend code or API
import { publishDeviceConfigToTopic } from './config/awsIoT.js';

await publishDeviceConfigToTopic(
  'esp32/config24',  // Target topic
  '24',              // Device ID
  {
    pressure: 16.0,
    humidity: 6.0,
    mode: 'VAPS_MODE'
  }
);
```

## Testing

### Test 1: Verify Data Reception

1. ESP32 device publishes to `esp32/data24`
2. Check backend logs - should see:
   ```
   IoT data received and processed successfully
   Config published to IoT Core topic: esp32/config24
   ```
3. Check MongoDB - data should be saved

### Test 2: Verify Config Publishing

1. Set configuration via API:
```bash
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "BIPAP",
    "config_values": {"pressure": 18.0}
  }'
```

2. Subscribe to `esp32/config24` in AWS IoT Test Client
3. ESP32 device sends next data
4. You should see config message on `esp32/config24` topic

### Test 3: End-to-End Flow

1. ESP32 sends data → Backend receives and saves
2. Admin sets config via API → Config saved, `pending_update: true`
3. ESP32 sends next data → Backend publishes config to `esp32/config24`
4. ESP32 receives config → Updates hardware settings

## Device ID Mapping

The backend automatically extracts device ID from topic:

| Topic | Extracted Device ID |
|-------|---------------------|
| `esp32/data24` | `24` |
| `esp32/24` | `24` |
| `esp32/data001` | `001` |
| `devices/cpap_001/data` | `cpap_001` |

## Config Topic Mapping

When config is published, topic is determined by data topic:

| Data Topic | Config Topic |
|------------|--------------|
| `esp32/data24` | `esp32/config24` |
| `esp32/24` | `esp32/config24` |
| `devices/cpap_001/data` | `devices/cpap_001/config/update` |

## Troubleshooting

### Data not reaching backend

1. Check IoT Core Rule is active
2. Verify rule SQL matches `esp32/+` pattern
3. Check webhook URL is accessible
4. Review CloudWatch logs for rule errors

### Config not being published

1. Verify device ID matches in MongoDB config
2. Check `pending_update` is `true`
3. Review backend logs for publish errors
4. Verify AWS credentials are correct

### Device not receiving config

1. Verify device is subscribed to `esp32/config24`
2. Check device certificate permissions
3. Test publish manually using AWS IoT Test Client
4. Verify topic name matches exactly

## Next Steps

1. Set up IoT Core Rule (see above)
2. Configure ESP32 device certificates in AWS IoT
3. Update ESP32 firmware to use correct topics
4. Test the complete flow
5. Monitor logs and set up alerts



---

## # ⚙️ Setup Guides

*Source: SETUP_ESP32_DATA24.md*

# Setup Guide for esp32/data24 Topic

Complete setup for device sending data to `esp32/data24` topic.

## Your Device Configuration

**Topic:** `esp32/data24`

This means:
- Your device publishes to: `esp32/data24`
- Config updates will be sent to: `esp32/config24`

## AWS IoT Core Rule Setup

### SQL Query for Rule

When creating your AWS IoT Core Rule, use this SQL:

```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'esp32/+'
```

**This matches:**
- ✅ `esp32/data24` (your device)
- ✅ `esp32/data25` (other devices)
- ✅ `esp32/anything` (all esp32 topics)

### Rule Action

**HTTPS Endpoint:**
- **For local testing:** `https://your-ngrok-url.ngrok.io/api/iot/webhook`
- **For production:** `https://your-production-api.com/api/iot/webhook`

**HTTP Header:**
- Key: `Content-Type`
- Value: `application/json`

## Expected Message Format

Your device should publish this format:

```json
{
  "device_status": 0,
  "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
}
```

**Topic:** `esp32/data24`

## Backend Processing

When your device sends data to `esp32/data24`:

1. **AWS IoT Core receives** the message
2. **IoT Core Rule forwards** to your API webhook
3. **Backend extracts:**
   - Device ID: `24` (from topic `esp32/data24`)
   - Device Type: Auto-detected (CPAP from MANUALMODE)
4. **Backend saves** to MongoDB:
   - Database: `mehulapi`
   - Collection: `devicedatas`
   - Device ID: `24`
5. **Backend checks** for pending config
6. **Backend publishes** config to `esp32/config24` (if config exists)

## Config Topic Mapping

When you set configuration for device `24`:

**Set config via API:**
```bash
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 16.0,
      "humidity": 7.0
    }
  }'
```

**Backend publishes to:** `esp32/config24`

**Your device should subscribe to:** `esp32/config24`

## Complete Flow for esp32/data24

```
ESP32 Device
    ↓ Publishes to: esp32/data24
AWS IoT Core
    ↓ Rule forwards (esp32/+ pattern matches)
Your API (/api/iot/webhook)
    ↓ Extracts device_id: "24" from topic
    ↓ Auto-detects: CPAP (from MANUALMODE)
    ↓ Saves to MongoDB
    ↓ Checks for config for device "24"
    ↓ Publishes to: esp32/config24
AWS IoT Core
    ↓ Delivers to subscribed device
ESP32 Device (subscribes to esp32/config24)
    ↓ Receives config update
✅ Hardware Updated!
```

## Testing

### Test 1: Direct API Test

Test if your API handles `esp32/data24` correctly:

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "topic": "esp32/data24"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "IoT data received and processed successfully",
  "data": {
    "device_id": "24",
    "timestamp": "..."
  }
}
```

### Test 2: Via AWS IoT Test Client

1. **Go to:** AWS Console → IoT Core → Test (MQTT test client)
2. **Subscribe to:** `esp32/config24` (to see config updates)
3. **Publish to:** `esp32/data24` with your device data
4. **Check your server logs** - should see `POST /api/iot/webhook 200`
5. **Check MongoDB Atlas** - should see data with `device_id: "24"`

### Test 3: Set Configuration

```bash
# Set config for device 24
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 16.0,
      "humidity": 7.0,
      "mode": "MANUALMODE"
    }
  }'
```

**Then send device data again** - backend will automatically publish config to `esp32/config24`

## Verify in MongoDB Atlas

After device sends data:

1. Go to MongoDB Atlas → Browse Collections
2. Navigate to: `mehulapi` → `devicedatas`
3. Filter by: `device_id: "24"`
4. You should see all data from your device

## Device Configuration

Your ESP32 device should:

**Publish:**
- Topic: `esp32/data24`
- Message format: JSON with `device_status`, `device_data`

**Subscribe:**
- Topic: `esp32/config24`
- Receive: Configuration updates from backend

## Troubleshooting

### Data Not Reaching API

**Check:**
1. AWS IoT Core Rule SQL: Should match `esp32/+`
2. Rule Action URL: Should be your API webhook
3. ngrok running (if local testing)
4. Server logs show incoming requests

### Device ID Not Correct

**If device_id is wrong:**
- Backend extracts `24` from `esp32/data24`
- If you want different ID, include `device_id` in message payload

### Config Not Published

**Check:**
1. Config exists for device `24` in MongoDB
2. Config has `pending_update: true`
3. Backend logs show "Config published to IoT Core topic: esp32/config24"

---

**Your topic `esp32/data24` is perfect!** Just make sure:
1. ✅ AWS IoT Core Rule matches `esp32/+`
2. ✅ Device publishes to `esp32/data24`
3. ✅ Device subscribes to `esp32/config24`
4. ✅ Rule forwards to your API webhook




---

## # ⚙️ Setup Guides

*Source: NGROK_SETUP_COMPLETE.md*

# Complete ngrok Setup - Next Steps

You're on the ngrok onboarding page. Here's what to do:

## Step 1: Complete ngrok Onboarding

1. **"How would you describe yourself?"**
   - Already selected: "Software Engineer (Development)" ✓

2. **"What are you interested in using ngrok for?"**
   - Already selected: "IoT Device Connectivity" ✓ (Perfect!)

3. **"Are you using ngrok for"**
   - Already selected: "Development" ✓

4. **Click:** "Continue" button (blue button at bottom)

## Step 2: Get Your Authtoken

After clicking "Continue", you'll be taken to the dashboard.

1. **Look for:** "Getting Started" or "Your Authtoken" section

2. **Or go directly to:**
   ```
   https://dashboard.ngrok.com/get-started/your-authtoken
   ```

3. **Copy your authtoken** (it looks like: `2abc123def456ghi789...`)

## Step 3: Configure ngrok with Authtoken

**In Terminal (where you'll run ngrok):**

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

Replace `YOUR_AUTHTOKEN_HERE` with the authtoken you copied.

**Expected output:**
```
Authtoken saved to configuration file: /Users/deckmount/.ngrok2/ngrok.yml
```

## Step 4: Start ngrok

**In Terminal (new terminal - keep npm run dev running):**

```bash
ngrok http 3000
```

**You'll see output like:**
```
ngrok                                                                         
                                                                                
Session Status                online                                           
Account                       Your Name (Plan: Free)                          
Version                       3.x.x                                            
Region                        United States (us)                               
Latency                       50ms                                             
Web Interface                 http://127.0.0.1:4040                            
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:3000
                                                                                
Connections                   ttl     opn     rt1     rt5     p50     p90      
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the HTTPS URL** (e.g., `https://abc123def456.ngrok.io`)

## Step 5: Use ngrok URL in AWS IoT Core Rule

**Go back to AWS IoT Core Console (Step 3):**

1. **Click dropdown** "Choose an action"
2. **Select:** "Send a message to an HTTPS endpoint"
3. **URL:** `https://YOUR-NGROK-URL.ngrok.io/api/iot/webhook`
   *(Replace YOUR-NGROK-URL with your actual ngrok URL)*
4. **Add HTTP header:**
   - Key: `Content-Type`
   - Value: `application/json`
5. **Click "Create role"** (if prompted)
6. **Click "Add action"**
7. **Click "Next"**

## Step 6: Complete Rule Creation

1. **Review settings** (Step 4)
2. **Click "Create"**

---

## Quick Checklist

- [ ] Complete ngrok onboarding (click "Continue")
- [ ] Get authtoken from ngrok dashboard
- [ ] Run: `ngrok config add-authtoken YOUR_AUTHTOKEN`
- [ ] Start ngrok: `ngrok http 3000`
- [ ] Copy HTTPS URL from ngrok output
- [ ] Go back to AWS IoT Core (Step 3)
- [ ] Fill in action with ngrok URL
- [ ] Complete rule creation

---

**Ready? Click "Continue" on the ngrok page, then follow the steps above!** 🚀



---

## # ⚙️ Setup Guides

*Source: LOCAL_TESTING_IOT.md*

# Local Testing Guide - IoT Core Integration

This guide shows you how to test the complete flow locally:
- Receiving data from AWS IoT Core → Your local API
- Sending config updates from your local API → AWS IoT Core → Devices

## Prerequisites

1. ✅ Backend API running locally (`npm run dev`)
2. ✅ MongoDB running (or MongoDB Atlas connection)
3. ✅ AWS IoT Core credentials configured in `.env`
4. ✅ AWS IoT Core Rule set up (or use ngrok for local testing)
5. ✅ AWS IoT Test Client access (web console)

## Option 1: Testing with AWS IoT Test Client (Recommended)

This simulates the complete flow using AWS IoT Console.

### Step 1: Start Your Local API

```bash
cd /Users/deckmount/Documents/mehulapi

# Make sure MongoDB is running or connected
# Update .env with your credentials

# Start the server
npm run dev
```

You should see:
```
Server running on port 3000
MongoDB Connected: ...
```

### Step 2: Set Up ngrok (For Local Testing)

Since AWS IoT Core needs a public HTTPS URL, use ngrok to expose your local API:

```bash
# Install ngrok
brew install ngrok

# Or download from: https://ngrok.com/download

# Start ngrok tunnel
ngrok http 3000
```

You'll get a URL like:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

**Save this URL!** You'll need it for AWS IoT Core Rule.

### Step 3: Update AWS IoT Core Rule

1. Go to AWS IoT Core Console → Rules
2. Edit your rule (or create new one)
3. Update HTTPS endpoint to your ngrok URL:
   ```
   https://abc123.ngrok.io/api/iot/webhook
   ```
4. Save the rule

**Important:** If you restart ngrok, you'll get a new URL - update the rule again!

### Step 4: Test Receiving Data from IoT Core

#### Using AWS IoT Test Client:

1. **Go to AWS IoT Console → Test (MQTT test client)**
2. **Subscribe to config topic** (to see if config is published):
   - Click "Subscribe to a topic"
   - Topic: `esp32/config24`
   - Quality of Service: QoS 1
   - Click "Subscribe"

3. **Publish test data** (simulating device sending data):
   - Click "Publish to a topic"
   - Topic: `esp32/data24`
   - Message payload:
   ```json
   {
     "device_status": 0,
     "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
   }
   ```
   - Click "Publish"

4. **Check your local API logs:**
   ```bash
   # In your terminal where npm run dev is running
   # You should see:
   # POST /api/iot/webhook 200
   # Config published to IoT Core topic: esp32/config24 for device: 24
   ```

5. **Check AWS IoT Test Client:**
   - Switch to subscribed topic: `esp32/config24`
   - You should see a config message appear!

### Step 5: Test Setting Configuration via API

#### Set Configuration:

```bash
# Set device configuration (this will publish to IoT Core on next data send)
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 16.0,
      "humidity": 7.0,
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
    "config_values": { ... },
    "pending_update": true
  }
}
```

#### Send Device Data Again:

Now publish to `esp32/data24` again in AWS IoT Test Client. Your local API will:
1. Receive the data
2. Save to MongoDB
3. Check for pending config (finds the one you just set)
4. Publish config to `esp32/config24`

#### Verify in AWS IoT Test Client:

- Check `esp32/config24` subscription
- You should see the config message with your values!

## Option 2: Direct Testing (Without IoT Core Rule)

Test endpoints directly without AWS IoT Core Rule forwarding.

### Test 1: Test IoT Webhook Endpoint Directly

```bash
# Simulate IoT Core sending data to your local API
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "topic": "esp32/data24",
    "timestamp": "2025-11-15T12:00:00Z",
    "messageId": "test-msg-001"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "IoT data received and processed successfully",
  "data": {
    "device_id": "24",
    "timestamp": "..."
  },
  "config_update": {
    "available": false
  }
}
```

### Test 2: Set Configuration and Test Complete Flow

```bash
# 1. Set configuration
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 16.0,
      "humidity": 7.0
    }
  }'

# 2. Send device data again (this should trigger config publishing)
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "topic": "esp32/data24"
  }'
```

**Check your local API logs** - you should see:
```
Config published to IoT Core topic: esp32/config24 for device: 24
```

**Verify in AWS IoT Test Client:**
- Subscribe to `esp32/config24`
- You should see the config message!

## Option 3: Complete End-to-End Test Script

Create a test script that simulates the complete flow:

```bash
#!/bin/bash

API_URL="http://localhost:3000"

echo "🧪 Testing Complete IoT Flow"
echo "============================"
echo ""

echo "1️⃣  Setting Device Configuration..."
curl -s -X POST $API_URL/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 18.0,
      "humidity": 8.0,
      "temperature": 3.0,
      "mode": "MANUALMODE"
    }
  }' | python3 -m json.tool
echo ""

echo "2️⃣  Simulating Device Sending Data (via IoT Core webhook)..."
curl -s -X POST $API_URL/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "topic": "esp32/data24",
    "timestamp": "2025-11-15T12:00:00Z",
    "messageId": "test-msg-001"
  }' | python3 -m json.tool
echo ""

echo "3️⃣  Verifying Data Saved in MongoDB..."
curl -s "$API_URL/api/devices/24/data?limit=1" | python3 -m json.tool
echo ""

echo "4️⃣  Checking Configuration..."
curl -s $API_URL/api/devices/24/config | python3 -m json.tool
echo ""

echo "✅ Test Complete!"
echo ""
echo "📊 Next Steps:"
echo "1. Check AWS IoT Test Client - subscribe to esp32/config24"
echo "2. You should see config message published"
echo "3. Check local API logs for publish confirmation"
```

Save as `test-iot-flow.sh` and run:
```bash
chmod +x test-iot-flow.sh
./test-iot-flow.sh
```

## Monitoring the Complete Flow

### Terminal 1: Watch API Logs

```bash
# In terminal where npm run dev is running
# Watch for:
# - POST /api/iot/webhook 200
# - Config published to IoT Core topic: ...
```

### Terminal 2: Watch MongoDB (Optional)

```bash
# If using local MongoDB with mongosh
mongosh mehulapi

# Watch for new documents
db.devicedatas.watch().forEach(change => printjson(change))

# Or check latest data
db.devicedatas.find().sort({ timestamp: -1 }).limit(1).pretty()
```

### Browser: AWS IoT Test Client

1. AWS Console → IoT Core → Test
2. Subscribe to: `esp32/config24`
3. Watch for config messages appearing

### Terminal 3: Test Scripts

Run your test scripts to simulate devices sending data.

## Verification Checklist

After running tests, verify:

- [ ] ✅ Local API receives data at `/api/iot/webhook`
- [ ] ✅ Data saved to MongoDB (`devicedatas` collection)
- [ ] ✅ Configuration set via API
- [ ] ✅ Configuration saved to MongoDB (`deviceconfigs` collection)
- [ ] ✅ Config published to IoT Core (check logs)
- [ ] ✅ Config message visible in AWS IoT Test Client
- [ ] ✅ Complete round-trip working

## Troubleshooting Local Testing

### Issue: IoT Core Rule Not Forwarding

**Solution:**
- Verify ngrok URL is correct in rule
- Check ngrok tunnel is active
- Restart ngrok if needed (update rule with new URL)

### Issue: Config Not Being Published

**Check:**
1. AWS credentials in `.env` are correct
2. `AWS_IOT_ENDPOINT` is set correctly
3. Check local API logs for errors
4. Verify config has `pending_update: true` in MongoDB

**Debug:**
```bash
# Test IoT connection
node scripts/verify-iot-connection.js
```

### Issue: Data Not Saving to MongoDB

**Check:**
1. MongoDB is running (or Atlas connection works)
2. Connection string in `.env` is correct
3. Check local API logs for MongoDB errors

### Issue: ngrok URL Changed

**Solution:**
- ngrok free tier gives new URL on restart
- Update AWS IoT Core Rule with new URL
- Or use ngrok reserved domain (paid)

## Advanced: Using Postman/Thunder Client

Import these requests to test:

### Request 1: Set Configuration
```
POST http://localhost:3000/api/devices/24/config
Content-Type: application/json

{
  "device_type": "CPAP",
  "config_values": {
    "pressure": 16.0,
    "humidity": 7.0
  }
}
```

### Request 2: Simulate IoT Webhook
```
POST http://localhost:3000/api/iot/webhook
Content-Type: application/json

{
  "device_status": 0,
  "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
  "topic": "esp32/data24"
}
```

## Complete Test Flow Diagram

```
1. Set Config via API
   POST /api/devices/24/config
   ↓
2. Config saved to MongoDB (pending_update: true)
   ↓
3. Simulate Device Sending Data
   (Via AWS IoT Core Rule → ngrok → Local API)
   POST /api/iot/webhook
   ↓
4. API receives data, saves to MongoDB
   ↓
5. API checks for pending config (finds it!)
   ↓
6. API publishes config to IoT Core
   Topic: esp32/config24
   ↓
7. Verify in AWS IoT Test Client
   Subscribe to esp32/config24 → See message!
```

## Quick Test Commands

```bash
# Terminal 1: Start API
npm run dev

# Terminal 2: Start ngrok (in another terminal)
ngrok http 3000

# Terminal 3: Run tests
./test-iot-flow.sh

# Browser: AWS IoT Test Client
# - Subscribe to esp32/config24
# - Watch for config messages
```

---

**Ready to test?** Follow Option 1 (AWS IoT Test Client) for the most realistic testing experience! 🚀



---

## # ☁️ AWS IoT Core Rules

*Source: IOT_CORE_RULE_SETUP.md*

# AWS IoT Core Rule Setup - Step by Step

This guide shows you exactly how to set up the AWS IoT Core Rule to forward device data from your ESP32 hardware to your backend API.

## Complete Data Flow

```
ESP32 Hardware → AWS IoT Core (esp32/data24) 
    ↓
AWS IoT Core Rule (forwards automatically)
    ↓
Backend API (/api/iot/webhook)
    ↓
MongoDB (saves data)
    ↓
Backend checks for config updates
    ↓
Backend publishes to AWS IoT Core (esp32/config24)
    ↓
ESP32 Hardware (subscribes and receives config)
    ↓
Hardware Updates ✅
```

## Step-by-Step Setup

### Step 1: Open AWS IoT Core Console

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **IoT Core** service
3. Make sure you're in the **us-east-1** region (or your configured region)
4. Click on **Rules** in the left sidebar

### Step 2: Create New Rule

1. Click the **"Create rule"** button (orange button at the top right)
2. Fill in the rule details:

**Rule name:**
```
ForwardESP32DataToBackend
```

**Description (optional):**
```
Forwards all ESP32 device data from esp32/+ topics to backend API
```

**Rule query statement:**

Use this SQL query:
```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'esp32/+'
```

This will match all topics starting with `esp32/` (like `esp32/data24`, `esp32/data25`, etc.)

### Step 3: Configure Rule Action (HTTPS)

1. Scroll down to **"Set one or more actions"**
2. Click **"Add action"**
3. Select **"Send a message to an HTTPS endpoint"**
4. Click **"Configure action"**

#### Action Configuration:

**URL:**
```
https://your-backend-url.com/api/iot/webhook
```

**Note:** Replace `your-backend-url.com` with your actual backend API URL. 
- For local testing with ngrok: `https://your-ngrok-url.ngrok.io/api/iot/webhook`
- For production: `https://api.yourdomain.com/api/iot/webhook`

**HTTP header:**
- Click **"Add HTTP header"**
- **Key:** `Content-Type`
- **Value:** `application/json`

**Confirmation required for HTTPS endpoint:** Leave unchecked (or check if you want confirmations)

**Authentication method:**
- Select **"None"** (or configure API key if your backend requires authentication)

5. Click **"Add action"** button
6. If prompted, click **"Create new role"** or select existing role for IoT Core to access HTTPS endpoint

### Step 4: Review and Create

1. Review all settings
2. Click **"Create rule"** at the bottom

### Step 5: Test the Rule

#### Test 1: Using AWS IoT Test Client

1. Go to **"Test" → "MQTT test client"** in IoT Core
2. Subscribe to topic: `esp32/config24` (to see if config gets published)
3. Publish a test message to `esp32/data24`:

```json
{
  "device_status": 0,
  "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
}
```

4. Check your backend logs - you should see:
   - Request received at `/api/iot/webhook`
   - Data saved to MongoDB
   - Config check performed

#### Test 2: Set Configuration

1. Set a configuration via API:

```bash
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 15.0,
      "humidity": 6.0,
      "mode": "MANUALMODE"
    }
  }'
```

2. Publish another test message to `esp32/data24` (from Test 1)
3. Check `esp32/config24` topic - you should see the config message!

## Verifying the Setup

### Check Rule Status

1. Go to **IoT Core → Rules**
2. Find your rule: `ForwardESP32DataToBackend`
3. Status should be **"Active"** (green)

### Check CloudWatch Logs (if enabled)

1. Go to **CloudWatch → Log groups**
2. Look for log group: `/aws/iot/rules/ForwardESP32DataToBackend`
3. Check for any errors

### Monitor Backend Logs

Your backend should log:
```
IoT data received and processed successfully
Config published to IoT Core topic: esp32/config24 for device: 24
```

## Troubleshooting

### Rule Not Forwarding Messages

**Problem:** Messages published to `esp32/data24` are not reaching backend

**Solutions:**
1. Check rule SQL matches `esp32/+` pattern
2. Verify rule status is "Active"
3. Check backend URL is accessible (test with curl)
4. Review CloudWatch logs for rule errors
5. Verify IAM role has permission to call HTTPS endpoint

### Backend Not Receiving Data

**Problem:** Backend endpoint `/api/iot/webhook` not receiving requests

**Solutions:**
1. Test backend URL directly:
   ```bash
   curl -X POST https://your-backend-url.com/api/iot/webhook \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```
2. Check if backend is running and accessible
3. Verify HTTPS endpoint URL in rule action
4. Check firewall/security group settings
5. Use ngrok for local testing if needed

### Config Not Being Published

**Problem:** Config exists but not published to IoT Core

**Solutions:**
1. Verify `AWS_IOT_ENDPOINT` in `.env` file
2. Check AWS credentials are valid
3. Verify `pending_update: true` in MongoDB config
4. Check backend logs for publish errors
5. Test IoT publish manually:
   ```bash
   node scripts/verify-iot-connection.js
   ```

## Alternative: Using Lambda Function

If HTTPS endpoint doesn't work, you can use Lambda function instead:

1. Create Lambda function (use code from `aws-iot/lambda-function.js`)
2. Set environment variable: `BACKEND_API_URL=https://your-api-url.com`
3. In IoT Core Rule action, select **"Send a message to a Lambda function"**
4. Select your Lambda function

## Quick Reference

### Topic Patterns

| Device Topic | Config Topic | Rule Pattern |
|--------------|--------------|--------------|
| `esp32/data24` | `esp32/config24` | `esp32/+` |
| `esp32/data25` | `esp32/config25` | `esp32/+` |
| `esp32/24` | `esp32/config24` | `esp32/+` |

### Rule SQL

```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'esp32/+'
```

### Backend Endpoint

```
POST https://your-backend-url.com/api/iot/webhook
```

### Expected Message Format

```json
{
  "device_status": 0,
  "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
  "topic": "esp32/data24",
  "timestamp": "2025-11-15T12:00:00Z",
  "messageId": "msg-12345"
}
```

## Next Steps

1. ✅ Create IoT Core Rule (follow steps above)
2. ✅ Test with AWS IoT Test Client
3. ✅ Set device configuration via API
4. ✅ Verify config gets published to `esp32/config24`
5. ✅ Configure ESP32 hardware to subscribe to `esp32/config24`
6. ✅ Test complete end-to-end flow

Once the rule is set up, your hardware will automatically forward data to the backend, and the backend will automatically push configuration updates back through IoT Core to your hardware!



---

## # ☁️ AWS IoT Core Rules

*Source: COMPLETE_RULE_SETUP_STEP_BY_STEP.md*

# Complete Rule Setup - Step by Step Guide

You're on the "Create rule" page. Follow these exact steps:

## Step 1: Specify Rule Properties (Current Step)

**You're here!** Fill in:

### Rule name:
```
ForwardESP32DataToBackend
```
*(Delete "AWS" and type the name above)*

### Rule description (optional):
```
Forwards ESP32 device data from esp32/+ topics to backend API webhook
```

**Then click:** "Next" button (bottom right)

---

## Step 2: Configure Rule Query Statement

### SQL Version:
Select: **2016-03-23** (or latest available)

### SQL Statement:
```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'esp32/+'
```

**Copy and paste the SQL above into the SQL statement field**

**Then click:** "Next" button

---

## Step 3: Configure Actions

**Important:** You need ngrok running for this step!

### Before this step - Start ngrok:

**Open a NEW terminal** (keep npm run dev running):

```bash
# If ngrok not authenticated, sign up first:
# Go to: https://dashboard.ngrok.com/signup
# Get authtoken, then run:
ngrok config add-authtoken YOUR_AUTHTOKEN

# Start ngrok
ngrok http 3000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

---

### In AWS Console - Step 3:

1. **Click:** "Add action" button

2. **Select action type:**
   - Choose: **"Send a message to an HTTPS endpoint"**
   - Click it

3. **Configure HTTPS action:**

   **URL:**
   ```
   https://YOUR-NGROK-URL.ngrok.io/api/iot/webhook
   ```
   *(Replace YOUR-NGROK-URL with your actual ngrok URL)*
   
   **Example:** `https://abc123.ngrok.io/api/iot/webhook`

   **HTTP Headers:**
   - Click "Add HTTP header"
   - **Key:** `Content-Type`
   - **Value:** `application/json`

   **Confirmation required:**
   - Leave unchecked (unless you want confirmations)

4. **IAM Role:**
   - Click **"Create role"** or **"Create new role"** (if prompted)
   - AWS will create an IAM role automatically
   - Role name will be something like: `IoT_HTTPS_Action_Role`

5. **Click:** "Add action" button

6. **Then click:** "Next" button

---

## Step 4: Review and Create

1. **Review all settings:**
   - Rule name: `ForwardESP32DataToBackend`
   - SQL: `SELECT *, topic() as topic... FROM 'esp32/+'`
   - Action: HTTPS endpoint with your ngrok URL

2. **Click:** "Create" button (bottom right)

---

## After Creating the Rule

### Test It:

1. **Make sure your server is running:**
   ```bash
   npm run dev
   ```

2. **Make sure ngrok is running:**
   ```bash
   ngrok http 3000
   ```

3. **Device sends data** to `esp32/data24`

4. **Check server logs:**
   - Should see: `POST /api/iot/webhook 200`
   - Should see: `IoT data received and processed successfully`

5. **Check MongoDB Atlas:**
   - Go to: MongoDB Atlas → Browse Collections
   - Navigate to: `mehulapi` → `devicedatas`
   - **Refresh** → Should see your data!

---

## Summary of What You're Setting Up

**Rule Name:** `ForwardESP32DataToBackend`

**What it does:**
- Listens to ALL messages on topics starting with `esp32/`
- Forwards them to: `https://your-ngrok-url.ngrok.io/api/iot/webhook`
- Your API receives the data and saves it to MongoDB

**Flow:**
```
ESP32 Device → esp32/data24
    ↓
AWS IoT Core Rule (your new rule)
    ↓
Your API (via ngrok)
    ↓
MongoDB Atlas (saved!)
```

---

## If You Need to Update Rule Later

1. Go to Rules page
2. Click on your rule name: `ForwardESP32DataToBackend`
3. Click "Edit"
4. Update the URL if ngrok URL changes
5. Save

---

**Ready? Follow the steps above to complete your rule!** 🚀



---

## # ☁️ AWS IoT Core Rules

*Source: SETUP_RULE_VIA_CLI.md*

# Setup AWS IoT Rule via CLI (If Console Doesn't Work)

## Prerequisites

1. **AWS CLI installed:**
   ```bash
   aws --version
   ```
   If not installed: `brew install awscli`

2. **AWS credentials configured:**
   ```bash
   aws configure
   ```
   Enter your:
   - Access Key ID: `your_access_key_here`
   - Secret Access Key: `your_secret_key_here`
   - Default region: `us-east-1`
   - Default output format: `json`

3. **ngrok running:**
   ```bash
   ngrok http 3000
   ```
   Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

## Step 1: Update Rule Document

Edit `rule-document.json`:

1. Replace `YOUR-NGROK-URL` with your actual ngrok URL
2. Example:
   ```json
   "url": "https://abc123.ngrok.io/api/iot/webhook"
   ```

## Step 2: Create Rule

```bash
cd /Users/deckmount/Documents/mehulapi

aws iot create-topic-rule \
  --rule-name ForwardESP32DataToBackend \
  --topic-payload file://rule-document.json \
  --region us-east-1
```

**Expected output:**
```json
{
    "ResponseMetadata": {
        "HTTPStatusCode": 200,
        ...
    }
}
```

## Step 3: Verify Rule Created

```bash
aws iot get-topic-rule \
  --rule-name ForwardESP32DataToBackend \
  --region us-east-1
```

## Step 4: Test It

1. Your device sends data to `esp32/data24`
2. Check server logs: Should see `POST /api/iot/webhook 200`
3. Check MongoDB Atlas: Refresh → See your data!

## Update Rule (If ngrok URL Changes)

```bash
# Edit rule-document.json with new URL

aws iot replace-topic-rule \
  --rule-name ForwardESP32DataToBackend \
  --topic-payload file://rule-document.json \
  --region us-east-1
```

## Delete Rule (If Needed)

```bash
aws iot delete-topic-rule \
  --rule-name ForwardESP32DataToBackend \
  --region us-east-1
```

## List All Rules

```bash
aws iot list-topic-rules --region us-east-1
```

---

**That's it!** The rule will forward all messages from `esp32/+` topics to your API.




---

## # ☁️ AWS IoT Core Rules

*Source: FIND_RULES_IN_IOT_CORE.md*

# Where to Find Rules in AWS IoT Core

## Step-by-Step Navigation

### Step 1: Find Rules Section

In the AWS IoT Core console (where you are now):

1. **Look at the LEFT SIDEBAR** (AWS IoT navigation pane)

2. **Click on "Manage"** section (expand it if collapsed)

3. **Look for "Rules"** - it should be listed under "Manage" or under "Message routing"

   **OR**

4. **Alternative path:**
   - Click **"Message routing"** (under "Manage")
   - Then click **"Rules"** (if it appears as a sub-item)

### Step 2: Create Rule

Once you're in the Rules section:

1. **Click "Create rule"** button (usually top right)

2. **Fill in the rule details:**
   - **Rule name:** `ForwardESP32DataToBackend`
   - **SQL statement:** See below
   - **Actions:** See below

3. **Save the rule**

## Quick Visual Guide

```
AWS IoT Core Console
├── Monitor
├── Connect
├── Test
│   └── MQTT test client (you use this to see messages)
└── Manage  ← CLICK HERE
    ├── All devices
    ├── Greengrass devices
    ├── Software packages
    ├── Remote actions
    ├── Message routing
    └── Rules  ← GO HERE (or click Message routing first)
```

## If Rules is Not Visible

If you don't see "Rules" directly:

1. **Click "Message routing"** (under "Manage")
2. **Then click "Rules"** (it should appear there)

## What to Put in the Rule

### Rule Name:
```
ForwardESP32DataToBackend
```

### SQL Statement:
```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'esp32/+'
```

### Action:
1. Click **"Add action"**
2. Select **"Send a message to an HTTPS endpoint"**
3. **URL:** `https://YOUR-NGROK-URL.ngrok.io/api/iot/webhook`
   *(Replace with your actual ngrok URL)*
4. **HTTP Header:**
   - Key: `Content-Type`
   - Value: `application/json`
5. Click **"Create role"** (if prompted)
6. Click **"Add action"**

### Save:
Click **"Create rule"** at the bottom

## Quick Navigation Checklist

- [ ] Open AWS IoT Core console
- [ ] Click **"Manage"** in left sidebar
- [ ] Find and click **"Rules"** (or click "Message routing" first, then "Rules")
- [ ] Click **"Create rule"** button
- [ ] Fill in rule name, SQL, and action
- [ ] Save rule

---

**That's it!** Once the rule is created, data from your device will automatically flow to your API and save in MongoDB!




---

## # ☁️ AWS IoT Core Rules

*Source: FIND_RULES_ALTERNATIVE.md*

# Can't Find Rules? Alternative Ways to Access

## Method 1: Use Direct URL (EASIEST!)

Open this URL directly in your browser:

```
https://us-east-1.console.aws.amazon.com/iot/home?region=us-east-1#/rules
```

**Or for any region:**
```
https://console.aws.amazon.com/iot/home?region=YOUR_REGION#/rules
```

Replace `YOUR_REGION` with your AWS region (e.g., `us-east-1`, `us-west-2`)

## Method 2: Use AWS Console Search

1. **Click the AWS search bar** at the top (next to AWS logo)
2. **Type:** `IoT Rules` or `IoT Core Rules`
3. **Click** on "IoT Rules" or "Rules (IoT Core)"
4. **This will take you directly to Rules page**

## Method 3: Check Under Message Routing

1. In AWS IoT Core console
2. Click **"Message routing"** (under "Manage" in left sidebar)
3. Look for tabs or sub-sections:
   - **Rules** (might be a tab)
   - **Message routing rules**
   - **Topic rules**
4. Click on it

## Method 4: Look for "Topic Rules" or "SQL Rules"

Sometimes AWS labels it differently:
- **Topic Rules**
- **SQL Rules**
- **Message Routing Rules**
- **IoT Rules**

## Method 5: Check Your Permissions

If you still can't see Rules:

1. **Check IAM permissions** - You need:
   - `iot:ListTopicRules`
   - `iot:CreateTopicRule`
   - `iot:GetTopicRule`
   - `iot:ReplaceTopicRule`
   - `iot:DeleteTopicRule`

2. **Or use full admin access** (for testing)

## Quick Check: What You Should See

When you find Rules, you should see:
- A list of existing rules (might be empty)
- A **"Create rule"** button (usually top right, orange/blue)
- A table showing rule names, SQL statements, and status

## Still Can't Find It?

### Option A: Create via AWS CLI

If you have AWS CLI installed:

```bash
aws iot create-topic-rule \
  --rule-name ForwardESP32DataToBackend \
  --topic-payload file://rule-document.json \
  --region us-east-1
```

We can create the rule document file if needed.

### Option B: Check AWS Region

Make sure you're in the correct region:
- Check top right corner of AWS console
- Should show: "United States (N. Virginia)" or your region
- Rules are region-specific

### Option C: Use AWS Console Mobile App

The mobile app sometimes shows different navigation - Rules might be easier to find there.

---

**Try Method 1 first (Direct URL) - it's the fastest!**

Copy and paste this in your browser:
```
https://us-east-1.console.aws.amazon.com/iot/home?region=us-east-1#/rules
```




---

## # ☁️ AWS IoT Core Rules

*Source: STEP_3_ACTION_SETUP.md*

# Step 3: Configure Action - Exact Steps

You're on **Step 3: Attach rule actions**. Here's what to do:

## Step 3A: Start ngrok First (IMPORTANT!)

**Before filling in the action, you need ngrok running to get the HTTPS URL!**

### Open a NEW Terminal (keep npm run dev running):

```bash
# Check if ngrok is authenticated
ngrok config check

# If not authenticated:
# 1. Go to: https://dashboard.ngrok.com/signup (sign up - it's free)
# 2. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
# 3. Copy your authtoken
# 4. Run:
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE

# Start ngrok
ngrok http 3000
```

**You'll see output like:**
```
Forwarding: https://abc123def456.ngrok.io -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://abc123def456.ngrok.io`)

---

## Step 3B: Configure Action in AWS Console

**Back in AWS Console (Step 3):**

1. **Click the dropdown** "Choose an action" (highlighted in red)

2. **Select from the dropdown:**
   - Look for: **"Send a message to an HTTPS endpoint"**
   - Click on it

3. **Configure HTTPS endpoint:**
   
   **URL:**
   ```
   https://YOUR-NGROK-URL.ngrok.io/api/iot/webhook
   ```
   *(Replace YOUR-NGROK-URL with your actual ngrok URL from above)*
   
   **Example:** `https://abc123def456.ngrok.io/api/iot/webhook`

4. **HTTP Headers:**
   - Click **"Add HTTP header"** or **"Add header"**
   - **Key:** `Content-Type`
   - **Value:** `application/json`

5. **Confirmation required:**
   - Leave unchecked (unless you want confirmations)

6. **IAM Role:**
   - Click **"Create role"** or **"Create new role"** (if prompted)
   - AWS will automatically create an IAM role for HTTPS actions
   - Accept the default role name (e.g., `IoT_HTTPS_Action_Role`)

7. **Save the action:**
   - Click **"Add action"** or **"Next"** (if button appears)

8. **If you need to add more actions:** Click **"Add rule action"**
   - *(You only need one action for now)*

---

## Step 3C: Continue to Step 4

After adding the action, you should see:
- Action 1: "Send a message to an HTTPS endpoint" with your URL

**Then click:** **"Next"** button (bottom right)

---

## Step 4: Review and Create

1. **Review all settings:**
   - Rule name: `ForwardESP32DataToBackend`
   - SQL: `SELECT *, topic() as topic... FROM 'esp32/+'`
   - Action: HTTPS endpoint with your ngrok URL

2. **Click:** **"Create"** button (bottom right)

---

## After Creating the Rule

### Test It:

1. **Device sends data** to `esp32/data24`

2. **Check server logs** (where `npm run dev` is running):
   - Should see: `POST /api/iot/webhook 200`
   - Should see: `IoT data received and processed successfully`

3. **Check MongoDB Atlas:**
   - Go to: MongoDB Atlas → Browse Collections
   - Navigate to: `mehulapi` → `devicedatas`
   - **Refresh** → Should see your data!

---

## Quick Checklist

- [ ] ngrok is running (Terminal 2)
- [ ] Copied ngrok HTTPS URL
- [ ] Selected "Send a message to an HTTPS endpoint"
- [ ] Entered URL: `https://your-ngrok-url.ngrok.io/api/iot/webhook`
- [ ] Added HTTP header: `Content-Type: application/json`
- [ ] Created IAM role (if prompted)
- [ ] Added action
- [ ] Clicked "Next"
- [ ] Reviewed settings
- [ ] Clicked "Create"

---

**Ready? Start with ngrok first, then fill in the action!** 🚀



---

## # ☁️ AWS IoT Core Rules

*Source: FINAL_STEP_RULE_SETUP.md*

# Final Step: Put ngrok URL in AWS IoT Core Rule

Your ngrok is running! Here's exactly where to put the URL:

## Your ngrok URL

```
https://vina-unscrawled-krishna.ngrok-free.dev
```

## Complete URL to Use

```
https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook
```

⚠️ **IMPORTANT:** Add `/api/iot/webhook` at the end!

---

## Steps: Go Back to AWS IoT Core Console

1. **Go to AWS Console tab**
   - Should be on: "Create rule | Step 3: Attach rule actions"

2. **Click dropdown "Choose an action"**
   - (Currently highlighted/visible in red border)

3. **Select:** "Send a message to an HTTPS endpoint"
   - Click on it

4. **Configure HTTPS endpoint:**

   **URL field:**
   ```
   https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook
   ```
   *(Paste this exact URL)*

   **HTTP Headers:**
   - Click **"Add HTTP header"** or **"Add header"**
   - **Key:** `Content-Type`
   - **Value:** `application/json`

5. **IAM Role:**
   - Click **"Create role"** or **"Create new role"** (if prompted)
   - AWS will automatically create an IAM role
   - Accept the default role name

6. **Save the action:**
   - Click **"Add action"** button
   - Or click **"Next"** if button appears

7. **Continue to Step 4:**
   - Click **"Next"** button (bottom right)

---

## Step 4: Review and Create

1. **Review all settings:**
   - Rule name: `ForwardESP32DataToBackend`
   - SQL: `SELECT *, topic() as topic... FROM 'esp32/+'`
   - Action: HTTPS endpoint → `https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook`

2. **Click:** **"Create"** button (bottom right)

---

## After Creating the Rule

### Test It:

1. **Make sure your server is running:**
   ```bash
   npm run dev
   ```
   (Should be running already)

2. **Make sure ngrok is running:**
   ```bash
   ngrok http 3000
   ```
   (Should be running already - you see it in terminal)

3. **Device sends data** to `esp32/data24`

4. **Check server logs** (where `npm run dev` is running):
   - Should see: `POST /api/iot/webhook 200`
   - Should see: `IoT data received and processed successfully`
   - Should see: `Config published to IoT Core topic: esp32/config24`

5. **Check MongoDB Atlas:**
   - Go to: MongoDB Atlas → Browse Collections
   - Navigate to: `mehulapi` → `devicedatas`
   - **Refresh** the page
   - You should see your device data!

---

## Summary

**Copy this exact URL:**
```
https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook
```

**Paste it in:**
- AWS IoT Core Console
- Step 3: Attach rule actions
- Action: HTTPS endpoint
- URL field

**Then:**
- Add HTTP header: `Content-Type: application/json`
- Create role (if prompted)
- Add action
- Next → Review → Create

---

**Ready? Go back to AWS Console and paste the URL!** 🚀



---

## # ☁️ AWS IoT Core Rules

*Source: RULE_CONFIGURED_CORRECTLY.md*

# ✅ Rule Configuration - All Correct!

## Verification Check

Based on your Step 4 "Review and create" page:

### ✅ Rule Name:
```
ForwardESP32DataToBackend
```
**Status:** ✓ Correct

### ✅ SQL Statement:
```sql
SELECT *, topic() as topic, timestamp() as timestamp, messageId() as messageId FROM 'esp32/+'
```
**Status:** ✓ Correct

### ✅ HTTPS Endpoint URL:
```
https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook
```
**Status:** ✓ Correct! (Has `/api/iot/webhook` at the end)

### ✅ HTTP Headers:
- **Key:** `Content-Type`
- **Value:** `application/json`
- **Count:** 1 header
**Status:** ✓ Correct!

---

## 🎉 Everything is Ready!

**You can now click the "Create" button!**

---

## After Creating the Rule

### Test It:

1. **Make sure your server is running:**
   ```bash
   npm run dev
   ```
   (Should be running already)

2. **Make sure ngrok is running:**
   ```bash
   ngrok http 3000
   ```
   (Should be running already)

3. **Your device sends data** to `esp32/data24`

4. **Check server logs** (where `npm run dev` is running):
   - Should see: `POST /api/iot/webhook 200`
   - Should see: `IoT data received and processed successfully`
   - Should see: `Config published to IoT Core topic: esp32/config24`

5. **Check MongoDB Atlas:**
   - Go to: MongoDB Atlas → Browse Collections
   - Navigate to: `mehulapi` → `devicedatas`
   - **Refresh** the page
   - **You should see your device data!** 🎉

---

## Complete Flow Now Working

```
ESP32 Device
    ↓ Publishes to esp32/data24
    {
      "device_status": 0,
      "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#"
    }
AWS IoT Core
    ↓ Rule "ForwardESP32DataToBackend" automatically forwards
    ↓ URL: https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook
    ↓ Header: Content-Type: application/json
Your API (via ngrok)
    ↓ Receives at /api/iot/webhook
    ↓ Extracts device ID: "24" from topic esp32/data24
    ↓ Auto-detects device type: "CPAP" from AUTOMODE
    ↓ Parses data
MongoDB Atlas
    ↓ Saves to devicedatas collection
✅ Data in Database!
```

---

**Click "Create" now! Everything is configured correctly!** 🚀



---

## # ☁️ AWS IoT Core Rules

*Source: RULE_CREATED_NEXT_STEPS.md*

# ✅ Rule Created Successfully! Next Steps

## What Just Happened

Your AWS IoT Core Rule `ForwardESP32DataToBackend` has been created and is **Active**!

**Rule Details:**
- **Name:** `ForwardESP32DataToBackend`
- **Status:** Active ✅
- **Topic Pattern:** `esp32/+`
- **Action:** Forwards to `https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook`

---

## Complete Flow Now Active

```
ESP32 Device
    ↓ Publishes to esp32/data24
    {
      "device_status": 0,
      "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#"
    }
AWS IoT Core
    ↓ Rule "ForwardESP32DataToBackend" automatically forwards
Your API (via ngrok)
    ↓ Receives at /api/iot/webhook
    ↓ Extracts device ID: "24" from topic esp32/data24
    ↓ Auto-detects device type: "CPAP" from AUTOMODE
    ↓ Parses data
MongoDB Atlas
    ↓ Saves to devicedatas collection
✅ Data in Database!
```

---

## Testing - Verify Everything Works

### Step 1: Verify Services Are Running

**1. Check your API server is running:**
```bash
# Terminal 1 (should be running)
npm run dev
```
Should show: `Server running on port 3000`

**2. Check ngrok is running:**
```bash
# Terminal 2 (should be running)
ngrok http 3000
```
Should show: `Forwarding: https://vina-unscrawled-krishna.ngrok-free.dev -> http://localhost:3000`

**3. Check MongoDB is connected:**
In server logs, should see: `✅ MongoDB Connected: ...`

---

### Step 2: Test the Complete Flow

**Option A: Wait for Device to Send Data**

1. **Your device sends data** to `esp32/data24`
2. **Check server logs** (Terminal 1 where `npm run dev` is running):
   ```
   POST /api/iot/webhook 200
   IoT data received and processed successfully
   Config published to IoT Core topic: esp32/config24 for device: 24
   ```
3. **Check MongoDB Atlas:**
   - Go to: MongoDB Atlas → Browse Collections
   - Navigate to: `mehulapi` → `devicedatas`
   - **Refresh** the page
   - **You should see your device data!** 🎉

**Option B: Test Manually (Simulate Device)**

You can test manually by sending data directly to your API:

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#",
    "topic": "esp32/data24"
  }'
```

This should save to MongoDB immediately.

---

### Step 3: Verify Data in MongoDB Atlas

1. **Go to MongoDB Atlas dashboard**
2. **Click "Browse Collections"**
3. **Navigate to:** `mehulapi` → `devicedatas`
4. **Refresh the page**
5. **Look for your data:**
   - `device_id: "24"`
   - `device_type: "CPAP"` (auto-detected from AUTOMODE)
   - `raw_data: "*,R,181125,1124,AUTOMODE,..."`
   - `parsed_data: { sections: {...} }`
   - `timestamp: "2025-11-18T..."`

---

## Troubleshooting

### If Data Not Appearing

1. **Check server logs:**
   - Look for errors
   - Check for `POST /api/iot/webhook` requests

2. **Check ngrok:**
   - Verify it's still running
   - Check the forwarding URL matches rule configuration

3. **Check AWS IoT Core Rule:**
   - Go to Rules → Click `ForwardESP32DataToBackend`
   - Verify status is "Active"
   - Check action URL matches your ngrok URL

4. **Check MongoDB connection:**
   - Verify `✅ MongoDB Connected` in server logs
   - Check connection string in `.env` file

5. **Test API directly:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok",...}`

---

## Success Indicators

✅ **Rule is Active** - You see this in AWS IoT Core Rules page  
✅ **Server is Running** - `npm run dev` shows server running  
✅ **ngrok is Running** - Shows forwarding URL  
✅ **MongoDB Connected** - Server logs show MongoDB connected  
✅ **Data in MongoDB** - Can see data in MongoDB Atlas  

---

## Next: Wait for Device Data

Now everything is set up! When your device sends data to `esp32/data24`:

1. ✅ AWS IoT Core receives it
2. ✅ Rule automatically forwards it to your API
3. ✅ API saves it to MongoDB
4. ✅ Data appears in MongoDB Atlas

**You're all set!** 🎉

---

**Everything is configured correctly. Just wait for your device to send data, or test manually using the curl command above!**



---

## # ☁️ AWS IoT Core Rules

*Source: SAME_TOPIC_SETUP.md*

# Setup for Same Topic Publish/Subscribe

Your device publishes AND subscribes on the same topic: `esp32/data24`

## Your Device Configuration

**Topic:** `esp32/data24` (for both publish and subscribe)

This means:
- ✅ Device publishes data to: `esp32/data24`
- ✅ Device subscribes to: `esp32/data24` (same topic)
- ✅ Backend sends config updates to: `esp32/data24` (same topic)

## How It Works

```
ESP32 Device
    ↓ Publishes data to: esp32/data24
AWS IoT Core
    ↓ Rule forwards to your API
Your API (/api/iot/webhook)
    ↓ Saves to MongoDB
    ↓ Checks for config
    ↓ Publishes config to: esp32/data24 (SAME TOPIC!)
AWS IoT Core
    ↓ Delivers to esp32/data24
ESP32 Device (subscribes to esp32/data24)
    ↓ Receives config update
✅ Device Updated!
```

## Backend Configuration

The backend is now configured to publish config updates to the **same topic** your device uses.

**When device sends data to `esp32/data24`:**
- Backend receives it
- Backend saves to MongoDB
- Backend checks for pending config
- **Backend publishes config to `esp32/data24`** (same topic)
- Your device receives it on the same topic it subscribes to!

## Testing

### Test 1: Send Data (Device Publishes)

**Your device publishes to `esp32/data24`:**
```json
{
  "device_status": 0,
  "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
}
```

**Backend receives, saves, and publishes config back to same topic!**

### Test 2: Set Configuration

```bash
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 16.0,
      "humidity": 7.0,
      "mode": "MANUALMODE"
    }
  }'
```

**Next time device sends data:**
- Backend publishes config to `esp32/data24`
- Device receives config on same topic!

### Test 3: Verify in AWS IoT Test Client

1. **Subscribe to:** `esp32/data24` (same topic)
2. **Publish test data** to `esp32/data24`
3. **You should see:**
   - Your published data (device data)
   - Config update message (from backend)

## AWS IoT Core Rule Setup

**SQL Query:**
```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'esp32/data24'
```

**Or match all esp32 topics:**
```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'esp32/+'
```

**Action:** HTTPS endpoint → Your API webhook URL

## Message Flow

### Device → Backend (Data Publishing)

**Device publishes:**
- Topic: `esp32/data24`
- Message: `{ "device_status": 0, "device_data": "..." }`

**Backend receives:**
- At `/api/iot/webhook`
- Extracts device_id: `24`
- Saves to MongoDB
- Checks for config

### Backend → Device (Config Publishing)

**If config exists, backend publishes:**
- Topic: `esp32/data24` (SAME TOPIC!)
- Message:
```json
{
  "device_id": "24",
  "config": {
    "pressure": 16.0,
    "humidity": 7.0,
    "mode": "MANUALMODE"
  },
  "timestamp": "2025-11-18T...",
  "action": "config_update"
}
```

**Device receives:**
- On subscribed topic: `esp32/data24`
- Processes config update

## Important Notes

### 1. Message Identification

Since both device data and config use same topic, your device should:

**Identify message type:**
- Device data: Has `device_data` field
- Config update: Has `config` field and `action: "config_update"`

**Example device code logic:**
```javascript
// Pseudo-code
if (message.device_data) {
  // This is device data we sent - ignore
} else if (message.config && message.action === "config_update") {
  // This is config update from backend
  updateDeviceConfig(message.config);
}
```

### 2. Avoid Loops

Make sure your device:
- ✅ **Publishes** device data
- ✅ **Subscribes** to same topic
- ✅ **Ignores** messages it publishes (check message ID or sender)
- ✅ **Processes** config updates from backend

## Troubleshooting

### Device Receives Its Own Data

**Problem:** Device receives its own published data back

**Solution:** In device code, filter messages:
- Check if message has `device_data` (you sent it)
- Only process messages with `config` field (from backend)

### Config Not Being Received

**Check:**
1. Config exists for device `24` with `pending_update: true`
2. Backend logs show: `Config published to IoT Core topic: esp32/data24`
3. Device is subscribed to `esp32/data24`
4. Check AWS IoT Test Client to see if config message appears

### Both Messages on Same Topic

**Solution:** Use message fields to differentiate:
- **Device data:** `{ device_status, device_data, ... }`
- **Config update:** `{ device_id, config, action: "config_update", ... }`

## Alternative: Use Different Topics (If Needed)

If you want separate topics (recommended for clarity):

**Device:**
- Publishes to: `esp32/data24`
- Subscribes to: `esp32/config24`

**Backend:** Already configured to use `esp32/config24` for config updates (just uncomment the code in iotController.js)

---

**Your setup is now configured for same topic!** The backend will publish config updates to `esp32/data24` - the same topic your device subscribes to.




---

## # ☁️ AWS IoT Core Rules

*Source: FIX_SQL_ERROR.md*

# Fix SQL Error - messageId() Function Issue

## Error Message
```
InvalidRequestException
Errors encountered while validating query. 
ERROR: The provided function messageid does not exist
```

## Problem
The SQL query uses `messageId()` which is not a valid function in AWS IoT Core SQL.

## Solution: Remove messageId()

### Current SQL (WRONG):
```sql
SELECT *, topic() as topic, timestamp() as timestamp, messageId() as messageId FROM 'esp32/+'
```

### Corrected SQL (FIXED):
```sql
SELECT *, topic() as topic, timestamp() as timestamp FROM 'esp32/+'
```

**OR** (if you need a message ID, use this):

```sql
SELECT *, topic() as topic, timestamp() as timestamp FROM 'esp32/+'
```

---

## How to Fix

1. **Go back to Step 2: SQL statement**
   - Click "Edit" button next to "SQL statement" section

2. **Update the SQL query:**
   - Remove `, messageId() as messageId` from the SELECT statement
   - Should be:
   ```sql
   SELECT *, topic() as topic, timestamp() as timestamp FROM 'esp32/+'
   ```

3. **Click "Next"** to go back to Step 3

4. **Verify actions** (should already be correct):
   - URL: `https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook`
   - Headers: `Content-Type: application/json`

5. **Click "Next"** to go to Step 4

6. **Review and click "Create"**

---

## Alternative: If You Need Message ID

If you really need a message ID, AWS IoT Core doesn't provide a `messageId()` function directly. You can:

1. **Remove messageId()** (simplest - recommended)
2. **Use payload structure** - message ID might be in the payload itself

For this setup, you don't need messageId(), so just remove it.

---

**Quick Fix: Remove `, messageId() as messageId` from SQL query!**



---

## # 🚀 Deployment

*Source: DEPLOYMENT.md*

# Production Deployment Guide

This guide covers deploying the CPAP/BIPAP API to production with best practices.

## Deployment Options

### Option 1: AWS Elastic Beanstalk (Recommended for AWS Users) ⭐

**Best for:** Teams already using AWS, need scalability

#### Setup Steps

1. **Install EB CLI:**
```bash
pip install awsebcli
eb init
```

2. **Configure:**
```bash
# Create .ebignore (similar to .gitignore)
echo "node_modules/
.env
*.log" > .ebignore

# Initialize EB
eb init -p node.js --region us-east-1 mehulapi-prod

# Create environment
eb create mehulapi-production
```

3. **Set Environment Variables in AWS Console:**
   - Go to Elastic Beanstalk → Configuration → Environment properties
   - Add:
     ```
     NODE_ENV=production
     PORT=8080
     MONGODB_URI=your_production_mongodb_uri
     AWS_REGION=us-east-1
     AWS_ACCESS_KEY_ID=your_key
     AWS_SECRET_ACCESS_KEY=your_secret
     AWS_IOT_ENDPOINT=your_iot_endpoint
     ```

4. **Deploy:**
```bash
eb deploy
```

### Option 2: Railway (Easiest - Recommended) ⭐⭐⭐

**Best for:** Quick deployment, easy setup

#### Setup Steps

1. **Sign up:** https://railway.app
2. **Connect GitHub repository:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
3. **Add Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_uri
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_IOT_ENDPOINT=your_iot_endpoint
   ```
4. **Deploy:** Railway auto-deploys on git push
5. **Get URL:** Railway provides HTTPS URL automatically

### Option 3: Heroku

**Best for:** Simple deployments, popular platform

#### Setup Steps

1. **Install Heroku CLI:**
```bash
brew install heroku/brew/heroku
heroku login
```

2. **Create App:**
```bash
heroku create mehulapi-production
```

3. **Set Config Vars:**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set AWS_REGION=us-east-1
heroku config:set AWS_ACCESS_KEY_ID=your_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
heroku config:set AWS_IOT_ENDPOINT=your_iot_endpoint
```

4. **Deploy:**
```bash
git push heroku main
```

### Option 4: DigitalOcean App Platform

**Best for:** Simple, affordable hosting

1. Sign up at https://www.digitalocean.com
2. Create new App
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Option 5: AWS EC2 / Docker

**Best for:** Full control, custom infrastructure

See `DEPLOYMENT_DOCKER.md` for Docker setup.

## Production Configuration

### 1. Update package.json

Add production scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "production": "NODE_ENV=production node server.js"
  }
}
```

### 2. Create Production Environment File

**Never commit `.env` to git!** Use platform environment variables instead.

Create `.env.production` as template:

```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mehulapi
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_production_key
AWS_SECRET_ACCESS_KEY=your_production_secret
AWS_IOT_ENDPOINT=your-iot-endpoint-ats.iot.us-east-1.amazonaws.com
```

### 3. Update Server Configuration

Update `server.js` for production:

```javascript
const PORT = process.env.PORT || 3000;

// Only log errors in production
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // Less verbose logging
} else {
  app.use(morgan('dev'));
}
```

### 4. Enable CORS for Production

Update CORS settings:

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : '*',
  credentials: true
};
app.use(cors(corsOptions));
```

### 5. Add Security Middleware

Install security packages:

```bash
npm install helmet rate-limiter express-rate-limit
```

Add to `server.js`:

```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

## Production Checklist

### Before Deployment

- [ ] MongoDB Atlas production cluster set up
- [ ] Environment variables configured on platform
- [ ] AWS IoT Core credentials set up
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Security headers (helmet) enabled
- [ ] Error handling configured
- [ ] Logging set up
- [ ] Health check endpoint working
- [ ] API documentation updated

### Security

- [ ] Use HTTPS only
- [ ] Environment variables secure (not in code)
- [ ] API keys stored securely
- [ ] CORS restricted to known domains
- [ ] Rate limiting enabled
- [ ] Input validation enabled
- [ ] SQL injection protection (MongoDB is safe, but validate inputs)
- [ ] Regular dependency updates

### Monitoring

- [ ] Health check monitoring set up
- [ ] Error tracking (Sentry, LogRocket, etc.)
- [ ] Performance monitoring
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Log aggregation (CloudWatch, Datadog)

## Post-Deployment

### 1. Test Production API

```bash
# Test health endpoint
curl https://your-api-domain.com/health

# Test device data endpoint
curl -X POST https://your-api-domain.com/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{"device_status": 1, "device_data": "...", "device_type": "CPAP", "device_id": "test"}'
```

### 2. Update IoT Core Rule

Update AWS IoT Core Rule HTTPS endpoint to production URL:

```
https://your-api-domain.com/api/iot/webhook
```

### 3. Set Up Monitoring

- Configure uptime monitoring
- Set up error alerts
- Monitor API response times
- Track API usage

### 4. Domain Setup (Optional)

If using custom domain:

1. Add CNAME record pointing to deployment platform
2. Configure SSL certificate (usually auto-generated)
3. Update environment variables if needed

## Scaling Considerations

### Horizontal Scaling

- Use load balancer for multiple instances
- MongoDB Atlas scales automatically
- Stateless API design (no session storage in server)

### Database

- Use MongoDB Atlas for automatic backups
- Enable read replicas for high read volume
- Set up connection pooling

### Caching (Future)

Consider Redis for:
- Frequently accessed configurations
- Rate limiting counters
- Session management

## Backup & Recovery

### MongoDB Backups

- MongoDB Atlas: Automatic backups enabled by default
- Manual backup:
```bash
mongodump --uri="mongodb+srv://..." --out=/backup
```

### Application Code

- Version control (Git)
- Tag production releases
- Keep deployment scripts

## Troubleshooting Production

### Common Issues

1. **Database Connection Errors**
   - Check MongoDB Atlas network access
   - Verify connection string
   - Check Atlas cluster status

2. **AWS IoT Errors**
   - Verify credentials
   - Check IAM permissions
   - Verify IoT Core endpoint

3. **High Memory Usage**
   - Enable node memory limits
   - Review inefficient queries
   - Add connection pooling limits

4. **Slow Response Times**
   - Add database indexes
   - Optimize queries
   - Enable caching
   - Scale horizontally

## Recommended Platforms Comparison

| Platform | Ease | Cost | Scaling | Best For |
|----------|------|------|---------|----------|
| Railway | ⭐⭐⭐ | Free-$20/mo | Auto | Quick deployments |
| Heroku | ⭐⭐ | $7-$25/mo | Manual | Simple apps |
| AWS EB | ⭐⭐ | Pay-as-go | Auto | AWS ecosystem |
| DigitalOcean | ⭐⭐ | $5-$12/mo | Manual | Affordable VPS |
| Render | ⭐⭐⭐ | Free-$25/mo | Auto | Easy deployments |

## Next Steps

1. Choose deployment platform
2. Set up MongoDB Atlas production cluster
3. Configure environment variables
4. Deploy API
5. Update IoT Core Rule with production URL
6. Test end-to-end flow
7. Set up monitoring

For detailed platform-specific instructions, see:
- `DEPLOYMENT_RAILWAY.md`
- `DEPLOYMENT_HEROKU.md`
- `DEPLOYMENT_AWS.md`



---

## # 🚀 Deployment

*Source: DEPLOYMENT_RAILWAY.md*

# Railway Deployment Guide (Easiest)

Railway is the easiest way to deploy your API. Free tier available, automatic HTTPS, auto-deploy from GitHub.

## Prerequisites

- GitHub account
- Railway account (free): https://railway.app
- MongoDB Atlas account (free): https://www.mongodb.com/cloud/atlas
- AWS IoT Core set up

## Step-by-Step Deployment

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already)
git init

# Add files
git add .

# Commit
git commit -m "Initial commit - CPAP/BIPAP API"

# Create GitHub repository, then:
git remote add origin https://github.com/yourusername/mehulapi.git
git push -u origin main
```

### Step 2: Sign Up for Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (recommended)

### Step 3: Deploy from GitHub

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `mehulapi` repository
4. Railway will auto-detect Node.js and start deploying

### Step 4: Configure Environment Variables

In Railway project dashboard:

1. Go to "Variables" tab
2. Add these variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mehulapi
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_IOT_ENDPOINT=your-iot-endpoint-ats.iot.us-east-1.amazonaws.com
```

3. Click "Add" for each variable

### Step 5: Get Production URL

1. Go to "Settings" tab
2. Railway provides a domain like: `mehulapi-production.up.railway.app`
3. Or add custom domain in "Domains" section

### Step 6: Update AWS IoT Core Rule

1. Go to AWS IoT Core Console → Rules
2. Edit your rule
3. Update HTTPS endpoint to:
   ```
   https://mehulapi-production.up.railway.app/api/iot/webhook
   ```
4. Save rule

### Step 7: Test Production API

```bash
# Health check
curl https://mehulapi-production.up.railway.app/health

# Test device data
curl -X POST https://mehulapi-production.up.railway.app/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "test"
  }'
```

## Railway Advantages

✅ **Automatic HTTPS** - SSL certificates included
✅ **Auto-deploy** - Deploys on every git push
✅ **Free tier** - $5 free credit monthly
✅ **Easy scaling** - Click to scale
✅ **Logs** - Built-in log viewer
✅ **Environment variables** - Easy to manage

## Railway Pricing

- **Free tier:** $5 credit monthly
- **Hobby:** $20/month for consistent usage
- **Pro:** $40/month with more resources

## Custom Domain Setup

1. In Railway dashboard → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `api.yourcompany.com`)
4. Add CNAME record in your DNS:
   ```
   api.yourcompany.com → your-project.up.railway.app
   ```
5. Railway automatically provisions SSL certificate

## Monitoring & Logs

Railway provides:
- **Real-time logs** - View in dashboard
- **Metrics** - CPU, memory usage
- **Deployments** - History of all deployments

## Troubleshooting

### Build Fails

Check:
1. `package.json` has correct `start` script
2. Dependencies are in `package.json`
3. Node.js version is specified (optional)

### Environment Variables Not Working

1. Make sure variables are set in Railway dashboard
2. Redeploy after adding variables
3. Check variable names match exactly

### API Not Accessible

1. Check Railway deployment status
2. Verify domain is correct
3. Check logs for errors

## Automatic Deployments

Railway auto-deploys on:
- Push to `main` branch (production)
- Push to other branches (preview deployments)

To disable auto-deploy:
1. Settings → Source
2. Disable "Deploy on Push"

## Database Connection

Railway works great with:
- MongoDB Atlas (recommended)
- Railway's own PostgreSQL (if migrating)

For MongoDB Atlas, just use the connection string in environment variables.

## Next Steps After Deployment

1. ✅ Test all endpoints
2. ✅ Update IoT Core Rule with production URL
3. ✅ Set up monitoring (Railway has built-in)
4. ✅ Test end-to-end flow with devices
5. ✅ Set up custom domain (optional)

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

---

**Estimated Setup Time:** 10-15 minutes
**Difficulty:** ⭐ Easy
**Recommended for:** Quick deployments, teams new to DevOps



---

## # 🚀 Deployment

*Source: DEPLOYMENT_AWS.md*

# AWS Deployment Guide

Complete guide for deploying the CPAP/BIPAP API on AWS.

## AWS Deployment Options

### Option 1: AWS Elastic Beanstalk (Recommended) ⭐⭐⭐
**Best for:** Quick deployment, automatic scaling, easy management

### Option 2: AWS EC2 (Full Control)
**Best for:** Custom configurations, full server control

### Option 3: AWS ECS/Fargate (Containers)
**Best for:** Docker-based deployments, microservices

### Option 4: AWS Lambda + API Gateway (Serverless)
**Best for:** Pay-per-use, auto-scaling, low cost

---

## Option 1: AWS Elastic Beanstalk (Recommended)

Elastic Beanstalk is the easiest way to deploy Node.js applications on AWS.

### Prerequisites

1. AWS Account
2. AWS CLI installed
3. EB CLI installed

### Step 1: Install AWS EB CLI

```bash
# macOS
brew install aws-elasticbeanstalk

# Or using pip
pip install awsebcli --upgrade --user

# Verify installation
eb --version
```

### Step 2: Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Enter:
# AWS Access Key ID: your_access_key
# AWS Secret Access Key: your_secret_key
# Default region: us-east-1
# Default output format: json
```

### Step 3: Create Application Files

Create `.ebignore` file:

```bash
cat > .ebignore << 'EOF'
node_modules/
.env
*.log
.DS_Store
.git/
.gitignore
*.md
examples/
scripts/
aws-iot/
EOF
```

Create `.platform/hooks/postdeploy/01_migrate.sh` (optional):

```bash
mkdir -p .platform/hooks/postdeploy
cat > .platform/hooks/postdeploy/01_migrate.sh << 'EOF'
#!/bin/bash
# This runs after deployment
echo "Post-deploy hook executed"
EOF
chmod +x .platform/hooks/postdeploy/01_migrate.sh
```

### Step 4: Initialize Elastic Beanstalk

```bash
cd /Users/deckmount/Documents/mehulapi

# Initialize EB
eb init

# Follow prompts:
# Select region: us-east-1 (or your region)
# Application name: mehulapi
# Platform: Node.js
# Platform version: Node.js 18 (or latest)
# Setup SSH: Yes (optional, for debugging)
```

This creates `.elasticbeanstalk/config.yml` file.

### Step 5: Create Environment

```bash
# Create production environment
eb create mehulapi-production \
  --instance-type t3.small \
  --envvars NODE_ENV=production

# Or interactive mode
eb create
```

**Wait for environment creation** (5-10 minutes)

### Step 6: Set Environment Variables

```bash
# Set environment variables
eb setenv \
  NODE_ENV=production \
  MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/mehulapi" \
  AWS_REGION=us-east-1 \
  AWS_ACCESS_KEY_ID=your_access_key \
  AWS_SECRET_ACCESS_KEY=your_secret_key \
  AWS_IOT_ENDPOINT=your-iot-endpoint-ats.iot.us-east-1.amazonaws.com

# Or set one at a time
eb setenv MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/mehulapi"
eb setenv AWS_REGION=us-east-1
```

### Step 7: Deploy

```bash
# Deploy application
eb deploy

# Or deploy with specific environment
eb deploy mehulapi-production
```

### Step 8: Get Production URL

```bash
# Open application in browser
eb open

# Or get URL
eb status

# Output shows:
# CNAME: mehulapi-production.us-east-1.elasticbeanstalk.com
```

### Step 9: Update AWS IoT Core Rule

1. Go to AWS IoT Core Console → Rules
2. Edit your rule
3. Update HTTPS endpoint to:
   ```
   https://mehulapi-production.us-east-1.elasticbeanstalk.com/api/iot/webhook
   ```
4. Save

### Useful EB Commands

```bash
# View logs
eb logs

# SSH into instance
eb ssh

# Check status
eb status

# View environment info
eb health

# Scale application
eb scale 2  # Scale to 2 instances

# View environment variables
eb printenv

# Open application
eb open

# Terminate environment (be careful!)
eb terminate
```

### Custom Domain Setup

```bash
# Add custom domain
eb custom --optionname aws:elasticbeanstalk:environment --optionvalue your-domain.com
```

Or in AWS Console:
1. Elastic Beanstalk → Your environment → Configuration
2. Load balancer → Add listener (HTTPS)
3. Add certificate
4. Configure DNS CNAME to EB URL

---

## Option 2: AWS EC2 Deployment

For full control over the server.

### Step 1: Launch EC2 Instance

1. Go to EC2 Console → Launch Instance
2. Choose Amazon Linux 2023 or Ubuntu
3. Instance type: t3.small or t3.medium
4. Create key pair
5. Configure security group:
   - Allow HTTP (port 80)
   - Allow HTTPS (port 443)
   - Allow SSH (port 22) - your IP only
6. Launch instance

### Step 2: Connect to Instance

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip
```

### Step 3: Install Node.js

```bash
# Amazon Linux 2023
sudo dnf install -y nodejs npm

# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### Step 4: Install MongoDB (or use Atlas)

For MongoDB Atlas (recommended):
- Use MongoDB Atlas connection string
- No local MongoDB needed

For local MongoDB:
```bash
# Install MongoDB
# See MongoDB docs for your Linux distribution
```

### Step 5: Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/mehulapi.git
cd mehulapi

# Install dependencies
npm install --production

# Create .env file
nano .env

# Add environment variables
# NODE_ENV=production
# MONGODB_URI=...
# AWS_REGION=...
# etc.

# Install PM2 (process manager)
sudo npm install -g pm2

# Start application
pm2 start server.js --name mehulapi

# Save PM2 configuration
pm2 save
pm2 startup

# View logs
pm2 logs mehulapi
```

### Step 6: Set Up Nginx Reverse Proxy

```bash
# Install Nginx
sudo dnf install -y nginx  # Amazon Linux
# sudo apt-get install -y nginx  # Ubuntu

# Configure Nginx
sudo nano /etc/nginx/conf.d/mehulapi.conf
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test Nginx configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 7: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo dnf install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

---

## Option 3: AWS ECS/Fargate (Docker)

For containerized deployments.

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### Step 2: Build and Push Docker Image

```bash
# Build image
docker build -t mehulapi .

# Tag for ECR
docker tag mehulapi:latest your-account.dkr.ecr.us-east-1.amazonaws.com/mehulapi:latest

# Create ECR repository
aws ecr create-repository --repository-name mehulapi

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com

# Push image
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/mehulapi:latest
```

### Step 3: Create ECS Task Definition

Create `task-definition.json`:

```json
{
  "family": "mehulapi",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "mehulapi",
      "image": "your-account.dkr.ecr.us-east-1.amazonaws.com/mehulapi:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3000"}
      ],
      "secrets": [
        {"name": "MONGODB_URI", "valueFrom": "arn:aws:secretsmanager:us-east-1:account:secret:mongodb-uri"},
        {"name": "AWS_ACCESS_KEY_ID", "valueFrom": "arn:aws:secretsmanager:us-east-1:account:secret:aws-key-id"},
        {"name": "AWS_SECRET_ACCESS_KEY", "valueFrom": "arn:aws:secretsmanager:us-east-1:account:secret:aws-secret-key"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mehulapi",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Step 4: Create ECS Service

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster mehulapi-cluster \
  --service-name mehulapi-service \
  --task-definition mehulapi \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

---

## Option 4: AWS Lambda + API Gateway (Serverless)

For serverless architecture.

### Step 1: Install Serverless Framework

```bash
npm install -g serverless
```

### Step 2: Create serverless.yml

```yaml
service: mehulapi

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    MONGODB_URI: ${env:MONGODB_URI}
    AWS_REGION: us-east-1
    AWS_ACCESS_KEY_ID: ${env:AWS_ACCESS_KEY_ID}
    AWS_SECRET_ACCESS_KEY: ${env:AWS_SECRET_ACCESS_KEY}
    AWS_IOT_ENDPOINT: ${env:AWS_IOT_ENDPOINT}

functions:
  api:
    handler: serverless-handler.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
      - http:
          path: /
          method: ANY

plugins:
  - serverless-offline
```

### Step 3: Create Lambda Handler

Create `serverless-handler.js`:

```javascript
import serverless from 'serverless-http';
import app from './server.js';

export const handler = serverless(app);
```

### Step 4: Deploy

```bash
# Deploy
serverless deploy

# Get endpoint URL
serverless info
```

---

## Security Best Practices for AWS

### 1. Use AWS Secrets Manager

Store sensitive data in Secrets Manager instead of environment variables:

```bash
# Create secret
aws secretsmanager create-secret \
  --name mehulapi/mongodb-uri \
  --secret-string "mongodb+srv://user:pass@cluster.mongodb.net/mehulapi"
```

Access in code:
```javascript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });
const response = await client.send(new GetSecretValueCommand({
  SecretId: "mehulapi/mongodb-uri"
}));
const mongodbUri = JSON.parse(response.SecretString);
```

### 2. Use IAM Roles (Instead of Access Keys)

For EC2/ECS/Lambda:
- Create IAM role with required permissions
- Attach role to instance/container/function
- Remove access keys from code

### 3. Security Groups

Restrict access:
- Only allow necessary ports
- Restrict SSH to specific IPs
- Use VPC for private resources

### 4. Enable CloudWatch Logs

Monitor application logs:
- Set up log groups
- Enable log retention
- Set up alarms

---

## Cost Estimation

### Elastic Beanstalk (t3.small)
- EC2 instance: ~$15/month
- Load Balancer: ~$18/month
- Data transfer: Pay as you go
- **Total: ~$33-50/month**

### EC2 (t3.small, no load balancer)
- EC2 instance: ~$15/month
- Data transfer: Pay as you go
- **Total: ~$15-25/month**

### ECS Fargate
- Fargate vCPU: ~$0.04/hour
- Memory: ~$0.004/GB-hour
- **Total: ~$20-40/month** (depending on usage)

### Lambda + API Gateway
- Lambda: First 1M requests free, then $0.20 per 1M
- API Gateway: First 1M requests free, then $3.50 per 1M
- **Total: ~$0-10/month** (for low to medium traffic)

---

## Recommended: Elastic Beanstalk

**Why:**
- ✅ Easiest AWS deployment for Node.js
- ✅ Automatic scaling
- ✅ Load balancer included
- ✅ Easy environment variable management
- ✅ Built-in monitoring
- ✅ Easy rollbacks

**Quick Start:**
```bash
eb init
eb create mehulapi-production
eb setenv NODE_ENV=production MONGODB_URI=...
eb deploy
eb open
```

---

## Troubleshooting

### EB Deployment Fails

```bash
# Check logs
eb logs

# Check events
eb events

# SSH into instance
eb ssh
```

### High Memory Usage

```bash
# Scale up instance type
eb scale --instance-types t3.medium

# Or add more instances
eb scale 2
```

### Environment Variables Not Working

```bash
# Check environment variables
eb printenv

# Set again
eb setenv VARIABLE=value
```

---

## Next Steps

1. Choose deployment option (Elastic Beanstalk recommended)
2. Set up AWS account and credentials
3. Create MongoDB Atlas cluster
4. Deploy application
5. Configure environment variables
6. Update AWS IoT Core Rule with production URL
7. Test end-to-end flow
8. Set up monitoring and alarms

---

**Ready to deploy?** Start with Elastic Beanstalk for the easiest AWS deployment! 🚀



---

## # 🚀 Deployment

*Source: DEPLOYMENT_QUICK_START.md*

# Quick Deployment Guide

Choose your deployment method:

## 🚀 Option 1: Railway (Recommended - 10 minutes)

**Easiest deployment option!**

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/mehulapi.git
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Go to https://railway.app
   - Click "Start a New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-deploys!

3. **Add Environment Variables:**
   In Railway dashboard → Variables tab, add:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mehulapi
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_IOT_ENDPOINT=your-iot-endpoint-ats.iot.us-east-1.amazonaws.com
   ```

4. **Get URL:**
   Railway gives you: `https://your-project.up.railway.app`

5. **Update IoT Core Rule:**
   Change HTTPS endpoint to: `https://your-project.up.railway.app/api/iot/webhook`

**Done!** ✅

See full guide: `DEPLOYMENT_RAILWAY.md`

## ☁️ Option 2: Heroku (15 minutes)

1. **Install Heroku CLI:**
   ```bash
   brew install heroku/brew/heroku
   heroku login
   ```

2. **Create app:**
   ```bash
   heroku create mehulapi-production
   ```

3. **Set variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set AWS_REGION=us-east-1
   heroku config:set AWS_ACCESS_KEY_ID=your_key
   heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
   heroku config:set AWS_IOT_ENDPOINT=your_endpoint
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

5. **Get URL:**
   ```bash
   heroku open
   ```

## ☁️ Option 3: AWS Elastic Beanstalk (20 minutes)

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize:**
   ```bash
   eb init -p node.js --region us-east-1
   ```

3. **Create environment:**
   ```bash
   eb create mehulapi-production
   ```

4. **Set environment variables in AWS Console**

5. **Deploy:**
   ```bash
   eb deploy
   ```

## 📦 What You Need Before Deploying

1. ✅ **MongoDB Atlas Production Cluster**
   - Sign up: https://www.mongodb.com/cloud/atlas
   - Create free M0 cluster
   - Get connection string

2. ✅ **AWS IoT Core Credentials**
   - IAM user with IoT Data Plane access
   - Access Key ID and Secret Access Key
   - IoT Core endpoint URL

3. ✅ **GitHub Repository** (for Railway/Heroku)
   - Push code to GitHub
   - Make repository private if needed

## 🔐 Environment Variables Checklist

Make sure you have these values ready:

- [ ] MongoDB Atlas connection string
- [ ] AWS Region (e.g., us-east-1)
- [ ] AWS Access Key ID
- [ ] AWS Secret Access Key  
- [ ] AWS IoT Core Endpoint

## ✅ Post-Deployment Checklist

- [ ] API is accessible via HTTPS
- [ ] Health endpoint works: `/health`
- [ ] Test device data endpoint
- [ ] Update IoT Core Rule with production URL
- [ ] Test end-to-end flow
- [ ] Set up monitoring

## 🆘 Quick Troubleshooting

**API not accessible:**
- Check deployment platform status
- Verify environment variables are set
- Check logs in platform dashboard

**MongoDB connection fails:**
- Verify connection string
- Check MongoDB Atlas network access
- Ensure credentials are correct

**IoT Core not working:**
- Verify AWS credentials
- Check IoT Core endpoint
- Review IAM permissions

## 📚 Full Documentation

- Complete deployment: `DEPLOYMENT.md`
- Railway specific: `DEPLOYMENT_RAILWAY.md`
- Team package: `TEAM_DEPLOYMENT_PACKAGE.md`

## 🎯 Recommendation

**For quickest deployment:** Use Railway ⭐
- Takes 10 minutes
- Easiest setup
- Free tier available
- Auto-deploy from GitHub

---

**Ready to deploy?** Start with Railway! 🚀



---

## # 🚀 Deployment

*Source: AWS_DEPLOYMENT_QUICK_START.md*

# AWS Deployment Quick Start

Fastest way to deploy on AWS using Elastic Beanstalk.

## Prerequisites

1. AWS Account
2. AWS CLI installed: `brew install awscli` (or download from AWS)
3. EB CLI installed: `pip install awsebcli` (or `brew install aws-elasticbeanstalk`)

## Quick Deployment (15 minutes)

### Step 1: Configure AWS Credentials

```bash
aws configure
```

Enter:
- AWS Access Key ID: Your AWS access key
- AWS Secret Access Key: Your AWS secret key
- Default region: `us-east-1`
- Default output format: `json`

### Step 2: Initialize Elastic Beanstalk

```bash
cd /Users/deckmount/Documents/mehulapi

# Initialize EB
eb init

# Follow prompts:
# 1. Select region: us-east-1 (or your preferred region)
# 2. Application name: mehulapi
# 3. Platform: Node.js
# 4. Platform version: Node.js 18 or latest
# 5. Setup SSH: Yes (recommended)
```

### Step 3: Create Production Environment

```bash
# Create environment (this takes 5-10 minutes)
eb create mehulapi-production

# Or with specific instance type
eb create mehulapi-production --instance-type t3.small
```

**Wait for environment creation...**

### Step 4: Set Environment Variables

```bash
# Set all environment variables at once
eb setenv \
  NODE_ENV=production \
  MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/mehulapi?retryWrites=true&w=majority" \
  AWS_REGION=us-east-1 \
  AWS_ACCESS_KEY_ID=your_access_key \
  AWS_SECRET_ACCESS_KEY=your_secret_key \
  AWS_IOT_ENDPOINT=your-iot-endpoint-ats.iot.us-east-1.amazonaws.com
```

**Important:** Replace the placeholder values with your actual values!

### Step 5: Deploy Application

```bash
# Deploy to production
eb deploy
```

This will:
- Package your application
- Upload to S3
- Deploy to EC2 instances
- Run health checks

### Step 6: Get Production URL

```bash
# Open in browser
eb open

# Or get URL manually
eb status
```

You'll get a URL like:
```
http://mehulapi-production.us-east-1.elasticbeanstalk.com
```

### Step 7: Update AWS IoT Core Rule

1. Go to AWS Console → IoT Core → Rules
2. Edit your rule
3. Update HTTPS endpoint to:
   ```
   https://mehulapi-production.us-east-1.elasticbeanstalk.com/api/iot/webhook
   ```
4. Save

### Step 8: Test Production API

```bash
# Test health endpoint
curl https://mehulapi-production.us-east-1.elasticbeanstalk.com/health

# Test device data endpoint
curl -X POST https://mehulapi-production.us-east-1.elasticbeanstalk.com/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "test"
  }'
```

## Useful Commands

```bash
# View logs
eb logs

# Check status
eb status

# View environment health
eb health

# SSH into instance (for debugging)
eb ssh

# View environment variables
eb printenv

# Scale application
eb scale 2  # Scale to 2 instances

# Restart application
eb restart

# View recent events
eb events
```

## Troubleshooting

### Deployment Fails

```bash
# Check logs for errors
eb logs

# Check recent events
eb events

# Try deploying again
eb deploy
```

### Environment Variables Not Working

```bash
# Verify variables are set
eb printenv

# Update a variable
eb setenv VARIABLE_NAME=new_value

# Redeploy after changing variables
eb deploy
```

### Application Not Responding

```bash
# Check health
eb health

# Check logs
eb logs

# Restart environment
eb restart
```

## Custom Domain Setup

### Option 1: Using Route 53

1. Register domain in Route 53 (or use existing)
2. Create hosted zone
3. Create CNAME record:
   - Name: `api.yourdomain.com`
   - Value: `mehulapi-production.us-east-1.elasticbeanstalk.com`
4. Update Elastic Beanstalk environment:
   ```bash
   eb config
   # Edit configuration, add custom domain
   ```

### Option 2: Using Your Domain Provider

1. Go to your domain DNS settings
2. Create CNAME record:
   - Name: `api` (or subdomain)
   - Value: `mehulapi-production.us-east-1.elasticbeanstalk.com`
3. Wait for DNS propagation (5-30 minutes)

## SSL Certificate Setup

Elastic Beanstalk supports SSL certificates:

1. Go to AWS Certificate Manager (ACM)
2. Request certificate for your domain
3. Verify domain ownership
4. In Elastic Beanstalk → Configuration → Load balancer
5. Add listener (HTTPS, port 443)
6. Select your certificate
7. Save and apply

## Cost

**Estimated monthly cost:**
- EC2 t3.small: ~$15/month
- Load Balancer: ~$18/month
- Data transfer: Pay as you go (~$5-10/month)
- **Total: ~$35-50/month**

**Free tier:** If you're eligible for AWS Free Tier, first 12 months includes:
- 750 hours of EC2 t2.micro
- Some load balancer hours

## Next Steps

1. ✅ Set up custom domain (optional)
2. ✅ Configure SSL certificate
3. ✅ Set up CloudWatch monitoring
4. ✅ Configure auto-scaling
5. ✅ Set up backups
6. ✅ Enable log retention

## Environment Variables Checklist

Before deploying, ensure you have:

- [ ] MongoDB Atlas connection string
- [ ] AWS Region (e.g., us-east-1)
- [ ] AWS Access Key ID
- [ ] AWS Secret Access Key
- [ ] AWS IoT Core Endpoint

## Security Best Practices

1. **Use IAM Roles** (instead of access keys when possible)
2. **Store secrets in AWS Secrets Manager** (for sensitive data)
3. **Restrict security groups** (only necessary ports)
4. **Enable HTTPS** (SSL certificate)
5. **Regular updates** (keep dependencies updated)

---

**Estimated Time:** 15-20 minutes  
**Difficulty:** ⭐⭐ Medium  
**Recommended for:** Teams using AWS ecosystem

For detailed instructions, see `DEPLOYMENT_AWS.md`



---

## # 🚀 Deployment

*Source: DEPLOY_NOW.md*

# Deploy Your API - Quick Guide

Now that your API is working locally, here's how to deploy it for production/sharing with your team.

---

## 🚀 Recommended Deployment Options

### Option 1: Railway (Easiest - Recommended) ⭐⭐⭐

**Best for:** Quick deployment, free tier available, easy setup

**Pros:**
- Free tier available
- Deploys from GitHub automatically
- Environment variables easy to manage
- HTTPS included
- No credit card required (for free tier)

**Deploy Steps:**

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Sign up:** https://railway.app

3. **Deploy:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will detect Node.js automatically

4. **Add Environment Variables:**
   - Go to "Variables" tab
   - Add all variables from your `.env` file:
     ```
     PORT=3000
     NODE_ENV=production
     MONGODB_URI=mongodb+srv://...
     AWS_REGION=us-east-1
     AWS_ACCESS_KEY_ID=...
     AWS_SECRET_ACCESS_KEY=...
     AWS_IOT_ENDPOINT=...
     ```

5. **Get Production URL:**
   - Railway gives you a URL like: `https://mehulapi-production.up.railway.app`
   - This is your production API URL!

6. **Update AWS IoT Core Rule:**
   - Go to: AWS IoT Core → Rules → `ForwardESP32DataToBackend`
   - Click "Edit"
   - Update HTTPS endpoint URL to: `https://mehulapi-production.up.railway.app/api/iot/webhook`
   - Save

**See:** `DEPLOYMENT_RAILWAY.md` for detailed guide

---

### Option 2: AWS Elastic Beanstalk ⭐⭐

**Best for:** If you're already using AWS, want AWS integration

**Deploy Steps:**

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize:**
   ```bash
   eb init
   ```

3. **Create environment:**
   ```bash
   eb create mehulapi-production
   ```

4. **Set environment variables:**
   ```bash
   eb setenv NODE_ENV=production MONGODB_URI=... AWS_REGION=...
   ```

5. **Deploy:**
   ```bash
   eb deploy
   ```

6. **Get URL:**
   ```bash
   eb open
   ```

**See:** `AWS_DEPLOYMENT_QUICK_START.md` for detailed guide

---

### Option 3: Heroku ⭐⭐

**Best for:** Simple deployments, popular platform

**Deploy Steps:**

1. **Install Heroku CLI:**
   ```bash
   brew install heroku/brew/heroku
   ```

2. **Login:**
   ```bash
   heroku login
   ```

3. **Create app:**
   ```bash
   heroku create mehulapi-production
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production MONGODB_URI=... AWS_REGION=...
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

**See:** `DEPLOYMENT.md` for detailed guide

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] Code is working locally ✅ (You've tested this!)
- [ ] MongoDB Atlas is set up ✅ (You have this!)
- [ ] AWS IoT Core credentials are ready ✅ (You have this!)
- [ ] Code is in GitHub/GitLab (for automatic deployments)
- [ ] `.env` file has all required variables (but don't commit it!)
- [ ] `.gitignore` excludes `.env` file

---

## 🔄 After Deployment - Update AWS IoT Core Rule

**Important:** Once you have a production URL, update your AWS IoT Core Rule!

1. **Go to:** AWS IoT Core → Rules → `ForwardESP32DataToBackend`
2. **Click:** "Edit"
3. **Update HTTPS endpoint URL:**
   - Old: `https://vina-unscrawled-krishna.ngrok-free.dev/api/iot/webhook` (ngrok)
   - New: `https://your-production-url.com/api/iot/webhook` (production)
4. **Save** the rule

**Now you can stop ngrok** - production URL will handle everything!

---

## 🧪 Test Production Deployment

After deployment:

1. **Test health endpoint:**
   ```bash
   curl https://your-production-url.com/health
   ```

2. **Test API:**
   ```bash
   curl https://your-production-url.com/
   ```

3. **Check if device data reaches production:**
   - Device sends data → AWS IoT Core → Production API → MongoDB
   - Check MongoDB Atlas for new data

---

## 📝 Environment Variables for Production

Make sure these are set in your deployment platform:

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mehulapi
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_IOT_ENDPOINT=your-endpoint-ats.iot.us-east-1.amazonaws.com
```

---

## 🎯 Quick Start: Railway (Recommended)

**Fastest way to deploy:**

1. Push code to GitHub
2. Sign up at railway.app
3. Deploy from GitHub
4. Add environment variables
5. Get production URL
6. Update AWS IoT Core Rule

**Total time: ~10 minutes**

---

## 🔗 Share API with Team

After deployment, share:

1. **Production URL:** `https://your-api-url.com`
2. **API Documentation:** `README.md`
3. **Environment Setup:** `.env.example` (template, no secrets)
4. **Deployment Guide:** `DEPLOY_NOW.md` (this file)

**API Endpoints:**
- Base: `https://your-api-url.com`
- Health: `https://your-api-url.com/health`
- Device Data: `https://your-api-url.com/api/devices/data`
- IoT Webhook: `https://your-api-url.com/api/iot/webhook` (used by AWS IoT Core)

---

## 🆘 Troubleshooting

### Deployment Fails:
- Check environment variables are set correctly
- Verify MongoDB URI is accessible from deployment platform
- Check deployment logs for errors

### API Not Receiving Data:
- Verify AWS IoT Core Rule has correct production URL
- Check production URL is accessible (test with curl)
- Verify environment variables in deployment platform

### MongoDB Connection Fails:
- Check MongoDB Atlas network access allows deployment platform IP
- Verify connection string is correct
- Check MongoDB credentials

---

**Recommendation: Start with Railway - it's the easiest!** 🚀

See detailed guides:
- `DEPLOYMENT_RAILWAY.md` - Railway deployment
- `AWS_DEPLOYMENT_QUICK_START.md` - AWS deployment
- `DEPLOYMENT.md` - Heroku deployment



---

## # 🔌 API Documentation

*Source: API_FOR_TEAM.md*

# API for Team - Quick Reference

## What This API Does

✅ Receives device data from AWS IoT Core  
✅ Saves data to MongoDB Atlas  
✅ Manages device configurations  
✅ Pushes config updates back to devices via IoT Core

## Quick Start for Team Members

### 1. Setup

```bash
# Clone/download repository
cd mehulapi

# Install dependencies
npm install

# Create .env file (use .env.example as template)
cp .env.example .env

# Update .env with your credentials:
# - MONGODB_URI (MongoDB Atlas connection string)
# - AWS credentials (if using IoT Core)
```

### 2. Start Server

```bash
npm run dev
```

### 3. Test

```bash
curl http://localhost:3000/health
```

## API Endpoints

### Base URL
- **Local:** `http://localhost:3000`
- **Production:** `https://your-api-domain.com`

### Endpoints

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/` | GET | API information | `curl http://localhost:3000/` |
| `/health` | GET | Health check | `curl http://localhost:3000/health` |
| `/api/devices/data` | POST | Receive device data | See below |
| `/api/devices/:id/config` | GET | Get device config | `curl http://localhost:3000/api/devices/24/config` |
| `/api/devices/:id/config` | POST | Set device config | See below |
| `/api/devices/:id/data` | GET | Get data history | `curl http://localhost:3000/api/devices/24/data` |
| `/api/iot/webhook` | POST | IoT Core webhook | (Called automatically by IoT Core) |

## Example Requests

### 1. Send Device Data

```bash
curl -X POST http://localhost:3000/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#",
    "device_type": "CPAP",
    "device_id": "24"
  }'
```

### 2. Set Device Configuration

```bash
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 16.0,
      "humidity": 7.0,
      "mode": "AUTOMODE"
    }
  }'
```

### 3. Get Device Data History

```bash
curl "http://localhost:3000/api/devices/24/data?limit=10&offset=0"
```

### 4. Get Device Configuration

```bash
curl http://localhost:3000/api/devices/24/config
```

## Data Storage

**Database:** MongoDB Atlas  
**Database Name:** `mehulapi`  
**Collections:**
- `devicedatas` - All device data
- `deviceconfigs` - Device configurations

**View Data:**
1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Navigate to: `mehulapi` → `devicedatas`

## Device Integration

**Device Topic:** `esp32/data24`

**Device publishes to:** `esp32/data24`  
**Device subscribes to:** `esp32/data24` (same topic for config updates)

**Message Format:**
```json
{
  "device_status": 0,
  "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#"
}
```

## Environment Variables

Required in `.env`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mehulapi
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_IOT_ENDPOINT=your-endpoint-ats.iot.us-east-1.amazonaws.com
```

## Project Structure

```
mehulapi/
├── config/
│   ├── database.js       # MongoDB connection
│   └── awsIoT.js         # AWS IoT Core client
├── controllers/
│   ├── deviceController.js  # Device endpoints
│   └── iotController.js     # IoT webhook
├── models/
│   ├── DeviceData.js     # Device data schema
│   └── DeviceConfig.js   # Config schema
├── routes/
│   ├── deviceRoutes.js   # Device routes
│   └── iotRoutes.js      # IoT routes
├── utils/
│   └── dataParser.js     # Parse device data strings
├── server.js             # Main server
└── package.json          # Dependencies
```

## Documentation Files

- `README.md` - Complete API documentation
- `SHARE_WITH_TEAM.md` - Team sharing guide
- `DEPLOYMENT.md` - Production deployment
- `AWS_IOT_SETUP.md` - AWS IoT Core setup
- `TESTING_GUIDE.md` - Testing instructions
- `SAME_TOPIC_SETUP.md` - Same topic configuration

## Support & Help

- Check `README.md` for detailed documentation
- See `TESTING_GUIDE.md` for testing examples
- See `DEPLOYMENT.md` for production setup

---

**Ready to use!** Start server and begin saving device data to MongoDB! 🚀




---

## # 🔌 API Documentation

*Source: HOW_TO_IDENTIFY_DATA_SOURCE.md*

# 📊 How to Identify Data Source: Cloud vs Software

## ✅ What I Added

I've added a `data_source` field to track where data comes from:

- **`cloud`** = Data from AWS IoT Core (hardware/device)
- **`software`** = Data from direct API calls (software/application)

---

## 📋 Data Source Values

| Source | Value | Description |
|--------|-------|-------------|
| **Hardware via AWS IoT** | `cloud` | Data sent by ESP32 device → AWS IoT Core → Railway API |
| **Direct API Call** | `software` | Data sent directly to API endpoint (POST /api/devices/data) |
| **Legacy/Default** | `direct` | Old data or default value (for backward compatibility) |

---

## 🔍 How to Query Data by Source

### **Option 1: Using MongoDB Compass/Atlas**

1. **Open MongoDB Atlas/Compass**
2. **Connect to your database**
3. **Go to:** `DeviceData` collection
4. **Add filter:**

#### **Get all cloud data:**
```javascript
{ "data_source": "cloud" }
```

#### **Get all software data:**
```javascript
{ "data_source": "software" }
```

#### **Get data for specific device from cloud:**
```javascript
{ 
  "device_id": "24",
  "data_source": "cloud"
}
```

#### **Get data for specific device from software:**
```javascript
{ 
  "device_id": "24",
  "data_source": "software"
}
```

---

### **Option 2: Using API Endpoint**

#### **Get data from cloud (hardware):**

```bash
curl "https://backend-production-9c17.up.railway.app/api/devices/24/data?data_source=cloud&limit=10"
```

#### **Get data from software (direct API):**

```bash
curl "https://backend-production-9c17.up.railway.app/api/devices/24/data?data_source=software&limit=10"
```

#### **Get all data (both sources):**

```bash
curl "https://backend-production-9c17.up.railway.app/api/devices/24/data?limit=10"
```

**Note:** You may need to update the API endpoint to support `data_source` query parameter (see below).

---

### **Option 3: Using JavaScript/Node.js**

```javascript
const mongoose = require('mongoose');
const DeviceData = require('./models/DeviceData');

// Get all cloud data
const cloudData = await DeviceData.find({ 
  data_source: 'cloud',
  device_id: '24'
}).sort({ timestamp: -1 }).limit(10);

// Get all software data
const softwareData = await DeviceData.find({ 
  data_source: 'software',
  device_id: '24'
}).sort({ timestamp: -1 }).limit(10);

// Get data from both sources
const allData = await DeviceData.find({ 
  device_id: '24'
}).sort({ timestamp: -1 }).limit(10);
```

---

### **Option 4: Using Python**

```python
from pymongo import MongoClient

client = MongoClient("your_mongodb_uri")
db = client["your_database"]
collection = db["devicedatas"]

# Get cloud data
cloud_data = list(collection.find({
    "device_id": "24",
    "data_source": "cloud"
}).sort("timestamp", -1).limit(10))

# Get software data
software_data = list(collection.find({
    "device_id": "24",
    "data_source": "software"
}).sort("timestamp", -1).limit(10))
```

---

## 🔍 Check Data Source in Response

When you fetch data, each record will include the `data_source` field:

### **Example API Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "67890abcdef",
      "device_id": "24",
      "device_type": "CPAP",
      "device_status": 0,
      "data_source": "cloud",
      "raw_data": "*,R,191125,1348,AUTOMODE,G,16.0,1.0...",
      "parsed_data": { ... },
      "timestamp": "2025-11-19T08:25:04.466Z",
      "createdAt": "2025-11-19T08:25:04.466Z",
      "updatedAt": "2025-11-19T08:25:04.466Z"
    },
    {
      "_id": "12345abcdef",
      "device_id": "24",
      "device_type": "CPAP",
      "device_status": 0,
      "data_source": "software",
      "raw_data": "*,R,191125,1348,AUTOMODE,G,16.0,1.0...",
      "parsed_data": { ... },
      "timestamp": "2025-11-19T08:26:51.102Z",
      "createdAt": "2025-11-19T08:26:51.102Z",
      "updatedAt": "2025-11-19T08:26:51.102Z"
    }
  ]
}
```

**Look for `"data_source": "cloud"` or `"data_source": "software"`** in each record!

---

## 📊 Count Data by Source

### **Using MongoDB:**

```javascript
// Count cloud data
const cloudCount = await DeviceData.countDocuments({ 
  device_id: '24',
  data_source: 'cloud'
});

// Count software data
const softwareCount = await DeviceData.countDocuments({ 
  device_id: '24',
  data_source: 'software'
});

console.log(`Cloud (hardware): ${cloudCount}`);
console.log(`Software (direct): ${softwareCount}`);
```

### **Using MongoDB Aggregation:**

```javascript
const stats = await DeviceData.aggregate([
  {
    $match: { device_id: '24' }
  },
  {
    $group: {
      _id: '$data_source',
      count: { $sum: 1 },
      latest: { $max: '$timestamp' }
    }
  }
]);

// Result:
// [
//   { _id: 'cloud', count: 150, latest: ISODate('2025-11-19T08:30:00Z') },
//   { _id: 'software', count: 25, latest: ISODate('2025-11-19T08:28:00Z') }
// ]
```

---

## 🧪 Test It

### **1. Send data from cloud (via AWS IoT):**
Your ESP32 device will automatically mark it as `cloud` when it sends data.

### **2. Send data from software (direct API):**

```bash
curl -X POST "https://backend-production-9c17.up.railway.app/api/devices/data" \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,191125,1348,AUTOMODE,G,16.0,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678C,#",
    "device_type": "CPAP",
    "device_id": "24"
  }'
```

This will be saved with `data_source: "software"`.

### **3. Check in MongoDB:**

```bash
# Check cloud data
# Look for records with data_source: "cloud"

# Check software data  
# Look for records with data_source: "software"
```

---

## 📝 Summary

**Every record now has:**
- ✅ `data_source: "cloud"` = From hardware via AWS IoT Core
- ✅ `data_source: "software"` = From direct API call

**To identify source:**
1. Check the `data_source` field in MongoDB
2. Filter by `data_source` in queries
3. Look for `data_source` in API responses

**This helps you:**
- ✅ Track which data comes from hardware vs software
- ✅ Debug data flow issues
- ✅ Generate separate reports for cloud vs software data
- ✅ Analyze data quality by source

---

## 🔄 Migration Note

**Old data** (before this update) will have:
- `data_source: "direct"` (default value)
- OR missing `data_source` field

**New data** will have:
- `data_source: "cloud"` (from AWS IoT)
- `data_source: "software"` (from direct API)

If you want to update old data, you can run a migration script (see below).

---

## 🔄 Optional: Update Old Data

If you want to update existing records to have a `data_source` value:

```javascript
// In MongoDB or Node.js script:
await DeviceData.updateMany(
  { data_source: { $exists: false } },
  { $set: { data_source: 'direct' } }
);
```

This will set `data_source: "direct"` for all old records without the field.



---

## # 🔌 API Documentation

*Source: DATA_SOURCE_EXAMPLES.md*

# 📊 Data Source Identification - Examples

## ✅ What Changed

I've added a `data_source` field to track where data comes from:

- **`cloud`** = From AWS IoT Core (hardware/ESP32 device)
- **`software`** = From direct API call (software/application)
- **`direct`** = Legacy/default value (backward compatibility)

---

## 🔍 How to Check Data Source

### **Method 1: MongoDB Atlas/Compass**

1. **Open MongoDB Atlas/Compass**
2. **Go to:** `DeviceData` collection
3. **View documents** - each will have a `data_source` field
4. **Filter by source:**
   - `{ "data_source": "cloud" }` - Hardware data
   - `{ "data_source": "software" }` - Software data

---

### **Method 2: API Endpoint (Filter by Source)**

#### **Get all data:**
```bash
curl "https://backend-production-9c17.up.railway.app/api/devices/24/data?limit=10"
```

#### **Get only cloud data (hardware):**
```bash
curl "https://backend-production-9c17.up.railway.app/api/devices/24/data?data_source=cloud&limit=10"
```

#### **Get only software data (direct API):**
```bash
curl "https://backend-production-9c17.up.railway.app/api/devices/24/data?data_source=software&limit=10"
```

---

## 📋 Example Responses

### **Response with Cloud Data:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "_id": "67890abcdef",
        "device_id": "24",
        "device_type": "CPAP",
        "device_status": 0,
        "data_source": "cloud",
        "parsed_data": { ... },
        "timestamp": "2025-11-19T08:25:04.466Z",
        "createdAt": "2025-11-19T08:25:04.466Z"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 10,
      "offset": 0,
      "has_more": true
    }
  }
}
```

**Note:** `"data_source": "cloud"` means this came from hardware via AWS IoT Core!

---

### **Response with Software Data:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "_id": "12345abcdef",
        "device_id": "24",
        "device_type": "CPAP",
        "device_status": 0,
        "data_source": "software",
        "parsed_data": { ... },
        "timestamp": "2025-11-19T08:26:51.102Z",
        "createdAt": "2025-11-19T08:26:51.102Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0,
      "has_more": true
    }
  }
}
```

**Note:** `"data_source": "software"` means this came from a direct API call!

---

## 🧪 Quick Test

### **1. Send data from cloud (hardware):**
When your ESP32 device sends data → AWS IoT Core → Railway API, it's automatically marked as `cloud`.

**Check in MongoDB:**
- Should see: `data_source: "cloud"`

### **2. Send data from software (direct API):**

```bash
curl -X POST "https://backend-production-9c17.up.railway.app/api/devices/data" \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,191125,1348,AUTOMODE,G,16.0,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678C,#",
    "device_type": "CPAP",
    "device_id": "24"
  }'
```

**Check in MongoDB:**
- Should see: `data_source: "software"`

---

## 📊 Count by Source

### **Using MongoDB Query:**

```javascript
// Count cloud data
db.devicedatas.countDocuments({ 
  device_id: "24", 
  data_source: "cloud" 
})

// Count software data
db.devicedatas.countDocuments({ 
  device_id: "24", 
  data_source: "software" 
})
```

### **Using MongoDB Aggregation:**

```javascript
db.devicedatas.aggregate([
  {
    $match: { device_id: "24" }
  },
  {
    $group: {
      _id: "$data_source",
      count: { $sum: 1 },
      latest: { $max: "$timestamp" }
    }
  }
])
```

**Result:**
```json
[
  { "_id": "cloud", "count": 150, "latest": ISODate("2025-11-19T08:30:00Z") },
  { "_id": "software", "count": 25, "latest": ISODate("2025-11-19T08:28:00Z") }
]
```

---

## 💡 Use Cases

### **1. Debug Data Flow:**
- Check if data from hardware is reaching database
- Verify if software test data is being saved
- Compare data from different sources

### **2. Generate Reports:**
- Separate reports for hardware vs software data
- Track data quality by source
- Analyze patterns by source

### **3. Data Analytics:**
- Compare device behavior (hardware) vs test data (software)
- Monitor data frequency by source
- Identify data gaps by source

---

## ✅ Summary

**Every record now has:**
- ✅ `data_source: "cloud"` = From hardware via AWS IoT Core
- ✅ `data_source: "software"` = From direct API call
- ✅ `data_source: "direct"` = Legacy/default value

**To identify:**
1. Check `data_source` field in MongoDB
2. Filter by `?data_source=cloud` or `?data_source=software` in API
3. Look for `data_source` in API response

**This helps you:**
- ✅ Know exactly where data came from
- ✅ Debug data flow issues
- ✅ Generate separate analytics by source
- ✅ Track data quality by source



---

## # 🔄 Data Flow

*Source: COMPLETE_FLOW.md*

# Complete Data Flow - Hardware to Software and Back

This document explains the complete flow of how data moves from hardware → cloud → backend → cloud → hardware.

## Complete Flow Diagram

```
┌─────────────────┐
│  ESP32 Hardware │
│  (Device ID: 24)│
└────────┬────────┘
         │
         │ 1. Publishes data to topic: esp32/data24
         │    Payload: {
         │      "device_status": 0,
         │      "device_data": "*,R,141125,1703,MANUALMODE,..."
         │    }
         ↓
┌─────────────────┐
│ AWS IoT Core    │
│ (Cloud)         │
└────────┬────────┘
         │
         │ 2. IoT Core Rule automatically forwards
         │    to backend HTTPS endpoint
         ↓
┌─────────────────┐
│ Backend API     │
│ /api/iot/webhook│
└────────┬────────┘
         │
         │ 3. Backend processes:
         │    - Extracts device ID: "24"
         │    - Detects device type: "CPAP" (from MANUALMODE)
         │    - Parses data string
         │    - Saves to MongoDB
         │    - Checks for pending config updates
         ↓
┌─────────────────┐
│   MongoDB       │
│ (Database)      │
└────────┬────────┘
         │
         │ 4. Backend checks DeviceConfig collection
         │    for device_id="24" with pending_update=true
         ↓
┌─────────────────┐
│ Backend API     │
│ (Config Found)  │
└────────┬────────┘
         │
         │ 5. Publishes config to IoT Core
         │    Topic: esp32/config24
         │    Payload: {
         │      "device_id": "24",
         │      "config": { "pressure": 15.0, ... },
         │      "action": "config_update"
         │    }
         ↓
┌─────────────────┐
│ AWS IoT Core    │
│ (Cloud)         │
└────────┬────────┘
         │
         │ 6. IoT Core delivers message to
         │    esp32/config24 topic
         ↓
┌─────────────────┐
│  ESP32 Hardware │
│  (Subscribes to │
│  esp32/config24)│
└─────────────────┘
         │
         │ 7. Hardware receives config update
         │    and updates device settings
         ↓
    ✅ Hardware Updated!
```

## Step-by-Step Process

### Step 1: Hardware Sends Data

Your ESP32 device publishes data to AWS IoT Core:

**Topic:** `esp32/data24`

**Payload:**
```json
{
  "device_status": 0,
  "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
}
```

**What `device_status: 0` means:**
- Device is operational and sending data
- Ready to receive configuration updates
- Status 0 = Normal operation / Ready for updates

### Step 2: AWS IoT Core Rule Forwards to Backend

The IoT Core Rule you created automatically:
1. Matches message from `esp32/+` topics
2. Forwards to your backend HTTPS endpoint
3. Includes topic name, timestamp, and message ID

**Forwarded to:** `https://your-api-url.com/api/iot/webhook`

**Forwarded Payload:**
```json
{
  "device_status": 0,
  "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
  "topic": "esp32/data24",
  "timestamp": "2025-11-15T17:38:50Z",
  "messageId": "msg-12345"
}
```

### Step 3: Backend Processes and Saves

The backend API (`/api/iot/webhook`) receives the data and:

1. **Extracts Device ID:**
   - From topic `esp32/data24` → extracts `"24"`

2. **Auto-detects Device Type:**
   - Detects `MANUALMODE` in data string → sets `device_type: "CPAP"`

3. **Parses Data String:**
   - Parses sections: S (metadata), G (pressure), H (flow), I (settings)
   - Creates structured data object

4. **Saves to MongoDB:**
   - Creates/updates `DeviceData` document
   - Stores: device_id, device_type, device_status, raw_data, parsed_data

5. **Checks for Config Updates:**
   - Queries `DeviceConfig` collection
   - Looks for: `device_id: "24"` AND `pending_update: true`

### Step 4: Backend Publishes Config (if available)

If a configuration update is pending:

1. **Determines Config Topic:**
   - From `esp32/data24` → config topic is `esp32/config24`

2. **Publishes to IoT Core:**
   - Topic: `esp32/config24`
   - Payload:
   ```json
   {
     "device_id": "24",
     "config": {
       "pressure": 15.0,
       "humidity": 6.0,
       "mode": "MANUALMODE"
     },
     "timestamp": "2025-11-15T17:39:00Z",
     "action": "config_update"
   }
   ```

### Step 5: Hardware Receives Config Update

Your ESP32 device (which should be subscribed to `esp32/config24`):

1. Receives the config message from IoT Core
2. Parses the configuration values
3. Updates hardware settings accordingly
4. Optionally acknowledges receipt

## Setting Configuration Updates

### Via API

```bash
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 16.0,
      "humidity": 6.0,
      "temperature": 2.0,
      "mode": "MANUALMODE"
    }
  }'
```

**What happens:**
1. Config saved to MongoDB with `device_id: "24"` and `pending_update: true`
2. Next time device sends data, backend automatically publishes config
3. Device receives and applies the update

### Config Gets Sent Automatically

The config is **automatically sent** the next time:
- Device publishes data to `esp32/data24`
- Backend receives the data
- Backend finds `pending_update: true` for that device
- Backend publishes config to `esp32/config24`

## ESP32 Device Configuration

Your ESP32 device needs to:

### 1. Publish Data

```cpp
// Pseudo-code example
void publishDeviceData() {
  String topic = "esp32/data24";
  String payload = "{"
    "\"device_status\": 0,"
    "\"device_data\": \"*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#\""
  "}";
  
  mqttClient.publish(topic, payload);
}
```

### 2. Subscribe to Config Updates

```cpp
// Pseudo-code example
void setupMQTT() {
  mqttClient.subscribe("esp32/config24");
}

void onMessageReceived(String topic, String payload) {
  if (topic == "esp32/config24") {
    // Parse config JSON
    // Update device settings
    updateDeviceConfig(payload);
  }
}
```

## Testing the Complete Flow

### Test 1: Verify Data Reception

1. ESP32 publishes data → Check backend logs
2. Backend should log: `IoT data received and processed successfully`
3. Check MongoDB - data should be saved

### Test 2: Verify Config Publishing

1. Set config via API (see above)
2. ESP32 publishes data again
3. Subscribe to `esp32/config24` in AWS IoT Test Client
4. You should see config message!

### Test 3: End-to-End Test

1. Set configuration via API
2. ESP32 publishes data
3. Check AWS IoT Test Client on `esp32/config24`
4. Verify config message appears
5. ESP32 receives and applies config
6. ✅ Complete cycle working!

## Troubleshooting Flow

### Data not reaching backend?

1. Check IoT Core Rule is active
2. Verify rule SQL matches `esp32/+`
3. Test backend URL is accessible
4. Check CloudWatch logs

### Config not being published?

1. Verify config exists in MongoDB
2. Check `pending_update: true`
3. Verify AWS credentials in `.env`
4. Check backend logs for errors

### Device not receiving config?

1. Verify device subscribes to `esp32/config24`
2. Check device certificate permissions
3. Test publish manually via AWS IoT Test Client
4. Verify topic name matches exactly

## Summary

✅ **Hardware sends data** → AWS IoT Core receives it
✅ **IoT Core Rule forwards** → Backend API receives it  
✅ **Backend saves data** → MongoDB stores it
✅ **Backend checks for config** → Finds pending updates
✅ **Backend publishes config** → AWS IoT Core receives it
✅ **IoT Core delivers to device** → Hardware receives it
✅ **Hardware updates** → Configuration applied

The entire flow is **automatic** once set up correctly!



---

## # 🔄 Data Flow

*Source: AUTOMATIC_FLOW_EXPLAINED.md*

# Automatic Data Flow - How It Works

Yes! Once set up correctly, your API will **automatically receive data from AWS IoT Core** without any manual steps.

## Complete Automatic Flow

```
ESP32 Device (Hardware)
    ↓ (publishes data to IoT Core)
AWS IoT Core
    ↓ (IoT Core Rule automatically forwards)
Your Backend API (/api/iot/webhook)
    ↓ (saves to MongoDB)
MongoDB Atlas
    ↓ (checks for pending config)
Your Backend API
    ↓ (publishes config back)
AWS IoT Core
    ↓ (delivers to device)
ESP32 Device (Hardware)
✅ Hardware receives config update!
```

## How Automatic It Is

### ✅ Completely Automatic:
1. **Device sends data** → Automatically goes to IoT Core
2. **IoT Core Rule** → Automatically forwards to your API
3. **Your API** → Automatically saves to MongoDB
4. **Your API** → Automatically checks for config updates
5. **Your API** → Automatically publishes config back to IoT Core
6. **IoT Core** → Automatically delivers to device

**You don't need to do anything manually!** It all happens automatically once configured.

## What You Need to Set Up

### For Automatic Flow to Work:

1. ✅ **AWS IoT Core Rule** (forwards data to your API)
2. ✅ **Your API running** (receives data)
3. ✅ **MongoDB connected** (saves data)
4. ✅ **IoT Core credentials in .env** (publishes config back)

## Setup Steps

### Step 1: Set Up IoT Core Rule (One-time Setup)

**In AWS IoT Core Console:**

1. Go to: AWS Console → IoT Core → Rules
2. Click "Create rule"
3. Configure:
   - **Name:** `ForwardESP32DataToBackend`
   - **SQL:**
   ```sql
   SELECT 
       *,
       topic() as topic,
       timestamp() as timestamp,
       messageId() as messageId
   FROM 
       'esp32/+'
   ```
4. **Action:** "Send a message to an HTTPS endpoint"
   - **URL:** Your API webhook URL
     - **For local testing:** Use ngrok URL: `https://abc123.ngrok.io/api/iot/webhook`
     - **For production:** Your production API URL: `https://your-api.com/api/iot/webhook`
5. Save the rule

**Once this rule is set up, it works automatically forever!**

### Step 2: For Local Testing - Use ngrok

Since AWS IoT Core needs a public HTTPS URL, use ngrok to expose your local API:

```bash
# Terminal 2 (separate from npm run dev)
cd /Users/deckmount/Documents/mehulapi
./setup-ngrok.sh

# Or manually:
ngrok http 3000
```

**Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

**Update IoT Core Rule:**
- HTTPS endpoint: `https://abc123.ngrok.io/api/iot/webhook`

**Note:** ngrok free tier gives new URL on restart - update rule each time

### Step 3: Verify Everything is Set

**Check your .env file has:**
```env
AWS_IOT_ENDPOINT=a2jqpfwttlq1yk-ats.iot.us-east-1.amazonaws.com
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
```

✅ You already have these set!

## Testing the Automatic Flow

### Test 1: Using AWS IoT Test Client (Simulates Device)

1. **Go to:** AWS Console → IoT Core → Test (MQTT test client)
2. **Subscribe to:** `esp32/config24` (to see config updates)
3. **Publish to:** `esp32/data24` with this message:
   ```json
   {
     "device_status": 0,
     "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
   }
   ```

**What happens automatically:**
1. ✅ Message published to IoT Core
2. ✅ IoT Core Rule catches it
3. ✅ Rule forwards to your API (automatic!)
4. ✅ Your API receives it at `/api/iot/webhook`
5. ✅ API saves to MongoDB (automatic!)
6. ✅ API checks for config (automatic!)
7. ✅ API publishes config to `esp32/config24` (automatic!)
8. ✅ Config appears in AWS IoT Test Client (automatic!)

### Test 2: Check Your API Logs

In terminal where `npm run dev` is running:

Look for:
```
POST /api/iot/webhook 200
Config published to IoT Core topic: esp32/config24 for device: 24
```

**This means automatic flow is working!**

### Test 3: Check MongoDB

1. Go to MongoDB Atlas → Browse Collections
2. Check `devicedatas` collection
3. You should see the data automatically saved!

## Real Device Flow (When Hardware is Connected)

When your ESP32 hardware is actually connected:

1. **ESP32 publishes** to `esp32/data24` → **Automatic!**
2. **IoT Core receives** → **Automatic!**
3. **Rule forwards** to your API → **Automatic!**
4. **API processes** and saves → **Automatic!**
5. **API publishes config** back → **Automatic!**
6. **ESP32 receives** config → **Automatic!**

**No manual intervention needed!**

## Summary: Yes, It's Completely Automatic!

✅ **Once IoT Core Rule is set up** → Automatic forwarding
✅ **Once API is running** → Automatic receiving
✅ **Once MongoDB is connected** → Automatic saving
✅ **Once config is set** → Automatic publishing back

**You just need to:**
1. Set up the IoT Core Rule (one-time)
2. Keep your API running
3. That's it! Everything else is automatic

## Current Status

✅ **Your API:** Running and ready
✅ **MongoDB:** Connected (once you finish Atlas setup)
✅ **AWS Credentials:** Set in .env
✅ **IoT Core Endpoint:** Configured

**What's left:**
- Set up AWS IoT Core Rule (one-time setup)
- For local testing: Use ngrok to expose your local API

## Next Steps

1. ✅ Finish MongoDB Atlas setup (you're doing this now)
2. ✅ Set up AWS IoT Core Rule (see `IOT_CORE_RULE_SETUP.md`)
3. ✅ Test automatic flow using AWS IoT Test Client
4. ✅ Connect real hardware - it will work automatically!

---

**Bottom line:** Yes! Once the IoT Core Rule is set up, everything happens automatically. Your API will automatically receive data from the cloud whenever devices publish to IoT Core! 🚀



---

## # 🔄 Data Flow

*Source: GET_DATA_TO_DATABASE.md*

# Get Device Data to MongoDB - Simple Guide

Your device sends data to `esp32/data24` in AWS IoT Core. Here's how to get it into MongoDB Atlas.

## Current Status

✅ **Device sends data** → You can see it in AWS IoT Core MQTT test client  
✅ **Your API is ready** → `/api/iot/webhook` endpoint is working  
✅ **MongoDB is connected** → Ready to save data  
❌ **Missing link** → AWS IoT Core Rule not forwarding data to your API

## Quick Fix - 3 Steps

### Step 1: Start ngrok (For Local Testing)

**Open a NEW terminal window** (keep `npm run dev` running):

```bash
# Install ngrok if not installed
brew install ngrok

# Start ngrok
ngrok http 3000
```

**You'll see:**
```
Forwarding: https://abc123def456.ngrok.io -> http://localhost:3000
```

**Copy the HTTPS URL!** (e.g., `https://abc123def456.ngrok.io`)

### Step 2: Create AWS IoT Core Rule

1. **Go to:** AWS Console → IoT Core → Rules (left sidebar)

2. **Click:** "Create rule"

3. **Configure the rule:**

   **Rule name:**
   ```
   ForwardESP32DataToBackend
   ```

   **SQL statement:**
   ```sql
   SELECT 
       *,
       topic() as topic,
       timestamp() as timestamp,
       messageId() as messageId
   FROM 
       'esp32/+'
   ```
   *(This catches ALL messages from `esp32/` topics including `esp32/data24`)*

4. **Add action:**

   - Click **"Add action"**
   - Select **"Send a message to an HTTPS endpoint"**
   - **URL:** `https://YOUR-NGROK-URL.ngrok.io/api/iot/webhook`
     *(Replace YOUR-NGROK-URL with your actual ngrok URL)*
   - **HTTP Header:**
     - Key: `Content-Type`
     - Value: `application/json`
   - Click **"Create role"** (if prompted - it will create an IAM role automatically)
   - Click **"Add action"**

5. **Click "Create rule"**

### Step 3: Test It!

Now when your device sends data:

1. ✅ **Device publishes to:** `esp32/data24`
2. ✅ **AWS IoT Core receives it** (you see it in MQTT test client)
3. ✅ **IoT Core Rule forwards it** to your API (automatic!)
4. ✅ **Your API receives it** at `/api/iot/webhook`
5. ✅ **API saves to MongoDB** (automatic!)
6. ✅ **Check MongoDB Atlas** → Refresh → See your data!

## Verify It's Working

### Check Server Logs

In terminal where `npm run dev` is running, when device sends data, you should see:

```
POST /api/iot/webhook 200
IoT data received and processed successfully
Config published to IoT Core topic: esp32/config24 for device: 24
```

### Check MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Click **"Browse Collections"**
3. Navigate to: `mehulapi` → `devicedatas`
4. **Refresh the page**
5. You should see your device data!

**Data will include:**
- `device_id: "24"` (extracted from topic `esp32/data24`)
- `device_type: "CPAP"` (auto-detected from AUTOMODE in data)
- `raw_data: "*,R,181125,1124,AUTOMODE,..."`
- `parsed_data: { sections: {...} }`
- `timestamp: "2025-11-18T..."`

## Example Data Flow

**Device publishes:**
```json
{
  "device_status": 0,
  "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#"
}
```

**To topic:** `esp32/data24`

**IoT Core Rule forwards to:**
```
POST https://your-ngrok-url.ngrok.io/api/iot/webhook
```

**API saves to MongoDB:**
```javascript
{
  device_id: "24",
  device_type: "CPAP",
  device_status: 0,
  raw_data: "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#",
  parsed_data: {
    sections: {
      G: {...},
      H: {...},
      I: {...}
    }
  },
  timestamp: "2025-11-18T11:24:50.000Z"
}
```

## Troubleshooting

### Data not appearing in MongoDB?

1. **Check ngrok is running:**
   ```bash
   # Should show "Forwarding: https://... -> http://localhost:3000"
   ```

2. **Check AWS IoT Core Rule:**
   - Go to Rules → Click your rule
   - Verify SQL statement includes `'esp32/+'`
   - Verify HTTPS endpoint URL matches your ngrok URL
   - Check rule status is "Enabled"

3. **Check server logs:**
   - Look for `POST /api/iot/webhook` requests
   - Check for any error messages

4. **Test API directly:**
   ```bash
   curl -X POST http://localhost:3000/api/iot/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "device_status": 0,
       "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#",
       "topic": "esp32/data24"
     }'
   ```
   *(Should save to MongoDB immediately)*

5. **Check MongoDB connection:**
   - Go to MongoDB Atlas → Browse Collections
   - Verify database `mehulapi` exists
   - Check server logs for MongoDB connection errors

### Rule not forwarding data?

- **Check rule is enabled:** Rules page → Your rule → Should show "Enabled"
- **Check SQL matches topic:** Your device publishes to `esp32/data24`, SQL should include `'esp32/+'` or `'esp32/data24'`
- **Check ngrok URL is correct:** Copy exact URL from ngrok (including `https://` and ending with `.ngrok.io`)

## For Production (Later)

When you deploy your API to production (Railway, AWS, etc.):

1. **Get production URL:** e.g., `https://mehulapi-production.railway.app`

2. **Update AWS IoT Core Rule:**
   - Go to Rules → Click your rule → Edit
   - Update HTTPS endpoint URL to production URL
   - Save

3. **Stop ngrok** (no longer needed)

That's it! Data will flow automatically from device → IoT Core → Production API → MongoDB.

---

**Need help?** Check server logs or MongoDB Atlas dashboard!




---

## # 👥 Team Guides

*Source: TEAM_GUIDE.md*

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



---

## # 👥 Team Guides

*Source: TEAM_API_SHARE.md*

# API Package for Team

## What's Included

This API receives device data from AWS IoT Core and saves it to MongoDB Atlas.

## Quick Start for Team Members

### 1. Download/Clone Repository

```bash
git clone <repository-url>
cd mehulapi
```

Or download ZIP and extract.

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create `.env` file in project root:

```env
PORT=3000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mehulapi?retryWrites=true&w=majority

# AWS IoT Core (Optional - if using IoT Core)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_IOT_ENDPOINT=your-endpoint-ats.iot.us-east-1.amazonaws.com
```

**Get credentials from:**
- MongoDB Atlas: Database → Connect → Connection string
- AWS IoT Core: IAM → Create user with `AWSIoTDataPlaneAccess` policy

### 4. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 5. Test API

```bash
# Health check
curl http://localhost:3000/health

# Test device data endpoint
curl -X POST http://localhost:3000/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#",
    "device_type": "CPAP",
    "device_id": "test_device"
  }'
```

## API Endpoints

**Base URL:** `http://localhost:3000` (local) or your production URL

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/api/devices/data` | POST | Receive device data |
| `/api/devices/:id/config` | GET | Get device configuration |
| `/api/devices/:id/config` | POST | Set device configuration |
| `/api/devices/:id/data` | GET | Get device data history |
| `/api/iot/webhook` | POST | AWS IoT Core webhook (auto-called by IoT Core) |

## Project Structure

```
mehulapi/
├── config/
│   ├── database.js          # MongoDB connection
│   └── awsIoT.js            # AWS IoT Core client
├── controllers/
│   ├── deviceController.js  # Device data endpoints
│   └── iotController.js     # IoT webhook handler
├── models/
│   ├── DeviceData.js        # Device data schema
│   └── DeviceConfig.js      # Config schema
├── routes/
│   ├── deviceRoutes.js      # Device routes
│   └── iotRoutes.js         # IoT routes
├── utils/
│   └── dataParser.js        # Parse device data strings
├── server.js                # Main server
└── package.json             # Dependencies
```

## Data Storage

**Database:** MongoDB Atlas  
**Database Name:** `mehulapi`  
**Collections:**
- `devicedatas` - All device data
- `deviceconfigs` - Device configurations

**View Data:**
1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Navigate to: `mehulapi` → `devicedatas`

## Device Integration

**Device Topic:** `esp32/data24`

**Message Format from Device:**
```json
{
  "device_status": 0,
  "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#"
}
```

**API automatically:**
- Extracts device ID from topic (`esp32/data24` → `24`)
- Detects device type from data (`AUTOMODE` → `CPAP`)
- Parses data string into structured format
- Saves to MongoDB

## Documentation Files

- `README.md` - Complete API documentation
- `GET_DATA_TO_DATABASE.md` - How to get device data into MongoDB
- `SHARE_WITH_TEAM.md` - Deployment guide
- `DEPLOYMENT.md` - Production deployment
- `AWS_IOT_SETUP.md` - AWS IoT Core setup
- `TESTING_GUIDE.md` - Testing instructions

## Requirements

- Node.js 18+ 
- MongoDB Atlas account (free tier available)
- AWS account (if using IoT Core)

## Support

- Check `README.md` for detailed documentation
- See `GET_DATA_TO_DATABASE.md` for IoT Core setup
- Review `DEPLOYMENT.md` for production deployment

---

**Ready to use!** Start server and begin saving device data to MongoDB! 🚀




---

## # 👥 Team Guides

*Source: COMPLETE_SETUP_FOR_TEAM.md*

# Complete Setup Guide - Device Data to Database

This guide shows you exactly how to get device data from AWS IoT Core into MongoDB database.

## Current Status

✅ **Device sends data** → AWS IoT Core receives it  
✅ **Your API works** → Can receive and save data  
✅ **MongoDB connected** → Can save data  
❌ **Missing link** → AWS IoT Core Rule not forwarding to API

## Quick Fix - Get Data to Database

### Step 1: Start ngrok (For Local Testing)

AWS IoT Core needs a public HTTPS URL to reach your local API.

**Terminal 2 (separate from npm run dev):**

```bash
cd /Users/deckmount/Documents/mehulapi

# Install ngrok if not installed
brew install ngrok

# Start ngrok
ngrok http 3000
```

**You'll see:**
```
Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the ngrok URL!** (e.g., `https://abc123.ngrok.io`)

### Step 2: Create/Update AWS IoT Core Rule

1. **Go to:** AWS Console → IoT Core → Rules
2. **Click:** "Create rule" (or edit existing)
3. **Configure:**

   **Rule name:**
   ```
   ForwardESP32DataToBackend
   ```

   **SQL query:**
   ```sql
   SELECT 
       *,
       topic() as topic,
       timestamp() as timestamp,
       messageId() as messageId
   FROM 
       'esp32/+'
   ```

   **Action:**
   - Click "Add action"
   - Select "Send a message to an HTTPS endpoint"
   - **URL:** `https://abc123.ngrok.io/api/iot/webhook` (your ngrok URL)
   - **HTTP Header:**
     - Key: `Content-Type`
     - Value: `application/json`
   - Click "Create role" if prompted
   - Click "Add action"

4. **Save the rule**

### Step 3: Test - Device Sends Data

Now when your device sends data to `esp32/data24`:

1. ✅ **AWS IoT Core receives it** (you can see it)
2. ✅ **IoT Core Rule forwards it** to your API (automatic!)
3. ✅ **Your API receives it** at `/api/iot/webhook`
4. ✅ **API saves to MongoDB** (automatic!)
5. ✅ **Data appears in MongoDB Atlas** (refresh to see it!)

### Step 4: Verify in MongoDB Atlas

1. Go to MongoDB Atlas → Browse Collections
2. Navigate to: `mehulapi` → `devicedatas`
3. **Refresh the page**
4. You should see your device data!

### Step 5: Check Your Server Logs

In terminal where `npm run dev` is running, when device sends data, you should see:

```
POST /api/iot/webhook 200
IoT data received and processed successfully
```

## Complete Automatic Flow

```
ESP32 Device
    ↓ Publishes to esp32/data24
    {
      "device_status": 0,
      "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#"
    }
AWS IoT Core
    ↓ Rule automatically forwards
Your Local API (via ngrok)
    https://abc123.ngrok.io/api/iot/webhook
    ↓ Receives and processes
MongoDB Atlas
    ↓ Saves to devicedatas collection
✅ Data in Database!
```

## What to Share with Your Team

### Essential Files to Share

**Core Application:**
- `server.js` - Main server
- `package.json` - Dependencies
- All files in: `config/`, `controllers/`, `models/`, `routes/`, `utils/`

**Documentation:**
- `README.md` - API documentation
- `SHARE_WITH_TEAM.md` - Team sharing guide
- `DEPLOYMENT.md` - Deployment guide
- `AWS_IOT_SETUP.md` - IoT Core setup
- `SAME_TOPIC_SETUP.md` - Same topic configuration

**Configuration Template:**
- `.env.example` - Environment variables template (NOT actual `.env`!)

### Quick Setup for Team

**For team members to get started:**

1. **Clone/Download repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mehulapi
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=their_access_key
   AWS_SECRET_ACCESS_KEY=their_secret_key
   AWS_IOT_ENDPOINT=their-iot-endpoint-ats.iot.us-east-1.amazonaws.com
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

5. **Test:**
   ```bash
   curl http://localhost:3000/health
   ```

## API Endpoints for Team

**Base URL:** `http://localhost:3000` (local) or your production URL

### Endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/api/devices/data` | POST | Receive device data |
| `/api/devices/:id/config` | GET | Get device config |
| `/api/devices/:id/config` | POST | Set device config |
| `/api/devices/:id/data` | GET | Get device data history |
| `/api/iot/webhook` | POST | IoT Core webhook |

## Testing Data Flow

### Test 1: Direct API Test

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#",
    "topic": "esp32/data24"
  }'
```

**Expected:** Data saved to MongoDB Atlas

### Test 2: Check MongoDB Atlas

1. Go to MongoDB Atlas → Browse Collections
2. Navigate to: `mehulapi` → `devicedatas`
3. Refresh page
4. Should see your data with:
   - `device_id: "24"`
   - `device_type: "CPAP"` (auto-detected from AUTOMODE)
   - `device_data: "*,R,181125,1124,AUTOMODE,..."`
   - `parsed_data: { sections: {...} }`

## Deploy for Team (Production)

Once working locally, deploy to production:

### Option 1: AWS Elastic Beanstalk

```bash
eb init
eb create mehulapi-production
eb setenv MONGODB_URI=... AWS_REGION=... (etc)
eb deploy
```

### Option 2: Railway (Easiest)

1. Push code to GitHub
2. Go to https://railway.app
3. Deploy from GitHub repo
4. Add environment variables
5. Get production URL

Then update AWS IoT Core Rule to use production URL instead of ngrok.

## What's Happening Now

1. ✅ **Device sends data** → AWS IoT Core (you see it in MQTT test client)
2. ❌ **IoT Core Rule** → Not forwarding to your API yet
3. ✅ **Your API** → Ready to receive (tested and working)
4. ✅ **MongoDB** → Ready to save (connected)

**What you need:**
- Set up AWS IoT Core Rule with ngrok URL (for local)
- Or deploy API to production and use production URL

## Quick Action Items

1. ✅ **Start ngrok:** `ngrok http 3000`
2. ✅ **Create AWS IoT Core Rule** with ngrok URL
3. ✅ **Test:** Device sends data → Check MongoDB Atlas
4. ✅ **Share with team:** Give them code + documentation

---

**See:** `SHARE_WITH_TEAM.md` for complete team sharing guide




---

## # 👥 Team Guides

*Source: TEAM_DEPLOYMENT_PACKAGE.md*

# Team Deployment Package

## What to Share with Your Team

### 1. Essential Files for Deployment

**Core Application Files:**
```
mehulapi/
├── config/
│   ├── database.js          ✅ Required
│   └── awsIoT.js            ✅ Required (for IoT Core)
├── controllers/
│   ├── deviceController.js  ✅ Required
│   └── iotController.js     ✅ Required (for IoT Core)
├── models/
│   ├── DeviceData.js        ✅ Required
│   └── DeviceConfig.js      ✅ Required
├── routes/
│   ├── deviceRoutes.js      ✅ Required
│   └── iotRoutes.js         ✅ Required (for IoT Core)
├── utils/
│   └── dataParser.js        ✅ Required
├── package.json             ✅ Required
├── server.js                ✅ Required
└── .gitignore               ✅ Required
```

**Documentation Files:**
```
├── README.md                    ✅ Share with team
├── DEPLOYMENT.md                ✅ Share with team
├── TESTING_GUIDE.md             ✅ Share with team
├── AWS_IOT_SETUP.md             ✅ Share with team
├── ESP32_SETUP.md               ✅ Share with team
└── COMPLETE_FLOW.md             ✅ Share with team
```

### 2. Environment Variables Template

Create `.env.example` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mehulapi

# AWS IoT Core Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_IOT_ENDPOINT=your-iot-endpoint-ats.iot.us-east-1.amazonaws.com
```

**Important:** Share the `.env.example` file, NOT the actual `.env` file with credentials!

### 3. Quick Start Guide for Team

```markdown
# Quick Start

1. Clone repository
2. Run: npm install
3. Create .env file from .env.example
4. Update .env with your credentials
5. Start MongoDB (or use MongoDB Atlas)
6. Run: npm run dev
7. Test: curl http://localhost:3000/health
```

### 4. Deployment Checklist

Share this checklist with your team:

```
✅ MongoDB Atlas production cluster created
✅ Environment variables configured
✅ AWS IoT Core credentials set up
✅ Deployment platform chosen (Railway/Heroku/AWS)
✅ CORS configured for production domains
✅ API deployed and accessible
✅ Health check endpoint working
✅ IoT Core Rule updated with production URL
✅ End-to-end testing completed
✅ Monitoring set up
```

### 5. API Endpoints Reference

Share this API reference:

```
GET  /                    - API information
GET  /health              - Health check
POST /api/devices/data    - Receive device data
GET  /api/devices/:id/config        - Get device config
POST /api/devices/:id/config        - Set device config
POST /api/devices/:id/config/delivered - Mark config delivered
GET  /api/devices/:id/data          - Get device data history
POST /api/iot/webhook               - IoT Core webhook
```

## Deployment Options Summary

### Recommended: Railway (Easiest)

**Why:** 
- Easiest to set up
- Free tier available
- Auto-deploys from GitHub
- Automatic HTTPS

**Steps:**
1. Push code to GitHub
2. Connect Railway to GitHub
3. Add environment variables
4. Deploy automatically

### Alternative: Heroku

**Why:**
- Popular platform
- Well-documented
- Easy scaling

**Steps:**
1. Install Heroku CLI
2. Create Heroku app
3. Set environment variables
4. Deploy via Git

## Production Environment Variables

Share these variables (values should be set on deployment platform, not in code):

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | ✅ | Set to `production` |
| `PORT` | ❌ | Usually set by platform |
| `MONGODB_URI` | ✅ | Production MongoDB connection string |
| `AWS_REGION` | ✅ | AWS region (e.g., us-east-1) |
| `AWS_ACCESS_KEY_ID` | ✅ | AWS access key for IoT Core |
| `AWS_SECRET_ACCESS_KEY` | ✅ | AWS secret key for IoT Core |
| `AWS_IOT_ENDPOINT` | ✅ | IoT Core endpoint URL |

## MongoDB Atlas Production Setup

### For Team:

1. **Create MongoDB Atlas Account:**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Create free account

2. **Create Production Cluster:**
   - Choose M0 (Free) or M10 (Production) tier
   - Select region closest to your API

3. **Create Database User:**
   - Go to "Database Access"
   - Add user with read/write permissions

4. **Configure Network Access:**
   - Go to "Network Access"
   - Add IP addresses or allow from anywhere

5. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with actual password
   - Add database name: `/mehulapi?retryWrites=true&w=majority`

## AWS IoT Core Production Setup

### For Team:

1. **Create IAM User for API:**
   - Go to AWS IAM Console
   - Create new user: `mehulapi-iot-user`
   - Attach policy: `AWSIoTDataPlaneAccess`
   - Save Access Key ID and Secret Access Key

2. **Get IoT Endpoint:**
   - Go to AWS IoT Core Console → Settings
   - Copy "Device data endpoint"
   - Format: `xxxxx-ats.iot.us-east-1.amazonaws.com`

3. **Create IoT Core Rule:**
   - Go to IoT Core → Rules
   - Create rule: `ForwardDeviceDataToBackend`
   - SQL: `SELECT *, topic() as topic FROM 'esp32/+'`
   - Action: HTTPS endpoint → Production API URL

## Testing Production Deployment

### Test Script for Team:

```bash
#!/bin/bash

API_URL="https://your-production-api.com"

echo "Testing Production API..."
echo "=========================="

# 1. Health check
echo "1. Health Check:"
curl -s $API_URL/health | jq .

# 2. Send device data
echo "2. Sending Device Data:"
curl -s -X POST $API_URL/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "production_test_001"
  }' | jq .

# 3. Set configuration
echo "3. Setting Configuration:"
curl -s -X POST $API_URL/api/devices/production_test_001/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {"pressure": 16.0, "humidity": 7.0}
  }' | jq .

echo "✅ Production tests complete!"
```

## Deployment Timeline

### Phase 1: Preparation (Day 1)
- Set up MongoDB Atlas
- Set up AWS IoT Core credentials
- Choose deployment platform
- Prepare environment variables

### Phase 2: Deployment (Day 1-2)
- Deploy API to production
- Configure environment variables
- Test basic endpoints

### Phase 3: Integration (Day 2-3)
- Update IoT Core Rule with production URL
- Test IoT Core integration
- Test end-to-end flow

### Phase 4: Validation (Day 3)
- Complete end-to-end testing
- Set up monitoring
- Document production URLs

## Team Communication Template

```
Subject: CPAP/BIPAP API - Production Deployment

Hi Team,

The CPAP/BIPAP Device Data API is ready for production deployment.

📦 What's Included:
- Full API with device data management
- AWS IoT Core integration
- MongoDB database setup
- Complete documentation

🚀 Deployment Options:
1. Railway (Recommended - Easiest)
2. Heroku (Popular platform)
3. AWS Elastic Beanstalk (For AWS users)

📋 Next Steps:
1. Review DEPLOYMENT.md
2. Set up MongoDB Atlas production cluster
3. Configure AWS IoT Core credentials
4. Choose deployment platform
5. Deploy API
6. Update IoT Core Rule with production URL

📚 Documentation:
- DEPLOYMENT.md - Complete deployment guide
- README.md - API documentation
- TESTING_GUIDE.md - Testing instructions
- AWS_IOT_SETUP.md - IoT Core setup

🔗 Production URLs (after deployment):
- API: https://your-api-domain.com
- Health: https://your-api-domain.com/health
- MongoDB Atlas Dashboard: (share Atlas URL)
- AWS IoT Console: (share IoT Core URL)

❓ Questions?
Please refer to documentation or reach out.

Thanks!
```

## Important Security Notes

**Share with Team:**

1. **Never commit `.env` file to Git**
   - Use `.env.example` as template
   - Set environment variables on deployment platform

2. **Use Production Credentials**
   - Don't use development credentials in production
   - Rotate keys regularly
   - Use IAM roles when possible (AWS)

3. **Secure MongoDB Access**
   - Use strong passwords
   - Restrict network access
   - Enable MongoDB Atlas security features

4. **API Security**
   - Use HTTPS only
   - Enable CORS restrictions
   - Set up rate limiting
   - Monitor for unusual activity

## Support & Troubleshooting

**For Team:**

- Documentation: All guides in project root
- Testing: See `TESTING_GUIDE.md`
- Deployment Issues: See `DEPLOYMENT.md`
- AWS IoT Issues: See `AWS_IOT_SETUP.md`

---

**Last Updated:** [Current Date]
**Version:** 1.0.0
**Status:** Ready for Production



---

## # 👥 Team Guides

*Source: SHARE_WITH_TEAM.md*

# CPAP/BIPAP API - Team Package

**Project:** CPAP/BIPAP Device Data Management API with AWS IoT Core Integration  
**Status:** Ready for Production Deployment  
**Version:** 1.0.0

## 📦 What to Share with Your Team

### Essential Files (Share All)

**Core Application:**
- `server.js` - Main server file
- `package.json` - Dependencies
- All files in: `config/`, `controllers/`, `models/`, `routes/`, `utils/`

**Documentation (Share All):**
- `README.md` - Full API documentation
- `DEPLOYMENT.md` - Complete deployment guide
- `DEPLOYMENT_QUICK_START.md` - Quick deployment steps
- `DEPLOYMENT_RAILWAY.md` - Railway-specific guide
- `TESTING_GUIDE.md` - Testing instructions
- `AWS_IOT_SETUP.md` - AWS IoT Core setup
- `ESP32_SETUP.md` - ESP32 device setup
- `COMPLETE_FLOW.md` - End-to-end flow explanation

**Configuration Template:**
- `.env.example` - Environment variables template (NOT the actual `.env` file!)

### Do NOT Share

- ❌ `.env` file (contains secrets)
- ❌ `node_modules/` folder
- ❌ `.DS_Store` files
- ❌ Any files with actual credentials

## 🚀 Quick Deployment Options

### Option A: AWS Elastic Beanstalk (AWS Users) ⭐

**Best for:** Teams already using AWS ecosystem

**Quick Steps:**
1. Install EB CLI: `pip install awsebcli`
2. Configure AWS: `aws configure`
3. Initialize: `eb init`
4. Create environment: `eb create mehulapi-production`
5. Set variables: `eb setenv NODE_ENV=production MONGODB_URI=...`
6. Deploy: `eb deploy`
7. Get URL: `eb open`

**See:** `AWS_DEPLOYMENT_QUICK_START.md` for detailed guide

### Option B: Railway (Easiest) ⭐⭐⭐

**Best for:** Quick deployments, teams new to DevOps

**Quick Steps:**
1. Push to GitHub
2. Sign up: https://railway.app
3. Deploy from GitHub repo
4. Add environment variables
5. Get production URL automatically

**See:** `DEPLOYMENT_RAILWAY.md` for detailed guide

### Option C: Heroku (Popular)

**Best for:** Simple deployments, popular platform

**Quick Steps:**
1. Install Heroku CLI
2. Create app: `heroku create mehulapi-production`
3. Set variables: `heroku config:set NODE_ENV=production ...`
4. Deploy: `git push heroku main`

**See:** `DEPLOYMENT.md` for Heroku guide

## 🔐 Required Production Setup

### 1. MongoDB Atlas (Free)

**Steps:**
1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create free M0 cluster
3. Create database user
4. Configure network access (Allow from Anywhere)
5. Get connection string

**Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/mehulapi?retryWrites=true&w=majority
```

### 2. AWS IoT Core Credentials

**Steps:**
1. AWS Console → IAM → Create User
2. User name: `mehulapi-iot-user`
3. Attach policy: `AWSIoTDataPlaneAccess`
4. Create access key → Save Access Key ID and Secret
5. Get IoT Core endpoint: IoT Core → Settings → Device data endpoint

### 3. AWS IoT Core Rule

**Already set up?** Just update the HTTPS endpoint URL to production URL.

**Not set up?** See `AWS_IOT_SETUP.md` for detailed instructions.

## 📋 Deployment Checklist

Before deploying, ensure:

- [ ] MongoDB Atlas production cluster created
- [ ] AWS IoT Core credentials set up
- [ ] Code pushed to GitHub
- [ ] Environment variables documented (NOT actual values)
- [ ] Team has access to deployment platform
- [ ] Production URLs documented

## 🧪 Testing Production

After deployment:

```bash
# Test health endpoint
curl https://your-api-domain.com/health

# Test device data endpoint
curl -X POST https://your-api-domain.com/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "test_device"
  }'
```

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/api/devices/data` | POST | Receive device data |
| `/api/devices/:id/config` | GET | Get device configuration |
| `/api/devices/:id/config` | POST | Set device configuration |
| `/api/devices/:id/data` | GET | Get device data history |
| `/api/iot/webhook` | POST | AWS IoT Core webhook |

## 🗄️ Data Storage

**MongoDB Atlas:**
- **Database:** `mehulapi`
- **Collections:**
  - `devicedatas` - All device data
  - `deviceconfigs` - All device configurations

**View Data:**
- MongoDB Atlas Dashboard → Browse Collections
- Or use API endpoints

## 🔄 Complete Data Flow

```
ESP32 Hardware → AWS IoT Core → Production API → MongoDB Atlas
                                                      ↓
ESP32 Hardware ← AWS IoT Core ← Production API ← Config Updates
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main API documentation |
| `DEPLOYMENT.md` | Complete deployment guide |
| `DEPLOYMENT_QUICK_START.md` | Quick deployment steps |
| `DEPLOYMENT_RAILWAY.md` | Railway-specific guide |
| `TESTING_GUIDE.md` | How to test the API |
| `AWS_IOT_SETUP.md` | AWS IoT Core setup |
| `ESP32_SETUP.md` | ESP32 device configuration |
| `COMPLETE_FLOW.md` | End-to-end flow explanation |
| `TEAM_GUIDE.md` | Team onboarding guide |

## 🆘 Quick Troubleshooting

**API not accessible:**
- Check deployment platform status
- Verify environment variables
- Check logs in platform dashboard

**MongoDB connection fails:**
- Verify connection string
- Check Atlas network access
- Ensure credentials are correct

**IoT Core not working:**
- Verify AWS credentials
- Check IoT Core endpoint
- Review IAM permissions

## 📞 Support & Resources

- **Railway Support:** https://docs.railway.app
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **AWS IoT Core Docs:** https://docs.aws.amazon.com/iot

## 🎯 Next Steps

1. **Review Documentation**
   - Read `DEPLOYMENT_QUICK_START.md`
   - Review `TESTING_GUIDE.md`

2. **Set Up Production**
   - Create MongoDB Atlas cluster
   - Set up AWS IoT Core credentials
   - Deploy on Railway

3. **Test Production**
   - Test all endpoints
   - Verify IoT Core integration
   - Test end-to-end flow

4. **Monitor & Maintain**
   - Set up monitoring
   - Review logs regularly
   - Monitor API usage

---

**Ready to Deploy?** Start with `DEPLOYMENT_QUICK_START.md`! 🚀

**Questions?** Check documentation files or reach out to the team.



---

## # 👥 Team Guides

*Source: SHARING_CHECKLIST.md*

# Sharing Checklist for Team

Use this checklist to share the API project with your team members.

## 📋 Files to Share

### Essential Files (Must Share)
- [x] `package.json` - Dependencies and project metadata
- [x] `README.md` - Main documentation
- [x] `TEAM_GUIDE.md` - Team onboarding guide
- [x] `server.js` - Main server file
- [x] All files in `config/`, `controllers/`, `models/`, `routes/`, `utils/` folders

### Configuration Files
- [x] `.gitignore` - Git ignore rules
- [ ] `.env.example` - Environment variable template (create and share)

### Optional but Helpful
- [x] `examples/test-api.js` - API testing examples
- [x] `SHARING_CHECKLIST.md` - This file

## 📦 What to Include When Sharing

### 1. Repository/Code
Share via:
- Git repository (GitHub, GitLab, Bitbucket)
- ZIP file with all project files
- Shared drive/folder

**Required folders/files:**
```
mehulapi/
├── config/
├── controllers/
├── models/
├── routes/
├── utils/
├── examples/
├── package.json
├── server.js
├── README.md
├── TEAM_GUIDE.md
├── .gitignore
└── .env.example (or template)
```

### 2. Environment Setup Instructions
Share these setup steps:

1. **Install Node.js** (v18+)
   - Download from nodejs.org
   - Verify: `node --version`

2. **Install MongoDB**
   - Local: Download from mongodb.com
   - Cloud: Get MongoDB Atlas connection string

3. **Project Setup**
   ```bash
   # Clone/download project
   cd mehulapi
   
   # Install dependencies
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your MongoDB URI
   
   # Start server
   npm run dev
   ```

4. **Verify Installation**
   ```bash
   curl http://localhost:3000/health
   ```

### 3. Key Documentation to Share

**Send these documents:**
- `README.md` - Full API documentation
- `TEAM_GUIDE.md` - Team-specific guide

**Quick links to share:**
- API Base URL: `http://localhost:3000` (or production URL)
- Health Check: `GET /health`
- Main Endpoint: `POST /api/devices/data`

### 4. Sample Data for Testing

Share these example requests:

**CPAP Device Data:**
```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
  "device_type": "CPAP",
  "device_id": "cpap_001"
}
```

**BIPAP Device Data:**
```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,A,12.2,1.0,B,29.6,10.8,10.6,40.0,10.0,10.0,13.0,1.0,C,16.0,10.0,10.0,10.0,10.0,10.0,0.0,200.0,1.0,D,11.0,10.0,10.0,10.0,10.0,10.0,10.0,200.0,1.0,E,20.0,10.0,5.0,10.0,20.0,20.0,1.0,200.0,1.0,170.0,500.0,F,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
  "device_type": "BIPAP",
  "device_id": "bipap_001"
}
```

## 🔐 Sensitive Information (DO NOT Share)

- ❌ `.env` file with actual credentials
- ❌ Production database credentials
- ❌ API keys or secrets
- ❌ Node modules folder (use `.gitignore`)

## 📝 Quick Share Template

Copy and customize this for team communication:

---

**Subject: CPAP/BIPAP API Project - Setup Guide**

Hi Team,

I've set up the CPAP/BIPAP device data API. Here's what you need to get started:

**Quick Setup:**
1. Clone/download the project from: [LINK]
2. Install Node.js (v18+) and MongoDB
3. Run: `npm install`
4. Create `.env` file with MongoDB connection
5. Run: `npm run dev`
6. Test: `curl http://localhost:3000/health`

**Documentation:**
- Full API docs: `README.md`
- Team guide: `TEAM_GUIDE.md`
- Test examples: `examples/test-api.js`

**Key Endpoints:**
- Health: `GET /health`
- Receive data: `POST /api/devices/data`
- Get config: `GET /api/devices/:deviceId/config`
- Set config: `POST /api/devices/:deviceId/config`

**Questions?** Check the TEAM_GUIDE.md or reach out.

---

## ✅ Pre-Share Checklist

Before sharing, verify:
- [ ] All code is working locally
- [ ] `.env.example` exists (without secrets)
- [ ] `README.md` is complete
- [ ] `TEAM_GUIDE.md` is up to date
- [ ] `.gitignore` includes sensitive files
- [ ] Test script works: `node examples/test-api.js`
- [ ] No hardcoded credentials in code
- [ ] Documentation is clear for new team members

## 🚀 Post-Share Support

After sharing, be ready to help with:
- Environment setup issues
- MongoDB connection problems
- API endpoint questions
- Data format clarifications
- Deployment assistance

## 📞 Team Onboarding Flow

1. **Day 1:** Share repository + README
2. **Day 2:** Team sets up local environment
3. **Day 3:** Review TEAM_GUIDE together
4. **Day 4:** Hands-on testing with sample data
5. **Week 2:** Integration with cloud/hardware

---

**Last Updated:** [Current Date]
**Version:** 1.0.0



---

## # 🧪 Testing & Verification

*Source: TESTING_GUIDE.md*

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



---

## # 🧪 Testing & Verification

*Source: QUICK_LOCAL_TEST.md*

# Quick Local Testing Guide

Fast guide to test receiving data from cloud and sending updates back.

## Quick Start (5 minutes)

### Step 1: Start Your Local API

```bash
cd /Users/deckmount/Documents/mehulapi
npm run dev
```

Keep this terminal open - you'll see logs here.

### Step 2: Set Up ngrok (New Terminal)

```bash
# Terminal 2
cd /Users/deckmount/Documents/mehulapi
./setup-ngrok.sh

# Or manually:
ngrok http 3000
```

**Copy the ngrok URL** - looks like: `https://abc123.ngrok.io`

### Step 3: Update AWS IoT Core Rule

1. Go to AWS Console → IoT Core → Rules
2. Edit your rule
3. Update HTTPS endpoint to:
   ```
   https://abc123.ngrok.io/api/iot/webhook
   ```
4. Save

### Step 4: Test Complete Flow

#### A. Set Configuration (Terminal 3)

```bash
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {"pressure": 16.0, "humidity": 7.0}
  }'
```

#### B. Test via AWS IoT Test Client

1. **Open AWS IoT Test Client** (Browser)
   - Go to: AWS Console → IoT Core → Test (MQTT test client)

2. **Subscribe to config topic:**
   - Topic: `esp32/config24`
   - Click "Subscribe"

3. **Publish device data:**
   - Topic: `esp32/data24`
   - Message:
   ```json
   {
     "device_status": 0,
     "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
   }
   ```
   - Click "Publish"

4. **Check Results:**
   - ✅ Terminal 1 (API logs): Should show "Config published to IoT Core"
   - ✅ AWS IoT Test Client: Should see config message on `esp32/config24`

## Visual Flow

```
AWS IoT Test Client
  ↓ Publish to esp32/data24
AWS IoT Core Rule
  ↓ Forward via HTTPS
ngrok Tunnel (abc123.ngrok.io)
  ↓ Forward to localhost:3000
Your Local API (/api/iot/webhook)
  ↓ Save to MongoDB
  ↓ Check for config (finds it!)
  ↓ Publish to esp32/config24
AWS IoT Core
  ↓ Deliver message
AWS IoT Test Client
  ↓ Subscribe to esp32/config24
✅ See config message!
```

## Quick Test Script

```bash
# Run complete test
./test-iot-flow.sh
```

This script:
1. Sets device configuration
2. Simulates device sending data
3. Verifies data saved
4. Checks configuration

## What to Watch

### Terminal 1 (API Logs)
Look for:
```
POST /api/iot/webhook 200
Config published to IoT Core topic: esp32/config24 for device: 24
```

### AWS IoT Test Client
- Subscribe to: `esp32/config24`
- Watch for config message appearing

### MongoDB (Optional)
```bash
# Check data saved
mongosh mehulapi
db.devicedatas.find().sort({ timestamp: -1 }).limit(1).pretty()
db.deviceconfigs.find({ device_id: "24" }).pretty()
```

## Troubleshooting

### API Not Receiving Data
- ✅ Check ngrok is running
- ✅ Verify AWS IoT Core Rule URL matches ngrok URL
- ✅ Check API is running on port 3000

### Config Not Published
- ✅ Verify AWS credentials in `.env`
- ✅ Check `AWS_IOT_ENDPOINT` is set
- ✅ Look for errors in API logs
- ✅ Test IoT connection: `node scripts/verify-iot-connection.js`

### Can't See Config in IoT Test Client
- ✅ Verify subscribed to correct topic: `esp32/config24`
- ✅ Check message quality: Auto-format JSON
- ✅ Try publishing again

## Complete Verification

After testing, verify:

- [ ] ✅ Local API logs show data received
- [ ] ✅ Data appears in MongoDB
- [ ] ✅ Config is set and saved
- [ ] ✅ API logs show config published
- [ ] ✅ Config message appears in AWS IoT Test Client

**All checked?** Your complete flow is working! 🎉

---

**See:** `LOCAL_TESTING_IOT.md` for detailed guide



---

## # 🧪 Testing & Verification

*Source: VERIFY_CLOUD_TO_DB.md*

# Verify Data from Cloud to Database

You received this data in AWS IoT Core:
```json
{
  "device_status": 0,
  "device_data": "*,R,142225,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678C,#"
}
```

## Check if Data Reached Your Database

### Method 1: MongoDB Atlas (Best - Visual Check)

1. **Go to:** https://cloud.mongodb.com/
2. **Click** on your cluster
3. **Click** "Browse Collections"
4. **Navigate to:** `mehulapi` → `devicedatas`
5. **Click "Filter" button**
6. **Enter filter:**
   ```
   { "raw_data": { "$regex": "MANUALMODE" } }
   ```
   OR:
   ```
   { "raw_data": { "$regex": "142225" } }
   ```
7. **Click "Apply"**
8. **Refresh** the page
9. **Look for** record with this exact `raw_data`:
   ```
   *,R,142225,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678C,#
   ```

**If you see it → Data is in database!** ✅  
**If not → Data hasn't reached your API yet**

---

### Method 2: Check Server Logs

**Look in terminal where `npm run dev` is running:**

When your device sent this data, check if you see:
```
POST /api/iot/webhook 200
IoT data received and processed successfully
```

**If you see this** → Data was saved!  
**If not** → Data might not have reached your API

---

### Method 3: Check API Endpoint

**Query your API:**

```bash
curl 'http://localhost:3000/api/devices/24/data?limit=20' | grep -i "MANUALMODE"
```

**Or in browser:**
```
http://localhost:3000/api/devices/24/data?limit=20
```

Then search (Ctrl+F / Cmd+F) for: `MANUALMODE` or `142225`

---

## If Data NOT in Database

### Troubleshooting:

1. **Check AWS IoT Core Rule is Active:**
   - Go to: AWS IoT Core → Rules
   - Verify: `ForwardESP32DataToBackend` is "Active"
   - Check topic pattern: `esp32/+` matches `esp32/data24`

2. **Check ngrok is Still Running:**
   ```bash
   # Terminal 2 should show:
   Forwarding: https://vina-unscrawled-krishna.ngrok-free.dev -> http://localhost:3000
   ```
   - If ngrok stopped, **restart it**: `ngrok http 3000`
   - **Important:** If ngrok URL changed, update AWS IoT Core Rule with new URL!

3. **Check Server is Running:**
   - Terminal 1: `npm run dev` should be running
   - Should show: `Server running on port 3000`

4. **Check MongoDB Connection:**
   - Server logs should show: `✅ MongoDB Connected`
   - If not, check `.env` file for `MONGODB_URI`

5. **Verify Data Format:**
   - The data you received in cloud should match exactly
   - Topic should be: `esp32/data24`

---

## Test Manually (Save Data Now)

If the data from cloud hasn't reached your API, you can test by saving it manually:

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,142225,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678C,#",
    "topic": "esp32/data24"
  }'
```

**This will save the data to MongoDB immediately!**

Then check MongoDB Atlas again.

---

## Why Data Might Not Be in Database

### Common Issues:

1. **ngrok URL Changed:**
   - ngrok free URLs change when you restart it
   - AWS IoT Core Rule still has old URL
   - **Fix:** Restart ngrok, get new URL, update AWS IoT Core Rule

2. **Rule Not Triggering:**
   - Rule might not be matching the topic
   - **Fix:** Verify topic in rule SQL matches `esp32/+`

3. **Server Not Running:**
   - API server stopped
   - **Fix:** Restart with `npm run dev`

4. **MongoDB Connection Lost:**
   - MongoDB disconnected
   - **Fix:** Check connection string in `.env`

---

## Quick Checklist

- [ ] Data received in AWS IoT Core (you see it in MQTT test client) ✅
- [ ] AWS IoT Core Rule is Active
- [ ] ngrok is running with correct URL
- [ ] API server is running (`npm run dev`)
- [ ] MongoDB is connected (see `✅ MongoDB Connected` in logs)
- [ ] Check MongoDB Atlas → Filter by "MANUALMODE"
- [ ] Check server logs for `POST /api/iot/webhook 200`

---

**Best Method: Use MongoDB Atlas → Browse Collections → Filter by `raw_data` containing "MANUALMODE"** 🎯

If data is not there, check if rule forwarded it to your API by checking server logs!



---

## # 🧪 Testing & Verification

*Source: HOW_TO_CHECK_DATABASE.md*

# How to Check Data in MongoDB Database

Your device sent data to AWS IoT Core → Rule forwards to API → API saves to MongoDB.

Here's how to verify the data is in your database:

## Method 1: Check MongoDB Atlas (Visual)

### Steps:

1. **Go to MongoDB Atlas:**
   - Open: https://cloud.mongodb.com/
   - Sign in to your account

2. **Navigate to your database:**
   - Click on your cluster
   - Click "Browse Collections" button

3. **Find your data:**
   - Database: `mehulapi`
   - Collection: `devicedatas`
   - **Refresh the page** (important!)

4. **You should see:**
   - Documents with:
     - `device_id: "24"` (extracted from `esp32/data24`)
     - `device_type: "CPAP"` or `"BIPAP"` (auto-detected)
     - `raw_data: "*,R,181125,1124,AUTOMODE,..."`
     - `parsed_data: { sections: {...} }`
     - `timestamp: "2025-11-18T..."`

---

## Method 2: Check via API Endpoint

### Query your API:

```bash
# Get latest data for device 24
curl http://localhost:3000/api/devices/24/data?limit=5
```

**Or in browser:**
```
http://localhost:3000/api/devices/24/data?limit=5
```

**You should see JSON response with your device data.**

---

## Method 3: Check Server Logs

**Check terminal where `npm run dev` is running:**

Look for these messages when device sent data:
```
POST /api/iot/webhook 200
IoT data received and processed successfully
Config published to IoT Core topic: esp32/config24 for device: 24
```

If you see these, **data was received and saved!**

---

## Method 4: Test API Health

```bash
# Check if API is running
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "ok",
  "mongodb": "connected",
  ...
}
```

---

## Troubleshooting

### If Data NOT in MongoDB Atlas:

1. **Check server logs:**
   - Look for errors
   - Check for `POST /api/iot/webhook` requests
   - Check MongoDB connection errors

2. **Check if API received data:**
   - Look for `POST /api/iot/webhook 200` in logs
   - If not, rule might not be forwarding correctly

3. **Check MongoDB connection:**
   - Server logs should show: `✅ MongoDB Connected`
   - If not, check `.env` file for `MONGODB_URI`

4. **Verify rule is active:**
   - Go to AWS IoT Core → Rules
   - Check `ForwardESP32DataToBackend` is "Active"
   - Verify action URL matches your ngrok URL

5. **Test API directly:**
   ```bash
   curl -X POST http://localhost:3000/api/iot/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "device_status": 0,
       "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#",
       "topic": "esp32/data24"
     }'
   ```
   This should save to MongoDB immediately.

---

## Quick Checklist

- [ ] MongoDB Atlas → Browse Collections → `mehulapi` → `devicedatas` → **Refresh**
- [ ] Check server logs for `POST /api/iot/webhook 200`
- [ ] Test API endpoint: `curl http://localhost:3000/api/devices/24/data?limit=5`
- [ ] Verify MongoDB connection in server logs

---

**Follow Method 1 (MongoDB Atlas) first - it's the easiest way to see your data!**



---

## # 🧪 Testing & Verification

*Source: HOW_TO_CHECK_SPECIFIC_DATA.md*

# How to Check Specific Data in Database

You received this data in AWS IoT Core:
```json
{
  "device_status": 0,
  "device_data": "*,R,142225,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678C,#"
}
```

Here's how to check if it's in your MongoDB database:

---

## Method 1: Check via API (Quick Check)

### Query all data for device 24:

**In browser:**
```
http://localhost:3000/api/devices/24/data?limit=10
```

**Or via curl:**
```bash
curl 'http://localhost:3000/api/devices/24/data?limit=10'
```

### Search for specific data:

Look for records with:
- `device_status: 0`
- `raw_data` containing: `"MANUALMODE"` or `"142225"` or `"12345678C"`

---

## Method 2: Check MongoDB Atlas (Visual - Best)

### Steps:

1. **Go to:** https://cloud.mongodb.com/
2. **Click** on your cluster
3. **Click** "Browse Collections"
4. **Navigate to:**
   - Database: `mehulapi`
   - Collection: `devicedatas`
5. **Use Filter:**
   - Click "Filter" button
   - Enter: `{ "raw_data": { "$regex": "MANUALMODE", "$options": "i" } }`
   - OR: `{ "raw_data": { "$regex": "142225" } }`
   - OR: `{ "device_status": 0 }`
6. **Refresh** the page
7. **Look for** the record with:
   - `raw_data: "*,R,142225,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678C,#"`

---

## Method 3: Test if Data Reaches API

If the data is not in the database, test if it reaches your API:

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,142225,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678C,#",
    "topic": "esp32/data24"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "IoT data received and processed successfully",
  "data": {
    "device_id": "24",
    "timestamp": "..."
  }
}
```

This will save the data to MongoDB if it's not already there.

---

## Method 4: Check Server Logs

**Look in terminal where `npm run dev` is running:**

When device sends data, you should see:
```
POST /api/iot/webhook 200
IoT data received and processed successfully
```

**If you see this** when your device sent the data, **it was saved to MongoDB!**

---

## What to Look For in Database

Your data should be saved as:

```json
{
  "_id": "...",
  "device_type": "CPAP",
  "device_id": "24",
  "device_status": 0,
  "raw_data": "*,R,142225,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678C,#",
  "parsed_data": {
    "sections": {
      "R": [142225, 1703, "MANUALMODE"],
      "G": [13.6, 1.0],
      "H": [12.4, 12.4, 20.0, 1.0],
      "I": [5.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 12345678]
    },
    ...
  },
  "timestamp": "2025-11-18T..."
}
```

**Key identifiers:**
- `raw_data` contains: `MANUALMODE` or `142225` or `12345678C`
- `device_status: 0`
- `device_id: "24"` (extracted from topic `esp32/data24`)

---

## If Data NOT Found

### Troubleshooting:

1. **Check if AWS IoT Core Rule forwarded it:**
   - Go to AWS IoT Core → Rules
   - Check `ForwardESP32DataToBackend` is "Active"
   - Verify it matches topic `esp32/data24`

2. **Check server logs:**
   - Look for `POST /api/iot/webhook` requests
   - Check for errors

3. **Check ngrok is still running:**
   - Terminal 2 should show: `Forwarding: https://...`
   - If ngrok stopped, the rule can't reach your API

4. **Test API directly:**
   - Use Method 3 above to test if API works
   - This will save data immediately

5. **Check MongoDB connection:**
   - Server logs should show: `✅ MongoDB Connected`
   - If not connected, data won't save

---

## Quick Search Commands

### Search by MANUALMODE:
```bash
curl 'http://localhost:3000/api/devices/24/data?limit=50' | grep -i "MANUALMODE"
```

### Search by date (142225 = 14/22/25):
```bash
curl 'http://localhost:3000/api/devices/24/data?limit=50' | grep "142225"
```

---

**Best Method: Use MongoDB Atlas → Browse Collections → Filter by `raw_data` containing "MANUALMODE"** 🎯



---

## # 🧪 Testing & Verification

*Source: HOW_TO_CHECK.md*

# Where to Check - Complete Verification Guide

This guide shows you exactly where to check if everything is working.

## Where to Check Everything

### 1. Check Your Local API Server

**Terminal where `npm run dev` is running:**

Look for these messages:
```
✅ MongoDB Connected: mehulapi-cluster.4fkajzs.mongodb.net
Server running on port 3000 in development mode
```

**If you see:**
- ✅ `MongoDB Connected` - **Great! MongoDB is connected**
- ❌ `MongoDB Connection Error` - Check your `.env` file connection string
- ❌ Server not running - Start it with `npm run dev`

**Test in Browser:**
- Open: `http://localhost:3000`
- Should show API information with endpoints

**Test in Terminal:**
```bash
curl http://localhost:3000/health
```
Should return:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "..."
}
```

### 2. Check MongoDB Connection

**Option A: Check Server Logs**

In your terminal where `npm run dev` is running, look for:
```
✅ MongoDB Connected: mehulapi-cluster.4fkajzs.mongodb.net
```

**Option B: Test Saving Data**

```bash
# Test saving device data
curl -X POST http://localhost:3000/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "test_001"
  }'
```

**If successful**, you'll see:
```json
{
  "success": true,
  "message": "Device data received and saved successfully",
  "data": {
    "device_id": "test_001",
    "timestamp": "..."
  }
}
```

**If MongoDB not connected**, you'll see an error.

### 3. Check Data in MongoDB Atlas

**Where to Look:**

1. **Go to MongoDB Atlas Dashboard** (in your browser)
   - You're already there! I can see your cluster page

2. **Click "Browse Collections" button** (top right of your cluster)
   - Or go to: Clusters → mehulapi-cluster → "Browse Collections"

3. **You should see:**
   - Database: `mehulapi`
   - Collections: `devicedatas` and `deviceconfigs` (after saving data)

4. **View Saved Data:**
   - Click on `devicedatas` collection
   - You'll see all device data you've saved
   - Each document shows: device_id, device_type, device_data, timestamp, etc.

### 4. Check MongoDB Atlas Cluster Status

**On the cluster page you're viewing:**

- **Connections: 1.0** - This shows active connections
- **Data Size: 114.55 MB / 512.00 MB** - Shows database size
- **R/W Operations** - Shows read/write activity

**Green indicators = Everything working!**

### 5. Check All API Endpoints

**Quick Test Script:**

```bash
# Test all endpoints
curl http://localhost:3000/health
curl http://localhost:3000/
curl "http://localhost:3000/api/devices/test_001/data?limit=5"
curl http://localhost:3000/api/devices/test_001/config
```

Or use the test script:
```bash
./test-iot-flow.sh
```

## Complete Checklist

### ✅ Local API Server
- [ ] Server is running (`npm run dev`)
- [ ] Server logs show "MongoDB Connected"
- [ ] Can access `http://localhost:3000`
- [ ] Health endpoint returns success

### ✅ MongoDB Connection
- [ ] `.env` file has correct `MONGODB_URI`
- [ ] Server logs show connection success
- [ ] Can save data via API
- [ ] No connection errors in logs

### ✅ MongoDB Atlas Dashboard
- [ ] Cluster is visible and running
- [ ] "Browse Collections" works
- [ ] Can see `mehulapi` database
- [ ] Can see saved data in collections

### ✅ Data Operations
- [ ] Can save device data via API
- [ ] Can set device configuration
- [ ] Can retrieve device data history
- [ ] Data appears in MongoDB Atlas

## Where to Check - Summary

| What to Check | Where | What to Look For |
|---------------|-------|------------------|
| **API Running** | Terminal (`npm run dev`) | "Server running on port 3000" |
| **MongoDB Connected** | Terminal logs | "✅ MongoDB Connected" |
| **API Endpoints** | Browser: `localhost:3000` | See API info page |
| **Health Check** | Browser or curl: `/health` | `{"success": true}` |
| **Saved Data** | MongoDB Atlas → Browse Collections | See `devicedatas` collection |
| **Cluster Status** | MongoDB Atlas Dashboard | Green metrics, cluster running |
| **Connections** | MongoDB Atlas → Cluster metrics | Shows active connections |

## Quick Test Commands

```bash
# 1. Test API is running
curl http://localhost:3000/health

# 2. Test saving data (this will save to MongoDB)
curl -X POST http://localhost:3000/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "check_001"
  }'

# 3. Check data was saved
curl "http://localhost:3000/api/devices/check_001/data?limit=1"

# 4. View in browser
# Open: http://localhost:3000
```

## View Data in MongoDB Atlas

**Steps:**

1. **On the cluster page** (where you are now)
2. **Click "Browse Collections"** button (top right)
3. **Select database:** `mehulapi`
4. **Select collection:** `devicedatas`
5. **View documents:** All your saved device data!

**What you'll see:**
- Device ID
- Device Type (CPAP/BIPAP)
- Raw data string
- Parsed data (structured format)
- Timestamps

## If Something Isn't Working

### Can't See "MongoDB Connected" in Logs?

**Check:**
1. `.env` file has `MONGODB_URI` set
2. Connection string has `/mehulapi` before `?`
3. Username and password are correct
4. Network access allows your IP

**Fix:**
```bash
# Check .env file
cat .env | grep MONGODB_URI

# Should show something like:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mehulapi?retryWrites=true&w=majority
```

### Can't See Data in MongoDB Atlas?

**Check:**
1. Did you save any data? Run the test curl command above
2. Check correct database: `mehulapi` (not default)
3. Check correct collection: `devicedatas`
4. Refresh the browser page

---

**Quick Check:** Click "Browse Collections" on your MongoDB Atlas cluster page right now - that's the easiest way to see if data is being saved! 📊



---

## # 🧪 Testing & Verification

*Source: DATA_IN_DATABASE_SUCCESS.md*

# ✅ Data is in Your Database!

## Verification Complete

**Your device data was successfully received and saved to MongoDB!** 🎉

---

## What We Found

The API query shows your data is in the database:

- **Device ID:** `24` (extracted from topic `esp32/data24`)
- **Device Type:** `CPAP` (auto-detected from AUTOMODE)
- **Device Status:** `0`
- **Data Parsed:** ✅ Successfully parsed into structured format
- **Saved to:** MongoDB Atlas → `mehulapi` → `devicedatas`

---

## How to View Your Data

### Method 1: MongoDB Atlas (Visual - Easiest)

1. **Go to:** https://cloud.mongodb.com/
2. **Click** on your cluster
3. **Click** "Browse Collections"
4. **Navigate to:**
   - Database: `mehulapi`
   - Collection: `devicedatas`
5. **REFRESH** the page (important!)
6. **You'll see your data** with:
   - `device_id: "24"`
   - `device_type: "CPAP"`
   - `raw_data: "*,R,181125,1124,AUTOMODE,..."`
   - `parsed_data: { sections: {...} }`
   - `timestamp: "2025-11-18T..."`

---

### Method 2: API Endpoint (Quick Check)

**In your browser:**
```
http://localhost:3000/api/devices/24/data?limit=5
```

**Or via curl:**
```bash
curl 'http://localhost:3000/api/devices/24/data?limit=5'
```

This shows all data for device `24`.

---

### Method 3: Get Latest Data

```bash
curl 'http://localhost:3000/api/devices/24/data?limit=1'
```

Shows the most recent data point.

---

## Complete Flow Working! ✅

```
✅ ESP32 Device
   ↓ Sends data to esp32/data24
✅ AWS IoT Core
   ↓ Receives and forwards via rule
✅ Your API (via ngrok)
   ↓ Receives at /api/iot/webhook
   ↓ Extracts device ID: "24"
   ↓ Auto-detects type: "CPAP"
   ↓ Parses data
✅ MongoDB Atlas
   ↓ Saves to devicedatas collection
✅ DATA IN DATABASE! 🎉
```

---

## Data Format in Database

Your data is saved with this structure:

```json
{
  "_id": "...",
  "device_type": "CPAP",
  "device_id": "24",
  "device_status": 0,
  "raw_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#",
  "parsed_data": {
    "sections": {
      "R": [181125, 1124, "AUTOMODE"],
      "G": [8.5, 1],
      "H": [6.4, 6.4, 12, 1],
      "I": [10, 3, 1, 1, 0, 1, 1, 12345678]
    },
    "pressure": {
      "ipap": 8.5,
      "ramp": 1
    },
    "flow": {
      "max_flow": 6.4,
      "min_flow": 6.4,
      "backup_rate": 12,
      "mode": 1
    },
    "settings": {
      "humidity": 10,
      "temperature": 3
    }
  },
  "timestamp": "2025-11-18T12:..."
}
```

---

## Success! 🎉

**Everything is working perfectly!**

- ✅ Device sends data to AWS IoT Core
- ✅ Rule forwards to your API
- ✅ API receives and processes data
- ✅ Data saved to MongoDB Atlas
- ✅ Data visible in database

**Your complete IoT data pipeline is working!** 🚀

---

## Next Steps

1. **View data in MongoDB Atlas** - Go to Browse Collections
2. **Query data via API** - Use the API endpoints
3. **Monitor future data** - All new device data will automatically save
4. **Set device config** - Use API to push config updates to devices

---

**Everything is set up and working! Your data is flowing from device → cloud → database automatically!** ✅



---

## # 🔧 Troubleshooting

*Source: DEBUG_CLOUD_TO_MONGODB.md*

# 🔍 Debug: Data in Cloud but Not Saving to MongoDB

## Problem
- ✅ Data is visible in AWS IoT Core Cloud
- ❌ Data is NOT saving to MongoDB when sent from hardware
- ✅ Manual API calls (curl/Postman) work fine

**This means the AWS IoT Core Rule is NOT forwarding data to your Railway API!**

---

## 🔍 Step 1: Check Railway Logs

1. **Go to Railway Dashboard**
   - https://railway.app
   - Open your backend service
   - Click **"Deployments"** tab
   - Click on the latest deployment
   - Click **"View Logs"**

2. **Look for webhook requests:**
   ```
   [req_xxx] 📥 Received IoT data request
   ```

3. **If you DON'T see these logs when hardware sends data:**
   - ❌ AWS IoT Rule is NOT calling your API
   - Problem is in AWS IoT Core Rule configuration

---

## 🔍 Step 2: Verify AWS IoT Core Rule

### Check Rule Status

1. **Go to AWS IoT Core Console**
   - https://console.aws.amazon.com/iot/
   - Navigate to: **Act** → **Rules**

2. **Find your rule** (should be something like `ForwardESP32DataToBackend`)

3. **Check:**
   - ✅ Rule is **Enabled** (Status should be "Enabled")
   - ✅ Rule SQL statement includes your topic
   - ✅ HTTPS action URL is correct

### Verify Rule SQL

Your rule SQL should be:

```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp
FROM 
    'esp32/+'
```

**OR for specific topic:**

```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp
FROM 
    'esp32/data24'
```

**Common mistakes:**
- ❌ SQL doesn't match your topic (`esp32/data24`)
- ❌ Missing `topic()` function
- ❌ Wrong topic pattern

---

## 🔍 Step 3: Check HTTPS Action URL

1. **In AWS IoT Rule → Actions → HTTPS endpoint**

2. **URL should be:**
   ```
   https://backend-production-9c17.up.railway.app/api/iot/webhook
   ```
   ⚠️ **Must include `/api/iot/webhook` at the end!**

3. **Common mistakes:**
   - ❌ URL is just: `https://backend-production-9c17.up.railway.app` (missing path)
   - ❌ URL uses HTTP instead of HTTPS
   - ❌ URL has trailing slash: `/api/iot/webhook/` (extra slash)

---

## 🔍 Step 4: Test AWS IoT Rule Manually

### Test 1: Publish Test Message via AWS IoT Console

1. **Go to AWS IoT Core → Test**

2. **Publish to topic:** `esp32/data24`

3. **Payload:**
   ```json
   {
     "device_status": 0,
     "device_data": "*,R,191125,1348,AUTOMODE,G,16.0,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678C,#"
   }
   ```

4. **Check Railway Logs:**
   - You should see: `[req_xxx] 📥 Received IoT data request`
   - If not, the rule is not forwarding!

### Test 2: Check Rule Execution in CloudWatch

1. **Go to AWS CloudWatch**
   - https://console.aws.amazon.com/cloudwatch/

2. **Navigate to:** Logs → Log groups

3. **Look for:** `/aws/iot/` log groups

4. **Check for errors:**
   - Rule execution errors
   - HTTPS endpoint errors
   - Authentication errors

---

## 🔍 Step 5: Verify Rule IAM Permissions

The Rule needs permission to invoke HTTPS endpoint:

1. **Go to AWS IoT Core → Rules → Your Rule**

2. **Click on the Rule**

3. **Check "Resource role"**

4. **The role should have:**
   - `iotactions` service permissions
   - Permission to invoke HTTPS endpoint

5. **If missing, create/update role:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "iotactions:InvokeHTTPS"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

---

## 🔍 Step 6: Common Issues & Fixes

### Issue 1: Rule is Disabled

**Fix:**
1. Go to AWS IoT Core → Rules
2. Find your rule
3. Click **"Enable"**

### Issue 2: Wrong Topic Pattern

**Your device publishes to:** `esp32/data24`

**Rule SQL should include:**
```sql
FROM 'esp32/+'  -- Matches esp32/* topics
-- OR
FROM 'esp32/data24'  -- Matches specific topic
```

**Fix:** Update rule SQL to match your topic.

### Issue 3: HTTPS URL Missing Path

**Wrong:**
```
https://backend-production-9c17.up.railway.app
```

**Correct:**
```
https://backend-production-9c17.up.railway.app/api/iot/webhook
```

**Fix:** Add `/api/iot/webhook` to the URL.

### Issue 4: Railway API Not Receiving Requests

**Check Railway Logs:**
```bash
# Look for these in Railway logs:
[req_xxx] 📥 Received IoT data request
[req_xxx] 📦 Raw payload received: ...
```

**If not present:**
- Rule is not calling the API
- Check rule configuration
- Check IAM permissions

### Issue 5: CORS or Authentication Issues

Railway API should accept POST requests without authentication for IoT webhook.

**Check:** Railway API logs for 403/401 errors.

---

## ✅ Verification Checklist

- [ ] AWS IoT Rule is **Enabled**
- [ ] Rule SQL matches your topic (`esp32/+` or `esp32/data24`)
- [ ] HTTPS URL includes full path: `/api/iot/webhook`
- [ ] HTTPS URL uses `https://` (not `http://`)
- [ ] Rule IAM role has `iotactions:InvokeHTTPS` permission
- [ ] Railway logs show webhook requests when testing
- [ ] MongoDB connection is working (test via manual API call)

---

## 🧪 Quick Test

### Test if Rule is Working:

1. **Publish test message via AWS IoT Console:**
   - Topic: `esp32/data24`
   - Payload:
   ```json
   {
     "device_status": 0,
     "device_data": "*,R,191125,1348,AUTOMODE,G,16.0,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678C,#"
   }
   ```

2. **Check Railway logs immediately:**
   - Should see: `[req_xxx] 📥 Received IoT data request`

3. **If NOT seeing logs:**
   - Rule is not calling API
   - Fix rule configuration (see above)

4. **If seeing logs but data not saving:**
   - Check MongoDB connection in logs
   - Check for parsing errors
   - Check error messages in response

---

## 📝 Expected Logs (When Working)

**Railway Logs should show:**
```
[req_1234567890_abc123] 📥 Received IoT data request
[req_1234567890_abc123] 📦 Raw payload received: {"device_status":0,"device_data":"*,R,191125...
[req_1234567890_abc123] 💾 Attempting to save data for device: 24, type: CPAP
[req_1234567890_abc123] ✅ Data saved successfully to MongoDB (attempt 1)
[req_1234567890_abc123] 📊 Saved record ID: 67890abcdef, timestamp: 2025-11-19T...
[req_1234567890_abc123] ✅ Request completed successfully
```

**If you don't see `📥 Received IoT data request` when hardware sends data:**
- The rule is not forwarding!
- Fix AWS IoT Rule configuration!

---

## 🚀 Most Likely Issue

**99% chance the problem is:**
- AWS IoT Rule HTTPS URL is missing `/api/iot/webhook` path
- OR Rule is disabled
- OR Rule SQL doesn't match your topic

**Fix these first!** ✅



---

## # 🔧 Troubleshooting

*Source: DEBUG_IOT_DATA.md*

# Debug Guide - Device Data Not Appearing in MongoDB

If your device sent data but it's not showing in MongoDB, check these:

## Quick Debugging Steps

### Step 1: Check if API is Receiving Data

**Check your terminal where `npm run dev` is running:**

Look for these logs:
```
POST /api/iot/webhook 200
IoT data received and processed successfully
```

**If you DON'T see this:**
- ❌ Data is not reaching your API
- Check AWS IoT Core Rule setup (see below)

**If you DO see this:**
- ✅ API is receiving data
- Check MongoDB connection (see below)

### Step 2: Check AWS IoT Core Rule

**Your device sends data to AWS IoT Core, but your API needs to receive it.**

1. **Go to:** AWS Console → IoT Core → Rules
2. **Check:** Is there a rule for `esp32/+` topics?
3. **Verify:** Does the rule forward to your API URL?

**For Local Testing:**
- Rule should forward to: `https://your-ngrok-url.ngrok.io/api/iot/webhook`
- Make sure ngrok is running
- Update rule with current ngrok URL

**For Production:**
- Rule should forward to: `https://your-production-api.com/api/iot/webhook`

### Step 3: Check ngrok (For Local Testing)

If testing locally, ngrok must be running:

```bash
# Check if ngrok is running
ps aux | grep ngrok

# If not running, start it:
ngrok http 3000

# Update AWS IoT Core Rule with new ngrok URL
```

**Important:** If you restart ngrok, you get a new URL - update the IoT Core Rule!

### Step 4: Check MongoDB Connection

**Check server logs:**
- Look for: `✅ MongoDB Connected: mehulapi-cluster.4fkajzs.mongodb.net`
- If you see connection errors, fix `.env` file

**Verify MongoDB URI in .env:**
```bash
cat .env | grep MONGODB_URI
```

Should show:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mehulapi?retryWrites=true&w=majority
```

### Step 5: Test Webhook Endpoint Directly

Test if your webhook endpoint works:

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "topic": "esp32/data24"
  }'
```

**If successful:**
- You'll see: `{"success": true, ...}`
- Data should appear in MongoDB Atlas
- This means API endpoint works

**If failed:**
- Check server logs for errors
- Verify MongoDB connection

### Step 6: Check Server Logs in Real-Time

Watch your server logs as device sends data:

```bash
# In terminal where npm run dev is running
# Watch for incoming requests

# You should see:
POST /api/iot/webhook 200
IoT data received and processed successfully
```

## Common Issues

### Issue 1: IoT Core Rule Not Set Up

**Symptom:** No logs in API when device sends data

**Solution:**
1. Set up AWS IoT Core Rule (see `IOT_CORE_RULE_SETUP.md`)
2. Forward `esp32/+` topics to your API webhook
3. For local: Use ngrok URL
4. For production: Use production API URL

### Issue 2: ngrok Not Running (Local Testing)

**Symptom:** Device sends data but API doesn't receive it

**Solution:**
```bash
# Start ngrok
ngrok http 3000

# Copy ngrok URL
# Update AWS IoT Core Rule with new URL
```

### Issue 3: Wrong Webhook URL in IoT Rule

**Symptom:** Data not reaching API

**Solution:**
1. Check IoT Core Rule → Actions
2. Verify HTTPS endpoint URL is correct
3. Must include `/api/iot/webhook` at the end
4. Must be HTTPS (not HTTP)

### Issue 4: MongoDB Connection Failed

**Symptom:** API receives data but doesn't save

**Solution:**
1. Check server logs for MongoDB errors
2. Verify `.env` file has correct `MONGODB_URI`
3. Check MongoDB Atlas network access
4. Verify credentials are correct

### Issue 5: Data Saved but Not Visible

**Symptom:** API saves data but MongoDB Atlas shows nothing

**Solution:**
1. Refresh MongoDB Atlas page
2. Check correct database: `mehulapi`
3. Check correct collection: `devicedatas`
4. Verify filter/search is not hiding data

## Debug Checklist

Go through this checklist:

- [ ] ✅ Server is running (`npm run dev`)
- [ ] ✅ MongoDB connected (check logs)
- [ ] ✅ AWS IoT Core Rule is set up
- [ ] ✅ IoT Rule forwards to correct URL
- [ ] ✅ ngrok running (if local testing)
- [ ] ✅ Webhook endpoint `/api/iot/webhook` works (test with curl)
- [ ] ✅ Server logs show incoming requests
- [ ] ✅ MongoDB Atlas network access allows connections
- [ ] ✅ Refresh MongoDB Atlas page to see data

## Test Complete Flow

Test the complete flow step by step:

### Test 1: API Webhook Endpoint

```bash
curl -X POST http://localhost:3000/api/iot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "topic": "esp32/data24"
  }'
```

**Expected:** Success response, data appears in MongoDB

### Test 2: Check MongoDB

1. Go to MongoDB Atlas → Browse Collections
2. Navigate to: `mehulapi` → `devicedatas`
3. Refresh page
4. Should see saved data

### Test 3: Check API Logs

In terminal where `npm run dev` is running:
- Look for `POST /api/iot/webhook`
- Look for `Config published` (if config exists)
- Look for MongoDB connection status

## Quick Fix Commands

```bash
# Test webhook directly
./test-save-data.sh

# Check if ngrok is running
ps aux | grep ngrok

# Check MongoDB connection
curl http://localhost:3000/health

# View recent server logs (if logging to file)
tail -f /tmp/api-server.log
```

## Most Likely Issues

1. **AWS IoT Core Rule not set up** - Device sends to IoT Core but rule doesn't forward to API
2. **ngrok not running** (local) - IoT Core can't reach local API
3. **Wrong URL in IoT Rule** - Rule forwards to wrong endpoint
4. **MongoDB not connected** - API receives data but can't save

## Next Steps

1. Check server logs when device sends data
2. Verify AWS IoT Core Rule is configured
3. Test webhook endpoint directly
4. Check MongoDB connection

---

**Quick Test:** Run `./test-save-data.sh` - if this works, your API and MongoDB are fine. The issue is with IoT Core Rule forwarding data.




---

## # 🔧 Troubleshooting

*Source: QUICK_FIX_DEVICE_DATA.md*

# Quick Fix - Device Data Not Reaching MongoDB

Your device sent data but it's not in MongoDB. Here's the quick fix:

## The Problem

✅ **Your API works** - webhook endpoint tested successfully  
✅ **MongoDB works** - can save data manually  
❌ **IoT Core Rule not forwarding** - Device → IoT Core → **???** → Your API

## Quick Fix Steps

### Step 1: Check if AWS IoT Core Rule is Set Up

**Go to AWS Console:**
1. AWS Console → IoT Core → Rules
2. **Do you see a rule for `esp32/+` topics?**
   - If **NO** → Create the rule (see below)
   - If **YES** → Check the rule action (see Step 2)

### Step 2: For Local Testing - Set Up ngrok

Your device sends data to AWS IoT Core, but IoT Core needs a **public HTTPS URL** to forward to your local API.

**Start ngrok:**

```bash
# Terminal 2 (separate from npm run dev)
cd /Users/deckmount/Documents/mehulapi
ngrok http 3000

# You'll see:
# Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

### Step 3: Update AWS IoT Core Rule

1. **Go to:** AWS Console → IoT Core → Rules
2. **Find your rule** (or create new one)
3. **Edit the rule**
4. **Check the HTTPS Action:**
   - URL should be: `https://abc123.ngrok.io/api/iot/webhook`
   - Must include `/api/iot/webhook` at the end
   - Must be HTTPS (not HTTP)

5. **Save the rule**

### Step 4: Test Again

1. **Have your device send data again**
2. **Check your server logs** (terminal where `npm run dev` is running)
3. **Look for:**
   ```
   POST /api/iot/webhook 200
   IoT data received and processed successfully
   ```

**If you see this:** ✅ Data is flowing! Check MongoDB Atlas and refresh.

**If you DON'T see this:** Check rule URL again.

## Quick Setup: Create IoT Core Rule

If you don't have a rule set up:

1. **Go to:** AWS Console → IoT Core → Rules → Create Rule

2. **Configure:**
   - **Name:** `ForwardESP32DataToBackend`
   - **SQL:**
   ```sql
   SELECT 
       *,
       topic() as topic,
       timestamp() as timestamp,
       messageId() as messageId
   FROM 
       'esp32/+'
   ```

3. **Add Action:**
   - "Send a message to an HTTPS endpoint"
   - **URL:** `https://your-ngrok-url.ngrok.io/api/iot/webhook`
   - **Header:** `Content-Type: application/json`

4. **Save**

## Check Your Server Logs

**In the terminal where `npm run dev` is running:**

When your device sends data, you should see:
```
POST /api/iot/webhook 200
IoT data received and processed successfully
Config published to IoT Core topic: esp32/config24 for device: 24
```

**If you see this:** Everything is working! Refresh MongoDB Atlas.

**If you DON'T see this:** IoT Core Rule is not forwarding data.

## Troubleshooting Checklist

Go through this:

- [ ] ✅ Server is running (`npm run dev`)
- [ ] ✅ ngrok is running (if local testing): `ps aux | grep ngrok`
- [ ] ✅ AWS IoT Core Rule exists and is active
- [ ] ✅ Rule SQL matches: `esp32/+`
- [ ] ✅ Rule action URL is correct: `https://ngrok-url/api/iot/webhook`
- [ ] ✅ Rule action URL includes `/api/iot/webhook`
- [ ] ✅ Device is sending data to correct topic: `esp32/data24`
- [ ] ✅ MongoDB Atlas network access allows your IP

## Quick Test

**Test if rule is working:**

1. **Publish test data via AWS IoT Test Client:**
   - Go to: AWS Console → IoT Core → Test (MQTT test client)
   - **Publish to:** `esp32/data24`
   - **Message:**
   ```json
   {
     "device_status": 0,
     "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
   }
   ```

2. **Check your server logs:**
   - Should see `POST /api/iot/webhook 200`

3. **Check MongoDB Atlas:**
   - Refresh page
   - Should see data in `devicedatas` collection

## Most Common Issue

**AWS IoT Core Rule not forwarding to your API**

**Solution:**
1. Set up ngrok (for local): `ngrok http 3000`
2. Create/update IoT Core Rule with ngrok URL
3. Make sure URL includes `/api/iot/webhook`

## Summary

**The issue:** AWS IoT Core receives data from your device, but the Rule is not forwarding it to your API.

**The fix:** 
1. Set up ngrok (for local testing)
2. Configure AWS IoT Core Rule to forward to your API URL
3. Test and verify data flows

---

**Quick Action:** Start ngrok and update your AWS IoT Core Rule URL! That's likely what's missing.




---

## # 🔧 Troubleshooting

*Source: QUICK_FIX_MONGODB.md*

# Quick Fix - MongoDB Connection Issue

Your server is crashing because MongoDB isn't connected. Here are quick solutions:

## Quick Solution: Use MongoDB Atlas (5 minutes, no installation)

This is the **easiest** solution - no local MongoDB needed!

### Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create a free M0 cluster (free tier)

### Step 2: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Step 3: Update .env File

```bash
cd /Users/deckmount/Documents/mehulapi
nano .env
```

Add or update:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mehulapi?retryWrites=true&w=majority
```

Replace:
- `YOUR_USERNAME` with your Atlas username
- `YOUR_PASSWORD` with your Atlas password
- `cluster0.xxxxx` with your actual cluster address

### Step 4: Configure Network Access

In MongoDB Atlas:
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for testing)
   OR add your specific IP address

### Step 5: Restart Your Server

```bash
# Stop the server (Ctrl+C)
# Then start again:
npm run dev
```

You should now see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 3000
```

## Alternative: Test Without MongoDB First

The server now won't crash if MongoDB isn't connected, but data operations will fail.

You can still:
- ✅ Access `http://localhost:3000/` - See API info
- ✅ Access `http://localhost:3000/health` - Health check
- ❌ Data endpoints will fail (need MongoDB)

To test endpoints that save data, you need MongoDB Atlas (see above).

## Verify It's Working

### Test 1: Check API is Running

```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "..."
}
```

### Test 2: Visit in Browser

Open browser: `http://localhost:3000`

You should see API information with all endpoints listed.

### Test 3: Check MongoDB Connection

Look at your terminal - you should see:
```
✅ MongoDB Connected: ...
```

If you see a warning, MongoDB isn't connected yet (use MongoDB Atlas solution above).

## Current Status After Fix

✅ **Server won't crash** if MongoDB isn't connected
✅ **API endpoints are accessible** at `http://localhost:3000`
✅ **Basic endpoints work** without MongoDB
❌ **Data endpoints need MongoDB** (use MongoDB Atlas)

## Next Steps

1. ✅ Set up MongoDB Atlas (5 minutes - recommended)
2. ✅ Update `.env` with connection string
3. ✅ Restart server
4. ✅ Test all endpoints

---

**Need help?** See `SETUP_MONGODB.md` for detailed MongoDB setup instructions.



---

## # 📝 Additional Documentation

*Source: DOCUMENTATION.md*

# 📚 Complete Documentation - CPAP/BIPAP Device Data Management API

**Version:** 1.0.0  
**Last Updated:** December 2024

---

# Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [System Architecture](#system-architecture)
4. [API Reference](#api-reference)
5. [Data Source Tracking](#data-source-tracking)
6. [Setup Guides](#setup-guides)
7. [AWS IoT Core Integration](#aws-iot-core-integration)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Project Structure](#project-structure)

---

# Overview

## What This API Does

A RESTful API for managing CPAP and BIPAP device data that enables:
- 📥 Receive and store device data from CPAP/BIPAP hardware via AWS IoT Core
- 💾 Parse and store structured device data in MongoDB
- ⚙️ Push configuration updates to devices through AWS IoT Core
- 📊 Retrieve device data history with filtering
- 🔄 Track data sources (cloud vs software vs direct)
- 🔗 Webhook endpoint for receiving IoT Core messages

## Key Features

- ✅ Real-time MQTT data reception from AWS IoT Core
- ✅ Automatic data parsing for CPAP/BIPAP devices
- ✅ Device configuration management
- ✅ Push configuration updates to devices via AWS IoT Core
- ✅ Data source identification (cloud/software/direct)
- ✅ Retry logic for database operations
- ✅ Resilient MongoDB connection handling
- ✅ Non-blocking server startup (works even if MongoDB unavailable)

---

# Quick Start

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env` file:**
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

3. **Start the server:**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

## Test the API

```bash
# Health check
curl http://localhost:3000/health

# Send device data
curl -X POST http://localhost:3000/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 1,
    "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
    "device_type": "CPAP",
    "device_id": "cpap_001"
  }'
```

---

# System Architecture

## Architecture Diagram

```
ESP32 Device → MQTT → AWS IoT Core → HTTPS → API Webhook → MongoDB
                              ↕
                        REST API (for applications)
                              ↕
                       AWS IoT Core → ESP32 Device (config)
```

## Data Flow

### Forward Flow: Device → Cloud → API → Database

1. **ESP32 device** sends MQTT message to AWS IoT Core
   - Topic: `esp32/data24`
   - Payload: `{device_status, device_data, device_type}`

2. **AWS IoT Core Rule** forwards to API webhook
   - HTTPS POST to `/api/iot/webhook`
   - Endpoint: `https://backend-production-9c17.up.railway.app/api/iot/webhook`

3. **API receives & processes**
   - Extracts device ID from topic (`esp32/data24` → `24`)
   - Auto-detects device type from data string
   - Parses raw data using `dataParser.js`
   - Marks `data_source: 'cloud'`

4. **Data persistence**
   - Saves to MongoDB `DeviceData` collection
   - Retry logic (3 attempts with exponential backoff)

5. **Configuration check**
   - Checks for pending configuration updates
   - If found, publishes to IoT Core config topic
   - Topic: `esp32/config24`

6. **Device receives config**
   - ESP32 subscribes to config topic
   - Receives configuration update via MQTT

### Reverse Flow: Software → API → AWS IoT → Device

1. **Application** calls API: `POST /api/devices/24/config`
2. **API stores** configuration in MongoDB (`pending_update: true`)
3. **API publishes** to AWS IoT Core topic `esp32/config24`
4. **Device receives** configuration update and updates settings

### Direct API Flow: Software → API → Database

1. **Application** calls API: `POST /api/devices/data`
2. **API processes** and marks `data_source: 'software'`
3. **Data persists** to MongoDB

## Component Breakdown

### 1. Server (`server.js`)
- Express.js application entry point
- Middleware: CORS, JSON parser, Morgan logger
- Routes: `/api/devices/*`, `/api/iot/*`
- MongoDB connection (non-blocking)

### 2. Controllers

**`iotController.js`**
- `receiveIoTData()` - Webhook handler for AWS IoT Core
- Extracts device ID from topic
- Auto-detects device type
- Marks `data_source: 'cloud'`
- Retry logic for DB saves

**`deviceController.js`**
- `receiveDeviceData()` - Direct API handler
- Marks `data_source: 'software'`
- `getDeviceConfig()` - Get device configuration
- `setDeviceConfig()` - Set device configuration
- `getDeviceDataHistory()` - Get history with filtering

### 3. Models

**`DeviceData`** - Device readings
- `device_type`, `device_id`, `device_status`
- `raw_data`, `parsed_data`
- `data_source` (cloud/software/direct)
- `timestamp` (indexed)

**`DeviceConfig`** - Device settings
- `device_id` (unique)
- `config_values` (JSON)
- `pending_update` (boolean)

### 4. Utilities

**`dataParser.js`**
- `parseCPAPData()` - Sections: S, G, H, I
- `parseBIPAPData()` - Sections: S, A, B, C, D, E, F

**`awsIoT.js`**
- `publishDeviceConfig()` - Send config to device
- `publishAcknowledgment()` - Send ack to device

---

# API Reference

## Base URL

- **Local:** `http://localhost:3000`
- **Production:** `https://backend-production-9c17.up.railway.app`

## Endpoints

### Health Check
```
GET /health
```
Returns API status.

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Receive Device Data (Direct API)
```
POST /api/devices/data
```
Receive device data directly from software applications.

**Request Body:**
```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
  "device_type": "CPAP",
  "device_id": "device_001"
}
```

**Response:** `201 Created`
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

**Data Source:** Automatically set to `software`

### Get Device Data History
```
GET /api/devices/:deviceId/data?limit=100&offset=0&data_source=cloud
```

**Query Parameters:**
- `limit` (optional): Number of records (default: 100)
- `offset` (optional): Pagination offset (default: 0)
- `data_source` (optional): Filter by `cloud`, `software`, or `direct`

**Response:** `200 OK`
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

### Get Device Configuration
```
GET /api/devices/:deviceId/config
```

**Response:** `200 OK`
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

**Response:** `200 OK` or `201 Created`
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

**Action:** Automatically publishes to AWS IoT Core config topic

### Mark Configuration as Delivered
```
POST /api/devices/:deviceId/config/delivered
```

**Response:** `200 OK`
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

### IoT Webhook Endpoint
```
POST /api/iot/webhook
```
Webhook endpoint for AWS IoT Core Rule Action (HTTPS).

**Called by:** AWS IoT Core automatically  
**Data Source:** Automatically set to `cloud`

**Request:** (varies based on IoT Rule configuration)
```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,G,12.2,1.0,...",
  "device_type": "CPAP",
  "device_id": "24",
  "topic": "esp32/data24"
}
```

**Response:** `200 OK`

---

# Data Source Tracking

## Overview

Every device data record includes a `data_source` field that identifies where the data came from:

- **`cloud`** = Data from AWS IoT Core (hardware/ESP32 device)
- **`software`** = Data from direct API calls (software/application)
- **`direct`** = Legacy/default value (for backward compatibility)

## How Data Sources are Set

### Cloud Data (`data_source: 'cloud'`)
Automatically set when data comes from AWS IoT Core webhook (`/api/iot/webhook`).

**Flow:**
```
ESP32 Device → AWS IoT Core → API Webhook → MongoDB (data_source: 'cloud')
```

### Software Data (`data_source: 'software'`)
Automatically set when data comes from direct API calls (`POST /api/devices/data`).

**Flow:**
```
Application → POST /api/devices/data → MongoDB (data_source: 'software')
```

## Querying by Data Source

### Using API

**Get only cloud data (from hardware):**
```bash
curl "https://backend-production-9c17.up.railway.app/api/devices/24/data?data_source=cloud&limit=10"
```

**Get only software data (from applications):**
```bash
curl "https://backend-production-9c17.up.railway.app/api/devices/24/data?data_source=software&limit=10"
```

**Get all data:**
```bash
curl "https://backend-production-9c17.up.railway.app/api/devices/24/data?limit=10"
```

### Using MongoDB

**Get cloud data:**
```javascript
db.devicedatas.find({ 
  device_id: "24", 
  data_source: "cloud" 
}).sort({ timestamp: -1 }).limit(10)
```

**Get software data:**
```javascript
db.devicedatas.find({ 
  device_id: "24", 
  data_source: "software" 
}).sort({ timestamp: -1 }).limit(10)
```

**Count by source:**
```javascript
db.devicedatas.aggregate([
  {
    $match: { device_id: "24" }
  },
  {
    $group: {
      _id: "$data_source",
      count: { $sum: 1 },
      latest: { $max: "$timestamp" }
    }
  }
])
```

---

# Setup Guides

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)

1. **Create Account:** https://www.mongodb.com/cloud/atlas
2. **Create Free Cluster:** M0 (Free tier)
3. **Create Database User:**
   - Database Access → Add New Database User
   - Username: `mehulapi`
   - Password: Generate secure password
4. **Whitelist IP Addresses:**
   - Network Access → Add IP Address
   - For Railway: `0.0.0.0/0` (Allow from anywhere)
   - For local testing: Add your IP
5. **Get Connection String:**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your password
   - Example: `mongodb+srv://mehulapi:password@cluster.mongodb.net/mehulapi`

6. **Update `.env`:**
```env
MONGODB_URI=mongodb+srv://mehulapi:password@cluster.mongodb.net/mehulapi
```

### Option 2: Local MongoDB

1. **Install MongoDB:** https://www.mongodb.com/try/download/community
2. **Start MongoDB:**
```bash
mongod
```

3. **Update `.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/mehulapi
```

---

# AWS IoT Core Integration

## Prerequisites

- AWS Account with IoT Core enabled
- AWS IAM user/role with IoT Core permissions
- Backend API deployed and accessible via HTTPS

## AWS Credentials Setup

1. **Get AWS Access Keys:**
   - AWS Console → IAM → Users → Create User
   - Attach policy: `AWSIoTDataAccess`
   - Create access key

2. **Get IoT Endpoint:**
   - AWS Console → IoT Core → Settings
   - Copy "Device data endpoint" (without `https://`)
   - Example: `xxxxxx-ats.iot.us-east-1.amazonaws.com`

3. **Update `.env`:**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_IOT_ENDPOINT=xxxxxx-ats.iot.us-east-1.amazonaws.com
```

## Create IoT Core Rule

### Step 1: Create Rule

1. Go to AWS Console → IoT Core → Rules
2. Click "Create rule"
3. **Name:** `ForwardDeviceDataToAPI`
4. **SQL Version:** 2016-03-23
5. **SQL Statement:**
```sql
SELECT 
  device_status,
  device_data,
  device_type,
  device_id,
  topic() as topic
FROM 'esp32/data+'
```

### Step 2: Configure HTTPS Action

1. Under "Actions", click "Add action"
2. Select "Send a message to an HTTPS endpoint"
3. **Configure:**
   - **URL:** `https://backend-production-9c17.up.railway.app/api/iot/webhook`
   - **HTTP Header:**
     - Key: `Content-Type`
     - Value: `application/json`
   - **Authentication:** None (or configure if API requires auth)
4. Click "Create role" if needed
5. Save the rule

### Step 3: Test

1. Use AWS IoT Test client to publish test message:
   - Topic: `esp32/data24`
   - Message:
```json
{
  "device_status": 0,
  "device_data": "*,R,181125,1124,AUTOMODE,G,8.5,1.0,H,6.4,6.4,12.0,1.0,I,10.0,3.0,1.0,1.0,0.0,1.0,1.0,12345678 C,#",
  "device_type": "CPAP",
  "device_id": "24"
}
```

2. Check MongoDB Atlas for saved data
3. Check API logs for webhook reception

## MQTT Topics

### Device Data Topics (Subscribed by IoT Rule)
- `esp32/data24` - Device 24 data
- `esp32/data+` - Pattern for all devices (wildcard)
- `devices/{device_id}/data` - Alternative format

### Configuration Topics (Published by API)
- `esp32/config24` - Device 24 configuration
- `devices/{device_id}/config/update` - Alternative format

### Acknowledgment Topics
- `esp32/ack24` - Device 24 acknowledgment
- `devices/{device_id}/ack` - Alternative format

---

# Deployment

## Railway Deployment (Recommended)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/mehulapi.git
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `mehulapi` repository
5. Railway auto-detects Node.js and starts deploying

### Step 3: Configure Environment Variables

In Railway dashboard → Variables tab, add:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mehulapi
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_IOT_ENDPOINT=xxxxxx-ats.iot.us-east-1.amazonaws.com
```

### Step 4: Get Production URL

1. Go to Railway dashboard → Settings
2. Railway provides a domain: `mehulapi-production.up.railway.app`
3. Or add custom domain in "Domains" section

### Step 5: Update AWS IoT Core Rule

1. Go to AWS IoT Core Console → Rules
2. Edit your rule
3. Update HTTPS endpoint to:
   ```
   https://mehulapi-production.up.railway.app/api/iot/webhook
   ```
4. Save rule

### Step 6: Test Production API

```bash
curl https://mehulapi-production.up.railway.app/health
```

## Railway Advantages

✅ Automatic HTTPS (SSL certificates included)  
✅ Auto-deploy on every git push  
✅ Free tier ($5 credit monthly)  
✅ Easy scaling  
✅ Built-in log viewer  
✅ Simple environment variable management

---

# Troubleshooting

## MongoDB Connection Issues

### Error: `ECONNREFUSED`

**Solution:**
1. Check if MongoDB is running (local) or accessible (Atlas)
2. Verify `MONGODB_URI` in `.env` is correct
3. For Atlas: Whitelist your IP address
4. For Railway: Whitelist `0.0.0.0/0` in Atlas Network Access

### Server Starts Without MongoDB

This is **normal**. The API is designed to start even if MongoDB is unavailable. Check logs for connection status.

## AWS IoT Core Issues

### Data Not Saving to MongoDB

**Check:**
1. AWS IoT Core Rule is enabled
2. Rule SQL query matches your topic pattern
3. Rule HTTPS endpoint URL is correct (includes `/api/iot/webhook`)
4. Railway logs show incoming webhook requests
5. MongoDB Atlas Network Access allows Railway IPs (`0.0.0.0/0`)

### Error: `Invalid character in header content ["authorization"]`

**Solution:**
- Clean AWS credentials in Railway Variables
- Remove any whitespace, newlines, or special characters
- Ensure credentials are correctly formatted

## Railway Deployment Issues

### Build Fails

**Check:**
1. `package.json` has correct `start` script
2. Dependencies are in `package.json`
3. Node.js version compatibility

### API Not Accessible (502 Error)

**Check:**
1. Railway deployment status
2. MongoDB Atlas Network Access (`0.0.0.0/0`)
3. Railway logs for errors
4. Server is listening on `0.0.0.0` (configured in `server.js`)

### Environment Variables Not Working

1. Make sure variables are set in Railway dashboard → Variables
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)

## Data Not Appearing in MongoDB

**Verify:**
1. Data is reaching API (check Railway logs)
2. MongoDB connection is established
3. Data format is correct (device_status, device_data required)
4. Check data_source field to identify source
5. Query with correct device_id

---

# Project Structure

```
mehulapi/
├── config/
│   ├── database.js          # MongoDB connection configuration
│   └── awsIoT.js            # AWS IoT Core client
├── controllers/
│   ├── deviceController.js  # Device data and config handlers
│   └── iotController.js     # IoT webhook handler
├── models/
│   ├── DeviceData.js        # Device data schema
│   └── DeviceConfig.js      # Device configuration schema
├── routes/
│   ├── deviceRoutes.js      # Device API routes
│   └── iotRoutes.js         # IoT webhook routes
├── utils/
│   └── dataParser.js        # CPAP/BIPAP data parsing logic
├── examples/
│   └── test-api.js          # Example API client code
├── aws-iot/
│   └── cpap.ino             # ESP32 Arduino sketch
├── .env                     # Environment variables (create this)
├── .gitignore
├── package.json
├── railway.json             # Railway configuration
├── server.js                # Express server entry point
└── DOCUMENTATION.md         # This file
```

---

# Device Data Format

## CPAP Device Data

Format:
```
*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#
```

Sections:
- **S** - Metadata (Date: 141125, Time: 1447)
- **G** - Pressure settings (IPAP: 12.2, Ramp: 1.0)
- **H** - Flow settings
- **I** - Device settings (humidity, temperature, etc.)

## BIPAP Device Data

Format:
```
*,S,141125,1447,A,12.2,1.0,B,29.6,10.8,10.6,40.0,10.0,10.0,13.0,1.0,C,16.0,...#
```

Sections:
- **S** - Metadata (Date and Time)
- **A** - Pressure settings
- **B** - Ventilation parameters
- **C, D, E, F** - Additional device-specific parameters

---

# Technology Stack

- **Backend:** Node.js (v18+), Express.js (v4.18.2)
- **Database:** MongoDB Atlas, Mongoose (v8.0.3)
- **AWS:** AWS IoT Core, AWS SDK for JavaScript (v3.490.0)
- **Deployment:** Railway (Cloud hosting)
- **Development:** nodemon (auto-reload)

---

# Environment Variables

Required variables (`.env` or Railway Variables):

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database

# AWS IoT Core
AWS_IOT_ENDPOINT=xxxxxx-ats.iot.us-east-1.amazonaws.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

---

# Performance Considerations

## Database Indexes

- Compound index: `{device_id: 1, timestamp: -1}`
- Separate indexes: `device_id`, `timestamp`, `data_source`

## Pagination

- Default limit: 100 records
- Offset-based pagination for large datasets
- Efficient queries with `.sort()`, `.limit()`, `.skip()`

---

# Security Considerations

1. **Environment Variables:** Secrets stored securely (not in code)
2. **CORS:** Configured for cross-origin requests (customize as needed)
3. **Input Validation:** All inputs validated before processing
4. **Error Messages:** Production errors don't expose stack traces
5. **AWS Credentials:** Stored securely, never in git repository

---

# Future Enhancements

1. Authentication/Authorization (JWT tokens, API keys)
2. Rate Limiting
3. WebSocket Support (real-time bidirectional communication)
4. Data Analytics (aggregated statistics and reports)
5. Multi-tenancy (support multiple organizations/users)
6. Device Management (CRUD operations for devices)
7. Alerting (notifications for device anomalies)
8. Data Export (CSV/Excel export functionality)

---

# Support & Resources

- **GitHub Repository:** https://github.com/yourusername/mehulapi
- **Production API:** https://backend-production-9c17.up.railway.app
- **Health Check:** `GET /health`
- **API Info:** `GET /`

---

**License:** ISC



---

**End of Documentation**

