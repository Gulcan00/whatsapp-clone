import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

function timeAgo(unixSec) {
  if (!unixSec) return '';
  const diff = Date.now() / 1000 - unixSec;
  if (diff < 3600)   return `${Math.floor(diff / 60)}m`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 604800)}w`;
}

export default function ArchivePanel() {
  const [convos, setConvos] = useState([]);

  useEffect(() => {
    api.get('/conversations?archived=true').then(setConvos).catch(console.error);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-1)' }}>
      <div className="max-w-2xl mx-auto px-8 py-12">
        <h1 className="text-[40px] font-extrabold tracking-[-0.03em] mb-6" style={{ color: 'var(--ink-0)' }}>Archive</h1>

        {convos.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-4xl">📦</div>
            <div className="text-lg font-bold mt-3">Nothing archived</div>
            <div className="mt-1.5" style={{ color: 'var(--ink-3)' }}>Archived conversations appear here.</div>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            {convos.map((c, i) => {
              const name = c.type === 'group' ? c.name : c.other_user?.username || 'Unknown';
              const avatar = c.type === 'direct' ? c.other_user?.avatar_url : null;
              return (
                <div key={c.id} className="flex gap-3.5 px-5 py-4 items-center border-b last:border-b-0"
                  style={{ borderColor: 'var(--line)' }}>
                  <AvatarImage src={avatar} name={name} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px]" style={{ color: 'var(--ink-0)' }}>{name}</div>
                    <div className="text-[13px] truncate" style={{ color: 'var(--ink-3)' }}>
                      {c.last_message_type === 'image' ? '📷 Image' : c.last_message || 'No messages'}
                    </div>
                  </div>
                  <div className="text-xs font-mono shrink-0" style={{ color: 'var(--ink-3)' }}>
                    {timeAgo(c.last_message_at || c.created_at)}
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}
