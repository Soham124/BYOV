"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function Editor() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const [authorName, setAuthorName] = useState("")
  const [authorAvatar, setAuthorAvatar] = useState("")

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setAuthorName(userDoc.data().name)
            setAuthorAvatar(userDoc.data().avatar)
          }
        } catch (err) {
          console.error("Error fetching user data:", err)
        }
      }
      fetchUserData()
    }
  }, [user])

  const handlePublish = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault()
    if (!user) {
      router.push("/login")
      return
    }

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        authorName,
        avatar: authorAvatar,
        title: title.trim(),
        content: content.trim(),
        tags: tagsArray,
        createdAt: serverTimestamp(),
        likesCount: 0,
        isDraft,
        isPrivate,
      })

      router.push(`/profile/${user.uid}`)
    } catch (err: any) {
      setError(err.message || "Failed to publish post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-8">Write Your Verse</h1>

          <form onSubmit={(e) => handlePublish(e, false)} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your verse a title..."
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
                maxLength={200}
              />
              <p className="text-xs text-muted mt-1">{title.length}/200</p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts, story, or poem here..."
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                rows={12}
              />
              <p className="text-xs text-muted mt-1">{content.length} characters</p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="poetry, writing, thoughts"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg border border-border">
              <input
                type="checkbox"
                id="isPrivate"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 rounded border-border cursor-pointer"
              />
              <label htmlFor="isPrivate" className="flex-1 cursor-pointer">
                <p className="text-sm font-medium text-foreground">Keep this verse private</p>
                <p className="text-xs text-muted">Only you can see this verse</p>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-accent hover:bg-accent-hover text-foreground font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Publishing..." : "Publish"}
              </button>
              <button
                type="button"
                onClick={(e) => handlePublish(e, true)}
                disabled={loading}
                className="flex-1 bg-muted hover:bg-muted-foreground text-foreground font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                Save Draft
              </button>
            </div>
          </form>

          {/* AI Bubble Placeholder */}
          <div className="fixed bottom-8 right-8 w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl transition-shadow group animate-float">
            <svg className="w-7 h-7 text-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="absolute bottom-full right-0 mb-2 bg-foreground text-background px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              AI coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
