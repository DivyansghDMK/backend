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

