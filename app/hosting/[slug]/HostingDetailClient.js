'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  ChevronLeft, Server, Star, ExternalLink, Loader2, CheckCircle, Shield, Users
} from 'lucide-react'

export default function HostingDetailClient({ slug }) {
  const router = useRouter()
  const [hosting, setHosting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewForm, setReviewForm] = useState({ performance: 5, support: 5, priceValue: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Check auth
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data?.user || null))
      .catch(() => {})

    // Fetch hosting details
    fetch(`/api/hostings/${slug}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setHosting(data.hosting)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  const StarRating = ({ value, onChange, readonly = false }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star className={`w-5 h-5 ${star <= value ? 'fill-yellow-500 text-yellow-500' : 'text-zinc-600'}`} />
        </button>
      ))}
    </div>
  )

  const submitReview = async () => {
    if (!user) {
      toast.error('Değerlendirme yapmak için giriş yapmalısınız')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/hostings/${hosting.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(reviewForm)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Değerlendirme kaydedildi!')
        if (data.newBadges?.length > 0) {
          toast.success(`🎉 Yeni rozet kazandınız: ${data.newBadges.join(', ')}`)
        }
        setReviewOpen(false)
        // Refresh hosting data
        const updated = await fetch(`/api/hostings/${slug}`, { credentials: 'include' }).then(r => r.json())
        setHosting(updated.hosting)
      } else {
        toast.error(data.error || 'Hata oluştu')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!hosting) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <Server className="w-16 h-16 text-zinc-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Hosting Bulunamadı</h2>
        <Button onClick={() => router.push('/hosting')} variant="outline" className="border-zinc-700">
          <ChevronLeft className="w-4 h-4 mr-1" /> Hosting Listesi
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-zinc-800">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-lg font-bold text-emerald-500">{hosting.name}</span>
          {hosting.isVerified && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <CheckCircle className="w-3 h-3 mr-1" /> Onaylı
            </Badge>
          )}
          {hosting.isSponsored && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <Star className="w-3 h-3 mr-1" /> Sponsor
            </Badge>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Main Card */}
        <Card className="bg-zinc-900/80 backdrop-blur border-zinc-800 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Logo */}
              <div className="w-24 h-24 rounded-xl bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex-shrink-0">
                {hosting.logoUrl ? (
                  <img src={hosting.logoUrl} alt={hosting.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800">
                    <Server className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{hosting.name}</h1>
                  {hosting.isVerified && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <Shield className="w-3 h-3 mr-1" /> Doğrulanmış
                    </Badge>
                  )}
                </div>
                <p className="text-zinc-400 mt-2">{hosting.description}</p>

                {/* Ratings */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.round(hosting.avgOverall || 0) ? 'fill-yellow-500' : 'fill-zinc-700 text-zinc-700'}`} />
                    ))}
                    <span className="text-white ml-2 font-bold text-xl">{(hosting.avgOverall || 0).toFixed(1)}</span>
                  </div>
                  <span className="text-zinc-500">({hosting.reviewCount} değerlendirme)</span>
                </div>

                {/* Price */}
                <div className="mt-4">
                  <span className="text-3xl font-bold text-emerald-500">{parseFloat(hosting.startingPrice).toFixed(2)}</span>
                  <span className="text-zinc-400"> ₺/ay'dan başlayan fiyatlar</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <a href={hosting.website} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500">
                    <ExternalLink className="w-4 h-4 mr-2" /> Siteye Git
                  </Button>
                </a>
                <Button variant="outline" className="w-full border-zinc-700" onClick={() => {
                  setReviewForm({ performance: 5, support: 5, priceValue: 5, comment: '' })
                  setReviewOpen(true)
                }}>
                  <Star className="w-4 h-4 mr-2" /> Değerlendir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ratings Detail */}
        <Card className="bg-zinc-900/80 backdrop-blur border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Detaylı Puanlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Performans</span>
                <span className="text-white font-medium">{(hosting.avgPerformance || 0).toFixed(1)}/5</span>
              </div>
              <Progress value={(hosting.avgPerformance || 0) * 20} className="h-2 bg-zinc-800" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Destek Kalitesi</span>
                <span className="text-white font-medium">{(hosting.avgSupport || 0).toFixed(1)}/5</span>
              </div>
              <Progress value={(hosting.avgSupport || 0) * 20} className="h-2 bg-zinc-800" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Fiyat/Performans</span>
                <span className="text-white font-medium">{(hosting.avgPriceValue || 0).toFixed(1)}/5</span>
              </div>
              <Progress value={(hosting.avgPriceValue || 0) * 20} className="h-2 bg-zinc-800" />
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        {hosting.features?.length > 0 && (
          <Card className="bg-zinc-900/80 backdrop-blur border-zinc-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Özellikler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {hosting.features.map((feature, i) => (
                  <Badge key={i} variant="outline" className="border-emerald-500/30 text-emerald-400">
                    <CheckCircle className="w-3 h-3 mr-1" /> {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Long Description */}
        {hosting.longDescription && (
          <Card className="bg-zinc-900/80 backdrop-blur border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Hakkında</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-300 whitespace-pre-wrap">{hosting.longDescription}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">{hosting.name} Değerlendir</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-white">Performans</Label>
              <StarRating value={reviewForm.performance} onChange={(v) => setReviewForm(f => ({ ...f, performance: v }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Destek Kalitesi</Label>
              <StarRating value={reviewForm.support} onChange={(v) => setReviewForm(f => ({ ...f, support: v }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Fiyat/Performans</Label>
              <StarRating value={reviewForm.priceValue} onChange={(v) => setReviewForm(f => ({ ...f, priceValue: v }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Yorum (Opsiyonel)</Label>
              <Textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Deneyiminizi paylaşın..."
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)} className="border-zinc-700">İptal</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={submitReview} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gönder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
