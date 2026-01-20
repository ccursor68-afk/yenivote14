'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { 
  Search, Server, Users, Trophy, Crown, Plus, LogIn, LogOut, 
  User, Settings, ChevronRight, Vote, Sparkles, Gamepad2,
  Globe, MessageSquare, Star, TrendingUp, Clock, Shield,
  ExternalLink, Copy, Check, X, Menu, Home, FileText, Ticket
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

// Server Card Component
function ServerCard({ server, onVote, onView }) {
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
        <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <Crown className="w-3 h-3" /> SPONSOR
        </div>
      )}
      
      {/* Banner */}
      <div className="relative h-24 bg-gradient-to-br from-emerald-900/50 to-zinc-900 overflow-hidden">
        {server.bannerUrl ? (
          <img src={server.bannerUrl} alt={server.name} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/photo/2015/03/01/19/32/minecraft-655158_1280.jpg')] bg-cover bg-center opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
      </div>

      <CardContent className="relative -mt-8 p-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-16 h-16 rounded-lg bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex-shrink-0">
            {server.logoUrl ? (
              <img src={server.logoUrl} alt={server.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800">
                <Server className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white truncate">{server.name}</h3>
              <Badge variant="outline" className={platformColors[server.platform]}>
                {server.platform}
              </Badge>
            </div>
            <p className="text-sm text-zinc-400 line-clamp-2 mt-1">{server.shortDescription}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-emerald-500" />
              <span className="text-zinc-300">{server.playerCount}/{server.maxPlayers}</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-zinc-300">{server.voteCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-700 hover:bg-zinc-800"
              onClick={copyIP}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500"
              onClick={() => onVote(server)}
            >
              <Vote className="w-4 h-4 mr-1" /> Oy Ver
            </Button>
          </div>
        </div>

        {/* Tags */}
        {server.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {server.tags.slice(0, 4).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs bg-zinc-800 text-zinc-400">
                {tag}
              </Badge>
            ))}
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
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-emerald-500" />
            {server.name} için Oy Ver
          </DialogTitle>
          <DialogDescription>
            Oyun içi ödülünüzü almak için Minecraft kullanıcı adınızı girin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Minecraft Kullanıcı Adı</Label>
            <div className="relative">
              <Input
                placeholder="Örn: Notch"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-zinc-800 border-zinc-700 pl-10"
                maxLength={16}
              />
              <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>
            <p className="text-xs text-zinc-500">
              ⚠️ Girdiğiniz kullanıcı adı sunucuya gönderilecek ve oyun içi ödülünüz bu hesaba verilecektir.
            </p>
          </div>

          {username && (
            <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
              <img 
                src={`https://mc-heads.net/avatar/${username}`} 
                alt={username}
                className="w-12 h-12 rounded"
              />
              <div>
                <p className="font-medium text-white">{username}</p>
                <p className="text-xs text-zinc-400">Minecraft Oyuncu</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700">
            İptal
          </Button>
          <Button 
            onClick={handleVote} 
            disabled={loading || !username.trim()}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {loading ? 'Gönderiliyor...' : 'Oy Ver'}
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
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Logo className="w-6 h-6" />
            {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
            <TabsTrigger value="login">Giriş</TabsTrigger>
            <TabsTrigger value="register">Kayıt</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label>Kullanıcı Adı</Label>
                <Input
                  placeholder="kullaniciadi"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="ornek@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Şifre</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500"
              disabled={loading}
            >
              {loading ? 'Yükleniyor...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Add Server Dialog
function AddServerDialog({ open, onOpenChange, onSuccess }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    ip: '',
    port: 25565,
    platform: 'JAVA',
    version: '1.20.4',
    website: '',
    discord: '',
    bannerUrl: '',
    logoUrl: '',
    shortDescription: '',
    longDescription: '',
    tags: [],
    votifierHost: '',
    votifierPort: '',
    votifierPublicKey: '',
    votifierToken: ''
  })
  const [tagInput, setTagInput] = useState('')

  const addTag = () => {
    if (tagInput.trim() && form.tags.length < 10) {
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
      onOpenChange(false)
      setStep(1)
      setForm({
        name: '', ip: '', port: 25565, platform: 'JAVA', version: '1.20.4',
        website: '', discord: '', bannerUrl: '', logoUrl: '',
        shortDescription: '', longDescription: '', tags: [],
        votifierHost: '', votifierPort: '', votifierPublicKey: '', votifierToken: ''
      })
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { num: 1, title: 'Temel Bilgiler' },
    { num: 2, title: 'Medya' },
    { num: 3, title: 'İçerik' },
    { num: 4, title: 'Votifier' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-500" />
            Sunucu Ekle
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step >= s.num ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {s.num}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 transition-colors ${
                  step > s.num ? 'bg-emerald-600' : 'bg-zinc-800'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sunucu Adı *</Label>
                <Input
                  placeholder="Örn: MyServer"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Platform *</Label>
                <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="JAVA">Java Edition</SelectItem>
                    <SelectItem value="BEDROCK">Bedrock Edition</SelectItem>
                    <SelectItem value="CROSSPLAY">Crossplay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Sunucu IP *</Label>
                <Input
                  placeholder="play.myserver.com"
                  value={form.ip}
                  onChange={(e) => setForm({ ...form, ip: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Port</Label>
                <Input
                  type="number"
                  placeholder="25565"
                  value={form.port}
                  onChange={(e) => setForm({ ...form, port: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Minecraft Versiyonu *</Label>
              <Input
                placeholder="1.20.4"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Website (Opsiyonel)</Label>
                <Input
                  placeholder="https://myserver.com"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Discord (Opsiyonel)</Label>
                <Input
                  placeholder="https://discord.gg/xxx"
                  value={form.discord}
                  onChange={(e) => setForm({ ...form, discord: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Media */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Banner URL (Opsiyonel)</Label>
              <Input
                placeholder="https://example.com/banner.png"
                value={form.bannerUrl}
                onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
              />
              <p className="text-xs text-zinc-500">Önerilen boyut: 1200x400px</p>
              {form.bannerUrl && (
                <div className="h-24 rounded-lg overflow-hidden bg-zinc-800">
                  <img src={form.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Logo URL (Opsiyonel)</Label>
              <Input
                placeholder="https://example.com/logo.png"
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
              />
              <p className="text-xs text-zinc-500">Önerilen boyut: 128x128px</p>
              {form.logoUrl && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800">
                  <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Content */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Kısa Açıklama *</Label>
              <Input
                placeholder="Sunucunuzu kısaca tanıtın (max 150 karakter)"
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
                maxLength={150}
              />
              <p className="text-xs text-zinc-500">{form.shortDescription.length}/150</p>
            </div>

            <div className="space-y-2">
              <Label>Uzun Açıklama (Opsiyonel)</Label>
              <Textarea
                placeholder="Sunucunuz hakkında detaylı bilgi..."
                value={form.longDescription}
                onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                className="bg-zinc-800 border-zinc-700 min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Etiketler</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Etiket ekle (Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="bg-zinc-800 border-zinc-700"
                />
                <Button type="button" onClick={addTag} variant="outline" className="border-zinc-700">
                  Ekle
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-zinc-800 gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Votifier */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-900/20 border border-emerald-800 rounded-lg">
              <h4 className="font-medium text-emerald-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                NuVotifier Entegrasyonu
              </h4>
              <p className="text-sm text-zinc-400 mt-1">
                Oyunculara oyun içi ödül vermek için NuVotifier plugin kurulu olmalıdır.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Votifier Host</Label>
                <Input
                  placeholder="play.myserver.com"
                  value={form.votifierHost}
                  onChange={(e) => setForm({ ...form, votifierHost: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Votifier Port</Label>
                <Input
                  type="number"
                  placeholder="8192"
                  value={form.votifierPort}
                  onChange={(e) => setForm({ ...form, votifierPort: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Public Key</Label>
              <Textarea
                placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                value={form.votifierPublicKey}
                onChange={(e) => setForm({ ...form, votifierPublicKey: e.target.value })}
                className="bg-zinc-800 border-zinc-700 min-h-[100px] font-mono text-xs"
              />
              <p className="text-xs text-zinc-500">plugins/Votifier/rsa/public.key dosyasından</p>
            </div>

            <div className="space-y-2">
              <Label>Token (Opsiyonel - V2 protokolü için)</Label>
              <Input
                placeholder="NuVotifier token"
                value={form.votifierToken}
                onChange={(e) => setForm({ ...form, votifierToken: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="border-zinc-700">
              Geri
            </Button>
          )}
          {step < 4 ? (
            <Button 
              onClick={() => setStep(step + 1)}
              className="bg-emerald-600 hover:bg-emerald-500"
              disabled={step === 1 && (!form.name || !form.ip || !form.shortDescription || !form.version)}
            >
              İleri
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-500"
              disabled={loading}
            >
              {loading ? 'Gönderiliyor...' : 'Sunucu Ekle'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null)
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('ALL')
  
  // Dialogs
  const [authOpen, setAuthOpen] = useState(false)
  const [voteServer, setVoteServer] = useState(null)
  const [addServerOpen, setAddServerOpen] = useState(false)

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
            <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" /> Ana Sayfa
            </a>
            <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
              <Server className="w-4 h-4" /> Sunucular
            </a>
            <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
              <FileText className="w-4 h-4" /> Blog
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  className="border-emerald-600 text-emerald-500 hover:bg-emerald-600 hover:text-white"
                  onClick={() => setAddServerOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Sunucu Ekle
                </Button>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-emerald-600">
                      {user.username?.[0] || user.email?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white hidden md:block">{user.username || user.email}</span>
                  {user.role === 'ADMIN' && (
                    <Badge className="bg-red-600">Admin</Badge>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
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
                      <div className="h-24 bg-zinc-800 rounded" />
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
                    onClick={() => setAddServerOpen(true)}
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
              {topServers.map(server => (
                <ServerCard 
                  key={server.id} 
                  server={server} 
                  onVote={setVoteServer}
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
      <AddServerDialog
        open={addServerOpen}
        onOpenChange={setAddServerOpen}
        onSuccess={() => {
          // Refresh servers
          fetch('/api/servers')
            .then(res => res.json())
            .then(data => setServers(data.servers || []))
        }}
      />
    </div>
  )
}
