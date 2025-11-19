# Firestore Database Setup Guide

This guide will help you set up Cloud Firestore for your Violify app to enable multi-user support with persistent data storage.

## What's Been Implemented

✅ **Firebase Configuration** - Firestore initialized in `src/config/firebase.ts`
✅ **Database Service** - Complete CRUD operations in `src/services/firestore.ts`
✅ **Type Definitions** - TypeScript types for all data models in `src/types/database.ts`
✅ **User Profile Management** - Automatic profile creation on signup
✅ **Settings Integration** - Profile editing now saves to Firestore
✅ **Security Rules** - Firestore security rules in `firestore.rules`

## Database Structure

Your Firestore database is organized as follows:

```
firestore/
├── users/                          (Collection)
│   ├── {userId}/                   (Document)
│   │   ├── displayName
│   │   ├── email
│   │   ├── phone
│   │   ├── bio
│   │   ├── subscription
│   │   ├── createdAt
│   │   └── updatedAt
│   │
│   │   ├── lessons/               (Subcollection)
│   │   │   └── {lessonId}/        (Document)
│   │   │       ├── title
│   │   │       ├── description
│   │   │       ├── difficulty
│   │   │       ├── progress
│   │   │       └── ...
│   │   │
│   │   ├── practice-sessions/     (Subcollection)
│   │   │   └── {sessionId}/       (Document)
│   │   │       ├── date
│   │   │       ├── duration
│   │   │       ├── mistakesCount
│   │   │       └── ...
│   │   │
│   │   ├── analytics/             (Subcollection)
│   │   │   └── summary/           (Document)
│   │   │       ├── currentStreak
│   │   │       ├── totalPracticeTime
│   │   │       └── ...
│   │   │
│   │   └── achievements/          (Subcollection)
│   │       └── {achievementId}/   (Document)
│   │           ├── title
│   │           ├── type
│   │           └── ...
```

## Setup Instructions

### Step 1: Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **Violify** project
3. Click on **Firestore Database** in the left sidebar
4. Click **Create Database**
5. Choose **Start in production mode** (we'll add security rules next)
6. Select a Cloud Firestore location (choose one closest to your users, e.g., `us-central1`)
7. Click **Enable**

### Step 2: Deploy Security Rules

1. In the Firebase Console, go to **Firestore Database** → **Rules** tab
2. Replace the default rules with the contents of `firestore.rules` file
3. Click **Publish**

Alternatively, if you have Firebase CLI installed:
```bash
firebase deploy --only firestore:rules
```

### Step 3: Test the Integration

1. **Sign up a new user** in your app
2. Check the Firebase Console → Firestore Database
3. You should see a new document created in `users/{userId}`
4. **Edit your profile** in the Settings screen
5. Verify that phone and bio are saved to Firestore

### Step 4: Verify Security Rules (Optional but Recommended)

Test that security rules are working:

1. In Firebase Console, go to **Firestore Database** → **Rules** tab
2. Click **Rules Playground**
3. Test scenarios:
   - ✅ User reading their own data: `get /users/USER_ID` (should allow)
   - ❌ User reading another user's data: `get /users/OTHER_USER_ID` (should deny)

## How It Works

### User Profile Creation

When a user signs up (via email, Google, or Apple), the app automatically:
1. Creates a Firebase Auth account
2. Creates a Firestore document in `users/{userId}` with their profile data

**Code:** `src/components/AuthContext.tsx` lines 95-100

### Profile Updates

When a user updates their profile in Settings:
1. Updates Firebase Auth (displayName, email)
2. Updates Firestore document with all profile data (including phone and bio)

**Code:** `src/components/SettingsScreen.tsx` lines 76-81

### Reading User Data

User data is loaded from Firestore when the Settings screen opens:

**Code:** `src/components/SettingsScreen.tsx` lines 35-45

## Available Database Functions

You can use these functions throughout your app:

### User Profile
```typescript
import { getUserProfile, updateUserProfile, createUserProfile } from '../services/firestore';

// Get user profile
const profile = await getUserProfile(userId);

// Update user profile
await updateUserProfile(userId, {
  displayName: 'John Doe',
  phone: '+1234567890'
});
```

### Lessons
```typescript
import { createLesson, getUserLessons, updateLesson, completeLesson } from '../services/firestore';

// Create a lesson
const lessonId = await createLesson(userId, {
  title: 'Learn Sarali Varisai',
  description: 'Master the basics',
  difficulty: 'beginner',
  duration: 30,
  progress: 0,
  isCompleted: false
});

// Get user's lessons
const lessons = await getUserLessons(userId, 10);

// Mark lesson as complete
await completeLesson(userId, lessonId);
```

### Practice Sessions
```typescript
import { createPracticeSession, getRecentPracticeSessions } from '../services/firestore';

// Log a practice session
const sessionId = await createPracticeSession(userId, {
  date: new Date(),
  duration: 25,
  mistakesCount: 12,
  correctCount: 48,
  aiScore: 85
});

// Get last 7 days of sessions
const recentSessions = await getRecentPracticeSessions(userId, 7);
```

### Analytics
```typescript
import { getUserAnalytics, updateUserAnalytics, incrementStreak } from '../services/firestore';

// Get analytics
const analytics = await getUserAnalytics(userId);

// Increment streak
await incrementStreak(userId);
```

## Cost Estimation (Firebase Free Tier)

Firebase offers a generous free tier:
- **50,000 reads per day**
- **20,000 writes per day**
- **20,000 deletes per day**
- **1 GB storage**

For a small to medium app with 100-1000 users, this is more than enough!

### Estimated Usage:
- **New user signup**: 1 write
- **Profile update**: 1 write
- **Practice session**: 1 write
- **Loading home screen**: 3-5 reads
- **Loading lessons**: 1 read per lesson

Even with 500 active users daily:
- 500 users × 5 reads = 2,500 reads/day ✅
- 500 users × 2 writes = 1,000 writes/day ✅

**You're well within the free tier!**

## Backup and Data Export

Firebase provides automatic backups, but you can also export data:

1. Go to Firebase Console → Firestore Database
2. Click the ⋮ menu → **Export data**
3. Choose collections to export
4. Select a Cloud Storage bucket
5. Click **Export**

## Next Steps

Now that Firestore is set up, you can:

1. ✅ **Migrate practice sessions** - Save practice data to Firestore
2. ✅ **Add lesson management** - Let users create custom lessons
3. ✅ **Build analytics** - Track practice streaks and progress over time
4. ✅ **Implement achievements** - Award badges for milestones
5. ✅ **Add social features** - Share progress with friends (optional)

## Troubleshooting

### "Missing or insufficient permissions" error
- Check that Firestore security rules are deployed
- Verify user is authenticated
- Ensure userId matches `request.auth.uid`

### Data not showing up
- Check Firebase Console to see if data is being written
- Verify network requests in browser DevTools
- Check console for any errors

### User profile not created
- Enable Email/Password authentication in Firebase Console
- Check that `createUserProfile` is called in AuthContext
- Verify Firestore is enabled in Firebase Console

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Pricing](https://firebase.google.com/pricing)
