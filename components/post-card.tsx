"use client"

import Link from "next/link"

interface PostCardProps {
  id: string
  title: string
  excerpt: string
  authorName: string
  authorAvatar: string
  likesCount: number
  createdAt: Date
  editedAt?: any
}

export default function PostCard({
  id,
  title,
  excerpt,
  authorName,
  authorAvatar,
  likesCount,
  createdAt,
  editedAt,
}: PostCardProps) {
  // Use a consistent date format to avoid hydration mismatches
  const date = new Date(createdAt)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const formattedDate = `${months[date.getMonth()]} ${date.getDate()}`

  return (
    <Link href={`/post/${id}`}>
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col justify-between hover:border-accent/50 group">
        <div>
          {editedAt && (
            <div className="text-xs text-muted mb-2">Edited</div>
          )}
          <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-accent transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted line-clamp-3 mb-4 leading-relaxed">{excerpt}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <img
              src={authorAvatar || "/placeholder.svg"}
              alt={authorName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">{authorName}</span>
              <span className="text-xs text-muted">{formattedDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-accent">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            <span className="text-xs">{likesCount}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
