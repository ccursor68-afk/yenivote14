'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  ChevronLeft, Server, Users, Trophy, Crown, Vote, Gamepad2,
  Globe, MessageCircle, ExternalLink, Copy, Check, Loader2,
  FileText, User, Calendar, AlertCircle, Zap, BarChart3, TrendingUp
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const platformColors = {
  JAVA: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  BEDROCK: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CROSSPLAY: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
}

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

const getGameModeStyle = (mode) => gameModes.find(g => g.value === mode)?.color || 'bg-zinc-500/20 text-zinc-400'
const getGameModeLabel = (mode) => gameModes.find(g => g.value === mode)?.label || mode

export default function ServerDetailClient({ serverId }) {
  const router = useRouter()
  const [server, setServer] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [voteOpen, setVoteOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [voteLoading, setVoteLoading] = useState(false)
  const [boostLoading, setBoostLoading] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check auth
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data?.user || null))
      .catch(() => {})

    // Fetch server details
    fetch(`/api/servers/${serverId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setServer(data.server)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Fetch server stats
    fetch(`/api/servers/${serverId}/stats`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {})

    // Record visit (click count)
    fetch(`/api/servers/${serverId}/stats`, {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {})
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

  const handleVote = async () => {
    if (!username.trim()) {
      toast.error('Minecraft kullanıcı adı gerekli')
      return
    }

    setVoteLoading(true)
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
      setVoteOpen(false)
      setUsername('')
      // Refresh server data
      const updated = await fetch(`/api/servers/${serverId}`, { credentials: 'include' }).then(r => r.json())
      setServer(updated.server)
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setVoteLoading(false)
    }
  }

  const handleBoostRequest = async () => {
    if (!user) {
      toast.error('Boost talep etmek için giriş yapmalısınız')
      return
    }

    setBoostLoading(true)
    try {
      const res = await fetch(`/api/servers/${server.id}/boost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ duration: 7 })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Boost talebi oluşturulamadı')
        return
      }

      toast.success(data.message || 'Boost talebi oluşturuldu!')
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setBoostLoading(false)
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
        <Button onClick={() => router.push('/')} variant="outline" className="border-zinc-700">
          <ChevronLeft className="w-4 h-4 mr-1" /> Ana Sayfa
        </Button>
      </div>
    )
  }

  // Format chart data
  const chartData = stats?.playerHistory?.map(h => ({
    time: new Date(h.time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    players: h.playerCount,
    max: h.maxPlayers
  })) || []

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

        <div className="absolute top-4 left-4">
          <Button onClick={() => router.push('/')} variant="outline" size="sm" className="bg-black/50 border-zinc-700 hover:bg-black/70">
            <ChevronLeft className="w-4 h-4 mr-1" /> Geri
          </Button>
        </div>

        {server.isSponsored && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <Crown className="w-5 h-5" /> BOOST AKTİF
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
                      <Badge variant="outline" className={platformColors[server.platform]}>{server.platform}</Badge>
                      {server.gameMode && (
                        <Badge variant="outline" className={getGameModeStyle(server.gameMode)}>
                          {getGameModeLabel(server.gameMode)}
                        </Badge>
                      )}
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
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        <span className="text-white font-medium">{stats?.clickCount || server.clickCount || 0}</span>
                        <span className="text-zinc-500">Görüntülenme</span>
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

            {/* Player History Chart */}
            {chartData.length > 0 && (
              <Card className="bg-zinc-900/80 backdrop-blur border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Son 24 Saat Oyuncu İstatistikleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="time" stroke="#71717a" fontSize={12} />
                        <YAxis stroke="#71717a" fontSize={12} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="players" stroke="#10b981" strokeWidth={2} dot={false} name="Oyuncu" />
                        <Line type="monotone" dataKey="max" stroke="#3b82f6" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Kapasite" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

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
                      <Badge key={tag} variant="secondary" className="bg-zinc-800 text-zinc-300">#{tag}</Badge>
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

                <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-lg" onClick={() => setVoteOpen(true)}>
                  <Vote className="w-5 h-5 mr-2" /> Oy Ver
                </Button>

                {server.hasVotifier && (
                  <p className="text-xs text-center text-emerald-400">
                    ✓ NuVotifier aktif - Oyun içi ödül alabilirsiniz
                  </p>
                )}

                {/* Boost Status / Request */}
                {stats?.activeBoost ? (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-400 mb-1">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">Boost Aktif</span>
                    </div>
                    <p className="text-xs text-yellow-400/70">
                      Kalan süre: {stats.activeBoost.remainingHours} saat
                    </p>
                  </div>
                ) : (
                  user && server.ownerId === user.id && (
                    <Button
                      variant="outline"
                      className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      onClick={handleBoostRequest}
                      disabled={boostLoading}
                    >
                      {boostLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                      Instant Boost Talep Et
                    </Button>
                  )
                )}

                <Separator className="bg-zinc-800" />

                <div className="space-y-2">
                  {server.website && (
                    <a href={server.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                      <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  {server.discord && (
                    <a href={server.discord} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                      <MessageCircle className="w-4 h-4" /> Discord <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Vote Dialog */}
      <Dialog open={voteOpen} onOpenChange={setVoteOpen}>
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
            <Button variant="outline" onClick={() => setVoteOpen(false)} className="border-zinc-700 hover:bg-zinc-800">
              İptal
            </Button>
            <Button onClick={handleVote} disabled={voteLoading || !username.trim()} className="bg-emerald-600 hover:bg-emerald-500">
              {voteLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gönderiliyor...</> : <><Vote className="w-4 h-4 mr-2" /> Oy Ver</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
