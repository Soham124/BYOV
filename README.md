# Build Your Own Verse (BYOV)

A cozy, minimal Pinterest-style platform for writers and readers to share and discover beautiful writing.

## Features

- 📝 Write and publish verses (text posts)
- 🎨 Masonry feed layout
- ❤️ Like posts
- 💬 Comment on posts
- 👤 User profiles
- 🔐 Firebase authentication

## Tech Stack

- **Frontend**: Next.js 16 + React + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project (or use existing)
   - Enable Authentication (Email/Password)
   - Create a Firestore database (start in test mode)
   - Go to Project Settings → General tab
   - Copy your Firebase config object
   - Create `.env.local` file in the root directory
   - Add your Firebase credentials:
     \`\`\`
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     \`\`\`
   - See `.env.local.example` for reference

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Firebase Security Rules

After creating your Firestore database, update the security rules to:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if true;
      allow write: if request.auth.uid == uid;
    }
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }
    match /likes/{likeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
\`\`\`

## Project Structure

\`\`\`
/app
  /login          - Login page
  /signup         - Sign up page
  /create         - Create new post
  /post/[id]      - View single post
  /profile/[uid]  - User profile
  /page.tsx       - Home feed

/components
  navbar.tsx      - Navigation bar
  post-card.tsx   - Post card component
  editor.tsx      - Text editor

/lib
  firebase.ts     - Firebase configuration
  auth-context.tsx - Auth context provider
\`\`\`

## Firestore Structure

\`\`\`
users/
  {uid}
    - name: string
    - username: string
    - bio: string
    - avatar: string
    - followersCount: number
    - followingCount: number
    - createdAt: timestamp

posts/
  {postId}
    - authorId: string
    - authorName: string
    - title: string
    - content: string
    - tags: array
    - createdAt: timestamp
    - likesCount: number

likes/
  {likeId}
    - userId: string
    - postId: string
    - createdAt: timestamp

comments/
  {commentId}
    - postId: string
    - userId: string
    - content: string
    - createdAt: timestamp
\`\`\`

## Deployment

Deploy to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your Firebase environment variables in Vercel project settings
4. Deploy!

## Troubleshooting

**Error: "Firebase: Error (auth/invalid-api-key)"**
- Make sure you've created a `.env.local` file with all Firebase credentials
- Verify the credentials are correct from your Firebase Console
- Restart the development server after adding environment variables

## License

MIT
