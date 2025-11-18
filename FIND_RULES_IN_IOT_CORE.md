# Where to Find Rules in AWS IoT Core

## Step-by-Step Navigation

### Step 1: Find Rules Section

In the AWS IoT Core console (where you are now):

1. **Look at the LEFT SIDEBAR** (AWS IoT navigation pane)

2. **Click on "Manage"** section (expand it if collapsed)

3. **Look for "Rules"** - it should be listed under "Manage" or under "Message routing"

   **OR**

4. **Alternative path:**
   - Click **"Message routing"** (under "Manage")
   - Then click **"Rules"** (if it appears as a sub-item)

### Step 2: Create Rule

Once you're in the Rules section:

1. **Click "Create rule"** button (usually top right)

2. **Fill in the rule details:**
   - **Rule name:** `ForwardESP32DataToBackend`
   - **SQL statement:** See below
   - **Actions:** See below

3. **Save the rule**

## Quick Visual Guide

```
AWS IoT Core Console
├── Monitor
├── Connect
├── Test
│   └── MQTT test client (you use this to see messages)
└── Manage  ← CLICK HERE
    ├── All devices
    ├── Greengrass devices
    ├── Software packages
    ├── Remote actions
    ├── Message routing
    └── Rules  ← GO HERE (or click Message routing first)
```

## If Rules is Not Visible

If you don't see "Rules" directly:

1. **Click "Message routing"** (under "Manage")
2. **Then click "Rules"** (it should appear there)

## What to Put in the Rule

### Rule Name:
```
ForwardESP32DataToBackend
```

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

### Action:
1. Click **"Add action"**
2. Select **"Send a message to an HTTPS endpoint"**
3. **URL:** `https://YOUR-NGROK-URL.ngrok.io/api/iot/webhook`
   *(Replace with your actual ngrok URL)*
4. **HTTP Header:**
   - Key: `Content-Type`
   - Value: `application/json`
5. Click **"Create role"** (if prompted)
6. Click **"Add action"**

### Save:
Click **"Create rule"** at the bottom

## Quick Navigation Checklist

- [ ] Open AWS IoT Core console
- [ ] Click **"Manage"** in left sidebar
- [ ] Find and click **"Rules"** (or click "Message routing" first, then "Rules")
- [ ] Click **"Create rule"** button
- [ ] Fill in rule name, SQL, and action
- [ ] Save rule

---

**That's it!** Once the rule is created, data from your device will automatically flow to your API and save in MongoDB!


