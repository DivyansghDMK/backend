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

