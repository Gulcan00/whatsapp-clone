import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useTheme } from '@/context/ThemeContext';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import FriendsPanel from '@/components/friends/FriendsPanel';
import ProfilePanel from '@/components/profile/ProfilePanel';
import RequestsPanel from '@/components/requests/RequestsPanel';
import ArchivePanel from '@/components/archive/ArchivePanel';
import NewGroupDialog from '@/components/chat/NewGroupDialog';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MessageSquare, Users, Bell, Archive, User, Moon, Sun } from 'lucide-react';

const NAV = [
  { id: 'chats',    icon: MessageSquare, label: 'Chats' },
  { id: 'friends',  icon: Users,         label: 'Friends' },
  { id: 'requests', icon: Bell,          label: 'Requests' },
  { id: 'archive',  icon: Archive,       label: 'Archive' },
];

function NavRail({ nav, setNav, requestCount }) {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div className="flex flex-col items-center py-4 shrink-0"
      style={{ width: 72, background: 'var(--bg-0)', borderRight: '1px solid var(--line)' }}>
      {/* Logo mark */}
      <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-6"
        style={{ background: 'var(--ink-0)' }}>
        <div className="flex items-center gap-[3px]" style={{ height: 18 }}>
          {[40, 70, 100, 60, 30].map((h, i) => (
            <span key={i} className="block rounded-sm" style={{ width: 2, height: `${h}%`, background: 'var(--accent)' }} />
          ))}
        </div>
      </div>

      {NAV.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setNav(id)}
          title={label}
          className={cn(
            'h-12 w-12 rounded-xl mb-1.5 flex items-center justify-center relative transition-colors',
            nav === id
              ? 'text-[var(--ink-0)]'
              : 'text-[var(--ink-3)] hover:text-[var(--ink-0)] hover:bg-[var(--bg-1)]'
          )}
          style={nav === id ? { background: 'var(--bg-2)' } : {}}
        >
          <Icon size={22} />
          {id === 'requests' && requestCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full px-1 text-[10px] font-bold flex items-center justify-center"
              style={{ background: 'var(--accent)', color: 'var(--accent-ink)', lineHeight: 1 }}
            >
              {requestCount > 99 ? '99+' : requestCount}
            </span>
          )}
        </button>
      ))}

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        title="Toggle theme"
        className="h-10 w-10 rounded-full flex items-center justify-center mb-1.5 transition-colors hover:bg-[var(--bg-2)]"
        style={{ color: 'var(--ink-2)' }}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Avatar → profile */}
      <button onClick={() => setNav('profile')} title="Profile" className="mb-1.5">
        <AvatarImage src={user.avatar_url} name={user.username} size={36} online />
      </button>
    </div>
  );
}

export default function MainPage() {
  const { socket } = useSocket();
  const [nav, setNav] = useState('chats');
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  const fetchRequestCount = () =>
    api.get('/friends/requests').then(r => setRequestCount(r.length)).catch(() => {});

  useEffect(() => { fetchRequestCount(); }, []);

  // Re-fetch when leaving the requests panel so the badge clears after accepting/declining
  useEffect(() => {
    if (nav !== 'requests') fetchRequestCount();
  }, [nav]);

  const handleSelectConvo = (convo) => {
    setSelectedConvo(convo);
    setMobileShowChat(true);
  };

  const navigateToConvo = async (convoId) => {
    try {
      const convos = await api.get('/conversations');
      const convo = convos.find(c => c.id === convoId);
      if (convo) {
        setSelectedConvo(convo);
        setNav('chats');
        setMobileShowChat(true);
      }
    } catch {}
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: 'var(--bg-1)' }}>
      {/* Nav rail */}
      <NavRail nav={nav} setNav={setNav} requestCount={requestCount} />

      {/* Chat list (only for chats view) */}
      {nav === 'chats' && (
        <div className={cn(!mobileShowChat ? 'flex' : 'hidden md:flex')}>
          <ConversationList
            selectedId={selectedConvo?.id}
            onSelect={handleSelectConvo}
            onNewGroup={() => setShowGroupDialog(true)}
          />
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 min-w-0">
        {nav === 'chats' && (
          <div className={cn('flex flex-1', !mobileShowChat && !selectedConvo ? 'hidden md:flex' : 'flex')}>
            {selectedConvo ? (
              <ChatWindow
                key={selectedConvo.id}
                conversation={selectedConvo}
                onBack={() => setMobileShowChat(false)}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        )}

        {nav === 'friends' && (
          <FriendsPanel onStartChat={navigateToConvo} />
        )}

        {nav === 'requests' && (
          <RequestsPanel onStartChat={navigateToConvo} />
        )}

        {nav === 'archive' && <ArchivePanel />}

        {nav === 'profile' && <ProfilePanel />}
      </div>

      <NewGroupDialog
        open={showGroupDialog}
        onClose={() => setShowGroupDialog(false)}
        onCreated={navigateToConvo}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4" style={{ color: 'var(--ink-3)' }}>
      <div className="flex items-center gap-2.5 font-extrabold text-[32px] tracking-[-0.03em]" style={{ color: 'var(--ink-0)' }}>
        <div className="flex items-center gap-[3px]" style={{ height: 32 }}>
          {[40, 70, 100, 60, 30].map((h, i) => (
            <span key={i} className="block rounded-sm" style={{ width: 4, height: `${h}%`, background: 'var(--accent)' }} />
          ))}
        </div>
        Pulse
      </div>
      <div className="text-center">
        <p className="font-semibold" style={{ color: 'var(--ink-1)' }}>Pick a conversation</p>
        <p className="text-sm mt-1">Messages are end‑to‑end encrypted by default.</p>
      </div>
    </div>
  );
}
