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
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { 
  Search, Server, Users, Trophy, Crown, Plus, LogIn, LogOut, 
  User, Settings, ChevronRight, ChevronLeft, Vote, Sparkles, Gamepad2,
  Globe, MessageSquare, Star, TrendingUp, Clock, Shield,
  ExternalLink, Copy, Check, X, Menu, Home, FileText, Ticket,
  Send, ArrowRight, CheckCircle2, AlertCircle, Loader2, Eye,
  Zap, Gem, Award, RefreshCw, DiscIcon, Link, Image, Tag,
  HelpCircle, MessageCircle, ChevronDown, Edit, Trash2, BarChart3,
  UserCog, ServerCog, BookOpen, PenSquare, Calendar, ArrowUpRight
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

// Game mode labels and colors
const gameModes = [
  { value: 'SURVIVAL', label: 'Survival', color: 'bg-green-500/20 text-green-400' },
  { value: 'SKYBLOCK', label: 'Skyblock', color: 'bg-sky-500/20 text-sky-400' },
  { value: 'FACTION', label: 'Faction', color: 'bg-red-500/20 text-red-400' },
  { value: 'TOWNY', label: 'Towny', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'CREATIVE', label: 'Creative', color: 'bg-pink-500/20 text-pink-400' },
  { value: 'MINIGAMES', label: 'Minigames', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'PRISON', label: 'Prison', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'KITPVP', label: 'KitPvP', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'OTHER', label: 'Diğer', color: 'bg-zinc-500/20 text-zinc-400' }
]

const getGameModeStyle = (mode) => {
  const found = gameModes.find(g => g.value === mode)
  return found ? found.color : 'bg-zinc-500/20 text-zinc-400'
}

const getGameModeLabel = (mode) => {
  const found = gameModes.find(g => g.value === mode)
  return found ? found.label : mode
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
function ServerCard({ server, onVote, onView, rank }) {
  const [copied, setCopied] = useState(false)

  const copyIP = async () => {
    try {
      const ipText = `${server.ip}${server.port !== 25565 ? ':' + server.port : ''}`
      await navigator.clipboard.writeText(ipText)
      setCopied(true)
      toast.success('IP kopyalandı!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = `${server.ip}${server.port !== 25565 ? ':' + server.port : ''}`
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      toast.success('IP kopyalandı!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 border-zinc-800 bg-zinc-900/50 backdrop-blur cursor-pointer ${server.isSponsored ? 'ring-2 ring-yellow-500/50' : ''}`}
      onClick={() => onView?.(server)}>
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
              {server.gameMode && (
                <Badge variant="outline" className={`${getGameModeStyle(server.gameMode)} text-xs`}>
                  {getGameModeLabel(server.gameMode)}
                </Badge>
              )}
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
            onClick={(e) => { e.stopPropagation(); copyIP(); }}
          >
            {copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'Kopyalandı!' : `${server.ip}`}
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={(e) => { e.stopPropagation(); onVote(server); }}
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

// Server Detail Page Component
function ServerDetailPage({ serverId, onBack, onVote, user }) {
  const [server, setServer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/servers/${serverId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setServer(data.server)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [serverId])

  const copyIP = async () => {
    if (!server) return
    try {
      const ipText = `${server.ip}${server.port !== 25565 ? ':' + server.port : ''}`
      await navigator.clipboard.writeText(ipText)
      setCopied(true)
      toast.success('IP kopyalandı!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = `${server.ip}${server.port !== 25565 ? ':' + server.port : ''}`
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      toast.success('IP kopyalandı!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!server) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <Server className="w-16 h-16 text-zinc-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Sunucu Bulunamadı</h2>
        <Button onClick={onBack} variant="outline" className="border-zinc-700">
          <ChevronLeft className="w-4 h-4 mr-1" /> Geri Dön
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Banner */}
      <div className="relative h-64 md:h-80">
        {server.bannerUrl ? (
          <img src={server.bannerUrl} alt={server.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[url('https://cdn.pixabay.com/photo/2015/03/01/19/32/minecraft-655158_1280.jpg')] bg-cover bg-center" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
        
        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Button onClick={onBack} variant="outline" size="sm" className="bg-black/50 border-zinc-700 hover:bg-black/70">
            <ChevronLeft className="w-4 h-4 mr-1" /> Geri
          </Button>
        </div>

        {/* Sponsor badge */}
        {server.isSponsored && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <Crown className="w-5 h-5" /> SPONSOR SUNUCU
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="bg-zinc-900/80 backdrop-blur border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-xl bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex-shrink-0">
                    {server.logoUrl ? (
                      <img src={server.logoUrl} alt={server.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800">
                        <Server className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-bold text-white">{server.name}</h1>
                      <Badge variant="outline" className={`${platformColors[server.platform]}`}>
                        {server.platform}
                      </Badge>
                      {server.isOnline ? (
                        <Badge className="bg-emerald-600">Çevrimiçi</Badge>
                      ) : (
                        <Badge variant="destructive">Çevrimdışı</Badge>
                      )}
                    </div>
                    <p className="text-zinc-400 mt-2">{server.shortDescription}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-500" />
                        <span className="text-white font-medium">{server.playerCount}/{server.maxPlayers}</span>
                        <span className="text-zinc-500">Oyuncu</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="text-white font-medium">{server.voteCount}</span>
                        <span className="text-zinc-500">Oy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-zinc-500" />
                        <span className="text-zinc-400">v{server.version}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="bg-zinc-900/80 backdrop-blur border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  Sunucu Hakkında
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-zinc-300 whitespace-pre-wrap">
                    {server.longDescription || server.shortDescription}
                  </p>
                </div>
                
                {server.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-zinc-800">
                    {server.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-zinc-800 text-zinc-300">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner Info */}
            {server.owner && (
              <Card className="bg-zinc-900/80 backdrop-blur border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-500" />
                    Sunucu Sahibi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={server.owner.avatarUrl} />
                      <AvatarFallback className="bg-emerald-600">
                        {server.owner.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{server.owner.username || 'Anonim'}</p>
                      {server.owner.minecraftNick && (
                        <p className="text-sm text-zinc-500">MC: {server.owner.minecraftNick}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* IP & Vote Card */}
            <Card className="bg-zinc-900/80 backdrop-blur border-zinc-800 sticky top-4">
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-zinc-400 text-sm">Sunucu IP</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 bg-zinc-800 px-4 py-3 rounded-lg text-emerald-400 font-mono">
                      {server.ip}{server.port !== 25565 ? `:${server.port}` : ''}
                    </code>
                    <Button onClick={copyIP} variant="outline" size="icon" className="border-zinc-700">
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-lg"
                  onClick={() => onVote(server)}
                >
                  <Vote className="w-5 h-5 mr-2" /> Oy Ver
                </Button>

                {server.hasVotifier && (
                  <p className="text-xs text-center text-emerald-400">
                    ✓ NuVotifier aktif - Oyun içi ödül alabilirsiniz
                  </p>
                )}

                <Separator className="bg-zinc-800" />

                {/* Links */}
                <div className="space-y-2">
                  {server.website && (
                    <a href={server.website} target="_blank" rel="noopener noreferrer" 
                      className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                      <Globe className="w-4 h-4" />
                      Website
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  {server.discord && (
                    <a href={server.discord} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Discord
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
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
        credentials: 'include',
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
        credentials: 'include',
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

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-900 px-2 text-zinc-500">veya</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline"
              className="w-full h-11 border-zinc-700 hover:bg-zinc-800 text-white font-medium"
              onClick={() => window.location.href = '/api/auth/discord'}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Discord ile {mode === 'login' ? 'Giriş Yap' : 'Devam Et'}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Profile Page Component
// Badge display info
const BADGE_INFO = {
  CRITIC: { name: 'Eleştirmen', icon: '⭐', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  EXPLORER: { name: 'Kaşif', icon: '🌍', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  VERIFIED_OWNER: { name: 'Onaylı Sahip', icon: '✓', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  EARLY_ADOPTER: { name: 'Öncü', icon: '🚀', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  TOP_VOTER: { name: 'Oy Ustası', icon: '🗳️', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
}

function ProfilePage({ user, onBack, onUpdateUser }) {
  const [loading, setLoading] = useState(false)
  const [servers, setServers] = useState([])
  const [tickets, setTickets] = useState([])
  const [badges, setBadges] = useState([])
  const [form, setForm] = useState({
    username: user?.username || '',
    minecraftNick: user?.minecraftNick || ''
  })

  useEffect(() => {
    // Fetch user's servers
    fetch('/api/servers/my', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setServers(data.servers || []))
      .catch(() => {})

    // Fetch user's tickets
    fetch('/api/tickets', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setTickets(data.tickets || []))
      .catch(() => {})

    // Fetch user's badges
    if (user?.id) {
      fetch(`/api/users/${user.id}/badges`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setBadges(data.badges || []))
        .catch(() => {})
    }
  }, [user?.id])

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Güncelleme başarısız')
        return
      }

      toast.success('Profil güncellendi!')
      onUpdateUser?.(data.user)
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    PENDING: 'bg-amber-500/20 text-amber-400',
    APPROVED: 'bg-emerald-500/20 text-emerald-400',
    REJECTED: 'bg-red-500/20 text-red-400'
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
          <span className="text-lg font-bold text-emerald-500">Profilim</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="bg-zinc-900/50 border-zinc-800 md:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24 mx-auto ring-4 ring-emerald-600/30">
                  <AvatarImage src={user?.avatarUrl || (form.minecraftNick ? `https://mc-heads.net/avatar/${form.minecraftNick}` : null)} />
                  <AvatarFallback className="bg-emerald-600 text-2xl">
                    {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {user?.role === 'ADMIN' && (
                  <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600">Admin</Badge>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mt-4">{user?.username || 'Kullanıcı'}</h2>
              <p className="text-zinc-500 text-sm">{user?.email}</p>
              
              {/* User Badges */}
              {badges.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {badges.map(badge => {
                    const info = BADGE_INFO[badge.badgeType] || {}
                    return (
                      <Badge key={badge.id} variant="outline" className={info.color} title={`Kazanıldı: ${new Date(badge.earnedAt).toLocaleDateString('tr-TR')}`}>
                        <span className="mr-1">{info.icon}</span>
                        {info.name}
                      </Badge>
                    )
                  })}
                </div>
              )}
              
              <Separator className="my-6 bg-zinc-800" />
              
              <div className="space-y-3 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Sunucular</span>
                  <span className="text-white font-medium">{servers.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Destek Talepleri</span>
                  <span className="text-white font-medium">{tickets.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Rozetler</span>
                  <span className="text-white font-medium">{badges.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Üyelik</span>
                  <span className="text-white font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="bg-zinc-900/50 border-zinc-800 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-500" />
                Profil Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Kullanıcı Adı</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="kullaniciadi"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Minecraft Nick</Label>
                <Input
                  value={form.minecraftNick}
                  onChange={(e) => setForm({ ...form, minecraftNick: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="MinecraftNick"
                />
                <p className="text-xs text-zinc-500">Avatarınız otomatik olarak mc-heads.net üzerinden alınacak</p>
              </div>

              {form.minecraftNick && (
                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                  <img 
                    src={`https://mc-heads.net/avatar/${form.minecraftNick}`}
                    alt={form.minecraftNick}
                    className="w-12 h-12 rounded"
                  />
                  <div>
                    <p className="text-white font-medium">{form.minecraftNick}</p>
                    <p className="text-xs text-zinc-500">Avatar önizleme</p>
                  </div>
                </div>
              )}

              <Button onClick={handleSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Kaydet
              </Button>
            </CardContent>
          </Card>

          {/* My Servers */}
          <Card className="bg-zinc-900/50 border-zinc-800 md:col-span-3">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-500" />
                Sunucularım
              </CardTitle>
            </CardHeader>
            <CardContent>
              {servers.length === 0 ? (
                <div className="text-center py-8">
                  <Server className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">Henüz sunucu eklemediniz</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {servers.map(server => (
                    <div key={server.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-zinc-700 flex items-center justify-center">
                          {server.logoUrl ? (
                            <img src={server.logoUrl} alt={server.name} className="w-full h-full rounded object-cover" />
                          ) : (
                            <Server className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{server.name}</p>
                          <p className="text-xs text-zinc-500">{server.ip}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[server.approvalStatus]}>
                          {server.approvalStatus === 'PENDING' ? 'Beklemede' : 
                           server.approvalStatus === 'APPROVED' ? 'Onaylı' : 'Reddedildi'}
                        </Badge>
                        <span className="text-sm text-zinc-500">{server.voteCount} oy</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Blog Page Component
// Blog type labels and colors
const blogTypeLabels = {
  GUIDE: { label: 'Rehber', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  UPDATE: { label: 'Güncelleme', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  NEWS: { label: 'Haber', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  TUTORIAL: { label: 'Eğitim', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
}

function BlogPage({ onBack, onViewPost }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState(null)
  const [typeCounts, setTypeCounts] = useState({})

  const fetchPosts = (type = null) => {
    setLoading(true)
    const url = type ? `/api/blog?type=${type}` : '/api/blog'
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || [])
        setTypeCounts(data.typeCounts || {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleTypeFilter = (type) => {
    if (activeType === type) {
      setActiveType(null)
      fetchPosts()
    } else {
      setActiveType(type)
      fetchPosts(type)
    }
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
          <span className="text-lg font-bold text-emerald-500">Blog</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Blog</h1>
          <p className="text-zinc-400">Minecraft dünyasından haberler ve rehberler</p>
        </div>

        {/* Type Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={activeType === null ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeFilter(null)}
            className={activeType === null ? "bg-emerald-600" : "border-zinc-700"}
          >
            Tümü
          </Button>
          {Object.entries(blogTypeLabels).map(([type, { label, color }]) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={() => handleTypeFilter(type)}
              className={`${activeType === type ? color : 'border-zinc-700'}`}
            >
              {label}
              {typeCounts[type] > 0 && (
                <span className="ml-1 text-xs opacity-70">({typeCounts[type]})</span>
              )}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="py-16 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Henüz yazı yok</h3>
              <p className="text-zinc-400">Yakında yeni içerikler eklenecek</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {posts.map(post => (
              <Card 
                key={post.id} 
                className="bg-zinc-900/50 border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors overflow-hidden"
                onClick={() => onViewPost?.(post.slug)}
              >
                {post.coverImage && (
                  <div className="h-48 overflow-hidden">
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
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
                  <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">{post.title}</h2>
                  {post.excerpt && (
                    <p className="text-zinc-400 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">
                      {new Date(post.createdAt).toLocaleDateString('tr-TR', { 
                        year: 'numeric', month: 'long', day: 'numeric' 
                      })}
                    </span>
                    <span className="text-emerald-500 flex items-center gap-1">
                      Oku <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Blog Post Detail Page
function BlogPostPage({ slug, onBack }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(res => res.json())
      .then(data => {
        setPost(data.post)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

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
        <Button onClick={onBack} variant="outline" className="border-zinc-700">
          <ChevronLeft className="w-4 h-4 mr-1" /> Geri Dön
        </Button>
      </div>
    )
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
          <span className="text-lg font-bold text-emerald-500">Blog</span>
        </div>
      </header>

      <article className="container mx-auto px-4 py-8 max-w-3xl">
        {post.coverImage && (
          <div className="rounded-xl overflow-hidden mb-8 h-64 md:h-80">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{post.title}</h1>
        
        <div className="flex items-center gap-4 text-sm text-zinc-500 mb-8 pb-8 border-b border-zinc-800">
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
          <span>•</span>
          <span>
            {new Date(post.createdAt).toLocaleDateString('tr-TR', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            })}
          </span>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none">
          <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>
        </div>
      </article>
    </div>
  )
}

// Hosting Page Component
function HostingPage({ onBack, user, onOpenAuth }) {
  const [hostings, setHostings] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewForm, setReviewForm] = useState({ performance: 5, support: 5, priceValue: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/hostings', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setHostings(data.hostings || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const submitReview = async () => {
    if (!user) {
      onOpenAuth?.()
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/hostings/${reviewModal.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(reviewForm)
      })
      if (res.ok) {
        toast.success('Değerlendirme kaydedildi!')
        setReviewModal(null)
        // Refresh hostings
        const updated = await fetch('/api/hostings', { credentials: 'include' }).then(r => r.json())
        setHostings(updated.hostings || [])
      } else {
        const data = await res.json()
        toast.error(data.error || 'Hata oluştu')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-zinc-800"><ChevronLeft className="w-5 h-5" /></Button>
          <Logo className="w-8 h-8" />
          <span className="text-lg font-bold text-emerald-500">Minecraft Hosting Karşılaştırma</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">En İyi Minecraft Hosting Firmaları</h1>
          <p className="text-zinc-400">Performans, destek ve fiyat/performans açısından karşılaştırın</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {hostings.map((hosting, index) => (
              <Card key={hosting.id} className={`bg-zinc-900/80 border-zinc-800 overflow-hidden ${hosting.isSponsored ? 'ring-2 ring-yellow-500/50' : ''}`}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Rank & Logo */}
                    <div className="flex items-center gap-4 p-6 md:w-64 border-b md:border-b-0 md:border-r border-zinc-800">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-gray-400 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-700 text-white'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white text-lg">{hosting.name}</h3>
                          {hosting.isVerified && <Badge className="bg-emerald-500/20 text-emerald-400 text-xs border-emerald-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Onaylı</Badge>}
                          {hosting.isSponsored && <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Sponsor</Badge>}
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.round(hosting.avgOverall) ? 'fill-yellow-500' : 'fill-zinc-700 text-zinc-700'}`} />
                          ))}
                          <span className="text-white ml-1 font-bold">{hosting.avgOverall?.toFixed(1) || '0.0'}</span>
                          <span className="text-zinc-500 text-sm">({hosting.reviewCount} değerlendirme)</span>
                        </div>
                      </div>
                    </div>

                    {/* Ratings */}
                    <div className="flex-1 p-6 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-zinc-400">Performans</span>
                            <span className="text-white font-medium">{hosting.avgPerformance?.toFixed(1) || '0.0'}</span>
                          </div>
                          <Progress value={(hosting.avgPerformance || 0) * 20} className="h-2 bg-zinc-800" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-zinc-400">Destek</span>
                            <span className="text-white font-medium">{hosting.avgSupport?.toFixed(1) || '0.0'}</span>
                          </div>
                          <Progress value={(hosting.avgSupport || 0) * 20} className="h-2 bg-zinc-800" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-zinc-400">Fiyat/Performans</span>
                            <span className="text-white font-medium">{hosting.avgPriceValue?.toFixed(1) || '0.0'}</span>
                          </div>
                          <Progress value={(hosting.avgPriceValue || 0) * 20} className="h-2 bg-zinc-800" />
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400">{hosting.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {hosting.features?.slice(0, 4).map((f, i) => (
                          <Badge key={i} variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">{f}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="p-6 md:w-48 flex flex-col items-center justify-center gap-3 border-t md:border-t-0 md:border-l border-zinc-800 bg-zinc-900">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-emerald-500">{parseFloat(hosting.startingPrice).toFixed(2)}</span>
                        <span className="text-zinc-400 text-sm"> ₺/ay</span>
                      </div>
                      <a href={hosting.website} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-500">
                          <ExternalLink className="w-4 h-4 mr-1" /> Siteye Git
                        </Button>
                      </a>
                      <Button variant="outline" className="w-full border-zinc-700" onClick={() => {
                        setReviewForm({ performance: 5, support: 5, priceValue: 5, comment: '' })
                        setReviewModal(hosting)
                      }}>
                        <Star className="w-4 h-4 mr-1" /> Değerlendir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={!!reviewModal} onOpenChange={() => setReviewModal(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">{reviewModal?.name} Değerlendir</DialogTitle>
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
              <Textarea value={reviewForm.comment} onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))} placeholder="Deneyiminizi paylaşın..." className="bg-zinc-800 border-zinc-700" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModal(null)} className="border-zinc-700">İptal</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={submitReview} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gönder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Pricing Page Component
function PricingPage({ onBack, user, onOpenAuth }) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pricing', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setPackages(data.packages || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handlePackageClick = async (pkg) => {
    if (!user) {
      onOpenAuth?.()
      toast.error('Lütfen önce giriş yapın')
      return
    }

    // Auto create ticket
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject: `${pkg.name} Talebi`,
          message: `Merhaba,\n\n"${pkg.name}" paketini satın almak istiyorum.\n\nPaket: ${pkg.name}\nFiyat: ${parseFloat(pkg.price).toFixed(2)} ₺\nSüre: ${pkg.duration} gün\n\nLütfen ödeme bilgilerini iletir misiniz?`,
          category: pkg.packageType.includes('SPONSOR') ? 'SPONSORSHIP' : 'ADVERTISING',
          packageType: pkg.packageType
        })
      })

      if (res.ok) {
        toast.success('Destek talebi oluşturuldu! Profilinizdeki destek bölümünden takip edebilirsiniz.')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Hata oluştu')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    }
  }

  const packageIcons = {
    HEADER_AD: <BarChart3 className="w-8 h-8" />,
    SIDEBAR_AD: <Menu className="w-8 h-8" />,
    SERVER_SPONSOR: <Crown className="w-8 h-8" />,
    HOSTING_SPONSOR: <Gem className="w-8 h-8" />
  }

  const packageColors = {
    HEADER_AD: 'from-blue-600 to-blue-800',
    SIDEBAR_AD: 'from-purple-600 to-purple-800',
    SERVER_SPONSOR: 'from-yellow-600 to-yellow-800',
    HOSTING_SPONSOR: 'from-emerald-600 to-emerald-800'
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-zinc-800"><ChevronLeft className="w-5 h-5" /></Button>
          <Logo className="w-8 h-8" />
          <span className="text-lg font-bold text-emerald-500">Fiyatlandırma</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Reklam & Sponsorluk Paketleri</h1>
          <p className="text-zinc-400 text-lg">Sunucunuzu veya hosting firmanızı öne çıkarın</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="bg-zinc-900/80 border-zinc-800 overflow-hidden hover:border-emerald-600/50 transition-colors">
                <div className={`bg-gradient-to-r ${packageColors[pkg.packageType] || 'from-zinc-600 to-zinc-800'} p-6 text-center`}>
                  <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-white">
                    {packageIcons[pkg.packageType] || <Gem className="w-8 h-8" />}
                  </div>
                  <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                </div>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-white">{parseFloat(pkg.price).toFixed(0)}</span>
                    <span className="text-zinc-400"> ₺</span>
                    <p className="text-sm text-zinc-500 mt-1">{pkg.duration} gün</p>
                  </div>
                  <p className="text-sm text-zinc-400 mb-6 text-center">{pkg.description}</p>
                  <ul className="space-y-2 mb-6">
                    {pkg.features?.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500" onClick={() => handlePackageClick(pkg)}>
                    <Ticket className="w-4 h-4 mr-1" /> Satın Al
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 text-center text-zinc-500 text-sm">
          <p>Ödeme işlemleri destek talebi üzerinden gerçekleştirilmektedir.</p>
          <p>EFT/Havale ve kredi kartı ile ödeme kabul edilmektedir.</p>
        </div>
      </div>
    </div>
  )
}

// Sidebar Component - Right Side
function RightSidebar({ recentServers, siteSettings }) {
  return (
    <div className="space-y-6">
      {/* Social Media */}
      <Card className="bg-zinc-900/80 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" /> Bizi Takip Edin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {siteSettings?.discordUrl && (
            <a href={siteSettings.discordUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-[#5865F2]/10 hover:bg-[#5865F2]/20 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-[#5865F2] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
              </div>
              <div className="flex-1">
                <span className="text-white font-medium group-hover:text-[#5865F2] transition-colors">Discord</span>
                <p className="text-xs text-zinc-500">Topluluğa katıl</p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500" />
            </a>
          )}
          {siteSettings?.youtubeUrl && (
            <a href={siteSettings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </div>
              <div className="flex-1">
                <span className="text-white font-medium group-hover:text-red-500 transition-colors">YouTube</span>
                <p className="text-xs text-zinc-500">Videolarımız</p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500" />
            </a>
          )}
          {siteSettings?.instagramUrl && (
            <a href={siteSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
              <div className="flex-1">
                <span className="text-white font-medium group-hover:text-pink-500 transition-colors">Instagram</span>
                <p className="text-xs text-zinc-500">Takip et</p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-500" />
            </a>
          )}
        </CardContent>
      </Card>

      {/* Recent Servers */}
      <Card className="bg-zinc-900/80 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" /> Son Eklenen Sunucular
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentServers?.slice(0, 5).map(server => (
            <div key={server.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
              <div className="w-8 h-8 rounded bg-emerald-600/20 flex items-center justify-center">
                <Server className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{server.name}</p>
                <p className="text-xs text-zinc-500">{getTimeAgo(server.createdAt)}</p>
              </div>
            </div>
          ))}
          {(!recentServers || recentServers.length === 0) && (
            <p className="text-sm text-zinc-500 text-center py-4">Henüz sunucu yok</p>
          )}
        </CardContent>
      </Card>

      {/* Ad Placeholder */}
      <Card className="bg-zinc-900/80 border-zinc-800 border-dashed">
        <CardContent className="p-6 text-center">
          <div className="w-full h-48 rounded-lg bg-zinc-800/50 flex items-center justify-center border border-dashed border-zinc-700">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">Reklam Alanı</p>
              <p className="text-xs text-zinc-600 mt-1">300x250</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Time ago helper
function getTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'Az önce'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`
  return date.toLocaleDateString('tr-TR')
}

// Admin Panel Component
function AdminPanel({ user, onBack }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [pendingServers, setPendingServers] = useState([])
  const [allServers, setAllServers] = useState([])
  const [users, setUsers] = useState([])
  const [tickets, setTickets] = useState([])
  const [blogPosts, setBlogPosts] = useState([])
  const [hostings, setHostings] = useState([])
  const [boosts, setBoosts] = useState([])
  const [loading, setLoading] = useState(true)

  // Blog form state
  const [blogForm, setBlogForm] = useState({ title: '', content: '', excerpt: '', coverImage: '', published: false, blogType: 'NEWS' })
  const [editingBlog, setEditingBlog] = useState(null)
  const [blogLoading, setBlogLoading] = useState(false)
  
  // Boost form state
  const [boostForm, setBoostForm] = useState({ serverId: '', durationDays: 7 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, pendingRes, usersRes, ticketsRes, blogRes, hostingsRes, boostsRes, allServersRes] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/admin/servers/pending', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/admin/users', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/admin/tickets', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/admin/blog', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/admin/hostings', { credentials: 'include' }).then(r => r.json()),
        fetch('/api/admin/boosts', { credentials: 'include' }).then(r => r.json()).catch(() => ({ boosts: [] })),
        fetch('/api/admin/all-servers', { credentials: 'include' }).then(r => r.json()).catch(() => ({ servers: [] }))
      ])

      setStats(statsRes.stats)
      setPendingServers(pendingRes.servers || [])
      setUsers(usersRes.users || [])
      setTickets(ticketsRes.tickets || [])
      setBlogPosts(blogRes.posts || [])
      setHostings(hostingsRes.hostings || [])
      setBoosts(boostsRes.boosts || [])
      setAllServers(allServersRes.servers || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleServerAction = async (serverId, action) => {
    try {
      const res = await fetch(`/api/admin/servers/${serverId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: action })
      })

      if (res.ok) {
        toast.success(action === 'APPROVED' ? 'Sunucu onaylandı!' : 'Sunucu reddedildi!')
        loadData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'İşlem başarısız')
      }
    } catch (err) {
      toast.error('İşlem başarısız')
    }
  }

  const handleSponsor = async (serverId, days) => {
    try {
      const res = await fetch(`/api/admin/servers/${serverId}/sponsor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ days: parseInt(days) })
      })

      if (res.ok) {
        toast.success(days > 0 ? 'Sponsor eklendi!' : 'Sponsor kaldırıldı!')
        loadData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'İşlem başarısız')
      }
    } catch (err) {
      toast.error('İşlem başarısız')
    }
  }

  // Create boost for server
  const handleCreateBoost = async () => {
    if (!boostForm.serverId) {
      toast.error('Sunucu seçin')
      return
    }
    try {
      const res = await fetch('/api/admin/boosts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(boostForm)
      })

      if (res.ok) {
        toast.success('Boost eklendi!')
        setBoostForm({ serverId: '', durationDays: 7 })
        loadData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Boost eklenemedi')
      }
    } catch (err) {
      toast.error('İşlem başarısız')
    }
  }

  // Deactivate boost
  const handleDeactivateBoost = async (boostId) => {
    try {
      const res = await fetch(`/api/admin/boosts?id=${boostId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        toast.success('Boost deaktif edildi!')
        loadData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'İşlem başarısız')
      }
    } catch (err) {
      toast.error('İşlem başarısız')
    }
  }

  // Toggle hosting verification
  const handleToggleHostingVerify = async (hostingId) => {
    try {
      const res = await fetch(`/api/admin/hostings/${hostingId}/verify`, {
        method: 'PUT',
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(data.message)
        loadData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'İşlem başarısız')
      }
    } catch (err) {
      toast.error('İşlem başarısız')
    }
  }

  const handleBlogSubmit = async () => {
    setBlogLoading(true)
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(blogForm)
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success('Blog yazısı oluşturuldu!')
        setBlogForm({ title: '', content: '', excerpt: '', coverImage: '', published: false, blogType: 'NEWS' })
        loadData()
      } else {
        toast.error(data.error || 'Yazı oluşturulamadı')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setBlogLoading(false)
    }
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Yetkisiz Erişim</h2>
        <p className="text-zinc-400 mb-4">Bu sayfaya erişim yetkiniz yok</p>
        <Button onClick={onBack} variant="outline" className="border-zinc-700">
          <ChevronLeft className="w-4 h-4 mr-1" /> Ana Sayfa
        </Button>
      </div>
    )
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
            <Logo className="w-8 h-8" />
            <span className="text-lg font-bold text-red-500">Admin Panel</span>
          </div>
          <Badge className="bg-red-600">Admin: {user?.username}</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.userCount}</p>
                    <p className="text-xs text-zinc-500">Kullanıcı</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                    <Server className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.serverCount}</p>
                    <p className="text-xs text-zinc-500">Sunucu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                    <Vote className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.voteCount}</p>
                    <p className="text-xs text-zinc-500">Toplam Oy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.pendingCount}</p>
                    <p className="text-xs text-zinc-500">Bekleyen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-800 mb-6 flex-wrap">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600">
              <BarChart3 className="w-4 h-4 mr-2" /> Genel
            </TabsTrigger>
            <TabsTrigger value="servers" className="data-[state=active]:bg-emerald-600">
              <ServerCog className="w-4 h-4 mr-2" /> Sunucular
            </TabsTrigger>
            <TabsTrigger value="boosts" className="data-[state=active]:bg-emerald-600">
              <Zap className="w-4 h-4 mr-2" /> Boostlar
            </TabsTrigger>
            <TabsTrigger value="hostings" className="data-[state=active]:bg-emerald-600">
              <Shield className="w-4 h-4 mr-2" /> Hostingler
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-emerald-600">
              <UserCog className="w-4 h-4 mr-2" /> Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="blog" className="data-[state=active]:bg-emerald-600">
              <PenSquare className="w-4 h-4 mr-2" /> Blog
            </TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-emerald-600">
              <Ticket className="w-4 h-4 mr-2" /> Ticketlar
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Onay Bekleyen Sunucular</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingServers.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">Bekleyen sunucu yok</p>
                ) : (
                  <div className="space-y-3">
                    {pendingServers.map(server => (
                      <div key={server.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Server className="w-8 h-8 text-zinc-500" />
                          <div>
                            <p className="font-medium text-white">{server.name}</p>
                            <p className="text-xs text-zinc-500">{server.ip} • {server.owner?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => handleServerAction(server.id, 'APPROVED')} className="bg-emerald-600 hover:bg-emerald-500">
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleServerAction(server.id, 'REJECTED')}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Boosts Tab */}
          <TabsContent value="boosts">
            <div className="space-y-6">
              {/* Add Boost Form */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" /> Yeni Boost Ekle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white">Sunucu</Label>
                      <Select value={boostForm.serverId} onValueChange={(v) => setBoostForm(f => ({ ...f, serverId: v }))}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="Sunucu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {allServers.filter(s => s.approvalStatus === 'APPROVED').map(server => (
                            <SelectItem key={server.id} value={server.id}>{server.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Süre (Gün)</Label>
                      <Select value={String(boostForm.durationDays)} onValueChange={(v) => setBoostForm(f => ({ ...f, durationDays: parseInt(v) }))}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 Gün</SelectItem>
                          <SelectItem value="14">14 Gün</SelectItem>
                          <SelectItem value="30">30 Gün</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleCreateBoost} className="bg-yellow-600 hover:bg-yellow-500 w-full">
                        <Zap className="w-4 h-4 mr-2" /> Boost Ekle
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Boosts */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Aktif Boostlar</CardTitle>
                </CardHeader>
                <CardContent>
                  {boosts.filter(b => b.isActive && new Date(b.endTime) > new Date()).length === 0 ? (
                    <p className="text-zinc-500 text-center py-8">Aktif boost yok</p>
                  ) : (
                    <div className="space-y-3">
                      {boosts.filter(b => b.isActive && new Date(b.endTime) > new Date()).map(boost => (
                        <div key={boost.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                              <Zap className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{boost.server?.name || 'Sunucu'}</p>
                              <p className="text-xs text-zinc-500">
                                Kalan: {Math.ceil((new Date(boost.endTime) - new Date()) / (1000 * 60 * 60 * 24))} gün
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => handleDeactivateBoost(boost.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Hostings Tab */}
          <TabsContent value="hostings">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Hosting Firmaları</CardTitle>
              </CardHeader>
              <CardContent>
                {hostings.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">Hosting firması yok</p>
                ) : (
                  <div className="space-y-3">
                    {hostings.map(hosting => (
                      <div key={hosting.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Server className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">{hosting.name}</p>
                              {hosting.isVerified && (
                                <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Onaylı</Badge>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500">{hosting.owner?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant={hosting.isVerified ? "destructive" : "default"}
                            onClick={() => handleToggleHostingVerify(hosting.id)}
                            className={hosting.isVerified ? "" : "bg-emerald-600 hover:bg-emerald-500"}
                          >
                            {hosting.isVerified ? (
                              <><X className="w-4 h-4 mr-1" /> Onayı Kaldır</>
                            ) : (
                              <><CheckCircle2 className="w-4 h-4 mr-1" /> Onayla</>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Servers Tab */}
          <TabsContent value="servers">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Tüm Sunucular</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingServers.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">Sunucu yok</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800">
                        <TableHead className="text-zinc-400">Sunucu</TableHead>
                        <TableHead className="text-zinc-400">IP</TableHead>
                        <TableHead className="text-zinc-400">Durum</TableHead>
                        <TableHead className="text-zinc-400">Sponsor</TableHead>
                        <TableHead className="text-zinc-400">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingServers.map(server => (
                        <TableRow key={server.id} className="border-zinc-800">
                          <TableCell className="font-medium text-white">{server.name}</TableCell>
                          <TableCell className="text-zinc-400">{server.ip}</TableCell>
                          <TableCell>
                            <Badge className={server.approvalStatus === 'APPROVED' ? 'bg-emerald-600' : server.approvalStatus === 'PENDING' ? 'bg-amber-600' : 'bg-red-600'}>
                              {server.approvalStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select onValueChange={(v) => handleSponsor(server.id, v)}>
                              <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700">
                                <SelectValue placeholder={server.isSponsored ? 'Aktif' : 'Yok'} />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700">
                                <SelectItem value="0">Kaldır</SelectItem>
                                <SelectItem value="7">7 Gün</SelectItem>
                                <SelectItem value="30">30 Gün</SelectItem>
                                <SelectItem value="90">90 Gün</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="border-zinc-700">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Kullanıcılar</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-400">Kullanıcı</TableHead>
                      <TableHead className="text-zinc-400">Email</TableHead>
                      <TableHead className="text-zinc-400">Rol</TableHead>
                      <TableHead className="text-zinc-400">Sunucu</TableHead>
                      <TableHead className="text-zinc-400">Kayıt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id} className="border-zinc-800">
                        <TableCell className="font-medium text-white">{u.username || '-'}</TableCell>
                        <TableCell className="text-zinc-400">{u.email}</TableCell>
                        <TableCell>
                          <Badge className={u.role === 'ADMIN' ? 'bg-red-600' : 'bg-zinc-600'}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-zinc-400">{u._count?.servers || 0}</TableCell>
                        <TableCell className="text-zinc-400">
                          {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Create Blog */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Yeni Blog Yazısı</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Başlık</Label>
                    <Input
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      className="bg-zinc-800 border-zinc-700"
                      placeholder="Yazı başlığı"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Özet</Label>
                    <Input
                      value={blogForm.excerpt}
                      onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                      className="bg-zinc-800 border-zinc-700"
                      placeholder="Kısa özet"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Kapak Görseli URL</Label>
                    <Input
                      value={blogForm.coverImage}
                      onChange={(e) => setBlogForm({ ...blogForm, coverImage: e.target.value })}
                      className="bg-zinc-800 border-zinc-700"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">İçerik</Label>
                    <Textarea
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 min-h-[200px]"
                      placeholder="Yazı içeriği..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={blogForm.published}
                      onCheckedChange={(checked) => setBlogForm({ ...blogForm, published: checked })}
                    />
                    <Label className="text-zinc-400">Hemen yayınla</Label>
                  </div>

                  <Button 
                    onClick={handleBlogSubmit} 
                    disabled={blogLoading || !blogForm.title || !blogForm.content}
                    className="w-full bg-emerald-600 hover:bg-emerald-500"
                  >
                    {blogLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Yazı Oluştur
                  </Button>
                </CardContent>
              </Card>

              {/* Blog List */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Mevcut Yazılar</CardTitle>
                </CardHeader>
                <CardContent>
                  {blogPosts.length === 0 ? (
                    <p className="text-zinc-500 text-center py-8">Henüz yazı yok</p>
                  ) : (
                    <div className="space-y-3">
                      {blogPosts.map(post => (
                        <div key={post.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                          <div>
                            <p className="font-medium text-white">{post.title}</p>
                            <p className="text-xs text-zinc-500">
                              {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={post.published ? 'bg-emerald-600' : 'bg-zinc-600'}>
                              {post.published ? 'Yayında' : 'Taslak'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Destek Talepleri</CardTitle>
              </CardHeader>
              <CardContent>
                {tickets.length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">Ticket yok</p>
                ) : (
                  <div className="space-y-3">
                    {tickets.map(ticket => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            ticket.status === 'OPEN' ? 'bg-emerald-500' : 
                            ticket.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-zinc-500'
                          }`} />
                          <div>
                            <p className="font-medium text-white">{ticket.subject}</p>
                            <p className="text-xs text-zinc-500">{ticket.user?.email}</p>
                          </div>
                        </div>
                        <Badge className={
                          ticket.status === 'OPEN' ? 'bg-emerald-600' : 
                          ticket.status === 'IN_PROGRESS' ? 'bg-blue-600' : 'bg-zinc-600'
                        }>
                          {ticket.status === 'OPEN' ? 'Açık' : ticket.status === 'IN_PROGRESS' ? 'İşlemde' : 'Kapalı'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
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
    gameMode: 'SURVIVAL',
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
        credentials: 'include',
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sunucu Gönder</h1>
          <p className="text-zinc-400">Minecraft sunucunuzu listeleyin ve oy almaya başlayın!</p>
        </div>

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
                <span className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-emerald-500' : 'text-zinc-600'}`}>{s.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 mb-6 transition-colors ${step > s.num ? 'bg-emerald-600' : 'bg-zinc-800'}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div><h2 className="text-xl font-bold text-white mb-1">Temel Bilgiler</h2><p className="text-sm text-zinc-500">Sunucunuzun temel bilgilerini girin</p></div>
                <div className="space-y-2"><Label className="text-white">Sunucu Adı *</Label><Input placeholder="My Awesome Server" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-zinc-800 border-zinc-700 h-11" /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2"><Label className="text-white">Sunucu IP Adresi *</Label><Input placeholder="play.example.com" value={form.ip} onChange={(e) => { setForm({ ...form, ip: e.target.value }); setVerified(false) }} className="bg-zinc-800 border-zinc-700 h-11" /></div>
                  <div className="space-y-2"><Label className="text-white">Port *</Label><Input placeholder="25565" value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} className="bg-zinc-800 border-zinc-700 h-11" /></div>
                </div>
                <Button onClick={verifyIP} disabled={verifying || !form.ip} className={`w-full h-11 ${verified ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-600' : 'bg-blue-600 hover:bg-blue-500'}`}>
                  {verifying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Doğrulanıyor...</> : verified ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Sunucu IP'si Doğrulandı</> : <><Check className="w-4 h-4 mr-2" /> Sunucu IP'sini Doğrula</>}
                </Button>
                <div className="space-y-2"><Label className="text-white">Minecraft Versiyonu *</Label><Select value={form.version} onValueChange={(v) => setForm({ ...form, version: v })}><SelectTrigger className="bg-zinc-800 border-zinc-700 h-11"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700 max-h-60">{minecraftVersions.map(v => (<SelectItem key={v} value={v}>{v}</SelectItem>))}</SelectContent></Select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-white">Platform</Label><Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}><SelectTrigger className="bg-zinc-800 border-zinc-700 h-11"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700"><SelectItem value="JAVA">☕ Java Edition</SelectItem><SelectItem value="BEDROCK">🪨 Bedrock Edition</SelectItem><SelectItem value="CROSSPLAY">🔄 Crossplay</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label className="text-white">Oyun Modu *</Label><Select value={form.gameMode} onValueChange={(v) => setForm({ ...form, gameMode: v })}><SelectTrigger className="bg-zinc-800 border-zinc-700 h-11"><SelectValue /></SelectTrigger><SelectContent className="bg-zinc-800 border-zinc-700">{gameModes.map(gm => (<SelectItem key={gm.value} value={gm.value}>{gm.label}</SelectItem>))}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-white">Website (Opsiyonel)</Label><Input placeholder="https://example.com" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="bg-zinc-800 border-zinc-700 h-11" /></div>
                  <div className="space-y-2"><Label className="text-white">Discord Daveti (Opsiyonel)</Label><Input placeholder="https://discord.gg/example" value={form.discord} onChange={(e) => setForm({ ...form, discord: e.target.value })} className="bg-zinc-800 border-zinc-700 h-11" /></div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <div><h2 className="text-xl font-bold text-white mb-1">Medya</h2><p className="text-sm text-zinc-500">Sunucunuz için görsel içerikler ekleyin</p></div>
                <div className="space-y-2"><Label className="text-white">Banner URL (Opsiyonel)</Label><Input placeholder="https://example.com/banner.png" value={form.bannerUrl} onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })} className="bg-zinc-800 border-zinc-700 h-11" /><p className="text-xs text-zinc-500">Önerilen boyut: 1200x400px</p>{form.bannerUrl && (<div className="h-32 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700"><img src={form.bannerUrl} alt="Banner" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} /></div>)}</div>
                <div className="space-y-2"><Label className="text-white">Logo URL (Opsiyonel)</Label><Input placeholder="https://example.com/logo.png" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} className="bg-zinc-800 border-zinc-700 h-11" /><p className="text-xs text-zinc-500">Önerilen boyut: 128x128px</p>{form.logoUrl && (<div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700"><img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} /></div>)}</div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6">
                <div><h2 className="text-xl font-bold text-white mb-1">İçerik</h2><p className="text-sm text-zinc-500">Sunucunuzu tanıtın</p></div>
                <div className="space-y-2"><Label className="text-white">Kısa Açıklama *</Label><Input placeholder="Sunucunuzu kısaca tanıtın (max 150 karakter)" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="bg-zinc-800 border-zinc-700 h-11" maxLength={150} /><p className="text-xs text-zinc-500 text-right">{form.shortDescription.length}/150</p></div>
                <div className="space-y-2"><Label className="text-white">Uzun Açıklama (Opsiyonel)</Label><Textarea placeholder="Sunucunuz hakkında detaylı bilgi..." value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} className="bg-zinc-800 border-zinc-700 min-h-[150px]" /></div>
                <div className="space-y-2"><Label className="text-white">Etiketler</Label><div className="flex gap-2"><Input placeholder="Etiket ekle (Enter)" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="bg-zinc-800 border-zinc-700 h-11" /><Button type="button" onClick={addTag} variant="outline" className="border-zinc-700 h-11 px-4"><Plus className="w-4 h-4" /></Button></div><div className="flex flex-wrap gap-2 mt-3">{form.tags.map(tag => (<Badge key={tag} variant="secondary" className="bg-zinc-800 gap-1 pr-1">{tag}<button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-400"><X className="w-3 h-3" /></button></Badge>))}</div><p className="text-xs text-zinc-500">{form.tags.length}/10 etiket</p></div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-6">
                <div><h2 className="text-xl font-bold text-white mb-1">Votifier Ayarları</h2><p className="text-sm text-zinc-500">Oyunculara oyun içi ödül vermek için yapılandırın</p></div>
                <div className="p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-lg"><h4 className="font-medium text-emerald-400 flex items-center gap-2"><Shield className="w-4 h-4" />NuVotifier Entegrasyonu</h4><p className="text-sm text-zinc-400 mt-1">Oyunculara oyun içi ödül vermek için NuVotifier plugin kurulu olmalıdır.<a href="https://www.spigotmc.org/resources/nuvotifier.13449/" target="_blank" rel="noopener" className="text-emerald-400 hover:underline ml-1">Plugin'i indir →</a></p></div>
                <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label className="text-white">Votifier Host</Label><Input placeholder="play.myserver.com" value={form.votifierHost} onChange={(e) => setForm({ ...form, votifierHost: e.target.value })} className="bg-zinc-800 border-zinc-700 h-11" /></div><div className="space-y-2"><Label className="text-white">Votifier Port</Label><Input placeholder="8192" value={form.votifierPort} onChange={(e) => setForm({ ...form, votifierPort: e.target.value })} className="bg-zinc-800 border-zinc-700 h-11" /></div></div>
                <div className="space-y-2"><Label className="text-white">Public Key</Label><Textarea placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----" value={form.votifierPublicKey} onChange={(e) => setForm({ ...form, votifierPublicKey: e.target.value })} className="bg-zinc-800 border-zinc-700 min-h-[120px] font-mono text-xs" /><p className="text-xs text-zinc-500">plugins/Votifier/rsa/public.key dosyasından</p></div>
                <div className="space-y-2"><Label className="text-white">Token (Opsiyonel - V2 protokolü için)</Label><Input placeholder="NuVotifier token" value={form.votifierToken} onChange={(e) => setForm({ ...form, votifierToken: e.target.value })} className="bg-zinc-800 border-zinc-700 h-11" /></div>
              </div>
            )}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
              {step > 1 ? (<Button variant="outline" onClick={() => setStep(step - 1)} className="border-zinc-700 hover:bg-zinc-800"><ChevronLeft className="w-4 h-4 mr-1" /> Geri</Button>) : (<div />)}
              {step < 4 ? (<Button onClick={() => setStep(step + 1)} className="bg-emerald-600 hover:bg-emerald-500" disabled={!canProceed()}>Sonraki <ArrowRight className="w-4 h-4 ml-1" /></Button>) : (<Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500" disabled={loading}>{loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gönderiliyor...</>) : (<><Send className="w-4 h-4 mr-2" /> Sunucu Gönder</>)}</Button>)}
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg"><p className="text-sm text-amber-400 flex items-start gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span><strong>Not:</strong> Sunucunuz incelendikten sonra kısa süre içinde listelenecektir.</span></p></div>
      </div>
    </div>
  )
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null)
  const [servers, setServers] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('ALL')
  const [gameMode, setGameMode] = useState('ALL')
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedServer, setSelectedServer] = useState(null)
  const [selectedBlogSlug, setSelectedBlogSlug] = useState(null)
  
  // Dialogs
  const [authOpen, setAuthOpen] = useState(false)
  const [voteServer, setVoteServer] = useState(null)

  // Fetch current user
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => {})
    
    // Fetch banners
    fetch('/api/banners', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setBanners(data.banners || []))
      .catch(() => {})
  }, [])

  // Fetch servers
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (platform !== 'ALL') params.set('platform', platform)
    if (gameMode !== 'ALL') params.set('gameMode', gameMode)

    fetch(`/api/servers?${params}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setServers(data.servers || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [search, platform, gameMode])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    toast.success('Çıkış yapıldı')
  }

  const refreshServers = () => {
    fetch('/api/servers', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setServers(data.servers || []))
  }

  // Render different pages
  if (currentPage === 'server-detail' && selectedServer) {
    return <ServerDetailPage serverId={selectedServer} onBack={() => { setCurrentPage('home'); setSelectedServer(null) }} onVote={setVoteServer} user={user} />
  }

  if (currentPage === 'add-server') {
    return <AddServerPage onBack={() => setCurrentPage('home')} onSuccess={() => { setCurrentPage('home'); refreshServers() }} />
  }

  if (currentPage === 'profile' && user) {
    return <ProfilePage user={user} onBack={() => setCurrentPage('home')} onUpdateUser={setUser} />
  }

  if (currentPage === 'blog') {
    return <BlogPage onBack={() => setCurrentPage('home')} onViewPost={(slug) => { setSelectedBlogSlug(slug); setCurrentPage('blog-post') }} />
  }

  if (currentPage === 'blog-post' && selectedBlogSlug) {
    return <BlogPostPage slug={selectedBlogSlug} onBack={() => { setCurrentPage('blog'); setSelectedBlogSlug(null) }} />
  }

  if (currentPage === 'hostings') {
    return <HostingPage onBack={() => setCurrentPage('home')} user={user} onOpenAuth={() => setAuthOpen(true)} />
  }

  if (currentPage === 'pricing') {
    return <PricingPage onBack={() => setCurrentPage('home')} user={user} onOpenAuth={() => setAuthOpen(true)} />
  }

  if (currentPage === 'admin' && user?.role === 'ADMIN') {
    return <AdminPanel user={user} onBack={() => setCurrentPage('home')} />
  }

  // Sort servers - recent ones for sidebar
  const recentServers = [...servers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const sponsoredServers = servers.filter(s => s.isSponsored)
  const topServers = servers.filter(s => !s.isSponsored).sort((a, b) => b.voteCount - a.voteCount)

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">ServerListRank</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setCurrentPage('home')} className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1"><Home className="w-4 h-4" /> Sunucular</button>
            <button onClick={() => setCurrentPage('hostings')} className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1"><Server className="w-4 h-4" /> Hostingler</button>
            <button onClick={() => setCurrentPage('blog')} className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1"><BookOpen className="w-4 h-4" /> Blog</button>
            <button onClick={() => setCurrentPage('pricing')} className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1"><Gem className="w-4 h-4" /> Fiyatlandırma</button>
            {user?.role === 'ADMIN' && (
              <button onClick={() => setCurrentPage('admin')} className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"><Shield className="w-4 h-4" /> Admin</button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button variant="outline" className="border-emerald-600 text-emerald-500 hover:bg-emerald-600 hover:text-white" onClick={() => setCurrentPage('add-server')}><Plus className="w-4 h-4 mr-1" /> Sunucu Ekle</Button>
                <button onClick={() => setCurrentPage('profile')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Avatar className="w-8 h-8 ring-2 ring-emerald-600/50">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-emerald-600 text-white">{user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white hidden md:block">{user.username || user.email}</span>
                  {user.role === 'ADMIN' && (<Badge className="bg-red-600 text-white text-xs">Admin</Badge>)}
                </button>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-zinc-800"><LogOut className="w-4 h-4" /></Button>
              </>
            ) : (
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => setAuthOpen(true)}><LogIn className="w-4 h-4 mr-1" /> Giriş Yap</Button>
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
            <div className="flex justify-center mb-6"><Logo className="w-20 h-20" /></div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent">En İyi Minecraft</span><br />
              <span className="text-white">Sunucularını Keşfet</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-8">Binlerce sunucu arasından favorini bul, oy ver ve kendi sunucunu ekle!</p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input placeholder="Sunucu ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-12 bg-zinc-900 border-zinc-800 focus:border-emerald-600" />
              </div>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-full sm:w-36 h-12 bg-zinc-900 border-zinc-800"><SelectValue placeholder="Platform" /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="ALL">Tümü</SelectItem>
                  <SelectItem value="JAVA">Java</SelectItem>
                  <SelectItem value="BEDROCK">Bedrock</SelectItem>
                  <SelectItem value="CROSSPLAY">Crossplay</SelectItem>
                </SelectContent>
              </Select>
              <Select value={gameMode} onValueChange={setGameMode}>
                <SelectTrigger className="w-full sm:w-40 h-12 bg-zinc-900 border-zinc-800"><SelectValue placeholder="Oyun Modu" /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="ALL">Tüm Modlar</SelectItem>
                  {gameModes.map(gm => (
                    <SelectItem key={gm.value} value={gm.value}>{gm.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center gap-8 mt-10">
              <div className="text-center"><div className="text-2xl font-bold text-emerald-500">{servers.length}+</div><div className="text-sm text-zinc-500">Sunucu</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-emerald-500">10K+</div><div className="text-sm text-zinc-500">Oyuncu</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-emerald-500">50K+</div><div className="text-sm text-zinc-500">Oy</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Banner */}
      {banners.filter(b => b.position === 'home_top').length > 0 && (
        <section className="py-6">
          <div className="container mx-auto px-4">
            {banners.filter(b => b.position === 'home_top').map(banner => (
              <a key={banner.id} href={banner.linkUrl || '#'} className="block relative overflow-hidden rounded-xl group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-purple-600/20 group-hover:opacity-80 transition-opacity" />
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-40 md:h-48 object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{banner.title}</h3>
                    {banner.subtitle && <p className="text-lg text-white/90 drop-shadow-lg mt-1">{banner.subtitle}</p>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Sponsored Servers */}
      {sponsoredServers.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-yellow-900/10 to-transparent">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6"><Crown className="w-6 h-6 text-yellow-500" /><h2 className="text-2xl font-bold text-white">Sponsorlu Sunucular</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsoredServers.map(server => (<ServerCard key={server.id} server={server} onVote={setVoteServer} onView={(s) => { setSelectedServer(s.id); setCurrentPage('server-detail') }} />))}
            </div>
          </div>
        </section>
      )}

      {/* Top Servers */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6"><Trophy className="w-6 h-6 text-emerald-500" /><h2 className="text-2xl font-bold text-white">En Çok Oy Alan Sunucular</h2></div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (<Card key={i} className="bg-zinc-900/50 border-zinc-800"><CardContent className="p-4"><div className="animate-pulse space-y-4"><div className="h-28 bg-zinc-800 rounded" /><div className="h-4 bg-zinc-800 rounded w-3/4" /><div className="h-4 bg-zinc-800 rounded w-1/2" /></div></CardContent></Card>))}
            </div>
          ) : topServers.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-12 text-center">
                <Server className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Henüz sunucu yok</h3>
                <p className="text-zinc-400 mb-4">İlk sunucuyu sen ekle!</p>
                {user ? (
                  <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => setCurrentPage('add-server')}><Plus className="w-4 h-4 mr-1" /> Sunucu Ekle</Button>
                ) : (
                  <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => setAuthOpen(true)}>Giriş Yap</Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topServers.map((server, index) => (<ServerCard key={server.id} server={server} onVote={setVoteServer} onView={(s) => { setSelectedServer(s.id); setCurrentPage('server-detail') }} rank={index + 1} />))}
            </div>
          )}
        </div>
      </section>

      {/* List Between Banner */}
      {banners.filter(b => b.position === 'list_between').length > 0 && servers.length > 0 && (
        <section className="py-6">
          <div className="container mx-auto px-4">
            {banners.filter(b => b.position === 'list_between').map(banner => (
              <a key={banner.id} href={banner.linkUrl || '#'} className="block relative overflow-hidden rounded-xl group">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center px-8">
                  <div>
                    <h3 className="text-xl font-bold text-white">{banner.title}</h3>
                    {banner.subtitle && <p className="text-white/80">{banner.subtitle}</p>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3"><Logo className="w-8 h-8" /><span className="font-bold text-white">ServerListRank</span></div>
            <div className="flex items-center gap-6">
              <button onClick={() => setCurrentPage('blog')} className="text-sm text-zinc-400 hover:text-white">Blog</button>
              {user?.role === 'ADMIN' && <button onClick={() => setCurrentPage('admin')} className="text-sm text-zinc-400 hover:text-white">Admin</button>}
            </div>
            <p className="text-sm text-zinc-500">© 2024 ServerListRank. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} onSuccess={setUser} />
      <VoteDialog server={voteServer} open={!!voteServer} onOpenChange={(open) => !open && setVoteServer(null)} />
    </div>
  )
}
