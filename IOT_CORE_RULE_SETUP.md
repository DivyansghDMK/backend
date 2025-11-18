# AWS IoT Core Rule Setup - Step by Step

This guide shows you exactly how to set up the AWS IoT Core Rule to forward device data from your ESP32 hardware to your backend API.

## Complete Data Flow

```
ESP32 Hardware → AWS IoT Core (esp32/data24) 
    ↓
AWS IoT Core Rule (forwards automatically)
    ↓
Backend API (/api/iot/webhook)
    ↓
MongoDB (saves data)
    ↓
Backend checks for config updates
    ↓
Backend publishes to AWS IoT Core (esp32/config24)
    ↓
ESP32 Hardware (subscribes and receives config)
    ↓
Hardware Updates ✅
```

## Step-by-Step Setup

### Step 1: Open AWS IoT Core Console

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **IoT Core** service
3. Make sure you're in the **us-east-1** region (or your configured region)
4. Click on **Rules** in the left sidebar

### Step 2: Create New Rule

1. Click the **"Create rule"** button (orange button at the top right)
2. Fill in the rule details:

**Rule name:**
```
ForwardESP32DataToBackend
```

**Description (optional):**
```
Forwards all ESP32 device data from esp32/+ topics to backend API
```

**Rule query statement:**

Use this SQL query:
```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'esp32/+'
```

This will match all topics starting with `esp32/` (like `esp32/data24`, `esp32/data25`, etc.)

### Step 3: Configure Rule Action (HTTPS)

1. Scroll down to **"Set one or more actions"**
2. Click **"Add action"**
3. Select **"Send a message to an HTTPS endpoint"**
4. Click **"Configure action"**

#### Action Configuration:

**URL:**
```
https://your-backend-url.com/api/iot/webhook
```

**Note:** Replace `your-backend-url.com` with your actual backend API URL. 
- For local testing with ngrok: `https://your-ngrok-url.ngrok.io/api/iot/webhook`
- For production: `https://api.yourdomain.com/api/iot/webhook`

**HTTP header:**
- Click **"Add HTTP header"**
- **Key:** `Content-Type`
- **Value:** `application/json`

**Confirmation required for HTTPS endpoint:** Leave unchecked (or check if you want confirmations)

**Authentication method:**
- Select **"None"** (or configure API key if your backend requires authentication)

5. Click **"Add action"** button
6. If prompted, click **"Create new role"** or select existing role for IoT Core to access HTTPS endpoint

### Step 4: Review and Create

1. Review all settings
2. Click **"Create rule"** at the bottom

### Step 5: Test the Rule

#### Test 1: Using AWS IoT Test Client

1. Go to **"Test" → "MQTT test client"** in IoT Core
2. Subscribe to topic: `esp32/config24` (to see if config gets published)
3. Publish a test message to `esp32/data24`:

```json
{
  "device_status": 0,
  "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#"
}
```

4. Check your backend logs - you should see:
   - Request received at `/api/iot/webhook`
   - Data saved to MongoDB
   - Config check performed

#### Test 2: Set Configuration

1. Set a configuration via API:

```bash
curl -X POST http://localhost:3000/api/devices/24/config \
  -H "Content-Type: application/json" \
  -d '{
    "device_type": "CPAP",
    "config_values": {
      "pressure": 15.0,
      "humidity": 6.0,
      "mode": "MANUALMODE"
    }
  }'
```

2. Publish another test message to `esp32/data24` (from Test 1)
3. Check `esp32/config24` topic - you should see the config message!

## Verifying the Setup

### Check Rule Status

1. Go to **IoT Core → Rules**
2. Find your rule: `ForwardESP32DataToBackend`
3. Status should be **"Active"** (green)

### Check CloudWatch Logs (if enabled)

1. Go to **CloudWatch → Log groups**
2. Look for log group: `/aws/iot/rules/ForwardESP32DataToBackend`
3. Check for any errors

### Monitor Backend Logs

Your backend should log:
```
IoT data received and processed successfully
Config published to IoT Core topic: esp32/config24 for device: 24
```

## Troubleshooting

### Rule Not Forwarding Messages

**Problem:** Messages published to `esp32/data24` are not reaching backend

**Solutions:**
1. Check rule SQL matches `esp32/+` pattern
2. Verify rule status is "Active"
3. Check backend URL is accessible (test with curl)
4. Review CloudWatch logs for rule errors
5. Verify IAM role has permission to call HTTPS endpoint

### Backend Not Receiving Data

**Problem:** Backend endpoint `/api/iot/webhook` not receiving requests

**Solutions:**
1. Test backend URL directly:
   ```bash
   curl -X POST https://your-backend-url.com/api/iot/webhook \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```
2. Check if backend is running and accessible
3. Verify HTTPS endpoint URL in rule action
4. Check firewall/security group settings
5. Use ngrok for local testing if needed

### Config Not Being Published

**Problem:** Config exists but not published to IoT Core

**Solutions:**
1. Verify `AWS_IOT_ENDPOINT` in `.env` file
2. Check AWS credentials are valid
3. Verify `pending_update: true` in MongoDB config
4. Check backend logs for publish errors
5. Test IoT publish manually:
   ```bash
   node scripts/verify-iot-connection.js
   ```

## Alternative: Using Lambda Function

If HTTPS endpoint doesn't work, you can use Lambda function instead:

1. Create Lambda function (use code from `aws-iot/lambda-function.js`)
2. Set environment variable: `BACKEND_API_URL=https://your-api-url.com`
3. In IoT Core Rule action, select **"Send a message to a Lambda function"**
4. Select your Lambda function

## Quick Reference

### Topic Patterns

| Device Topic | Config Topic | Rule Pattern |
|--------------|--------------|--------------|
| `esp32/data24` | `esp32/config24` | `esp32/+` |
| `esp32/data25` | `esp32/config25` | `esp32/+` |
| `esp32/24` | `esp32/config24` | `esp32/+` |

### Rule SQL

```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'esp32/+'
```

### Backend Endpoint

```
POST https://your-backend-url.com/api/iot/webhook
```

### Expected Message Format

```json
{
  "device_status": 0,
  "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
  "topic": "esp32/data24",
  "timestamp": "2025-11-15T12:00:00Z",
  "messageId": "msg-12345"
}
```

## Next Steps

1. ✅ Create IoT Core Rule (follow steps above)
2. ✅ Test with AWS IoT Test Client
3. ✅ Set device configuration via API
4. ✅ Verify config gets published to `esp32/config24`
5. ✅ Configure ESP32 hardware to subscribe to `esp32/config24`
6. ✅ Test complete end-to-end flow

Once the rule is set up, your hardware will automatically forward data to the backend, and the backend will automatically push configuration updates back through IoT Core to your hardware!

