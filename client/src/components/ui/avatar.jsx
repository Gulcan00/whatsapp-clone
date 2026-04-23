import * as React from 'react';
import { cn } from '@/lib/utils';

const PALETTE = [
  '#5b7fa6','#7a6ba8','#a66b5b','#5ba67a','#a6a05b',
  '#6ba6a0','#a65b7a','#6b85a6','#8ca65b','#a6745b',
];

function colorFor(name = '') {
  const idx = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % PALETTE.length;
  return PALETTE[idx];
}

function initialsFor(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const Avatar = React.forwardRef(({ name = '', size = 40, online = false, className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0', className)}
    style={{ width: size, height: size, fontSize: size * 0.38, background: colorFor(name), ...style }}
    title={name}
    {...props}
  >
    <span className="rounded-full overflow-hidden flex items-center justify-center w-full h-full">
      {initialsFor(name)}
    </span>
    {online && (
      <span
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '28%', height: '28%',
          minWidth: 10, minHeight: 10,
          background: 'var(--accent)',
          bottom: 0, right: 0,
          boxShadow: '0 0 0 2px var(--bg-0)',
          transform: 'translate(15%, 15%)',
        }}
      />
    )}
  </div>
));
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef(({ src, name = '', size = 40, online = false, className, ...props }, ref) => {
  const [err, setErr] = React.useState(false);
  if (!src || err) return <Avatar name={name} size={size} online={online} className={className} />;
  return (
    <div className={cn('relative inline-flex shrink-0', className)} style={{ width: size, height: size }}>
      <img
        ref={ref}
        src={src}
        onError={() => setErr(true)}
        className="rounded-full object-cover w-full h-full"
        {...props}
      />
      {online && (
        <span
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '28%', height: '28%',
            minWidth: 10, minHeight: 10,
            background: 'var(--accent)',
            bottom: 0, right: 0,
            boxShadow: '0 0 0 2px var(--bg-0)',
            transform: 'translate(15%, 15%)',
          }}
        />
      )}
    </div>
  );
});
AvatarImage.displayName = 'AvatarImage';

export { Avatar, AvatarImage, colorFor, initialsFor };
