'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Search, Server, Users, Trophy, Crown, Plus, LogIn, LogOut, 
  User, Settings, ChevronRight, ChevronLeft, Vote, Sparkles, Gamepad2,
  Globe, MessageSquare, Star, TrendingUp, Clock, Shield,
  ExternalLink, Copy, Check, X, Menu, Home, FileText, Ticket,
  Send, ArrowRight, CheckCircle2, AlertCircle, Loader2, Eye,
  Zap, Gem, Award, RefreshCw, DiscIcon, Link, Image, Tag,
  HelpCircle, MessageCircle, ChevronDown
} from 'lucide-react'

// Logo component
const Logo = ({ className = "w-10 h-10" }) => (
  <img 
    src="https://customer-assets.emergentagent.com/job_5d2bb20d-ffe5-4fb3-8c06-f22ef6426f62/artifacts/2drde4ew_Gemini_Generated_Image_jnmakrjnmakrjnma-removebg-preview.png"
    alt="ServerListRank"
    className={className}
  />
)

// Platform badge colors
const platformColors = {
  JAVA: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  BEDROCK: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CROSSPLAY: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
}

// Minecraft versions
const minecraftVersions = [
  '1.21', '1.20.6', '1.20.4', '1.20.2', '1.20.1', '1.20',
  '1.19.4', '1.19.3', '1.19.2', '1.19.1', '1.19',
  '1.18.2', '1.18.1', '1.18',
  '1.17.1', '1.17',
  '1.16.5', '1.16.4', '1.16.3',
  '1.12.2', '1.8.9', '1.7.10'
]

