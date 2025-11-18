# Setup AWS IoT Rule via CLI (If Console Doesn't Work)

## Prerequisites

1. **AWS CLI installed:**
   ```bash
   aws --version
   ```
   If not installed: `brew install awscli`

2. **AWS credentials configured:**
   ```bash
   aws configure
   ```
   Enter your:
   - Access Key ID: `your_access_key_here`
   - Secret Access Key: `your_secret_key_here`
   - Default region: `us-east-1`
   - Default output format: `json`

3. **ngrok running:**
   ```bash
   ngrok http 3000
   ```
   Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

## Step 1: Update Rule Document

Edit `rule-document.json`:

1. Replace `YOUR-NGROK-URL` with your actual ngrok URL
2. Example:
   ```json
   "url": "https://abc123.ngrok.io/api/iot/webhook"
   ```

## Step 2: Create Rule

```bash
cd /Users/deckmount/Documents/mehulapi

aws iot create-topic-rule \
  --rule-name ForwardESP32DataToBackend \
  --topic-payload file://rule-document.json \
  --region us-east-1
```

**Expected output:**
```json
{
    "ResponseMetadata": {
        "HTTPStatusCode": 200,
        ...
    }
}
```

## Step 3: Verify Rule Created

```bash
aws iot get-topic-rule \
  --rule-name ForwardESP32DataToBackend \
  --region us-east-1
```

## Step 4: Test It

1. Your device sends data to `esp32/data24`
2. Check server logs: Should see `POST /api/iot/webhook 200`
3. Check MongoDB Atlas: Refresh → See your data!

## Update Rule (If ngrok URL Changes)

```bash
# Edit rule-document.json with new URL

aws iot replace-topic-rule \
  --rule-name ForwardESP32DataToBackend \
  --topic-payload file://rule-document.json \
  --region us-east-1
```

## Delete Rule (If Needed)

```bash
aws iot delete-topic-rule \
  --rule-name ForwardESP32DataToBackend \
  --region us-east-1
```

## List All Rules

```bash
aws iot list-topic-rules --region us-east-1
```

---

**That's it!** The rule will forward all messages from `esp32/+` topics to your API.


