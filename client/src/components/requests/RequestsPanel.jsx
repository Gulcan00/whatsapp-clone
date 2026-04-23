import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

export default function RequestsPanel({ onStartChat }) {
  const [requests, setRequests] = useState([]);
  const [toast, setToast] = useState('');

  const fetch_ = () => api.get('/friends/requests').then(setRequests).catch(console.error);

  useEffect(() => { fetch_(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  const accept = async (friendshipId, userId) => {
    await api.post(`/friends/accept/${friendshipId}`);
    setRequests(xs => xs.filter(x => x.friendship_id !== friendshipId));
    showToast('Friend request accepted ✓');
    try {
      const { id } = await api.post('/conversations/direct', { user_id: userId });
      onStartChat?.(id);
    } catch {}
  };

  const decline = async (friendshipId) => {
    await api.delete(`/friends/${friendshipId}`);
    setRequests(xs => xs.filter(x => x.friendship_id !== friendshipId));
    showToast('Request declined');
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-1)' }}>
      <div className="max-w-2xl mx-auto px-8 py-12">
        <div className="text-xs font-bold tracking-[0.08em] uppercase" style={{ color: 'var(--ink-3)' }}>
          {requests.length} pending
        </div>
        <h1 className="text-[40px] font-extrabold tracking-[-0.03em] mt-1.5 mb-8" style={{ color: 'var(--ink-0)' }}>
          Requests
        </h1>

        {requests.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-4xl">✨</div>
            <div className="text-lg font-bold mt-3">You're all caught up</div>
            <div className="mt-1.5" style={{ color: 'var(--ink-3)' }}>New requests will show up here.</div>
          </Card>
        )}

        {requests.map(r => (
          <Card key={r.friendship_id} className="p-5 mb-3 flex gap-4 items-start">
            <AvatarImage src={r.avatar_url} name={r.username} size={56} />
            <div className="flex-1">
              <div className="font-bold text-base tracking-tight">
                {r.username}
              </div>
              <div className="text-[13px] mt-0.5" style={{ color: 'var(--ink-3)' }}>
                Wants to connect with you
              </div>
              <div className="flex gap-2 mt-3.5">
                <Button variant="accent" size="sm" onClick={() => accept(r.friendship_id, r.id)}>
                  <Check size={14} /> Accept
                </Button>
                <Button variant="outline" size="sm" onClick={() => decline(r.friendship_id)}>
                  <X size={14} /> Decline
                </Button>
              </div>
            </div>
          </Card>
        ))}

        <div className="mt-10 mb-3 text-xs font-bold tracking-[0.08em] uppercase" style={{ color: 'var(--ink-3)' }}>
          Earlier
        </div>
        {[
          { icon: '🔔', text: 'Your account security was updated' },
          { icon: '⭐', text: 'Starred messages are saved in your profile' },
        ].map((n, i) => (
          <div key={i} className="flex gap-3.5 py-3.5 items-center border-b" style={{ borderColor: 'var(--line)' }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'var(--bg-2)' }}>
              {n.icon}
            </div>
            <div className="flex-1 text-sm">{n.text}</div>
          </div>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-[13px] font-semibold shadow-xl slide-up"
          style={{ background: 'var(--ink-0)', color: 'var(--bg-0)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
