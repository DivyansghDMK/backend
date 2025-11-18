# Complete Rule Setup - Step by Step Guide

You're on the "Create rule" page. Follow these exact steps:

## Step 1: Specify Rule Properties (Current Step)

**You're here!** Fill in:

### Rule name:
```
ForwardESP32DataToBackend
```
*(Delete "AWS" and type the name above)*

### Rule description (optional):
```
Forwards ESP32 device data from esp32/+ topics to backend API webhook
```

**Then click:** "Next" button (bottom right)

---

## Step 2: Configure Rule Query Statement

### SQL Version:
Select: **2016-03-23** (or latest available)

### SQL Statement:
```sql
SELECT 
    *,
    topic() as topic,
    timestamp() as timestamp,
    messageId() as messageId
FROM 
    'esp32/+'
```

**Copy and paste the SQL above into the SQL statement field**

**Then click:** "Next" button

---

## Step 3: Configure Actions

**Important:** You need ngrok running for this step!

### Before this step - Start ngrok:

**Open a NEW terminal** (keep npm run dev running):

```bash
# If ngrok not authenticated, sign up first:
# Go to: https://dashboard.ngrok.com/signup
# Get authtoken, then run:
ngrok config add-authtoken YOUR_AUTHTOKEN

# Start ngrok
ngrok http 3000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

---

### In AWS Console - Step 3:

1. **Click:** "Add action" button

2. **Select action type:**
   - Choose: **"Send a message to an HTTPS endpoint"**
   - Click it

3. **Configure HTTPS action:**

   **URL:**
   ```
   https://YOUR-NGROK-URL.ngrok.io/api/iot/webhook
   ```
   *(Replace YOUR-NGROK-URL with your actual ngrok URL)*
   
   **Example:** `https://abc123.ngrok.io/api/iot/webhook`

   **HTTP Headers:**
   - Click "Add HTTP header"
   - **Key:** `Content-Type`
   - **Value:** `application/json`

   **Confirmation required:**
   - Leave unchecked (unless you want confirmations)

4. **IAM Role:**
   - Click **"Create role"** or **"Create new role"** (if prompted)
   - AWS will create an IAM role automatically
   - Role name will be something like: `IoT_HTTPS_Action_Role`

5. **Click:** "Add action" button

6. **Then click:** "Next" button

---

## Step 4: Review and Create

1. **Review all settings:**
   - Rule name: `ForwardESP32DataToBackend`
   - SQL: `SELECT *, topic() as topic... FROM 'esp32/+'`
   - Action: HTTPS endpoint with your ngrok URL

2. **Click:** "Create" button (bottom right)

---

## After Creating the Rule

### Test It:

1. **Make sure your server is running:**
   ```bash
   npm run dev
   ```

2. **Make sure ngrok is running:**
   ```bash
   ngrok http 3000
   ```

3. **Device sends data** to `esp32/data24`

4. **Check server logs:**
   - Should see: `POST /api/iot/webhook 200`
   - Should see: `IoT data received and processed successfully`

5. **Check MongoDB Atlas:**
   - Go to: MongoDB Atlas → Browse Collections
   - Navigate to: `mehulapi` → `devicedatas`
   - **Refresh** → Should see your data!

---

## Summary of What You're Setting Up

**Rule Name:** `ForwardESP32DataToBackend`

**What it does:**
- Listens to ALL messages on topics starting with `esp32/`
- Forwards them to: `https://your-ngrok-url.ngrok.io/api/iot/webhook`
- Your API receives the data and saves it to MongoDB

**Flow:**
```
ESP32 Device → esp32/data24
    ↓
AWS IoT Core Rule (your new rule)
    ↓
Your API (via ngrok)
    ↓
MongoDB Atlas (saved!)
```

---

## If You Need to Update Rule Later

1. Go to Rules page
2. Click on your rule name: `ForwardESP32DataToBackend`
3. Click "Edit"
4. Update the URL if ngrok URL changes
5. Save

---

**Ready? Follow the steps above to complete your rule!** 🚀

