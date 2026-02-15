'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function DiscordButton() {
  const [discordUrl, setDiscordUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch Discord URL from settings API
    const fetchDiscordUrl = async () => {
      try {
        const response = await fetch('/api/settings')
        const data = await response.json()
        
        if (data.settings?.discordUrl) {
          setDiscordUrl(data.settings.discordUrl)
        }
      } catch (error) {
        console.error('Discord URL fetch error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiscordUrl()
  }, [])

  // Don't render if no Discord URL or still loading
  if (isLoading || !discordUrl) {
    return null
  }

  return (
    <Link
      href={discordUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label="Discord Topluluğumuza Katıl"
    >
      <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
      
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-[#5865F2] animate-ping opacity-20" />
    </Link>
  )
}

