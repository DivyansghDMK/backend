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


