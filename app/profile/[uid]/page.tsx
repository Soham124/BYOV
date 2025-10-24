"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, deleteDoc, serverTimestamp, increment } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import PostCard from "@/components/post-card"

interface UserProfile {
  uid: string
  name: string
  username: string
  bio: string
  avatar: string
  followersCount: number
  followingCount: number
  createdAt: any
}

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

export default function ProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editBio, setEditBio] = useState("")
  const [uid, setUid] = useState<string>("")
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const { user } = useAuth()
  const isOwnProfile = user?.uid === uid
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const resolvedParams = await params
        setUid(resolvedParams.uid)
        
        const userDoc = await getDoc(doc(db, "users", resolvedParams.uid))
        if (userDoc.exists()) {
          setProfile({
            uid: userDoc.id,
            ...userDoc.data(),
          } as UserProfile)
          setEditBio(userDoc.data().bio || "")

          // If current user is signed in and viewing another profile, check follow state
          if (user && user.uid !== resolvedParams.uid) {
            try {
              const followQuery = query(
                collection(db, "follows"),
                where("followerId", "==", user.uid),
                where("followingId", "==", resolvedParams.uid),
              )
              const followSnapshot = await getDocs(followQuery)
              setIsFollowing(!followSnapshot.empty)
            } catch (err) {
              console.error("Error checking follow status:", err)
            }
          }

          // Fetch user's posts
          const postsQuery = query(collection(db, "posts"), where("authorId", "==", resolvedParams.uid))
          const postsSnapshot = await getDocs(postsQuery)
          const postsData = await Promise.all(
            postsSnapshot.docs.map(async (d) => {
              const p = ({ id: d.id, ...d.data() } as Post)
              // Reconcile likes count for this post
              try {
                const likesSnapshot = await getDocs(query(collection(db, "likes"), where("postId", "==", p.id)))
                const actual = likesSnapshot.size
                if (p.likesCount !== actual) {
                  await updateDoc(doc(db, "posts", p.id), { likesCount: actual })
                  p.likesCount = actual
                }
              } catch (err) {
                console.error("Error reconciling likes for post", p.id, err)
              }
              return p
            }),
          )

          // Only show private posts to the author. Some posts may not have an
          // `isPrivate` field (treated as public). Filter client-side so we
          // don't accidentally exclude posts that lack the field.
          const isOwn = user && user.uid === resolvedParams.uid
          const visiblePosts = postsData.filter((p) => {
            if (p.isPrivate === true) return !!isOwn
            return true
          })

          // Sort visible posts by createdAt
          visiblePosts.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0)
            const dateB = b.createdAt?.toDate?.() || new Date(0)
            return dateB.getTime() - dateA.getTime()
          })

          setPosts(visiblePosts)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [params, user])

  const handleSaveBio = async () => {
    if (!user) return

    try {
      await updateDoc(doc(db, "users", user.uid), {
        bio: editBio,
      })
      setProfile((prev) => (prev ? { ...prev, bio: editBio } : null))
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating bio:", error)
    }
  }

  const handleFollow = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setFollowLoading(true)
    try {
      if (!uid) return

      if (isFollowing) {
        // Unfollow: remove follow records and decrement counters
        const followQuery = query(
          collection(db, "follows"),
          where("followerId", "==", user.uid),
          where("followingId", "==", uid),
        )
        const followSnapshot = await getDocs(followQuery)
        await Promise.all(followSnapshot.docs.map((d) => deleteDoc(d.ref)))

        await updateDoc(doc(db, "users", uid), { followersCount: increment(-1) })
        await updateDoc(doc(db, "users", user.uid), { followingCount: increment(-1) })

        setIsFollowing(false)
        setProfile((prev) => (prev ? { ...prev, followersCount: Math.max(0, prev.followersCount - 1) } : prev))
      } else {
        // Follow: create follow record and increment counters
        await addDoc(collection(db, "follows"), {
          followerId: user.uid,
          followingId: uid,
          createdAt: serverTimestamp(),
        })

        await updateDoc(doc(db, "users", uid), { followersCount: increment(1) })
        await updateDoc(doc(db, "users", user.uid), { followingCount: increment(1) })

        setIsFollowing(true)
        setProfile((prev) => (prev ? { ...prev, followersCount: (prev.followersCount || 0) + 1 } : prev))
      }
    } catch (err) {
      console.error("Error toggling follow:", err)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Profile not found</p>
          <Link href="/" className="text-accent hover:text-accent-hover font-medium">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  // Use consistent date formatting to avoid hydration mismatches
  const date = new Date(profile.createdAt?.toDate?.() || new Date())
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const joinedDate = `${months[date.getMonth()]} ${date.getFullYear()}`

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
            <img src={profile.avatar || "/placeholder.svg"} alt={profile.name} className="w-24 h-24 rounded-full" />

            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">{profile.name}</h1>
              <p className="text-muted mb-4">@{profile.username}</p>

              {/* Bio Section */}
              {isOwnProfile && isEditing ? (
                <div className="mb-4">
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveBio}
                      className="px-4 py-2 bg-accent hover:bg-accent-hover text-foreground font-medium rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditBio(profile.bio)
                      }}
                      className="px-4 py-2 bg-muted hover:bg-muted-foreground text-foreground font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {profile.bio && <p className="text-foreground mb-4">{profile.bio}</p>}

                  {/* Follow/Unfollow for other users */}
                  {!isOwnProfile && (
                    <div className="mb-4">
                      {user ? (
                        <button
                          onClick={handleFollow}
                          disabled={followLoading}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            isFollowing ? "bg-muted text-foreground" : "bg-accent text-foreground"
                          }`}
                        >
                          {followLoading ? "Working..." : isFollowing ? "Unfollow" : "Follow"}
                        </button>
                      ) : (
                        <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
                          Sign in to follow
                        </Link>
                      )}
                    </div>
                  )}

                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-muted hover:bg-muted-foreground text-foreground font-medium rounded-lg transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </>
              )}

              {/* Stats */}
              <div className="flex gap-8 mt-6 pt-6 border-t border-border">
                <div>
                  <p className="text-2xl font-bold text-foreground">{posts.length}</p>
                  <p className="text-sm text-muted">Verses</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{profile.followersCount}</p>
                  <p className="text-sm text-muted">Followers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{profile.followingCount}</p>
                  <p className="text-sm text-muted">Following</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Joined {joinedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User's Posts */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Verses</h2>
          {posts.length === 0 ? (
            <>
              <div className="text-right mb-4">
                {user && user.uid === uid && (
                  <Link href="/create" className="px-4 py-2 bg-accent text-foreground rounded-lg">
                    Create Verse
                  </Link>
                )}
              </div>
              <div className="text-center py-12">
                <p className="text-muted mb-4">No verses yet</p>
                {isOwnProfile && (
                  <Link
                    href="/create"
                    className="inline-block px-6 py-2 bg-accent hover:bg-accent-hover text-foreground font-medium rounded-lg transition-colors"
                  >
                    Write Your First Verse
                  </Link>
                )}
              </div>
            </>
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
    </div>
  )
}
