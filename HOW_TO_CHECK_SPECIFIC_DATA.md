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

