# MongoDB Setup - Simple Guide

Choose the easiest option for you:

## Option 1: MongoDB Atlas (Cloud - Recommended) ⭐⭐⭐

**Best option!** No installation needed, free tier available, works from anywhere.

### Step-by-Step Setup (5 minutes)

#### Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Click "Try Free"
3. Sign up with:
   - Email
   - Password
   - Name
4. Click "Get started free"

#### Step 2: Create Free Cluster

1. On the welcome screen, choose:
   - **Cloud Provider:** AWS
   - **Region:** Choose closest to you (e.g., `N. Virginia (us-east-1)`)
   - **Cluster Tier:** Select **M0 FREE** (it's free forever!)
   - **Cluster Name:** Leave default or change to `mehulapi-cluster`
2. Click "Create Cluster"
3. Wait 3-5 minutes for cluster to be created

#### Step 3: Create Database User

1. On the security screen, click "Create Database User"
2. Choose "Password" authentication
3. Enter:
   - **Username:** (e.g., `mehulapi_user`)
   - **Password:** (Create a strong password - **SAVE THIS!**)
   - Click "Create Database User"

**⚠️ Important:** Save your username and password! You'll need them.

#### Step 4: Configure Network Access

1. On "Network Access" screen, click "Add IP Address"
2. Click "Allow Access from Anywhere" button (for testing)
   - This allows connection from any IP address
   - For production, you can restrict to specific IPs later
3. Click "Confirm"

#### Step 5: Get Connection String

1. Click "Finish and Close" (cluster is ready!)
2. On the Atlas dashboard, click "Connect" button
3. Choose "Connect your application"
4. Select:
   - **Driver:** Node.js
   - **Version:** 5.5 or later
5. Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

#### Step 6: Update Your .env File

1. Open your `.env` file:
   ```bash
   cd /Users/deckmount/Documents/mehulapi
   nano .env
   # or use your editor
   ```

2. Update or add `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mehulapi?retryWrites=true&w=majority
   ```

   **Replace:**
   - `username` with your database username
   - `password` with your database password
   - `cluster0.xxxxx` with your actual cluster address
   - **Important:** Add `/mehulapi` before `?retryWrites` (this is your database name)

3. Save the file (Ctrl+X, then Y, then Enter in nano)

#### Step 7: Test the Connection

1. Restart your server:
   ```bash
   # Stop server (Ctrl+C if running)
   npm run dev
   ```

2. You should see:
   ```
   ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
   Server running on port 3000
   ```

3. Test it:
   ```bash
   curl http://localhost:3000/health
   ```

**Done!** ✅ Your MongoDB is now set up and connected!

---

## Option 2: Install MongoDB Locally (macOS)

If you prefer local MongoDB installation:

### Step 1: Install MongoDB

#### Using Homebrew (Easiest)

```bash
# Tap MongoDB formula
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0
```

#### Manual Installation

1. Download MongoDB Community Server:
   - Go to: https://www.mongodb.com/try/download/community
   - Select: macOS, ARM64 (for M1/M2 Macs) or x86_64 (for Intel Macs)
   - Download `.tgz` file

2. Extract and install:
   ```bash
   # Extract
   tar -zxvf mongodb-macos-*.tgz
   
   # Move to /usr/local
   sudo mv mongodb-macos-* /usr/local/mongodb
   
   # Add to PATH (add to ~/.zshrc)
   echo 'export PATH=/usr/local/mongodb/bin:$PATH' >> ~/.zshrc
   source ~/.zshrc
   ```

3. Create data directory:
   ```bash
   sudo mkdir -p /data/db
   sudo chown $(whoami) /data/db
   ```

4. Start MongoDB:
   ```bash
   mongod --dbpath /data/db
   ```

### Step 2: Verify MongoDB is Running

```bash
# Check if MongoDB is running
ps aux | grep mongod

# Or test connection
mongosh
# Should connect successfully
```

### Step 3: Update Your .env File

```env
MONGODB_URI=mongodb://localhost:27017/mehulapi
```

### Step 4: Test Connection

Restart your server:
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
Server running on port 3000
```

---

## Option 3: Using Docker (Alternative)

If you have Docker installed:

```bash
# Run MongoDB in Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  mongo:7.0

# Update .env
MONGODB_URI=mongodb://localhost:27017/mehulapi
```

---

## Verification Checklist

After setup, verify:

- [ ] ✅ MongoDB Atlas cluster created (or local MongoDB running)
- [ ] ✅ Database user created
- [ ] ✅ Network access configured
- [ ] ✅ Connection string added to `.env`
- [ ] ✅ Server restarted
- [ ] ✅ See "MongoDB Connected" in server logs

## Test Your MongoDB Connection

### Test 1: Check Server Logs

When you start your server (`npm run dev`), you should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

If you see an error, check:
- Connection string is correct
- Username and password are correct
- Network access is configured

### Test 2: Test API Endpoint

```bash
# Test saving data
curl -X POST http://localhost:3000/api/devices/data \
  -H "Content-Type: application/json" \
  -d '{
    "device_status": 0,
    "device_data": "*,R,141125,1703,MANUALMODE,G,13.6,1.0,H,12.4,12.4,20.0,1.0,I,5.0,1.0,1.0,1.0,0.0,1.0,1.0,12345678,#",
    "device_type": "CPAP",
    "device_id": "test_001"
  }'
```

If successful, data is saved to MongoDB!

### Test 3: View Data in MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. You should see:
   - Database: `mehulapi`
   - Collection: `devicedatas`
   - Your saved data!

## Troubleshooting

### Connection Error: Authentication Failed

**Problem:** Wrong username or password

**Solution:**
1. Check username and password in connection string
2. Verify user exists in Atlas → Database Access
3. Make sure password doesn't have special characters (or URL-encode them)

### Connection Error: Timeout

**Problem:** Network access not configured

**Solution:**
1. Go to Atlas → Network Access
2. Add IP Address: "Allow Access from Anywhere" (for testing)
3. Wait a few minutes for changes to propagate

### Connection Error: ECONNREFUSED

**Problem:** Local MongoDB not running

**Solution:**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# If not running, start it:
brew services start mongodb-community@7.0
# OR
mongod --dbpath /data/db
```

### Can't See Data in Atlas

**Problem:** Wrong database name or collection name

**Solution:**
1. Make sure database name in connection string is `/mehulapi`
2. Check collection names: `devicedatas` and `deviceconfigs`
3. Wait a few seconds for data to appear

## Recommended: MongoDB Atlas

**Why MongoDB Atlas is recommended:**
- ✅ **No installation** needed
- ✅ **Free tier** (512MB storage - enough for testing)
- ✅ **Automatic backups**
- ✅ **Works from anywhere**
- ✅ **Easy to scale** later
- ✅ **Built-in monitoring**

**Free Tier Includes:**
- 512MB storage
- Shared RAM
- Basic features
- Perfect for development/testing

## Next Steps

After MongoDB is set up:

1. ✅ Restart your server: `npm run dev`
2. ✅ Test saving data via API
3. ✅ View data in MongoDB Atlas dashboard
4. ✅ Continue with IoT Core testing

---

**Need help?** 
- MongoDB Atlas docs: https://docs.atlas.mongodb.com
- See `SETUP_MONGODB.md` for detailed instructions
- See `QUICK_FIX_MONGODB.md` for quick troubleshooting

