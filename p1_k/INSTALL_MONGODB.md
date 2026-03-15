# 🗄️ Install MongoDB - Quick Guide

## Current Status: ❌ MongoDB Not Installed

The error message you see is because MongoDB is not installed on your computer.

---

## 🚀 Quick Solution: Install MongoDB Community Server

### Step 1: Download MongoDB

1. **Go to:** https://www.mongodb.com/try/download/community
2. **Select:**
   - Version: **Latest** (8.0 or 7.0)
   - Platform: **Windows**
   - Package: **MSI**
3. **Click "Download"**

### Step 2: Install MongoDB

1. **Run the downloaded .msi file**
2. **During installation:**
   - ✅ Choose **"Complete"** installation
   - ✅ ✅ **CHECK "Install MongoDB as a Service"** (IMPORTANT!)
   - ✅ ✅ **CHECK "Install MongoDB Compass"** (optional but helpful)
   - ✅ Choose **"Run service as Network Service user"**
   - ✅ Install MongoDB Compass (GUI tool - recommended)

3. **Click "Install"**
4. **Wait for installation to complete**

### Step 3: Verify Installation

1. **Open PowerShell** (as Administrator)
2. **Run:**
   ```powershell
   mongosh --version
   ```
   Should show MongoDB Shell version

3. **Check if service is running:**
   ```powershell
   Get-Service MongoDB
   ```
   Should show "Running"

### Step 4: Restart Backend Server

1. **Stop the backend** (Ctrl+C in terminal)
2. **Start it again:**
   ```powershell
   cd "C:\Users\pavan\OneDrive\Desktop\p1_k\p1_k\backend"
   $env:PATH += ";$env:ProgramFiles\nodejs"
   npm run dev
   ```

3. **You should see:**
   ```
   ✅ Connected to MongoDB: mongodb://127.0.0.1:27017/skillswap
   🚀 SkillSwap API running on port 5000
   ```

### Step 5: Test Registration

1. **Refresh your browser** (Ctrl+Shift+R)
2. **Try registering again**
3. **It should work now!** ✅

---

## 🌐 Alternative: MongoDB Atlas (Cloud - No Installation)

If you don't want to install MongoDB locally, use the cloud version:

### Step 1: Create Free Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Create a **FREE cluster** (M0 - 512MB)

### Step 2: Get Connection String
1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/`

### Step 3: Update Backend Configuration
1. Go to: `C:\Users\pavan\OneDrive\Desktop\p1_k\p1_k\backend`
2. Create a file named `.env` (if it doesn't exist)
3. Add this line:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/skillswap
   ```
   (Replace with your actual connection string)

### Step 4: Restart Backend
1. Stop backend (Ctrl+C)
2. Start again: `npm run dev`
3. Should connect to MongoDB Atlas!

---

## ✅ Which Option to Choose?

### Local MongoDB (Recommended for Development)
- ✅ Works offline
- ✅ Faster
- ✅ Free
- ❌ Requires installation (~200MB)

### MongoDB Atlas (Cloud)
- ✅ No installation needed
- ✅ Works from anywhere
- ✅ Free tier available
- ❌ Requires internet
- ❌ Slightly slower

**For learning/development:** Use **Local MongoDB**  
**For quick testing:** Use **MongoDB Atlas**

---

## 🔧 Troubleshooting

### MongoDB service won't start
1. Open **Services** (Win+R → `services.msc`)
2. Find **"MongoDB"**
3. Right-click → **Start**
4. If it fails, check Windows Event Viewer for errors

### Port 27017 already in use
- Another MongoDB instance might be running
- Close other MongoDB processes
- Or change port in `.env`: `MONGODB_URI=mongodb://127.0.0.1:27018/skillswap`

### "mongosh is not recognized"
- MongoDB might not be in PATH
- Add to PATH: `C:\Program Files\MongoDB\Server\8.0\bin`
- Or restart terminal after installation

---

## 📝 After Installation

Once MongoDB is installed and running:

1. ✅ Backend will connect automatically
2. ✅ Registration will work
3. ✅ Login will work
4. ✅ Video uploads will work
5. ✅ All database features will work!

**The error message will disappear!** 🎉







