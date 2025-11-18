# Quick Start: AWS IoT Core Integration

## Complete Data Flow

```
┌─────────┐         ┌──────────────┐         ┌──────────┐         ┌─────────┐
│ Device  │ ────>   │ AWS IoT Core │ ────>   │ Backend  │ ────>   │ MongoDB │
│         │ Publish │              │ Rule    │   API    │         │         │
│         │         │              │ HTTPS   │          │         │         │
└─────────┘         └──────────────┘         └──────────┘         └─────────┘
                           │                         │
                           │                         │ Publish Config
                           │                         │
                           v                         v
                    ┌──────────────┐         ┌──────────┐
                    │  Device      │ <────   │  IoT     │
                    │  Receives    │         │  Core    │
                    │  Config      │         │  Topic   │
                    └──────────────┘         └──────────┘
```

## Step 1: Configure Environment

Add to your `.env` file:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_IOT_ENDPOINT=xxxxxx-ats.iot.us-east-1.amazonaws.com
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up AWS IoT Core Rule

### Create IoT Core Rule

1. Go to AWS Console → IoT Core → Rules
2. Click "Create rule"
3. Configure:
   - **Name**: `ForwardDeviceDataToBackend`
   - **SQL Version**: 2016-03-23
   - **SQL Statement**:
   ```sql
   SELECT 
       *,
       topic() as topic,
       timestamp() as timestamp,
       messageId() as messageId
   FROM 
       'devices/+/data'
   ```

4. **Add Action**: "Send a message to an HTTPS endpoint"
   - **URL**: `https://your-api-domain.com/api/iot/webhook`
   - **HTTP Header**: `Content-Type: application/json`
   - Create IAM role if prompted

## Step 4: Device Configuration

### Device Publishing (Send Data)

Devices should publish to topic: `devices/{device_id}/data`

**Message Format:**
```json
{
  "device_status": 1,
  "device_data": "*,S,141125,1447,G,12.2,1.0,H,10.6,10.6,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,#",
  "device_type": "CPAP",
  "device_id": "cpap_001"
}
```

### Device Subscription (Receive Config)

Devices should subscribe to topic: `devices/{device_id}/config/update`

When backend sets a configuration, it will publish to this topic automatically.

## Step 5: Test the Integration

### Test 1: Send Device Data via IoT Core

Use AWS IoT Test Client or MQTT client:

1. Connect to IoT Core
2. Publish to topic: `devices/test_device/data`
3. Use the message format above
4. Check backend API logs - data should be saved

### Test 2: Set Device Configuration

```bash
curl -X POST http://localhost:3000/api/devices/test_device/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 14.0,
      "humidity": 6.0
    }
  }'
```

Check IoT Core Test Client - message should appear on topic `devices/test_device/config/update`

## What Happens Automatically

1. **Device sends data** → IoT Core receives it
2. **IoT Core Rule** → Forwards to backend `/api/iot/webhook`
3. **Backend** → Parses, saves to MongoDB
4. **Backend** → Checks for pending config updates
5. **If config exists** → Publishes to IoT Core topic
6. **Device receives** → Config update on subscribed topic

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/iot/webhook` | POST | Receive data from IoT Core |
| `/api/devices/data` | POST | Direct device data (alternative) |
| `/api/devices/:id/config` | POST | Set config (publishes to IoT Core) |
| `/api/devices/:id/config` | GET | Get current config |
| `/api/devices/:id/data` | GET | Get device data history |

## Troubleshooting

**Data not reaching backend:**
- Check IoT Core Rule is active
- Verify webhook URL is correct and accessible
- Check IAM role permissions

**Config not being published:**
- Verify `AWS_IOT_ENDPOINT` in `.env`
- Check AWS credentials are valid
- Review backend logs for errors

**Device not receiving config:**
- Verify device is subscribed to `devices/{id}/config/update`
- Check device certificate permissions
- Verify message published in IoT Core test client

## Next Steps

1. Deploy backend API to production (required for IoT Core HTTPS action)
2. Set up device certificates in IoT Core
3. Configure device firmware to use IoT Core
4. Set up monitoring and alerts
5. See [AWS_IOT_SETUP.md](./AWS_IOT_SETUP.md) for detailed configuration

