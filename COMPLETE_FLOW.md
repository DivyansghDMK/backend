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

