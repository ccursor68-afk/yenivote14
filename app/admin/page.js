'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3, Users, Server, Ticket, FileText, Settings, LogOut,
  ChevronLeft, ChevronRight, Search, Filter, MoreVertical, Plus,
  Check, X, Edit, Trash2, Eye, Ban, Shield, Zap, TrendingUp,
  Clock, AlertCircle, CheckCircle, XCircle, RefreshCw, Download,
  Home, Menu, Bell, Moon, Sun, ChevronDown, ExternalLink,
  MessageSquare, Star, Globe, Calendar, Activity, PieChart,
  ArrowUpRight, ArrowDownRight, Loader2, Save, Upload, Image
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast, Toaster } from 'sonner'

// ==================== ADMIN PANEL COMPONENT ====================
export default function AdminPanel() {
  const router = useRouter()
  
  // CRITICAL: Safe mounting pattern to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Data states
  const [stats, setStats] = useState(null)
  const [servers, setServers] = useState([])
  const [pendingServers, setPendingServers] = useState([])
  const [users, setUsers] = useState([])
  const [tickets, setTickets] = useState([])
  const [blogPosts, setBlogPosts] = useState([])
  const [votes, setVotes] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  // Safe mounting effect - MUST be first
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check auth on mount
  useEffect(() => {
    if (mounted) {
      checkAuth()
    }
  }, [mounted])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      const data = await res.json()
      
      if (data.user && data.user.role === 'ADMIN') {
        setUser(data.user)
        loadAllData()
      } else {
        router.push('/')
        toast.error('Admin yetkisi gerekli')
      }
    } catch (err) {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const loadAllData = async () => {
    try {
      const [statsRes, serversRes, pendingRes, usersRes, ticketsRes, blogRes] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include' }).then(r => r.json()).catch(() => ({})),
        fetch('/api/admin/all-servers', { credentials: 'include' }).then(r => r.json()).catch(() => ({ servers: [] })),
        fetch('/api/admin/servers/pending', { credentials: 'include' }).then(r => r.json()).catch(() => ({ servers: [] })),
        fetch('/api/admin/users', { credentials: 'include' }).then(r => r.json()).catch(() => ({ users: [] })),
        fetch('/api/admin/tickets', { credentials: 'include' }).then(r => r.json()).catch(() => ({ tickets: [] })),
        fetch('/api/admin/blog', { credentials: 'include' }).then(r => r.json()).catch(() => ({ posts: [] }))
      ])

      setStats(statsRes.stats || null)
      setServers(serversRes.servers || [])
      setPendingServers(pendingRes.servers || [])
      setUsers(usersRes.users || [])
      setTickets(ticketsRes.tickets || [])
      setBlogPosts(blogRes.posts || [])
    } catch (err) {
      console.error('Data load error:', err)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      router.push('/')
    } catch (err) {
      router.push('/')
    }
  }

  // CRITICAL: Return null/skeleton until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Admin paneli yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Not authorized
  if (!user || user.role !== 'ADMIN') {
    return null
  }

  // Menu items - SAFE: Calculate badges only after data is loaded to prevent hydration issues
  const pendingCount = Array.isArray(pendingServers) ? pendingServers.length : 0
  const openTicketCount = Array.isArray(tickets) ? tickets.filter(t => t && t.status === 'OPEN').length : 0
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: null },
    { id: 'servers', label: 'Sunucular', icon: Server, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'users', label: 'Kullanıcılar', icon: Users, badge: null },
    { id: 'tickets', label: 'Ticketlar', icon: Ticket, badge: openTicketCount > 0 ? openTicketCount : null },
    { id: 'blog', label: 'Blog', icon: FileText, badge: null },
    { id: 'votes', label: 'Oylar', icon: Star, badge: null },
    { id: 'settings', label: 'Ayarlar', icon: Settings, badge: null },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300 fixed h-full z-40 lg:relative`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">Admin Panel</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-zinc-800"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeSection === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge className="bg-red-500 text-white text-xs">{item.badge}</Badge>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-zinc-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-emerald-600 text-white">
                  {user?.username?.[0]?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username || user?.email}</p>
                <p className="text-xs text-zinc-500">Admin</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-zinc-800">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleLogout} className="w-full hover:bg-zinc-800">
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'} ml-20 lg:ml-0`}>
        {/* Top Header */}
        <header className="h-16 bg-zinc-900/50 backdrop-blur-lg border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden hover:bg-zinc-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-white capitalize">
                {menuItems.find(m => m.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-zinc-500">ServerListRank Admin Paneli</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={loadAllData} className="hover:bg-zinc-800">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/')} className="border-zinc-700 hover:bg-zinc-800">
              <ExternalLink className="w-4 h-4 mr-2" /> Siteyi Görüntüle
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {activeSection === 'dashboard' && <DashboardSection stats={stats} servers={servers} pendingServers={pendingServers} tickets={tickets} users={users} onRefresh={loadAllData} />}
          {activeSection === 'servers' && <ServersSection servers={servers} pendingServers={pendingServers} onRefresh={loadAllData} />}
          {activeSection === 'users' && <UsersSection users={users} onRefresh={loadAllData} />}
          {activeSection === 'tickets' && <TicketsSection tickets={tickets} onRefresh={loadAllData} />}
          {activeSection === 'blog' && <BlogSection posts={blogPosts} onRefresh={loadAllData} user={user} />}
          {activeSection === 'votes' && <VotesSection servers={servers} />}
          {activeSection === 'settings' && <SettingsSection />}
        </div>
      </main>
    </div>
  )
}

