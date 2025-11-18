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


