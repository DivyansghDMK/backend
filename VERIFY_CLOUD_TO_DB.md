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

