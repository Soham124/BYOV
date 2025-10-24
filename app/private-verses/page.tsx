"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface PrivateVerse {
  id: string
  title: string
  content: string
  createdAt: any
  likesCount: number
}

export default function PrivateVersesPage() {
  const [verses, setVerses] = useState<PrivateVerse[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchPrivateVerses = async () => {
      try {
        const q = query(collection(db, "posts"), where("authorId", "==", user.uid), where("isPrivate", "==", true))
        const snapshot = await getDocs(q)
        const versesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PrivateVerse[]

        versesData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0)
          const dateB = b.createdAt?.toDate?.() || new Date(0)
          return dateB.getTime() - dateA.getTime()
        })

        setVerses(versesData)
      } catch (error) {
        console.error("Error fetching private verses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrivateVerses()
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">My Private Verses</h1>
          <p className="text-muted">Only you can see these verses</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-muted">Loading your private verses...</div>
          </div>
        ) : verses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted mb-4">You haven't created any private verses yet.</p>
            <Link
              href="/create"
              className="inline-block px-6 py-2 bg-accent hover:bg-accent-hover text-foreground font-medium rounded-lg transition-colors"
            >
              Create a Private Verse
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {verses.map((verse) => (
              <Link key={verse.id} href={`/post/${verse.id}`}>
                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{verse.title}</h3>
                  <p className="text-sm text-muted line-clamp-2 mb-4">{verse.content.substring(0, 150)}</p>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>
                      {new Date(verse.createdAt?.toDate?.() || new Date()).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                      {verse.likesCount || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
