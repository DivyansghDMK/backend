# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended, Free)

MongoDB Atlas is the easiest way to get started. It's free and doesn't require local installation.

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a free cluster (M0 - Free tier)

### Step 2: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Step 3: Update .env File

Edit your `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mehulapi?retryWrites=true&w=majority
```

Replace:
- `username` with your MongoDB Atlas username
- `password` with your MongoDB Atlas password
- `cluster0.xxxxx` with your actual cluster address

### Step 4: Create Database User

In MongoDB Atlas:
1. Go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password
5. Set privileges to "Atlas admin" or "Read and write to any database"
6. Use these credentials in your connection string

### Step 5: Configure Network Access

In MongoDB Atlas:
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for testing)
   OR add your specific IP address

That's it! No local installation needed.

## Option 2: Install MongoDB Locally (macOS)

### Using Homebrew

If you have Homebrew installed:

```bash
# Tap MongoDB formula
brew tap mongodb/brew

# Install MongoDB
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0

# Verify it's running
ps aux | grep mongod
```

### Manual Installation

1. Download MongoDB Community Server:
   - Go to: https://www.mongodb.com/try/download/community
   - Select: macOS, x86_64 (or ARM64 for M1/M2 Macs)
   - Download the `.tgz` file

2. Extract and install:
```bash
# Extract
tar -zxvf mongodb-macos-x86_64-7.0.0.tgz

# Move to /usr/local
sudo mv mongodb-macos-x86_64-7.0.0 /usr/local/mongodb

# Add to PATH (add to ~/.zshrc)
export PATH=/usr/local/mongodb/bin:$PATH

# Create data directory
sudo mkdir -p /data/db
sudo chown $(whoami) /data/db
```

3. Start MongoDB:
```bash
mongod --dbpath /data/db
```

## Option 3: Use Docker (Alternative)

If you have Docker installed:

```bash
# Run MongoDB in Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  mongo:7.0

# Your MONGODB_URI stays the same
MONGODB_URI=mongodb://localhost:27017/mehulapi
```

## Verify MongoDB Connection

### For MongoDB Atlas:

```bash
# Update .env with your Atlas connection string
# Then test the connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mehulapi')
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch(err => console.error('❌ Connection error:', err));
"
```

### For Local MongoDB:

```bash
# Check if MongoDB is running
ps aux | grep mongod

# Test connection (if mongosh is installed)
mongosh mongodb://localhost:27017/mehulapi
```

## Recommended: MongoDB Atlas

**Why MongoDB Atlas?**
- ✅ Free tier available (512MB storage)
- ✅ No installation needed
- ✅ Automatic backups
- ✅ Accessible from anywhere
- ✅ Easy to scale later

**Free Tier Limits:**
- 512MB storage (enough for testing)
- Shared RAM (sufficient for development)
- Basic features (all you need)

## Next Steps

1. Choose one of the options above
2. Update your `.env` file with the correct `MONGODB_URI`
3. Restart your backend server
4. Test the API

## Troubleshooting

### Connection Refused (Local MongoDB)

```bash
# Check if MongoDB is running
ps aux | grep mongod

# If not running, start it:
brew services start mongodb-community@7.0
# OR
mongod --dbpath /data/db
```

### Authentication Failed (Atlas)

- Check username and password in connection string
- Verify database user exists in Atlas
- Check network access allows your IP

### Cannot Connect (Atlas)

- Verify cluster is running (check Atlas dashboard)
- Check network access includes your IP
- Verify connection string is correct

