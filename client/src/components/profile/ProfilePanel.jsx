import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Edit2, Check, X, LogOut, ChevronRight, Moon, Sun } from 'lucide-react';

function Row({ label, value, trailing }) {
  return (
    <div className="flex items-center px-5 py-3.5 border-b last:border-b-0 gap-3"
      style={{ borderColor: 'var(--line)' }}>
      <div className="text-sm flex-1" style={{ color: 'var(--ink-2)' }}>{label}</div>
      <div className="text-sm font-medium">{value}</div>
      {trailing || <ChevronRight size={16} style={{ color: 'var(--ink-3)' }} />}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="mt-7">
      <div className="text-xs font-bold tracking-[0.08em] uppercase px-1 pb-2" style={{ color: 'var(--ink-3)' }}>{title}</div>
      <Card className="overflow-hidden">{children}</Card>
    </div>
  );
}

export default function ProfilePanel() {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [editing, setEditing] = useState(null);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const saveField = async (field) => {
    setSaving(true); setError('');
    try {
      const updated = await api.patch('/users/me', field === 'username' ? { username } : { bio });
      updateUser(updated);
      setEditing(null);
    } catch (err) {
      setError(err.message);
    } finally { setSaving(false); }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { avatar_url } = await api.upload('/users/me/avatar', fd);
      updateUser({ avatar_url });
    } catch (err) { alert(err.message); }
    e.target.value = '';
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-1)' }}>
      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-xs font-bold tracking-[0.08em] uppercase" style={{ color: 'var(--ink-3)' }}>Account</div>
            <h1 className="text-4xl font-extrabold tracking-[-0.03em] mt-1" style={{ color: 'var(--ink-0)' }}>Your profile</h1>
          </div>
          {!editing
            ? <Button variant="outline" onClick={() => { setEditing('profile'); setUsername(user.username); setBio(user.bio || ''); }}>
                <Edit2 size={16} /> Edit
              </Button>
            : <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                <Button variant="accent" onClick={() => saveField('username')} disabled={saving}>Save changes</Button>
              </div>
          }
        </div>

        {error && <p className="text-sm mb-4" style={{ color: 'var(--danger)' }}>{error}</p>}

        {/* Avatar + name card */}
        <Card className="p-8">
          <div className="flex gap-7 items-center">
            <div className="relative">
              <AvatarImage src={user.avatar_url} name={user.username} size={128} />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 h-11 w-11 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'var(--ink-0)', color: 'var(--bg-0)', boxShadow: '0 0 0 4px var(--bg-0)' }}
              >
                <Camera size={18} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
            </div>

            <div className="flex-1 min-w-0">
              {editing ? (
                <>
                  <Input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="text-2xl font-extrabold h-auto py-2 mb-2"
                    placeholder="Username"
                  />
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Short bio…"
                    className="w-full p-3.5 rounded-xl text-sm border border-transparent outline-none resize-none transition-all"
                    style={{ background: 'var(--bg-1)', color: 'var(--ink-1)', height: 72 }}
                    onBlur={() => saveField('bio')}
                  />
                </>
              ) : (
                <>
                  <div className="text-3xl font-extrabold tracking-[-0.03em]" style={{ color: 'var(--ink-0)' }}>
                    {user.username}
                  </div>
                  <div className="mt-0.5" style={{ color: 'var(--ink-3)' }}>{user.email}</div>
                  <Badge variant="accent" className="mt-3 normal-case tracking-normal text-xs">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                    Available
                  </Badge>
                  {user.bio && <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-2)' }}>{user.bio}</p>}
                </>
              )}
            </div>
          </div>
        </Card>

        <SectionCard title="Privacy & safety">
          <Row label="Last seen" value="Everyone" />
          <Row label="Read receipts" value="On" />
          <Row label="Two‑step verification" value="Enabled" trailing={<Badge variant="accent">Recommended</Badge>} />
        </SectionCard>

        <SectionCard title="App">
          <div className="flex items-center px-5 py-3.5 border-b gap-3" style={{ borderColor: 'var(--line)' }}>
            <div className="text-sm flex-1" style={{ color: 'var(--ink-2)' }}>Theme</div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors hover:bg-[var(--bg-2)]"
              style={{ color: 'var(--ink-1)' }}
            >
              {theme === 'light' ? <><Moon size={16} /> Dark</> : <><Sun size={16} /> Light</>}
            </button>
          </div>
          <Row label="Language" value="English (US)" />
        </SectionCard>

        <div className="p-5 text-center mt-4">
          <Button
            variant="outline"
            className="w-full"
            style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
            onClick={logout}
          >
            <LogOut size={16} /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
