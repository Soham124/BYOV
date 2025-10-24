"use client"

import { useEffect, useState, Suspense } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

interface UserResult {
  uid: string
  name?: string
  username?: string
  avatar: string
  bio?: string
}

function SearchContent() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("q") || ""
  const [results, setResults] = useState<UserResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setLoading(false)
      return
    }

    const searchUsers = async () => {
      try {
        setLoading(true)
        // Search by username (FEATURES.md specifies username search).
        // Also fall back to `name` if stored differently by supporting both
        // fields would require multiple queries; to keep it simple and fast
        // we search `username` which is stored lowercased at signup.
        const normalized = searchQuery.toLowerCase()
        const q = query(
          collection(db, "users"),
          where("username", ">=", normalized),
          where("username", "<=", normalized + "\uf8ff"),
        )
        const snapshot = await getDocs(q)
        const usersData = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as UserResult[]
        setResults(usersData)
        setSearched(true)
      } catch (error) {
        console.error("Error searching users:", error)
        setSearched(true)
      } finally {
        setLoading(false)
      }
    }

    searchUsers()
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Search Users</h1>
          {searchQuery && <p className="text-muted">Results for "{searchQuery}"</p>}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-muted">Searching...</div>
          </div>
        ) : !searched ? (
          <div className="text-center py-20">
            <p className="text-muted">Enter a username to search</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted">No users found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((user) => (
              <Link key={user.uid} href={`/profile/${user.uid}`}>
                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name || user.username}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-serif text-lg font-semibold text-foreground">{user.name || user.username}</h3>
                      {user.bio && <p className="text-sm text-muted line-clamp-2 mt-1">{user.bio}</p>}
                    </div>
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted">Loading...</div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
