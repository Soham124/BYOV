"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const { user, logout, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
      setSearchOpen(false)
    }
  }

  // Only render nav after client mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16" />
      </nav>
    )
  }

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16" />
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-serif font-bold text-accent">
            BYOV
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-foreground hover:text-accent transition-colors">
              Home
            </Link>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-foreground hover:text-accent transition-colors"
              title="Search users"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            {user ? (
              <>
                <Link href="/create" className="text-foreground hover:text-accent transition-colors">
                  Create
                </Link>
                <Link href="/private-verses" className="text-foreground hover:text-accent transition-colors">
                  Private
                </Link>
                <Link href={`/profile/${user.uid}`} className="text-foreground hover:text-accent transition-colors">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-foreground rounded-lg font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-foreground hover:text-accent transition-colors">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-foreground rounded-lg font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 border-t border-border">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-foreground rounded-lg font-medium transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block px-4 py-2 text-foreground hover:bg-background rounded-lg">
              Home
            </Link>
            <button
              onClick={() => {
                setSearchOpen(!searchOpen)
                setMobileMenuOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-foreground hover:bg-background rounded-lg"
            >
              Search
            </button>
            {user ? (
              <>
                <Link href="/create" className="block px-4 py-2 text-foreground hover:bg-background rounded-lg">
                  Create
                </Link>
                <Link href="/private-verses" className="block px-4 py-2 text-foreground hover:bg-background rounded-lg">
                  Private Verses
                </Link>
                <Link
                  href={`/profile/${user.uid}`}
                  className="block px-4 py-2 text-foreground hover:bg-background rounded-lg"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-foreground hover:bg-background rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-2 text-foreground hover:bg-background rounded-lg">
                  Login
                </Link>
                <Link href="/signup" className="block px-4 py-2 text-foreground hover:bg-background rounded-lg">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
