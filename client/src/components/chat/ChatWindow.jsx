import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import MessageBubble from './MessageBubble';
import { Send, Image, Phone, Video, Search, MoreHorizontal, ArrowLeft, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ChatWindow({ conversation, onBack }) {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const typingTimer = useRef(null);

  const isGroup = conversation.type === 'group';
  const otherUser = conversation.other_user;
  const isOtherOnline = otherUser ? onlineUsers.has(otherUser.id) : false;
  const displayName = isGroup ? conversation.name : otherUser?.username || 'Unknown';
  const displayAvatar = isGroup ? null : otherUser?.avatar_url;

  const fetchMessages = useCallback(() => {
    api.get(`/conversations/${conversation.id}/messages`).then(setMessages).catch(console.error);
  }, [conversation.id]);

  useEffect(() => { setMessages([]); fetchMessages(); }, [conversation.id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length, typingUser]);

  useEffect(() => {
    if (!socket) return;
    const onMsg = (msg) => {
      if (msg.conversation_id === conversation.id) setMessages(prev => [...prev, msg]);
    };
    const onTyping = ({ userId, username, isTyping }) => {
      if (userId !== user.id) setTypingUser(isTyping ? username : null);
    };
    socket.on('new_message', onMsg);
    socket.on('typing', onTyping);
    return () => { socket.off('new_message', onMsg); socket.off('typing', onTyping); };
  }, [socket, conversation.id, user.id]);

  const sendMessage = () => {
    const content = text.trim();
    if (!content || !socket) return;
    socket.emit('send_message', { conversation_id: conversation.id, content });
    setText('');
    socket.emit('typing', { conversation_id: conversation.id, isTyping: false });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!socket) return;
    socket.emit('typing', { conversation_id: conversation.id, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing', { conversation_id: conversation.id, isTyping: false });
    }, 1500);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const msg = await api.upload(`/conversations/${conversation.id}/images`, fd);
      setMessages(prev => [...prev, { ...msg, conversation_id: conversation.id }]);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const headerStatus = isGroup
    ? null
    : typingUser
      ? <span style={{ color: 'var(--accent)' }}>{typingUser} is typing…</span>
      : isOtherOnline
        ? <span style={{ color: 'var(--accent)' }}>● Online</span>
        : <span>Offline</span>;

  return (
    <div className="flex flex-1 flex-col min-w-0" style={{ background: 'var(--bg-1)' }}>
      {/* Header */}
      <div className="flex items-center gap-3.5 px-6 border-b shrink-0"
        style={{ height: 72, borderColor: 'var(--line)', background: 'var(--bg-0)' }}>
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft size={20} />
          </Button>
        )}
        <div className="flex gap-3 items-center flex-1 min-w-0 cursor-pointer">
          {isGroup ? (
            <div className="relative shrink-0" style={{ width: 42, height: 42 }}>
              <div className="absolute top-0 left-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: '#5b7fa6' }}>GR</div>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ background: '#7a6ba8', boxShadow: '0 0 0 2px var(--bg-0)' }}>
                <Users size={10} />
              </div>
            </div>
          ) : (
            <AvatarImage src={displayAvatar} name={displayName} size={42} online={isOtherOnline} />
          )}
          <div className="min-w-0">
            <div className="font-bold text-base tracking-tight truncate" style={{ color: 'var(--ink-0)' }}>
              {displayName}
            </div>
            <div className="text-xs" style={{ color: 'var(--ink-3)' }}>
              {isGroup
                ? (typingUser ? <span style={{ color: 'var(--accent)' }}>{typingUser} is typing…</span> : null)
                : headerStatus}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon"><Phone size={18} /></Button>
        <Button variant="ghost" size="icon"><Video size={18} /></Button>
        <Button variant="ghost" size="icon"><Search size={18} /></Button>
        <Button variant="ghost" size="icon"><MoreHorizontal size={18} /></Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-2">
        <div className="flex justify-center mb-5">
          <Badge variant="secondary">Today</Badge>
        </div>
        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const next = messages[i + 1];
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isGroup={isGroup}
              grouped={prev?.sender_id === msg.sender_id}
              groupedNext={next?.sender_id === msg.sender_id}
            />
          );
        })}
        {typingUser && (
          <div className="flex gap-2.5 mt-2 items-end">
            <Avatar name={typingUser} size={28} />
            <div className="px-3.5 py-2.5" style={{ background: 'var(--bubble-them)', borderRadius: '4px 16px 16px 16px' }}>
              <div className="typing-dots"><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="px-6 pt-3 pb-5 shrink-0" style={{ background: 'var(--bg-1)' }}>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <div className="flex items-end gap-2 rounded-3xl p-2 border"
          style={{ background: 'var(--bg-0)', borderColor: 'var(--line)', boxShadow: 'var(--shadow-sm)' }}>
          <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} disabled={uploading} title="Send image">
            <Image size={20} style={{ color: 'var(--ink-3)' }} />
          </Button>
          <textarea
            placeholder="Write a message…"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={uploading}
            className="flex-1 resize-none px-1 py-2.5 text-[15px] leading-[1.4] max-h-36 bg-transparent outline-none"
            style={{ color: 'var(--ink-1)', fontFamily: 'var(--font-sans)', minHeight: 24 }}
          />
          {text.trim() ? (
            <Button variant="accent" size="icon" onClick={sendMessage} disabled={uploading}>
              <Send size={18} />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" disabled>
              <Send size={18} style={{ color: 'var(--ink-3)' }} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