// Server Card Component
function ServerCard({ server, onVote, rank }) {
  const [copied, setCopied] = useState(false)

  const copyIP = () => {
    navigator.clipboard.writeText(`${server.ip}${server.port !== 25565 ? ':' + server.port : ''}`)
    setCopied(true)
    toast.success('IP kopyalandı!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 border-zinc-800 bg-zinc-900/50 backdrop-blur ${server.isSponsored ? 'ring-2 ring-yellow-500/50' : ''}`}>
      {server.isSponsored && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10">
          <Crown className="w-3 h-3" /> SPONSOR
        </div>
      )}
      
      {rank && (
        <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 ${
          rank === 1 ? 'bg-yellow-500 text-black' :
          rank === 2 ? 'bg-gray-400 text-black' :
          rank === 3 ? 'bg-amber-700 text-white' :
          'bg-zinc-700 text-white'
        }`}>
          #{rank}
        </div>
      )}
      
      {/* Banner */}
      <div className="relative h-28 bg-gradient-to-br from-emerald-900/50 to-zinc-900 overflow-hidden">
        {server.bannerUrl ? (
          <img src={server.bannerUrl} alt={server.name} className="w-full h-full object-cover opacity-70" />
        ) : (
          <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/photo/2015/03/01/19/32/minecraft-655158_1280.jpg')] bg-cover bg-center opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
        
        {/* Online status */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-full">
          <div className={`w-2 h-2 rounded-full ${server.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-white">{server.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</span>
        </div>
      </div>

      <CardContent className="relative -mt-10 p-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-16 h-16 rounded-lg bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex-shrink-0 shadow-lg">
            {server.logoUrl ? (
              <img src={server.logoUrl} alt={server.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800">
                <Server className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-lg text-white truncate">{server.name}</h3>
              <Badge variant="outline" className={`${platformColors[server.platform]} text-xs`}>
                {server.platform}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">v{server.version}</p>
            <p className="text-sm text-zinc-400 line-clamp-2 mt-1">{server.shortDescription}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mt-4 py-3 border-y border-zinc-800">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-white">{server.playerCount}</span>
            <span className="text-xs text-zinc-500">/ {server.maxPlayers}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-white">{server.voteCount}</span>
            <span className="text-xs text-zinc-500">oy</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">+{server.monthlyVotes || 0} bu ay</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600"
            onClick={copyIP}
          >
            {copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'Kopyalandı!' : `${server.ip}`}
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={() => onVote(server)}
          >
            <Vote className="w-4 h-4 mr-1" /> Oy Ver
          </Button>
        </div>

        {/* Tags */}
        {server.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {server.tags.slice(0, 4).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700">
                {tag}
              </Badge>
            ))}
            {server.tags.length > 4 && (
              <Badge variant="secondary" className="text-xs bg-zinc-800/50 text-zinc-500">
                +{server.tags.length - 4}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Vote Dialog Component
function VoteDialog({ server, open, onOpenChange }) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVote = async () => {
    if (!username.trim()) {
      toast.error('Minecraft kullanıcı adı gerekli')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/servers/${server.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minecraftUsername: username })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Oy verilemedi')
        return
      }

      toast.success('Oyunuz başarıyla kaydedildi! 🎉')
      onOpenChange(false)
      setUsername('')
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!server) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Vote className="w-5 h-5 text-emerald-500" />
            {server.name} için Oy Ver
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Oyun içi ödülünüzü almak için Minecraft kullanıcı adınızı girin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-white">Minecraft Kullanıcı Adı</Label>
            <div className="relative">
              <Input
                placeholder="Örn: Notch"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-zinc-800 border-zinc-700 pl-10 h-12 text-white"
                maxLength={16}
              />
              <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            </div>
          </div>

          {username && (
            <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <img 
                src={`https://mc-heads.net/avatar/${username}`} 
                alt={username}
                className="w-16 h-16 rounded-lg shadow-lg"
              />
              <div>
                <p className="font-bold text-white text-lg">{username}</p>
                <p className="text-sm text-zinc-400">Minecraft Oyuncu</p>
              </div>
            </div>
          )}

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Girdiğiniz kullanıcı adı sunucuya gönderilecek ve oyun içi ödülünüz bu hesaba verilecektir.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 hover:bg-zinc-800">
            İptal
          </Button>
          <Button 
            onClick={handleVote} 
            disabled={loading || !username.trim()}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gönderiliyor...</>
            ) : (
              <><Vote className="w-4 h-4 mr-2" /> Oy Ver</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Auth Dialog Component  
function AuthDialog({ open, onOpenChange, onSuccess }) {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', username: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'İşlem başarısız')
        return
      }

      toast.success(mode === 'login' ? 'Giriş başarılı!' : 'Kayıt başarılı!')
      onSuccess(data.user)
      onOpenChange(false)
      setForm({ email: '', password: '', username: '' })
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Logo className="w-8 h-8" />
            {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={setMode} className="mt-2">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
            <TabsTrigger value="login" className="data-[state=active]:bg-emerald-600">Giriş</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-emerald-600">Kayıt</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label className="text-white">Kullanıcı Adı</Label>
                <Input
                  placeholder="kullaniciadi"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 h-11"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-white">Email</Label>
              <Input
                type="email"
                placeholder="ornek@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-zinc-800 border-zinc-700 h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Şifre</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="bg-zinc-800 border-zinc-700 h-11"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Yükleniyor...</>
              ) : (
                mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'
              )}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Add Server Page Component
function AddServerPage({ onBack, onSuccess }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [form, setForm] = useState({
    name: '',
    ip: '',
    port: '25565',
    platform: 'JAVA',
    version: '1.21',
    website: '',
    discord: '',
    bannerUrl: '',
    logoUrl: '',
    shortDescription: '',
    longDescription: '',
    tags: [],
    votifierHost: '',
    votifierPort: '8192',
    votifierPublicKey: '',
    votifierToken: ''
  })
  const [tagInput, setTagInput] = useState('')

  const steps = [
    { num: 1, title: 'Temel Bilgiler', icon: Server },
    { num: 2, title: 'Medya', icon: Image },
    { num: 3, title: 'İçerik', icon: FileText },
    { num: 4, title: 'Votifier', icon: Vote }
  ]

  const verifyIP = async () => {
    if (!form.ip) {
      toast.error('IP adresi girin')
      return
    }
    setVerifying(true)
    // Simulate verification
    await new Promise(r => setTimeout(r, 1500))
    setVerified(true)
    setVerifying(false)
    toast.success('Sunucu IP\'si doğrulandı!')
  }

  const addTag = () => {
    if (tagInput.trim() && form.tags.length < 10 && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          port: parseInt(form.port) || 25565,
          votifierPort: form.votifierPort ? parseInt(form.votifierPort) : null
        })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Sunucu eklenemedi')
        return
      }

      toast.success('Sunucu eklendi! Admin onayı bekleniyor.')
      onSuccess?.(data.server)
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return form.name && form.ip && form.version
    if (step === 3) return form.shortDescription
    return true
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-zinc-800">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Logo className="w-8 h-8" />
          <span className="text-lg font-bold text-emerald-500">ServerListRank</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sunucu Gönder</h1>
          <p className="text-zinc-400">Minecraft sunucunuzu listeleyin ve oy almaya başlayın!</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > s.num ? 'bg-emerald-600 text-white' :
                  step === s.num ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/30' :
                  'bg-zinc-800 text-zinc-500'
                }`}>
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  step >= s.num ? 'text-emerald-500' : 'text-zinc-600'
                }`}>{s.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 mb-6 transition-colors ${
                  step > s.num ? 'bg-emerald-600' : 'bg-zinc-800'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Temel Bilgiler</h2>
                  <p className="text-sm text-zinc-500">Sunucunuzun temel bilgilerini girin</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Sunucu Adı *</Label>
                  <Input
                    placeholder="My Awesome Server"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 h-11"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label className="text-white">Sunucu IP Adresi *</Label>
                    <Input
                      placeholder="play.example.com"
                      value={form.ip}
                      onChange={(e) => {
                        setForm({ ...form, ip: e.target.value })
                        setVerified(false)
                      }}
                      className="bg-zinc-800 border-zinc-700 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Port *</Label>
                    <Input
                      placeholder="25565"
                      value={form.port}
                      onChange={(e) => setForm({ ...form, port: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 h-11"
                    />
                  </div>
                </div>

                <Button
                  onClick={verifyIP}
                  disabled={verifying || !form.ip}
                  className={`w-full h-11 ${
                    verified 
                      ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-600' 
                      : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  {verifying ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Doğrulanıyor...</>
                  ) : verified ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Sunucu IP'si Doğrulandı</>
                  ) : (
                    <><Check className="w-4 h-4 mr-2" /> Sunucu IP'sini Doğrula</>
                  )}
                </Button>

                <div className="space-y-2">
                  <Label className="text-white">Minecraft Versiyonu *</Label>
                  <Select value={form.version} onValueChange={(v) => setForm({ ...form, version: v })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 max-h-60">
                      {minecraftVersions.map(v => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Platform</Label>
                  <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="JAVA">☕ Java Edition</SelectItem>
                      <SelectItem value="BEDROCK">🪨 Bedrock Edition</SelectItem>
                      <SelectItem value="CROSSPLAY">🔄 Crossplay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Website (Opsiyonel)</Label>
                    <Input
                      placeholder="https://example.com"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Discord Daveti (Opsiyonel)</Label>
                    <Input
                      placeholder="https://discord.gg/example"
                      value={form.discord}
                      onChange={(e) => setForm({ ...form, discord: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 h-11"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Media */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Medya</h2>
                  <p className="text-sm text-zinc-500">Sunucunuz için görsel içerikler ekleyin</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Banner URL (Opsiyonel)</Label>
                  <Input
                    placeholder="https://example.com/banner.png"
                    value={form.bannerUrl}
                    onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 h-11"
                  />
                  <p className="text-xs text-zinc-500">Önerilen boyut: 1200x400px</p>
                  {form.bannerUrl && (
                    <div className="h-32 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                      <img src={form.bannerUrl} alt="Banner" className="w-full h-full object-cover" 
                        onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Logo URL (Opsiyonel)</Label>
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={form.logoUrl}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 h-11"
                  />
                  <p className="text-xs text-zinc-500">Önerilen boyut: 128x128px</p>
                  {form.logoUrl && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                      <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" 
                        onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Content */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">İçerik</h2>
                  <p className="text-sm text-zinc-500">Sunucunuzu tanıtın</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Kısa Açıklama *</Label>
                  <Input
                    placeholder="Sunucunuzu kısaca tanıtın (max 150 karakter)"
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 h-11"
                    maxLength={150}
                  />
                  <p className="text-xs text-zinc-500 text-right">{form.shortDescription.length}/150</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Uzun Açıklama (Opsiyonel)</Label>
                  <Textarea
                    placeholder="Sunucunuz hakkında detaylı bilgi..."
                    value={form.longDescription}
                    onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 min-h-[150px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Etiketler</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Etiket ekle (Enter)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="bg-zinc-800 border-zinc-700 h-11"
                    />
                    <Button type="button" onClick={addTag} variant="outline" className="border-zinc-700 h-11 px-4">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-zinc-800 gap-1 pr-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500">{form.tags.length}/10 etiket</p>
                </div>
              </div>
            )}

            {/* Step 4: Votifier */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Votifier Ayarları</h2>
                  <p className="text-sm text-zinc-500">Oyunculara oyun içi ödül vermek için yapılandırın</p>
                </div>

                <div className="p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-lg">
                  <h4 className="font-medium text-emerald-400 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    NuVotifier Entegrasyonu
                  </h4>
                  <p className="text-sm text-zinc-400 mt-1">
                    Oyunculara oyun içi ödül vermek için NuVotifier plugin kurulu olmalıdır.
                    <a href="https://www.spigotmc.org/resources/nuvotifier.13449/" target="_blank" rel="noopener" 
                      className="text-emerald-400 hover:underline ml-1">Plugin'i indir →</a>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Votifier Host</Label>
                    <Input
                      placeholder="play.myserver.com"
                      value={form.votifierHost}
                      onChange={(e) => setForm({ ...form, votifierHost: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Votifier Port</Label>
                    <Input
                      placeholder="8192"
                      value={form.votifierPort}
                      onChange={(e) => setForm({ ...form, votifierPort: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Public Key</Label>
                  <Textarea
                    placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                    value={form.votifierPublicKey}
                    onChange={(e) => setForm({ ...form, votifierPublicKey: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 min-h-[120px] font-mono text-xs"
                  />
                  <p className="text-xs text-zinc-500">plugins/Votifier/rsa/public.key dosyasından</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Token (Opsiyonel - V2 protokolü için)</Label>
                  <Input
                    placeholder="NuVotifier token"
                    value={form.votifierToken}
                    onChange={(e) => setForm({ ...form, votifierToken: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 h-11"
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="border-zinc-700 hover:bg-zinc-800">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Geri
                </Button>
              ) : (
                <div />
              )}
              
              {step < 4 ? (
                <Button 
                  onClick={() => setStep(step + 1)}
                  className="bg-emerald-600 hover:bg-emerald-500"
                  disabled={!canProceed()}
                >
                  Sonraki <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="bg-emerald-600 hover:bg-emerald-500"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gönderiliyor...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Sunucu Gönder</>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Not:</strong> Sunucunuz incelendikten sonra kısa süre içinde listelenecektir.</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// Support/Tickets Page Component
function TicketsPage({ user, onBack }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTicket, setNewTicket] = useState({ category: 'general', message: '' })

  const categories = [
    { value: 'general', label: 'Genel Soru' },
    { value: 'report', label: 'Sunucu Rapor Et' },
    { value: 'removal', label: 'Sunucu Kaldırma Talebi' },
    { value: 'account', label: 'Hesap Sorunu' },
    { value: 'technical', label: 'Teknik Problem' },
    { value: 'billing', label: 'Satın Alma İşlemleri' },
    { value: 'other', label: 'Diğer' }
  ]

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets')
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createTicket = async () => {
    if (!newTicket.message.trim()) {
      toast.error('Mesaj gerekli')
      return
    }
    
    setCreating(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: categories.find(c => c.value === newTicket.category)?.label || 'Destek Talebi',
          message: newTicket.message
        })
      })
      
      if (res.ok) {
        toast.success('Destek talebiniz oluşturuldu!')
        setShowCreate(false)
        setNewTicket({ category: 'general', message: '' })
        fetchTickets()
      } else {
        toast.error('Talep oluşturulamadı')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setCreating(false)
    }
  }

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true
    if (filter === 'open') return t.status === 'OPEN'
    if (filter === 'progress') return t.status === 'IN_PROGRESS'
    if (filter === 'closed') return t.status === 'CLOSED'
    return true
  })

  const statusColors = {
    OPEN: 'bg-emerald-500/20 text-emerald-400',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
    CLOSED: 'bg-zinc-500/20 text-zinc-400'
  }

  const statusLabels = {
    OPEN: 'Açık',
    IN_PROGRESS: 'İnceleniyor',
    CLOSED: 'Kapalı'
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-zinc-800">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">Destek Taleplerim</h1>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-emerald-600 hover:bg-emerald-500">
            <Plus className="w-4 h-4 mr-2" /> Yeni Talep
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: 'Tümü' },
            { value: 'open', label: 'Açık' },
            { value: 'progress', label: 'İnceleniyor' },
            { value: 'closed', label: 'Kapalı' }
          ].map(f => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.value)}
              className={filter === f.value ? 'bg-emerald-600' : 'border-zinc-700 hover:bg-zinc-800'}
            >
              {f.label} ({tickets.filter(t => f.value === 'all' ? true : 
                f.value === 'open' ? t.status === 'OPEN' :
                f.value === 'progress' ? t.status === 'IN_PROGRESS' :
                t.status === 'CLOSED').length})
            </Button>
          ))}
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="py-16 text-center">
              <Ticket className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Henüz destek talebi oluşturmadınız</h3>
              <p className="text-zinc-400 mb-6">Bir sorunuz veya probleminiz mi var?</p>
              <Button onClick={() => setShowCreate(true)} className="bg-emerald-600 hover:bg-emerald-500">
                <Plus className="w-4 h-4 mr-2" /> İlk Talep Oluştur
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map(ticket => (
              <Card key={ticket.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${ticket.status === 'OPEN' ? 'bg-emerald-500' : ticket.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-zinc-500'}`} />
                      <div>
                        <h3 className="font-medium text-white">{ticket.subject}</h3>
                        <p className="text-sm text-zinc-500">#{ticket.id.slice(0, 8)} • {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[ticket.status]}>
                        {statusLabels[ticket.status]}
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-zinc-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Ticket Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">Destek Talebi Oluştur</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Sorununuzu açıklayın, size yardımcı olalım
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-white">Kategori *</Label>
                <Select value={newTicket.category} onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Mesajınız *</Label>
                <Textarea
                  placeholder="Sorununuzu detaylı olarak açıklayın..."
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 min-h-[150px]"
                />
                <p className="text-xs text-zinc-500">Be as specific as possible to help us resolve your issue faster</p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} className="border-zinc-700 hover:bg-zinc-800">
                Cancel
              </Button>
              <Button 
                onClick={createTicket}
                disabled={creating || !newTicket.message.trim()}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                {creating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gönderiliyor...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Talep Gönder</>
                )}
              </Button>
            </DialogFooter>

            {/* Tips */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mt-2">
              <p className="text-sm text-amber-400 font-medium mb-2">💡 Tips for better support:</p>
              <ul className="text-xs text-zinc-400 space-y-1">
                <li>• Include relevant server names or links</li>
                <li>• Describe what you expected vs what happened</li>
                <li>• Add screenshots if applicable (you can reply with images)</li>
              </ul>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Premium/Pricing Page Component
function PricingPage({ onBack }) {
  const plans = [
    {
      name: 'Ücretsiz',
      price: '0',
      period: '',
      description: 'Yeni başlayanlar için',
      color: 'border-zinc-700',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-500',
      buttonText: 'Hemen Başla',
      features: [
        { text: 'Standart Listeleme', included: true },
        { text: 'Renkli Sunucu Başlığı', included: true },
        { text: '6 Saatte Bir Bump', included: true },
        { text: 'Basit Ziyaretçi Sayacı', included: true },
        { text: 'Maksimum 3 Etiket', included: true },
        { text: 'Renkli Başlık', included: false },
        { text: 'Hareketli Banner', included: false },
        { text: 'Reklamsız Sayfa', included: false }
      ]
    },
    {
      name: 'Gümüş',
      price: '79',
      period: '/ Ay',
      description: 'Küçük ölçekli, yeni sunucular için',
      color: 'border-zinc-600',
      buttonClass: 'bg-zinc-700 hover:bg-zinc-600',
      buttonText: 'Satın Al',
      features: [
        { text: 'Öncelikli Listeleme', included: true },
        { text: "En Üstte 'Benzer Sunucular'da", included: true },
        { text: 'Kalın ve Renkli Başlık', included: true },
        { text: '3 Saatte Bir Bump', included: true },
        { text: 'Discord Webhook Bildirimi', included: true },
        { text: 'Hareketli Banner', included: false },
        { text: 'Gelişmiş Analitik Paneli', included: false },
        { text: 'Detay Sayfasında Reklam Yok', included: false }
      ]
    },
    {
      name: 'Altın',
      price: '199',
      period: '/ Ay',
      description: 'Büyük oynamak isteyenler için',
      color: 'border-amber-500 ring-2 ring-amber-500/30',
      buttonClass: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black',
      buttonText: 'Satın Al',
      popular: true,
      features: [
        { text: "En Üstte 'Benzer Sunucular'da", included: true },
        { text: 'Hareketli Banner (GIF/WebP)', included: true },
        { text: 'Kalın ve Renkli Başlık', included: true },
        { text: '3 Saatte Bir Bump', included: true },
        { text: 'Hareketli Favicon', included: true },
        { text: 'Gelişmiş Analitik Paneli', included: true },
        { text: 'Detay Sayfasında Reklam Yok', included: true }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-zinc-800">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Logo className="w-8 h-8" />
          <span className="text-lg font-bold text-emerald-500">ServerListRank</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4">
            Sunucunuzu Zirveye Taşıyın
          </h1>
          <p className="text-zinc-400 text-lg">İhtiyacınıza uygun paketi seçin, oyuncu sayınızı artırın.</p>
          <div className="mt-6">
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 text-sm">
              İlk aya özel %50 indirim fırsatını kaçırmayın!
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <Card key={plan.name} className={`relative bg-zinc-900/50 ${plan.color} transition-all hover:scale-105`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-amber-500 text-black px-3">En Çok Tercih Edilen</Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                <CardDescription className="text-zinc-400">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price} TL</span>
                  {plan.period && <span className="text-zinc-500">{plan.period}</span>}
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-600" />
                      )}
                      <span className={feature.included ? 'text-zinc-300' : 'text-zinc-600'}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                <Button className={`w-full h-11 font-medium ${plan.buttonClass}`}>
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sunucunuzu Büyütmeye Hazır mısınız?</h2>
          <p className="text-zinc-400 mb-6">Binlerce oyuncuya ulaşın ve sunucunuzu Minecraft'ın en popüler sunucuları arasına taşıyın.</p>
          <Button onClick={onBack} className="bg-emerald-600 hover:bg-emerald-500 h-12 px-8">
            Hemen Başla
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null)
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('ALL')
  const [currentPage, setCurrentPage] = useState('home')
  
  // Dialogs
  const [authOpen, setAuthOpen] = useState(false)
  const [voteServer, setVoteServer] = useState(null)

  // Fetch current user
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => {})
  }, [])

  // Fetch servers
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (platform !== 'ALL') params.set('platform', platform)

    fetch(`/api/servers?${params}`)
      .then(res => res.json())
      .then(data => {
        setServers(data.servers || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [search, platform])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    toast.success('Çıkış yapıldı')
  }

  const refreshServers = () => {
    fetch('/api/servers')
      .then(res => res.json())
      .then(data => setServers(data.servers || []))
  }

  // Render different pages
  if (currentPage === 'add-server') {
    return <AddServerPage onBack={() => setCurrentPage('home')} onSuccess={() => { setCurrentPage('home'); refreshServers() }} />
  }

  if (currentPage === 'tickets') {
    return <TicketsPage user={user} onBack={() => setCurrentPage('home')} />
  }

  if (currentPage === 'pricing') {
    return <PricingPage onBack={() => setCurrentPage('home')} />
  }

  const sponsoredServers = servers.filter(s => s.isSponsored)
  const topServers = servers.filter(s => !s.isSponsored).sort((a, b) => b.voteCount - a.voteCount)

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              ServerListRank
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setCurrentPage('home')} className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" /> Ana Sayfa
            </button>
            <button onClick={() => setCurrentPage('pricing')} className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
              <Gem className="w-4 h-4" /> Premium
            </button>
            {user && (
              <button onClick={() => setCurrentPage('tickets')} className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                <Ticket className="w-4 h-4" /> Destek
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  className="border-emerald-600 text-emerald-500 hover:bg-emerald-600 hover:text-white"
                  onClick={() => setCurrentPage('add-server')}
                >
                  <Plus className="w-4 h-4 mr-1" /> Sunucu Ekle
                </Button>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 ring-2 ring-emerald-600/50">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-emerald-600 text-white">
                      {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white hidden md:block">{user.username || user.email}</span>
                  {user.role === 'ADMIN' && (
                    <Badge className="bg-red-600 text-white text-xs">Admin</Badge>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-zinc-800">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button 
                className="bg-emerald-600 hover:bg-emerald-500"
                onClick={() => setAuthOpen(true)}
              >
                <LogIn className="w-4 h-4 mr-1" /> Giriş Yap
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/photo/2015/03/01/19/32/minecraft-655158_1280.jpg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-zinc-950 to-zinc-950" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <Logo className="w-20 h-20" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                En İyi Minecraft
              </span>
              <br />
              <span className="text-white">Sunucularını Keşfet</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-8">
              Binlerce sunucu arasından favorini bul, oy ver ve kendi sunucunu ekle!
            </p>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  placeholder="Sunucu ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 bg-zinc-900 border-zinc-800 focus:border-emerald-600"
                />
              </div>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-full sm:w-40 h-12 bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="ALL">Tümü</SelectItem>
                  <SelectItem value="JAVA">Java</SelectItem>
                  <SelectItem value="BEDROCK">Bedrock</SelectItem>
                  <SelectItem value="CROSSPLAY">Crossplay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-10">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-500">{servers.length}+</div>
                <div className="text-sm text-zinc-500">Sunucu</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-500">10K+</div>
                <div className="text-sm text-zinc-500">Oyuncu</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-500">50K+</div>
                <div className="text-sm text-zinc-500">Oy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsored Servers */}
      {sponsoredServers.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-yellow-900/10 to-transparent">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-white">Sponsorlu Sunucular</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsoredServers.map(server => (
                <ServerCard 
                  key={server.id} 
                  server={server} 
                  onVote={setVoteServer}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Servers */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-bold text-white">En Çok Oy Alan Sunucular</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-4">
                      <div className="h-28 bg-zinc-800 rounded" />
                      <div className="h-4 bg-zinc-800 rounded w-3/4" />
                      <div className="h-4 bg-zinc-800 rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : topServers.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-12 text-center">
                <Server className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Henüz sunucu yok</h3>
                <p className="text-zinc-400 mb-4">İlk sunucuyu sen ekle!</p>
                {user ? (
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-500"
                    onClick={() => setCurrentPage('add-server')}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Sunucu Ekle
                  </Button>
                ) : (
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-500"
                    onClick={() => setAuthOpen(true)}
                  >
                    Giriş Yap
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topServers.map((server, index) => (
                <ServerCard 
                  key={server.id} 
                  server={server} 
                  onVote={setVoteServer}
                  rank={index + 1}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <span className="font-bold text-white">ServerListRank</span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => setCurrentPage('pricing')} className="text-sm text-zinc-400 hover:text-white">Premium</button>
              {user && <button onClick={() => setCurrentPage('tickets')} className="text-sm text-zinc-400 hover:text-white">Destek</button>}
            </div>
            <p className="text-sm text-zinc-500">
              © 2024 ServerListRank. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <AuthDialog 
        open={authOpen} 
        onOpenChange={setAuthOpen} 
        onSuccess={setUser}
      />
      <VoteDialog 
        server={voteServer} 
        open={!!voteServer} 
        onOpenChange={(open) => !open && setVoteServer(null)}
      />
    </div>
  )
}
