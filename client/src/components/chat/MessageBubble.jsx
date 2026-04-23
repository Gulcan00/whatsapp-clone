import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, colorFor } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

function formatTime(unixSec) {
  return new Date(unixSec * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isGroup, grouped, groupedNext }) {
  const { user } = useAuth();
  const mine = message.sender_id === user.id;
  const showAvatar = !mine && !groupedNext;
  const showName = !mine && isGroup && !grouped;

  const bubble = message.type === 'image' ? (
    <div className="p-1 rounded-2xl overflow-hidden max-w-[320px]"
      style={{ background: mine ? 'var(--bubble-me)' : 'var(--bubble-them)' }}>
      <img
        src={message.content}
        alt="Shared"
        className="rounded-xl max-w-full cursor-pointer block"
        style={{ maxHeight: 280 }}
        onClick={() => window.open(message.content, '_blank')}
      />
    </div>
  ) : (
    <div
      className="px-3.5 py-2 max-w-[520px] text-[14.5px] leading-[1.4] inline-block break-words"
      style={{
        background: mine ? 'var(--bubble-me)' : 'var(--bubble-them)',
        color: mine ? 'var(--bubble-me-ink)' : 'var(--bubble-them-ink)',
        borderRadius: 18,
        borderTopRightRadius: mine && grouped ? 6 : 18,
        borderBottomRightRadius: mine && groupedNext ? 6 : 18,
        borderTopLeftRadius: !mine && grouped ? 6 : 18,
        borderBottomLeftRadius: !mine && groupedNext ? 6 : 18,
      }}
    >
      {message.content}
    </div>
  );

  return (
    <div
      className={cn('flex gap-2 items-end', mine ? 'justify-end' : 'justify-start')}
      style={{ marginTop: grouped ? 2 : 10 }}
    >
      {!mine && (
        <div className="shrink-0" style={{ width: 28 }}>
          {showAvatar && (
            <AvatarImage src={message.sender_avatar} name={message.sender_username} size={28} />
          )}
        </div>
      )}

      <div className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
        {showName && (
          <span className="text-[11px] font-bold ml-3 mb-0.5" style={{ color: colorFor(message.sender_username) }}>
            {message.sender_username}
          </span>
        )}
        {bubble}
        {!groupedNext && (
          <div className="flex gap-1 items-center mt-1 px-1.5">
            <span className="text-[11px]" style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
              {formatTime(message.created_at)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
