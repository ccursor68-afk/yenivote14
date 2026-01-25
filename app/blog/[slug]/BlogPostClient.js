'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronLeft, BookOpen, Loader2, Tag, Calendar, User } from 'lucide-react'
import Link from 'next/link'

const blogTypeLabels = {
  GUIDE: { label: 'Rehber', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  UPDATE: { label: 'Güncelleme', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  NEWS: { label: 'Haber', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  TUTORIAL: { label: 'Eğitim', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
}

const Logo = ({ className = "w-10 h-10" }) => (
  <img 
    src="https://customer-assets.emergentagent.com/job_5d2bb20d-ffe5-4fb3-8c06-f22ef6426f62/artifacts/2drde4ew_Gemini_Generated_Image_jnmakrjnmakrjnma-removebg-preview.png"
    alt="ServerListRank"
    className={className}
  />
)

export default function BlogPostClient({ slug, initialPost }) {
  const [post, setPost] = useState(initialPost)
  const [loading, setLoading] = useState(!initialPost)

  useEffect(() => {
    if (!initialPost) {
      fetch(`/api/blog/${slug}`)
        .then(res => res.json())
        .then(data => {
          setPost(data.post)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [slug, initialPost])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <BookOpen className="w-16 h-16 text-zinc-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Yazı Bulunamadı</h2>
        <Link href="/">
          <Button variant="outline" className="border-zinc-700">
            <ChevronLeft className="w-4 h-4 mr-1" /> Ana Sayfa
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-zinc-800">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="text-lg font-bold text-emerald-500">Blog</span>
          </Link>
        </div>
      </header>

      <article className="container mx-auto px-4 py-8 max-w-3xl">
        {post.coverImage && (
          <div className="rounded-xl overflow-hidden mb-8 h-64 md:h-80">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Type and Category Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {post.blogType && blogTypeLabels[post.blogType] && (
            <Badge variant="outline" className={blogTypeLabels[post.blogType].color}>
              {blogTypeLabels[post.blogType].label}
            </Badge>
          )}
          {post.category && (
            <Badge variant="outline" style={{ borderColor: post.category.color + '50', color: post.category.color }}>
              {post.category.name}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{post.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-6">
          {post.author && (
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={post.author.avatarUrl} />
                <AvatarFallback className="bg-emerald-600 text-xs">
                  {post.author.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{post.author.username}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(post.createdAt).toLocaleDateString('tr-TR', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-zinc-800">
            <Tag className="w-4 h-4 text-zinc-500" />
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="prose prose-invert prose-emerald max-w-none">
          <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>
        </div>

        {/* Share and Back */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <Link href="/">
            <Button variant="outline" className="border-zinc-700">
              <ChevronLeft className="w-4 h-4 mr-1" /> Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </article>
    </div>
  )
}
