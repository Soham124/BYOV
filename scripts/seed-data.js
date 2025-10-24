import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore"

// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const sampleUsers = [
  {
    uid: "user1",
    name: "Emma Chen",
    username: "emmachen",
    bio: "Writer, dreamer, coffee enthusiast. Sharing thoughts one verse at a time.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emmachen",
    followersCount: 42,
    followingCount: 28,
    createdAt: new Date("2024-01-15"),
  },
  {
    uid: "user2",
    name: "Marcus Johnson",
    username: "marcusj",
    bio: "Poet and storyteller exploring the human experience.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcusj",
    followersCount: 156,
    followingCount: 89,
    createdAt: new Date("2023-11-20"),
  },
  {
    uid: "user3",
    name: "Sofia Rodriguez",
    username: "sofiar",
    bio: "Bilingual writer. Spanish and English verses.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofiar",
    followersCount: 78,
    followingCount: 45,
    createdAt: new Date("2024-02-01"),
  },
]

const samplePosts = [
  {
    authorId: "user1",
    authorName: "Emma Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emmachen",
    title: "Morning Reflections",
    content: `The sun rises over the city, painting the sky in shades of amber and rose. I sit with my coffee, watching the world wake up. There's something magical about these quiet moments before the day begins in earnest.

Each morning is a gift, a chance to start fresh. The mistakes of yesterday fade with the darkness, and new possibilities emerge with the light. I've learned to cherish these moments of stillness, these pockets of peace in an otherwise chaotic world.

Today, I choose to be present. To notice the small things. The warmth of the cup in my hands. The sound of birds singing. The way the light filters through the leaves. These are the moments that make life worth living.`,
    tags: ["morning", "reflection", "poetry"],
    createdAt: new Date("2024-10-20"),
    likesCount: 24,
  },
  {
    authorId: "user2",
    authorName: "Marcus Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcusj",
    title: "The Weight of Words",
    content: `Words are powerful things. They can build up or tear down. They can inspire or discourage. They can heal or wound. As a writer, I feel the weight of this responsibility every time I put pen to paper.

I think about the words I choose. Do they matter? Will they resonate with someone? Will they make a difference? These questions haunt me, but they also drive me forward. Because if words can hurt, they can also help. If they can destroy, they can also create.

So I write with intention. I choose my words carefully. I try to say things that matter, things that might touch someone's heart or change their perspective. It's not always easy, but it's always worth it.`,
    tags: ["writing", "words", "reflection"],
    createdAt: new Date("2024-10-18"),
    likesCount: 31,
  },
  {
    authorId: "user3",
    authorName: "Sofia Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofiar",
    title: "Between Two Languages",
    content: `There's a unique experience in living between two languages. Spanish flows from my heart, English from my mind. Each language carries different memories, different emotions, different versions of myself.

When I write in Spanish, I feel the warmth of my childhood, the voices of my family, the rhythm of my heritage. When I write in English, I feel the clarity of my thoughts, the precision of my ideas, the expansion of my world.

I don't have to choose. I can be both. I can blend them, mix them, create something entirely new. This is my strength, my identity, my voice. Two languages, one heart, infinite possibilities.`,
    tags: ["bilingual", "identity", "language"],
    createdAt: new Date("2024-10-15"),
    likesCount: 18,
  },
  {
    authorId: "user1",
    authorName: "Emma Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emmachen",
    title: "Finding Home",
    content: `Home isn't always a place. Sometimes it's a feeling. Sometimes it's a person. Sometimes it's a moment in time when everything feels right.

I've lived in many places, but I've only felt truly at home a few times. Those moments are precious. They're the ones I hold onto when I'm feeling lost or displaced. They remind me that home is something I can create, something I can find, something I can carry with me.

Maybe home is wherever I am when I'm writing. When the words flow and the ideas come alive. When I'm lost in the world I'm creating. That's when I feel most at home. That's when I feel most myself.`,
    tags: ["home", "belonging", "writing"],
    createdAt: new Date("2024-10-12"),
    likesCount: 42,
  },
]

async function seedDatabase() {
  try {
    console.log("Starting to seed database...")

    // Add users
    for (const user of sampleUsers) {
      await setDoc(doc(db, "users", user.uid), {
        ...user,
        createdAt: serverTimestamp(),
      })
      console.log(`Added user: ${user.name}`)
    }

    // Add posts
    for (const post of samplePosts) {
      await addDoc(collection(db, "posts"), {
        ...post,
        createdAt: serverTimestamp(),
      })
      console.log(`Added post: ${post.title}`)
    }

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

seedDatabase()
