"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
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
  tags: string[]
  isPrivate?: boolean
  editedAt?: any
}

interface Comment {
  id: string
  userId: string
  content: string
  createdAt: any
  userName: string
  userAvatar: string
}

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [accessDenied, setAccessDenied] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const resolvedParams = await params
        const postDoc = await getDoc(doc(db, "posts", resolvedParams.id))
        if (postDoc.exists()) {
          const postData = postDoc.data() as Post

          if (postData.isPrivate && postData.authorId !== user?.uid) {
            setAccessDenied(true)
            setLoading(false)
            return
          }

          // Spread postData first to avoid duplicate key warnings, then set id explicitly
          setPost({
            ...postData,
            id: postDoc.id,
          })
          setLikesCount(postData.likesCount || 0)

          // Reconcile likes count with likes collection
          try {
            const likesSnapshot = await getDocs(query(collection(db, "likes"), where("postId", "==", postDoc.id)))
            const actual = likesSnapshot.size
            if (actual !== (postData.likesCount || 0)) {
              await updateDoc(doc(db, "posts", postDoc.id), { likesCount: actual })
              setLikesCount(actual)
            }
          } catch (err) {
            console.error("Error reconciling likes on post page:", err)
          }

          // Check if user has liked this post
          if (user) {
            const likeQuery = query(
              collection(db, "likes"),
              where("postId", "==", resolvedParams.id),
              where("userId", "==", user.uid),
            )
            const likeSnapshot = await getDocs(likeQuery)
            setIsLiked(!likeSnapshot.empty)
          }

          // Fetch comments
          const commentsQuery = query(collection(db, "comments"), where("postId", "==", resolvedParams.id))
          const commentsSnapshot = await getDocs(commentsQuery)
          const commentsData = commentsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Comment[]
          setComments(commentsData)
        }
      } catch (error) {
        console.error("Error fetching post:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params, user])

  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like posts")
      return
    }

    try {
      // Ensure we have the post id (from params or loaded post)
      const resolvedParams = await params
      const postId = resolvedParams.id || post?.id

      if (!postId) {
        console.error("Post ID missing when toggling like")
        return
      }

      if (isLiked) {
        // Unlike: remove like documents and decrement counter on post
        const likeQuery = query(
          collection(db, "likes"),
          where("postId", "==", postId),
          where("userId", "==", user.uid),
        )
        const likeSnapshot = await getDocs(likeQuery)
        // Await deletions to ensure backend reflects change
        await Promise.all(likeSnapshot.docs.map((d) => deleteDoc(d.ref)))
        // Atomically decrement likesCount on the post document
        await updateDoc(doc(db, "posts", postId), { likesCount: increment(-1) })
        setIsLiked(false)
        setLikesCount((prev) => Math.max(0, prev - 1))
      } else {
        // Like: add like document and increment counter on post
        await addDoc(collection(db, "likes"), {
          postId,
          userId: user.uid,
          createdAt: serverTimestamp(),
        })
        await updateDoc(doc(db, "posts", postId), { likesCount: increment(1) })
        setIsLiked(true)
        setLikesCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const startEdit = () => {
    if (!post) return
    setEditTitle(post.title)
    setEditContent(post.content)
    setIsEditing(true)
  }

  const saveEdit = async () => {
    if (!post || !user || user.uid !== post.authorId) return
    setEditLoading(true)
    try {
      await updateDoc(doc(db, "posts", post.id), {
        title: editTitle.trim(),
        content: editContent.trim(),
        editedAt: serverTimestamp(),
      })
      setPost((prev) => (prev ? { ...prev, title: editTitle.trim(), content: editContent.trim(), editedAt: new Date() } : prev))
      setIsEditing(false)
    } catch (err) {
      console.error("Error saving edit:", err)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!post || !user || user.uid !== post.authorId) return
    if (!confirm("Are you sure you want to delete this verse? This action cannot be undone.")) return
    setDeleteLoading(true)
    try {
      // Delete likes
      const likeQuery = query(collection(db, "likes"), where("postId", "==", post.id))
      const likeSnapshot = await getDocs(likeQuery)
      await Promise.all(likeSnapshot.docs.map((d) => deleteDoc(d.ref)))

      // Delete comments
      const commentsQuery = query(collection(db, "comments"), where("postId", "==", post.id))
      const commentsSnapshot = await getDocs(commentsQuery)
      await Promise.all(commentsSnapshot.docs.map((d) => deleteDoc(d.ref)))

      // Delete post
      await deleteDoc(doc(db, "posts", post.id))

      // Redirect to user's profile
      router.push(`/profile/${user.uid}`)
    } catch (err) {
      console.error("Error deleting post:", err)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert("Please log in to comment")
      return
    }

    if (!commentText.trim()) return

    try {
      const resolvedParams = await params
      const userDoc = await getDoc(doc(db, "users", user.uid))
      const userData = userDoc.data()

      await addDoc(collection(db, "comments"), {
        postId: resolvedParams.id,
        userId: user.uid,
        userName: userData?.name || "Anonymous",
        userAvatar: userData?.avatar || "/placeholder.svg",
        content: commentText.trim(),
        createdAt: serverTimestamp(),
      })

      setCommentText("")
      // Refresh comments
      const commentsQuery = query(collection(db, "comments"), where("postId", "==", resolvedParams.id))
      const commentsSnapshot = await getDocs(commentsQuery)
      const commentsData = commentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[]
      setComments(commentsData)
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">This verse is private and you don't have access to it.</p>
          <Link href="/" className="text-accent hover:text-accent-hover font-medium">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Post not found</p>
          <Link href="/" className="text-accent hover:text-accent-hover font-medium">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(post.createdAt?.toDate?.() || new Date()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/" className="text-accent hover:text-accent-hover font-medium mb-8 inline-block">
          ← Back to verses
        </Link>

        {/* Post Content */}
        <article className="bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground">{post.title}</h1>
            {post.isPrivate && (
              <span className="px-3 py-1 bg-secondary text-foreground text-xs font-medium rounded-full">Private</span>
            )}
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-4 pb-8 border-b border-border mb-8">
            <img src={post.avatar || "/placeholder.svg"} alt={post.authorName} className="w-12 h-12 rounded-full" />
            <div>
              <Link href={`/profile/${post.authorId}`} className="font-medium text-foreground hover:text-accent">
                {post.authorName}
              </Link>
              <p className="text-sm text-muted">{formattedDate}</p>
            </div>
            {/* Edit/Delete controls for author */}
            {user?.uid === post.authorId && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={startEdit}
                  className="px-3 py-1 bg-muted hover:bg-muted-foreground text-foreground rounded-md text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>

          {/* Content / Edit form */}
          {isEditing ? (
            <div className="mb-8">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  rows={10}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveEdit}
                  disabled={editLoading}
                  className="px-4 py-2 bg-accent text-foreground rounded-lg font-medium disabled:opacity-50"
                >
                  {editLoading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-muted hover:bg-muted-foreground text-foreground rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">{post.content}</p>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-border">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-muted text-foreground text-sm rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Edited label */}
          {post.editedAt && (
            <div className="text-sm text-muted mb-4">Edited</div>
          )}

          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isLiked ? "bg-accent text-foreground" : "bg-muted hover:bg-accent text-foreground"
            }`}
          >
            <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {likesCount} {likesCount === 1 ? "like" : "likes"}
          </button>
        </article>

        {/* Comments Section */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Comments</h2>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} className="mb-8 pb-8 border-b border-border">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                rows={3}
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="mt-3 px-4 py-2 bg-accent hover:bg-accent-hover text-foreground font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Post Comment
              </button>
            </form>
          ) : (
            <div className="mb-8 pb-8 border-b border-border text-center">
              <p className="text-muted mb-4">
                <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
                  Sign in
                </Link>{" "}
                to comment
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-muted text-center py-8">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <img
                    src={comment.userAvatar || "/placeholder.svg"}
                    alt={comment.userName}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{comment.userName}</p>
                    <p className="text-sm text-muted mb-2">
                      {new Date(comment.createdAt?.toDate?.() || new Date()).toLocaleDateString()}
                    </p>
                    <p className="text-foreground">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
