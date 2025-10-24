# 🪶 Build Your Own Verse (BYOV)

**Build Your Own Verse (BYOV)** is a web platform for writers and readers to create, share, and explore creative works in a community-driven space.  
It’s built as a minimal, cozy environment where ideas turn into verses and inspiration flows through every interaction.

---

## 🚀 Features (MVP)

- ✍️ **Write & Save Notes:** Simple, distraction-free note editor for writers.  
- 📚 **Library System:** Organize, categorize, and revisit your written pieces.  
- 👥 **Profiles & Social Interaction:** Create profiles, share your work, and explore others’ writings.  
- 💬 **Community Feed:** Discover, like, and comment on verses from other creators.  
- 🔐 **Authentication:** Secure login and signup powered by Firebase.  

---

## 🧩 Tech Stack

- **Frontend:** Next.js (React)  
- **Backend:** Firebase (Auth, Firestore, Storage)  
- **Styling:** Tailwind CSS / Shadcn UI  
- **Hosting:** Vercel (recommended for deployment)  

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory and add:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
