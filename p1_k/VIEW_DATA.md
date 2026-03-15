# 📊 How to View Stored Data for Your Professor

## Quick Summary:
- **Database Name:** `skillswap`
- **Collections:** `users`, `videos`, `reviews`
- **Connection:** `mongodb://127.0.0.1:27017/skillswap`

---

## Option 1: MongoDB Compass (Easiest - Visual GUI) ⭐ RECOMMENDED

### Step 1: Open MongoDB Compass
1. **If installed:** Search for "MongoDB Compass" in Windows Start menu
2. **If not installed:** Download from https://www.mongodb.com/try/download/compass

### Step 2: Connect to Database
1. Open MongoDB Compass
2. In the connection string field, enter:
   ```
   mongodb://127.0.0.1:27017
   ```
3. Click **"Connect"**

### Step 3: View Your Data
1. In the left sidebar, click on **`skillswap`** database
2. You'll see 3 collections:
   - **`users`** - All registered users (tutors & learners)
   - **`videos`** - All uploaded videos
   - **`reviews`** - All video reviews/ratings

3. Click on any collection to see the data:
   - **Users:** Shows email, name, role (tutor/learner), verification status
   - **Videos:** Shows video details, tutor name, topic, level, views, etc.
   - **Reviews:** Shows ratings, comments, learner info, video references

### Step 4: Export Data (for your professor)
1. Click on a collection (e.g., `users`)
2. Click the **"Export Collection"** button (top right)
3. Choose format: **JSON** or **CSV**
4. Save the file to show your professor

---

## Option 2: MongoDB Shell (mongosh) - Command Line

### Step 1: Open Terminal/PowerShell
Press `Win + X` → Select "Windows PowerShell" or "Terminal"

### Step 2: Connect to MongoDB
```powershell
mongosh mongodb://127.0.0.1:27017/skillswap
```

### Step 3: View Collections
```javascript
// List all collections
show collections

// View all users
db.users.find().pretty()

// View all videos
db.videos.find().pretty()

// View all reviews
db.reviews.find().pretty()
```

### Step 4: Count Documents
```javascript
// Count users
db.users.countDocuments()

// Count videos
db.videos.countDocuments()

// Count reviews
db.reviews.countDocuments()
```

### Step 5: View Specific Data
```javascript
// View tutors only
db.users.find({ role: 'tutor' }).pretty()

// View learners only
db.users.find({ role: 'learner' }).pretty()

// View verified tutors
db.users.find({ role: 'tutor', isVerified: true }).pretty()

// View videos by topic
db.videos.find({ topic: 'React' }).pretty()

// View reviews with ratings >= 4
db.reviews.find({ rating: { $gte: 4 } }).pretty()
```

### Step 6: Export Data
```javascript
// Export users to JSON file
db.users.find().forEach(function(doc) {
    printjson(doc);
});

// Or use mongoexport (if available)
// mongoexport --uri="mongodb://127.0.0.1:27017/skillswap" --collection=users --out=users.json
```

---

## Option 3: Quick Data Summary Script

I can create a script that shows a summary of all your data. Would you like me to create that?

---

## 📋 What Data You'll See:

### Users Collection:
- `fullName` - User's full name
- `email` - User's email address
- `role` - "tutor" or "learner"
- `isVerified` - Whether tutor is verified
- `createdAt` - Registration date
- `password` - (hashed, not readable)

### Videos Collection:
- `topic` - Video topic (e.g., "React", "Node.js")
- `level` - Difficulty level ("Beginner", "Intermediate", "Pro")
- `category` - Category ("Course", "Technology", "Workshop")
- `tutorName` - Name of tutor who uploaded
- `originalName` - Original video filename
- `url` - Video file path
- `views` - Number of views
- `size` - File size in bytes
- `createdAt` - Upload date

### Reviews Collection:
- `videoId` - Reference to video
- `learnerEmail` - Email of reviewer
- `learnerName` - Name of reviewer
- `rating` - Rating (1-5 stars)
- `review` - Review text/comment
- `createdAt` - Review date

---

## 🎯 Best Way to Show Your Professor:

**Recommended:** Use **MongoDB Compass** (Option 1)
- Visual, easy to understand
- Can export data easily
- Can take screenshots
- Shows data in a readable format

**Steps:**
1. Open MongoDB Compass
2. Connect to `mongodb://127.0.0.1:27017`
3. Open `skillswap` database
4. Show each collection (users, videos, reviews)
5. Take screenshots or export to JSON/CSV

---

## ⚠️ Important Notes:

- **Make sure MongoDB is running** before trying to connect
- **Passwords are hashed** - you won't see actual passwords
- **Video files** are stored in `backend/uploads/videos/` folder (not in database)
- **Database stores metadata** about videos, not the actual video files

---

## 🚀 Quick Start:

1. **Open MongoDB Compass**
2. **Connect:** `mongodb://127.0.0.1:27017`
3. **Click:** `skillswap` database
4. **Click:** Any collection to view data
5. **Export:** Click "Export Collection" to save data

That's it! Your professor can see all the stored data! 🎉






