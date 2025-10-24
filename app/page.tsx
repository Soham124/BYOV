"use client"

import { useEffect, useState } from "react"
import { collection, query, getDocs, limit, where } from "firebase/firestore"
import { updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import PostCard from "@/components/post-card"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface Post {
  id: string
  title: string
  content: string
  authorName: string
  authorId: string
  avatar: string
  likesCount: number
  createdAt: any
  isPrivate?: boolean
  editedAt?: any
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch all posts and filter out private ones client-side.
        // Many posts may not have an explicit `isPrivate` field — relying on
        // a where("isPrivate", "==", false) would exclude those.
        // To ensure all public verses are shown, fetch posts and filter locally.
        const q = query(collection(db, "posts"))
        const snapshot = await getDocs(q)
        
        const postsData = await Promise.all(
          snapshot.docs.map(async (d) => {
            const p = ({ id: d.id, ...d.data() } as Post)
            // Reconcile likesCount by checking likes collection when counts are missing or inconsistent
            try {
              const likesSnapshot = await getDocs(query(collection(db, "likes"), where("postId", "==", p.id)))
              const actual = likesSnapshot.size
              if (p.likesCount !== actual) {
                // update post document so feeds show accurate counts
                await updateDoc(doc(db, "posts", p.id), { likesCount: actual })
                p.likesCount = actual
              }
            } catch (err) {
              // ignore per-post reconciliation errors
              console.error("Error reconciling likes for post", p.id, err)
            }
            return p
          }),
        )

        // Treat documents without `isPrivate` or with `isPrivate === false` as public
        const publicPosts = postsData.filter((p) => p.isPrivate !== true)

        publicPosts.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.() || new Date(0)
          const timeB = b.createdAt?.toDate?.() || new Date(0)
          return timeB.getTime() - timeA.getTime()
        })

        setPosts(publicPosts)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">Discover Verses</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            A cozy rainforest sanctuary for writers and readers to share beautiful writing
          </p>
          {mounted && user && (
            <Link
              href="/create"
              className="inline-block mt-6 px-6 py-3 bg-accent hover:bg-accent-hover text-foreground font-medium rounded-lg transition-colors"
            >
              Start Writing
            </Link>
          )}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-muted">Loading verses...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted mb-4">No verses yet. Be the first to share!</p>
            {mounted && user ? (
              <Link
                href="/create"
                className="inline-block px-6 py-2 bg-accent hover:bg-accent-hover text-foreground font-medium rounded-lg transition-colors"
              >
                Create a Verse
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-block px-6 py-2 bg-accent hover:bg-accent-hover text-foreground font-medium rounded-lg transition-colors"
              >
                Sign Up to Write
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                excerpt={post.content.substring(0, 150)}
                authorName={post.authorName}
                authorAvatar={post.avatar}
                likesCount={post.likesCount || 0}
                createdAt={post.createdAt?.toDate?.() || new Date()}
                editedAt={post.editedAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