// ==================== DASHBOARD SECTION ====================
function DashboardSection({ stats, servers, pendingServers, tickets, users, onRefresh }) {
  // SAFE: Ensure all arrays are valid before using
  const safeServers = Array.isArray(servers) ? servers : []
  const safePendingServers = Array.isArray(pendingServers) ? pendingServers : []
  const safeTickets = Array.isArray(tickets) ? tickets : []
  
  const openTickets = safeTickets.filter(t => t && t.status === 'OPEN').length
  const totalVotes = stats?.voteCount || 0
  const totalUsers = stats?.userCount || 0
  const totalServers = stats?.serverCount || 0

  // Calculate stats
  const onlineServers = safeServers.filter(s => s && s.isOnline).length
  const totalPlayers = safeServers.reduce((acc, s) => acc + (s?.playerCount || 0), 0)

  // Format numbers safely (avoid locale differences between server/client)
  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const statCards = [
    { title: 'Toplam Sunucu', value: totalServers, icon: Server, color: 'emerald', change: '+12%' },
    { title: 'Online Sunucu', value: onlineServers, icon: Activity, color: 'green', change: `${totalServers > 0 ? Math.round((onlineServers/totalServers)*100) : 0}%` },
    { title: 'Toplam Oyuncu', value: formatNumber(totalPlayers), icon: Users, color: 'blue', change: '+8%' },
    { title: 'Toplam Oy', value: formatNumber(totalVotes), icon: Star, color: 'yellow', change: '+24%' },
    { title: 'Toplam Kullanıcı', value: totalUsers, icon: Users, color: 'purple', change: '+15%' },
    { title: 'Açık Ticket', value: openTickets, icon: Ticket, color: 'red', change: null },
    { title: 'Bekleyen Sunucu', value: safePendingServers.length, icon: Clock, color: 'orange', change: null },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.slice(0, 4).map((stat, idx) => (
          <Card key={idx} className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  {stat.change && (
                    <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-3 h-3" /> {stat.change}
                    </p>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.slice(4).map((stat, idx) => (
          <Card key={idx} className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
              </div>
              <div>
                <p className="text-xs text-zinc-400">{stat.title}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Servers */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Onay Bekleyen Sunucular
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(pendingServers || []).length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-zinc-400">Bekleyen sunucu yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(pendingServers || []).slice(0, 5).map(server => (
                  <div key={server.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                        <Server className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{server.name}</p>
                        <p className="text-xs text-zinc-500">{server.ip}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-500">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" className="h-8">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open Tickets */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-blue-500" />
              Açık Ticketlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(tickets || []).filter(t => t.status === 'OPEN').length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-zinc-400">Açık ticket yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(tickets || []).filter(t => t.status === 'OPEN').slice(0, 5).map(ticket => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        ticket.status === 'OPEN' ? 'bg-emerald-500' : 
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-zinc-500'
                      }`} />
                      <div>
                        <p className="font-medium text-white text-sm truncate max-w-[200px]">{ticket.subject}</p>
                        <p className="text-xs text-zinc-500">{ticket.user?.email || 'Bilinmeyen'}</p>
                      </div>
                    </div>
                    <Badge className="bg-zinc-700">{ticket.category}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Servers */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            En Çok Oy Alan Sunucular
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">#</TableHead>
                  <TableHead className="text-zinc-400">Sunucu</TableHead>
                  <TableHead className="text-zinc-400">IP</TableHead>
                  <TableHead className="text-zinc-400">Oyuncu</TableHead>
                  <TableHead className="text-zinc-400">Oy</TableHead>
                  <TableHead className="text-zinc-400">Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(servers || [])
                  .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
                  .slice(0, 5)
                  .map((server, idx) => (
                    <TableRow key={server.id} className="border-zinc-800">
                      <TableCell className="text-zinc-400 font-medium">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-zinc-700 rounded flex items-center justify-center">
                            <Server className="w-4 h-4 text-zinc-400" />
                          </div>
                          <span className="font-medium text-white">{server.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400 font-mono text-sm">{server.ip}</TableCell>
                      <TableCell className="text-zinc-400">{server.playerCount || 0}/{server.maxPlayers || 0}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-600">{server.voteCount || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        {server.isOnline ? (
                          <Badge className="bg-green-600">Online</Badge>
                        ) : (
                          <Badge className="bg-zinc-600">Offline</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== SERVERS SECTION ====================
function ServersSection({ servers, pendingServers, onRefresh }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedServer, setSelectedServer] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [sponsorModal, setSponsorModal] = useState(null)
  const [sponsorDays, setSponsorDays] = useState('7')

  const allServers = [...(pendingServers || []), ...(servers || [])]
  
  const filteredServers = useMemo(() => {
    return allServers.filter(server => {
      const matchesSearch = server.name.toLowerCase().includes(search.toLowerCase()) ||
                           server.ip.toLowerCase().includes(search.toLowerCase())
      
      if (filter === 'all') return matchesSearch
      if (filter === 'pending') return matchesSearch && server.approvalStatus === 'PENDING'
      if (filter === 'approved') return matchesSearch && server.approvalStatus === 'APPROVED'
      if (filter === 'rejected') return matchesSearch && server.approvalStatus === 'REJECTED'
      if (filter === 'sponsored') return matchesSearch && server.isSponsored
      if (filter === 'online') return matchesSearch && server.isOnline
      if (filter === 'offline') return matchesSearch && !server.isOnline
      return matchesSearch
    })
  }, [allServers, filter, search])

  const handleApprove = async (serverId) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/servers/${serverId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'APPROVED' })
      })
      if (res.ok) {
        toast.success('Sunucu onaylandı!')
        onRefresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Onaylama başarısız')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (serverId) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/servers/${serverId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'REJECTED' })
      })
      if (res.ok) {
        toast.success('Sunucu reddedildi!')
        onRefresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Reddetme başarısız')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (serverId) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/all-servers?id=${serverId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        toast.success('Sunucu silindi!')
        setDeleteConfirm(null)
        onRefresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Silme başarısız')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSponsor = async () => {
    if (!sponsorModal) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/servers/${sponsorModal.id}/sponsor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ days: parseInt(sponsorDays) })
      })
      if (res.ok) {
        toast.success(parseInt(sponsorDays) > 0 ? 'Sponsor eklendi!' : 'Sponsor kaldırıldı!')
        setSponsorModal(null)
        onRefresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'İşlem başarısız')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Sunucu adı veya IP ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Filtre" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="approved">Onaylı</SelectItem>
                <SelectItem value="rejected">Reddedildi</SelectItem>
                <SelectItem value="sponsored">Sponsorlu</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Servers Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Sunucular ({filteredServers.length})</CardTitle>
            <Button onClick={onRefresh} variant="outline" size="sm" className="border-zinc-700">
              <RefreshCw className="w-4 h-4 mr-2" /> Yenile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Sunucu</TableHead>
                  <TableHead className="text-zinc-400">IP / Port</TableHead>
                  <TableHead className="text-zinc-400">Durum</TableHead>
                  <TableHead className="text-zinc-400">Onay</TableHead>
                  <TableHead className="text-zinc-400">Oyuncu</TableHead>
                  <TableHead className="text-zinc-400">Oy</TableHead>
                  <TableHead className="text-zinc-400">Sponsor</TableHead>
                  <TableHead className="text-zinc-400">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-zinc-500">
                      Sunucu bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServers.map(server => (
                    <TableRow key={server.id} className="border-zinc-800">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                            <Server className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{server.name}</p>
                            <p className="text-xs text-zinc-500">{server.platform} • {server.gameMode}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-zinc-400">
                        {server.ip}:{server.port || 25565}
                      </TableCell>
                      <TableCell>
                        {server.isOnline ? (
                          <Badge className="bg-green-600">Online</Badge>
                        ) : (
                          <Badge className="bg-zinc-600">Offline</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          server.approvalStatus === 'APPROVED' ? 'bg-emerald-600' :
                          server.approvalStatus === 'PENDING' ? 'bg-amber-600' : 'bg-red-600'
                        }>
                          {server.approvalStatus === 'APPROVED' ? 'Onaylı' :
                           server.approvalStatus === 'PENDING' ? 'Beklemede' : 'Reddedildi'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {server.playerCount || 0}/{server.maxPlayers || 0}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-600">{server.voteCount || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        {server.isSponsored ? (
                          <Badge className="bg-yellow-600">Aktif</Badge>
                        ) : (
                          <Badge className="bg-zinc-700">Yok</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {server.approvalStatus === 'PENDING' && (
                            <>
                              <Button 
                                size="sm" 
                                className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-500"
                                onClick={() => handleApprove(server.id)}
                                disabled={actionLoading}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                className="h-8 w-8 p-0"
                                onClick={() => handleReject(server.id)}
                                disabled={actionLoading}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-zinc-700"
                            onClick={() => setSponsorModal(server)}
                          >
                            <Zap className="w-4 h-4 text-yellow-500" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-zinc-700"
                            onClick={() => setSelectedServer(server)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-red-900/50 text-red-500"
                            onClick={() => setDeleteConfirm(server)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Sunucu Silme
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              <strong className="text-white">{deleteConfirm?.name}</strong> sunucusunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="border-zinc-700">
              İptal
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDelete(deleteConfirm?.id)}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sponsor Modal */}
      <Dialog open={!!sponsorModal} onOpenChange={() => setSponsorModal(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-yellow-500 flex items-center gap-2">
              <Zap className="w-5 h-5" /> Sponsor Yönetimi
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              <strong className="text-white">{sponsorModal?.name}</strong> için sponsor ayarlayın
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-white mb-2 block">Sponsor Süresi</Label>
            <Select value={sponsorDays} onValueChange={setSponsorDays}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="0">Kaldır</SelectItem>
                <SelectItem value="7">7 Gün</SelectItem>
                <SelectItem value="14">14 Gün</SelectItem>
                <SelectItem value="30">30 Gün</SelectItem>
                <SelectItem value="90">90 Gün</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSponsorModal(null)} className="border-zinc-700">
              İptal
            </Button>
            <Button 
              className="bg-yellow-600 hover:bg-yellow-500"
              onClick={handleSponsor}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Server Detail Modal */}
      <Dialog open={!!selectedServer} onOpenChange={() => setSelectedServer(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-500" /> {selectedServer?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedServer && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label className="text-zinc-400 text-xs">IP Adresi</Label>
                <p className="text-white font-mono">{selectedServer.ip}:{selectedServer.port}</p>
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Platform</Label>
                <p className="text-white">{selectedServer.platform}</p>
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Oyun Modu</Label>
                <p className="text-white">{selectedServer.gameMode}</p>
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Versiyon</Label>
                <p className="text-white">{selectedServer.version}</p>
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Oyuncu</Label>
                <p className="text-white">{selectedServer.playerCount}/{selectedServer.maxPlayers}</p>
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Oy Sayısı</Label>
                <p className="text-white">{selectedServer.voteCount}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-zinc-400 text-xs">Kısa Açıklama</Label>
                <p className="text-white">{selectedServer.shortDescription}</p>
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Sahip</Label>
                <p className="text-white">{selectedServer.owner?.email || 'Bilinmeyen'}</p>
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Eklenme Tarihi</Label>
                <p className="text-white">{new Date(selectedServer.createdAt).toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== USERS SECTION ====================
function UsersSection({ users, onRefresh }) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const filteredUsers = useMemo(() => {
    return (users || []).filter(user => {
      const matchesSearch = 
        (user.username?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(search.toLowerCase())
      
      if (roleFilter === 'all') return matchesSearch
      return matchesSearch && user.role === roleFilter
    })
  }, [users, search, roleFilter])

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      })
      if (res.ok) {
        toast.success('Rol güncellendi!')
        onRefresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Güncelleme başarısız')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        toast.success('Kullanıcı silindi!')
        setSelectedUser(null)
        onRefresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Silme başarısız')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Kullanıcı adı veya email ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">Tüm Roller</SelectItem>
                <SelectItem value="USER">Kullanıcı</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="VERIFIED_HOSTING">Hosting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white">Kullanıcılar ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Kullanıcı</TableHead>
                  <TableHead className="text-zinc-400">Email</TableHead>
                  <TableHead className="text-zinc-400">Rol</TableHead>
                  <TableHead className="text-zinc-400">Discord</TableHead>
                  <TableHead className="text-zinc-400">Kayıt Tarihi</TableHead>
                  <TableHead className="text-zinc-400">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                      Kullanıcı bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id} className="border-zinc-800">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback className="bg-zinc-700">
                              {(user.username || user.email)?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-white">{user.username || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400">{user.email}</TableCell>
                      <TableCell>
                        <Select 
                          value={user.role} 
                          onValueChange={(v) => handleRoleChange(user.id, v)}
                          disabled={actionLoading}
                        >
                          <SelectTrigger className="w-32 h-8 bg-zinc-800 border-zinc-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="USER">Kullanıcı</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="VERIFIED_HOSTING">Hosting</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {user.discordId ? (
                          <Badge className="bg-[#5865F2]">Bağlı</Badge>
                        ) : (
                          <Badge className="bg-zinc-700">Yok</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-zinc-700"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-red-900/50 text-red-500"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" /> Kullanıcı Detayı
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedUser.avatarUrl} />
                  <AvatarFallback className="bg-zinc-700 text-xl">
                    {(selectedUser.username || selectedUser.email)?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-medium text-white">{selectedUser.username || '-'}</p>
                  <p className="text-sm text-zinc-400">{selectedUser.email}</p>
                </div>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400 text-xs">Rol</Label>
                  <p className="text-white">{selectedUser.role}</p>
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">Discord</Label>
                  <p className="text-white">{selectedUser.discordUsername || 'Bağlı değil'}</p>
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">Minecraft Nick</Label>
                  <p className="text-white">{selectedUser.minecraftNick || '-'}</p>
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">Kayıt Tarihi</Label>
                  <p className="text-white">{new Date(selectedUser.createdAt).toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== TICKETS SECTION ====================
function TicketsSection({ tickets, onRefresh }) {
  const [filter, setFilter] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [replyMessage, setReplyMessage] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const filteredTickets = useMemo(() => {
    if (filter === 'all') return tickets || []
    return (tickets || []).filter(t => t.status === filter)
  }, [tickets, filter])

  const openTicket = async (ticket) => {
    setSelectedTicket(ticket)
    try {
      const res = await fetch(`/api/admin/tickets/${ticket.id}/messages`, { credentials: 'include' })
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) {
      setMessages([])
    }
  }

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: replyMessage, isAdmin: true })
      })
      if (res.ok) {
        toast.success('Yanıt gönderildi!')
        setReplyMessage('')
        // Refresh messages
        const msgRes = await fetch(`/api/admin/tickets/${selectedTicket.id}/messages`, { credentials: 'include' })
        const msgData = await msgRes.json()
        setMessages(msgData.messages || [])
        onRefresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Yanıt gönderilemedi')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const updateStatus = async (status) => {
    if (!selectedTicket) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        toast.success('Durum güncellendi!')
        setSelectedTicket({ ...selectedTicket, status })
        onRefresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Güncelleme başarısız')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'Tümü' },
              { value: 'OPEN', label: 'Açık', color: 'emerald' },
              { value: 'IN_PROGRESS', label: 'İşlemde', color: 'blue' },
              { value: 'CLOSED', label: 'Kapalı', color: 'zinc' },
            ].map(f => (
              <Button
                key={f.value}
                variant={filter === f.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f.value)}
                className={filter === f.value ? 'bg-emerald-600' : 'border-zinc-700'}
              >
                {f.label}
                {f.value !== 'all' && (
                  <Badge className="ml-2 bg-zinc-700">
                    {(tickets || []).filter(t => t.status === f.value).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <Card className="bg-zinc-900/50 border-zinc-800 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-white">Ticketlar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">Ticket bulunamadı</div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {filteredTickets.map(ticket => (
                    <button
                      key={ticket.id}
                      onClick={() => openTicket(ticket)}
                      className={`w-full p-4 text-left hover:bg-zinc-800/50 transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-zinc-800/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                          ticket.status === 'OPEN' ? 'bg-emerald-500' :
                          ticket.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-zinc-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{ticket.subject}</p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {ticket.user?.email || 'Bilinmeyen'} • {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                          <Badge className="mt-2 bg-zinc-700 text-xs">{ticket.category}</Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Ticket Detail */}
        <Card className="bg-zinc-900/50 border-zinc-800 lg:col-span-2">
          {selectedTicket ? (
            <>
              <CardHeader className="border-b border-zinc-800">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white">{selectedTicket.subject}</CardTitle>
                    <CardDescription className="text-zinc-400 mt-1">
                      {selectedTicket.user?.email} • {selectedTicket.category}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={selectedTicket.status} 
                      onValueChange={updateStatus}
                      disabled={actionLoading}
                    >
                      <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="OPEN">Açık</SelectItem>
                        <SelectItem value="IN_PROGRESS">İşlemde</SelectItem>
                        <SelectItem value="CLOSED">Kapalı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Messages */}
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {(messages || []).map(msg => (
                      <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          msg.isAdmin ? 'bg-emerald-600/20 border border-emerald-600/30' : 'bg-zinc-800'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${msg.isAdmin ? 'text-emerald-400' : 'text-zinc-400'}`}>
                              {msg.isAdmin ? 'Admin' : msg.user?.email || 'Kullanıcı'}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {new Date(msg.createdAt).toLocaleString('tr-TR')}
                            </span>
                          </div>
                          <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Reply */}
                {selectedTicket.status !== 'CLOSED' && (
                  <div className="p-4 border-t border-zinc-800">
                    <div className="flex gap-2">
                      <Textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Yanıtınızı yazın..."
                        className="bg-zinc-800 border-zinc-700 min-h-[80px]"
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-500"
                        onClick={handleReply}
                        disabled={actionLoading || !replyMessage.trim()}
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                        Yanıtla
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-zinc-500">
              <div className="text-center">
                <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Bir ticket seçin</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ==================== BLOG SECTION ====================
function BlogSection({ posts, onRefresh, user }) {
  const [showForm, setShowForm] = useState(false)
  const [editPost, setEditPost] = useState(null)
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    published: false,
    blogType: 'NEWS',
    tags: ''
  })
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const resetForm = () => {
    setForm({
      title: '',
      content: '',
      excerpt: '',
      coverImage: '',
      published: false,
      blogType: 'NEWS',
      tags: ''
    })
    setEditPost(null)
    setShowForm(false)
  }

  const openEdit = (post) => {
    setEditPost(post)
    setForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      coverImage: post.coverImage || '',
      published: post.published,
      blogType: post.blogType || 'NEWS',
      tags: (post.tags || []).join(', ')
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      toast.error('Başlık ve içerik zorunludur')
      return
    }

    setActionLoading(true)
    try {
      const endpoint = editPost ? '/api/admin/blog' : '/api/admin/blog'
      const method = editPost ? 'PUT' : 'POST'
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...(editPost && { id: editPost.id }),
          title: form.title,
          content: form.content,
          excerpt: form.excerpt,
          coverImage: form.coverImage,
          published: form.published,
          blogType: form.blogType,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      })

      if (res.ok) {
        toast.success(editPost ? 'Yazı güncellendi!' : 'Yazı oluşturuldu!')
        resetForm()
        onRefresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'İşlem başarısız')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (postId) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/blog?id=${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        toast.success('Yazı silindi!')
        setDeleteConfirm(null)
        onRefresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Silme başarısız')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Blog Yazıları</h2>
          <p className="text-sm text-zinc-400">Toplam {(posts || []).length} yazı</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Yeni Yazı
        </Button>
      </div>

      {/* Blog Form Modal */}
      <Dialog open={showForm} onOpenChange={() => resetForm()}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editPost ? 'Yazıyı Düzenle' : 'Yeni Blog Yazısı'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white">Başlık *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
                placeholder="Yazı başlığı"
              />
            </div>
            <div>
              <Label className="text-white">İçerik *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1 min-h-[200px]"
                placeholder="Yazı içeriği (Markdown desteklenir)"
              />
            </div>
            <div>
              <Label className="text-white">Özet</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
                placeholder="Kısa özet"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Kapak Görseli URL</Label>
                <Input
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 mt-1"
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label className="text-white">Tür</Label>
                <Select value={form.blogType} onValueChange={(v) => setForm({ ...form, blogType: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="NEWS">Haber</SelectItem>
                    <SelectItem value="GUIDE">Rehber</SelectItem>
                    <SelectItem value="UPDATE">Güncelleme</SelectItem>
                    <SelectItem value="TUTORIAL">Tutorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-white">Etiketler</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="bg-zinc-800 border-zinc-700 mt-1"
                placeholder="minecraft, sunucu, rehber (virgülle ayırın)"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.published}
                onCheckedChange={(v) => setForm({ ...form, published: v })}
              />
              <Label className="text-white">Yayınla</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm} className="border-zinc-700">
              İptal
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-500"
              onClick={handleSubmit}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {editPost ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Posts List */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-0">
          {(posts || []).length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Henüz blog yazısı yok</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {(posts || []).map(post => (
                <div key={post.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt="" className="w-16 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-12 bg-zinc-800 rounded flex items-center justify-center">
                        <Image className="w-6 h-6 text-zinc-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-zinc-700 text-xs">{post.blogType}</Badge>
                        <Badge className={post.published ? 'bg-emerald-600' : 'bg-zinc-600'}>
                          {post.published ? 'Yayında' : 'Taslak'}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-zinc-700"
                      onClick={() => openEdit(post)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-red-900/50 text-red-500"
                      onClick={() => setDeleteConfirm(post)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-red-500">Yazıyı Sil</DialogTitle>
            <DialogDescription className="text-zinc-400">
              <strong className="text-white">{deleteConfirm?.title}</strong> yazısını silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="border-zinc-700">
              İptal
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleDelete(deleteConfirm?.id)}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ==================== VOTES SECTION ====================
function VotesSection({ servers }) {
  const sortedServers = useMemo(() => {
    return [...(servers || [])].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
  }, [servers])

  const totalVotes = (servers || []).reduce((acc, s) => acc + (s.voteCount || 0), 0)
  const totalMonthlyVotes = (servers || []).reduce((acc, s) => acc + (s.monthlyVotes || 0), 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Toplam Oy</p>
                <p className="text-2xl font-bold text-white">{totalVotes.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Bu Ay</p>
                <p className="text-2xl font-bold text-white">{totalMonthlyVotes.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Ortalama</p>
                <p className="text-2xl font-bold text-white">
                  {(servers || []).length > 0 ? Math.round(totalVotes / (servers || []).length) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Votes Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Sunucu Oyları</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">#</TableHead>
                <TableHead className="text-zinc-400">Sunucu</TableHead>
                <TableHead className="text-zinc-400">Toplam Oy</TableHead>
                <TableHead className="text-zinc-400">Bu Ay</TableHead>
                <TableHead className="text-zinc-400">Tıklanma</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedServers.map((server, idx) => (
                <TableRow key={server.id} className="border-zinc-800">
                  <TableCell className="font-medium text-zinc-400">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-zinc-700 rounded flex items-center justify-center">
                        <Server className="w-4 h-4 text-zinc-400" />
                      </div>
                      <span className="font-medium text-white">{server.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-600">{server.voteCount || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400">{server.monthlyVotes || 0}</TableCell>
                  <TableCell className="text-zinc-400">{server.clickCount || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== SETTINGS SECTION ====================
function SettingsSection() {
  const [settings, setSettings] = useState({
    discordUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    twitterUrl: '',
    contactEmail: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { credentials: 'include' })
      const data = await res.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (err) {
      console.error('Settings fetch error:', err)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        toast.success('Ayarlar kaydedildi!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Kaydetme başarısız')
      }
    } catch (err) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            Sosyal Medya Linkleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Discord Sunucu</Label>
            <Input
              value={settings.discordUrl || ''}
              onChange={(e) => setSettings({ ...settings, discordUrl: e.target.value })}
              className="bg-zinc-800 border-zinc-700 mt-1"
              placeholder="https://discord.gg/..."
            />
          </div>
          <div>
            <Label className="text-white">Instagram</Label>
            <Input
              value={settings.instagramUrl || ''}
              onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
              className="bg-zinc-800 border-zinc-700 mt-1"
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <Label className="text-white">YouTube</Label>
            <Input
              value={settings.youtubeUrl || ''}
              onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
              className="bg-zinc-800 border-zinc-700 mt-1"
              placeholder="https://youtube.com/..."
            />
          </div>
          <div>
            <Label className="text-white">Twitter / X</Label>
            <Input
              value={settings.twitterUrl || ''}
              onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
              className="bg-zinc-800 border-zinc-700 mt-1"
              placeholder="https://twitter.com/..."
            />
          </div>
          <div>
            <Label className="text-white">İletişim Email</Label>
            <Input
              value={settings.contactEmail || ''}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="bg-zinc-800 border-zinc-700 mt-1"
              placeholder="contact@example.com"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-500"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Kaydet
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
