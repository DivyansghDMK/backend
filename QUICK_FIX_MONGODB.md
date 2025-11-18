# Quick Fix - MongoDB Connection Issue

Your server is crashing because MongoDB isn't connected. Here are quick solutions:

## Quick Solution: Use MongoDB Atlas (5 minutes, no installation)

This is the **easiest** solution - no local MongoDB needed!

### Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create a free M0 cluster (free tier)

### Step 2: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Step 3: Update .env File

```bash
cd /Users/deckmount/Documents/mehulapi
nano .env
```

Add or update:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mehulapi?retryWrites=true&w=majority
```

Replace:
- `YOUR_USERNAME` with your Atlas username
- `YOUR_PASSWORD` with your Atlas password
- `cluster0.xxxxx` with your actual cluster address

### Step 4: Configure Network Access

In MongoDB Atlas:
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for testing)
   OR add your specific IP address

### Step 5: Restart Your Server

```bash
# Stop the server (Ctrl+C)
# Then start again:
npm run dev
```

You should now see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 3000
```

## Alternative: Test Without MongoDB First

The server now won't crash if MongoDB isn't connected, but data operations will fail.

You can still:
- ✅ Access `http://localhost:3000/` - See API info
- ✅ Access `http://localhost:3000/health` - Health check
- ❌ Data endpoints will fail (need MongoDB)

To test endpoints that save data, you need MongoDB Atlas (see above).

## Verify It's Working

### Test 1: Check API is Running

```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "..."
}
```

### Test 2: Visit in Browser

Open browser: `http://localhost:3000`

You should see API information with all endpoints listed.

### Test 3: Check MongoDB Connection

Look at your terminal - you should see:
```
✅ MongoDB Connected: ...
```

If you see a warning, MongoDB isn't connected yet (use MongoDB Atlas solution above).

## Current Status After Fix

✅ **Server won't crash** if MongoDB isn't connected
✅ **API endpoints are accessible** at `http://localhost:3000`
✅ **Basic endpoints work** without MongoDB
❌ **Data endpoints need MongoDB** (use MongoDB Atlas)

## Next Steps

1. ✅ Set up MongoDB Atlas (5 minutes - recommended)
2. ✅ Update `.env` with connection string
3. ✅ Restart server
4. ✅ Test all endpoints

---

**Need help?** See `SETUP_MONGODB.md` for detailed MongoDB setup instructions.

