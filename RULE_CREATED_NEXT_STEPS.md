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

