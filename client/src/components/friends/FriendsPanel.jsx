import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, MessageCircle, MoreHorizontal } from 'lucide-react';

function groupAlpha(list) {
  const map = {};
  list.forEach(c => {
    const k = c.username[0].toUpperCase();
    if (!map[k]) map[k] = [];
    map[k].push(c);
  });
  return map;
}

export default function FriendsPanel({ onStartChat }) {
  const { onlineUsers } = useSocket();
  const [tab, setTab] = useState('all');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchFriends = () => api.get('/friends').then(setFriends).catch(console.error);
  const fetchRequests = () => api.get('/friends/requests').then(setRequests).catch(console.error);

  useEffect(() => { fetchFriends(); fetchRequests(); }, []);

  useEffect(() => {
    if (tab !== 'search' || !search.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try { setSearchResults(await api.get(`/users/search?q=${encodeURIComponent(search)}`)); }
      catch {} finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [search, tab]);

  const sendRequest = async (userId) => {
    try {
      await api.post('/friends/request', { addressee_id: userId });
      setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, requested: true } : u));
    } catch (err) { alert(err.message); }
  };

  const startChat = async (friendId) => {
    try {
      const { id } = await api.post('/conversations/direct', { user_id: friendId });
      onStartChat(id);
    } catch (err) { alert(err.message); }
  };

  const onlineCount = friends.filter(f => onlineUsers.has(f.id)).length;
  const visibleFriends = friends
    .map(f => ({ ...f, online: onlineUsers.has(f.id) }))
    .filter(f => tab === 'online' ? f.online : true)
    .filter(f => !search || f.username.toLowerCase().includes(search.toLowerCase()));

  const grouped = groupAlpha(visibleFriends);

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-1)' }}>
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="text-xs font-bold tracking-[0.08em] uppercase" style={{ color: 'var(--ink-3)' }}>
              {friends.length} total · {onlineCount} online
            </div>
            <h1 className="text-[44px] font-extrabold tracking-[-0.03em] mt-1.5" style={{ color: 'var(--ink-0)' }}>Friends</h1>
          </div>
          <Button onClick={() => setTab('search')}>
            <UserPlus size={16} /> Add friend
          </Button>
        </div>

        {/* Search + filter */}
        <div className="flex gap-2.5 mb-6">
          <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl border"
            style={{ background: 'var(--bg-0)', borderColor: 'var(--line)' }}>
            <Search size={16} style={{ color: 'var(--ink-3)' }} />
            <input
              placeholder={tab === 'search' ? 'Search by username…' : 'Search friends…'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none border-none text-sm"
              style={{ color: 'var(--ink-1)' }}
            />
          </div>
          <Tabs value={tab} onValueChange={v => { setTab(v); setSearch(''); }}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="online">Online</TabsTrigger>
              <TabsTrigger value="search">Find</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Pending requests badge */}
        {requests.length > 0 && tab !== 'search' && (
          <Card className="p-4 mb-5 flex items-center gap-3">
            <Badge variant="accent">{requests.length}</Badge>
            <span className="text-sm flex-1">Pending friend requests</span>
            <Button variant="ghost" size="sm">View</Button>
          </Card>
        )}

        {/* Search results */}
        {tab === 'search' && (
          <div>
            {searching && <p className="text-center text-sm py-4" style={{ color: 'var(--ink-3)' }}>Searching…</p>}
            {!searching && searchResults.length === 0 && search && (
              <p className="text-center text-sm py-8" style={{ color: 'var(--ink-3)' }}>No users found for "{search}"</p>
            )}
            <Card className="overflow-hidden">
              {searchResults.map((u, i) => (
                <div key={u.id} className="flex items-center gap-3.5 px-5 py-3.5 border-b last:border-b-0 hover:bg-[var(--bg-1)] transition-colors"
                  style={{ borderColor: 'var(--line)' }}>
                  <AvatarImage src={u.avatar_url} name={u.username} size={44} />
                  <div className="flex-1">
                    <div className="font-semibold text-[15px] tracking-tight" style={{ color: 'var(--ink-0)' }}>
                      {u.username}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={u.requested ? 'secondary' : 'default'}
                    disabled={u.requested}
                    onClick={() => sendRequest(u.id)}
                  >
                    <UserPlus size={14} />
                    {u.requested ? 'Sent' : 'Add'}
                  </Button>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Friends list alphabetical */}
        {tab !== 'search' && (
          <>
            {visibleFriends.length === 0 && (
              <Card className="p-12 text-center">
                <div className="text-4xl mb-3">👋</div>
                <div className="text-lg font-bold">
                  {tab === 'online' ? 'No friends online' : 'No friends yet'}
                </div>
                <div className="mt-1.5" style={{ color: 'var(--ink-3)' }}>
                  {tab === 'online' ? 'Check back later' : 'Use "Find" to add people'}
                </div>
              </Card>
            )}
            {Object.keys(grouped).sort().map(letter => (
              <div key={letter} className="mb-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-extrabold tracking-[-0.03em]" style={{ color: 'var(--ink-3)' }}>{letter}</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
                </div>
                <Card className="overflow-hidden">
                  {grouped[letter].map(f => (
                    <div key={f.id} className="flex items-center gap-3.5 px-5 py-3.5 border-b last:border-b-0 hover:bg-[var(--bg-1)] cursor-pointer transition-colors"
                      style={{ borderColor: 'var(--line)' }}>
                      <AvatarImage src={f.avatar_url} name={f.username} size={44} online={f.online} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[15px] tracking-tight" style={{ color: 'var(--ink-0)' }}>
                          {f.username}
                        </div>
                        <div className="text-xs" style={{ color: f.online ? 'var(--accent)' : 'var(--ink-3)' }}>
                          {f.online ? 'Online now' : 'Offline'}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => startChat(f.id)} title="Message">
                        <MessageCircle size={18} style={{ color: 'var(--accent)' }} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal size={18} style={{ color: 'var(--ink-3)' }} />
                      </Button>
                    </div>
                  ))}
                </Card>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
