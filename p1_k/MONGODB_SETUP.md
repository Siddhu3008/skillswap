# MongoDB Setup Guide

## Option 1: MongoDB Community Server (Local Installation)

### Download and Install:
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (7.0 or 8.0)
   - Platform: Windows
   - Package: MSI
3. Download and run the installer
4. During installation:
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (GUI tool - optional but helpful)

### After Installation:
- MongoDB will run automatically as a Windows service
- Default port: 27017
- Connection string: `mongodb://127.0.0.1:27017/skillswap`

### Verify Installation:
```powershell
mongod --version
```

## Option 2: MongoDB Atlas (Cloud - Free Tier)

If you prefer cloud MongoDB:

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster (M0)
4. Get your connection string
5. Update `.env` file in backend:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillswap
   ```

## Option 3: Run Without MongoDB (Development Only)

The server will start without MongoDB, but:
- ❌ User registration/login won't work
- ❌ Video uploads won't be saved
- ❌ Reviews won't work
- ✅ Frontend will still load
- ✅ You can test UI/UX

## Current Configuration

The project is configured for **local MongoDB**:
- Default connection: `mongodb://127.0.0.1:27017/skillswap`
- Database name: `skillswap`
- Port: 27017

## Quick Start Commands

### Start MongoDB (if installed as service):
- It should start automatically
- Or: Open Services → Find "MongoDB" → Start

### Start MongoDB manually:
```powershell
mongod --dbpath "C:\data\db"
```
(You may need to create the directory first)

### Check if MongoDB is running:
```powershell
mongosh
```
Or test connection:
```powershell
mongosh "mongodb://127.0.0.1:27017/skillswap"
```

## Troubleshooting

### Port 27017 already in use:
- Another MongoDB instance might be running
- Check Windows Services
- Or change port in `.env`: `MONGODB_URI=mongodb://127.0.0.1:27018/skillswap`

### MongoDB not starting:
- Check Windows Event Viewer for errors
- Ensure you have admin rights
- Try running `mongod` manually to see error messages







