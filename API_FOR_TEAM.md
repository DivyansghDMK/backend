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


