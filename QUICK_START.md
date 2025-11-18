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

