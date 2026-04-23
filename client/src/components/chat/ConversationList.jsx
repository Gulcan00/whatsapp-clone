import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

function timeAgo(unixSec) {
  if (!unixSec) return '';
  const diff = Date.now() / 1000 - unixSec;
  if (diff < 60)     return 'now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h`;
  return new Date(unixSec * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function CheckIcon({ double, read }) {
  if (double) {
    return (
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
        <path d="M1 5l3 3 5-7" stroke={read ? 'var(--accent)' : 'var(--ink-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 5l3 3 5-7" stroke={read ? 'var(--accent)' : 'var(--ink-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4l3 3 5-6" stroke="var(--ink-3)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function ConversationList({ selectedId, onSelect, onNewGroup }) {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [convos, setConvos] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchConvos = () => api.get('/conversations').then(setConvos).catch(console.error);
  useEffect(() => { fetchConvos(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', fetchConvos);
    return () => socket.off('new_message', fetchConvos);
  }, [socket]);

  const getDisplay = (c) => ({
    name: c.type === 'group' ? c.name : c.other_user?.username || 'Unknown',
    avatar: c.type === 'direct' ? c.other_user?.avatar_url : null,
    online: c.type === 'direct' && c.other_user ? onlineUsers.has(c.other_user.id) : false,
    isGroup: c.type === 'group',
  });

  const counts = {
    all:    convos.length,
    direct: convos.filter(c => c.type === 'direct').length,
    groups: convos.filter(c => c.type === 'group').length,
  };

  const filtered = convos.filter(c => {
    if (filter === 'direct') return c.type === 'direct';
    if (filter === 'groups') return c.type === 'group';
    const { name } = getDisplay(c);
    return !search || name.toLowerCase().includes(search.toLowerCase());
  }).filter(c => {
    if (!search) return true;
    const { name } = getDisplay(c);
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col shrink-0" style={{ width: 340, borderRight: '1px solid var(--line)', background: 'var(--bg-0)' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[26px] font-extrabold tracking-[-0.03em] m-0" style={{ color: 'var(--ink-0)' }}>Chats</h2>
          <Button size="icon" onClick={onNewGroup} title="New group">
            <Plus size={18} strokeWidth={2.2} />
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl" style={{ background: 'var(--bg-1)' }}>
          <Search size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
          <input
            placeholder="Search messages & people"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--ink-1)' }}
          />
        </div>

        {/* Filter tabs */}
        <Tabs value={filter} onValueChange={setFilter} className="mt-3">
          <TabsList className="w-full justify-between bg-transparent p-0 gap-1.5">
            {[['all','All'], ['direct','Direct'], ['groups','Groups']].map(([k, l]) => (
              <TabsTrigger key={k} value={k} className={cn('flex-1 gap-1', filter !== k && 'bg-[var(--bg-1)]')}>
                {l}
                <span className="text-[10px] font-bold opacity-60" style={{ fontFamily: 'var(--font-mono)' }}>{counts[k]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-4">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16" style={{ color: 'var(--ink-3)' }}>
            <Users size={32} />
            <p className="text-sm">No conversations yet</p>
          </div>
        )}
        {filtered.map(c => {
          const { name, avatar, online, isGroup } = getDisplay(c);
          const last = c.last_message_type === 'image' ? '📷 Photo' : c.last_message || '';
          const fromMe = c.last_message_sender === user.username || !c.last_message_sender;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className={cn(
                'flex gap-3 px-4 py-3 mx-2 rounded-2xl w-[calc(100%-16px)] cursor-pointer transition-colors text-left',
                selectedId === c.id ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--bg-1)]'
              )}
            >
              {isGroup ? (
                <div className="relative shrink-0" style={{ width: 46, height: 46 }}>
                  <div className="absolute top-0 left-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: '#5b7fa6' }}>
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ background: '#7a6ba8', boxShadow: '0 0 0 2px var(--bg-0)' }}>
                    <Users size={12} />
                  </div>
                </div>
              ) : (
                <AvatarImage src={avatar} name={name} size={46} online={online} />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-1">
                  <span className="font-bold text-[15px] tracking-tight truncate" style={{ color: 'var(--ink-0)' }}>
                    {name}
                  </span>
                  <span className="text-[11px] shrink-0 ml-2" style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                    {timeAgo(c.last_message_at)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {fromMe && c.last_message && <CheckIcon double />}
                  <span className="truncate text-[13px] flex-1" style={{ color: 'var(--ink-3)' }}>
                    {last || 'No messages yet'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
