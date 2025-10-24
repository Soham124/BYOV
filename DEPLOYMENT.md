# Deployment Guide for BYOV

## Prerequisites

- Firebase project set up
- Vercel account
- GitHub repository

## Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use an existing one
3. Enable Authentication (Email/Password)
4. Create a Firestore database in production mode
5. Copy your Firebase config from Project Settings

## Step 2: Environment Variables

Create a `.env.local` file in your project root with your Firebase credentials:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

## Step 3: Local Development

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:3000` to see your app.

## Step 4: Seed Sample Data (Optional)

To populate the database with sample posts and users:

\`\`\`bash
node scripts/seed-data.js
\`\`\`

Make sure your `.env.local` is set up before running this.

## Step 5: Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project" and import your GitHub repository
4. Add your Firebase environment variables in the "Environment Variables" section
5. Click "Deploy"

## Step 6: Firestore Security Rules

Update your Firestore security rules to protect user data:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read all user profiles
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }

    // Posts are readable by everyone
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }

    // Likes
    match /likes/{likeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    // Comments
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
\`\`\`

## Features

- User authentication with Firebase
- Create and publish verses (posts)
- Masonry feed layout
- Like posts
- Comment on posts
- User profiles with bio editing
- Responsive design
- Cozy, minimal aesthetic

## Troubleshooting

### Posts not showing up?
- Check Firestore database has posts collection
- Verify security rules allow reading posts
- Check browser console for errors

### Authentication not working?
- Verify Firebase config is correct
- Check Email/Password auth is enabled in Firebase Console
- Ensure environment variables are set

### Images not loading?
- Check avatar URLs are accessible
- Verify CORS settings if using custom image URLs

## Future Enhancements

- AI-powered writing suggestions
- Follow/unfollow users
- Search functionality
- Tags and categories
- Reading time estimates
- Social sharing
- Dark mode toggle
