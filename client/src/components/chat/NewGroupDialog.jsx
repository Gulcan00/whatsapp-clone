import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Check } from 'lucide-react';

export default function NewGroupDialog({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      api.get('/friends').then(setFriends).catch(console.error);
      setName('');
      setSelected(new Set());
    }
  }, [open]);

  const toggle = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const create = async () => {
    if (!name.trim() || selected.size === 0) return;
    setLoading(true);
    try {
      const { id } = await api.post('/conversations/group', { name: name.trim(), member_ids: [...selected] });
      onCreated(id);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Group Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 px-6">
          <div className="space-y-2">
            <Label>Group name</Label>
            <Input placeholder="Weekend plans, Studio crew…" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Add members</Label>
            <div className="max-h-52 overflow-y-auto space-y-1 rounded-xl border p-2"
              style={{ borderColor: 'var(--line)' }}>
              {friends.length === 0 && (
                <p className="py-4 text-center text-sm" style={{ color: 'var(--ink-3)' }}>No friends yet</p>
              )}
              {friends.map(f => (
                <button
                  key={f.id}
                  onClick={() => toggle(f.id)}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-[var(--bg-1)]"
                >
                  <AvatarImage src={f.avatar_url} name={f.username} size={32} />
                  <span className="flex-1 text-sm font-medium" style={{ color: 'var(--ink-0)' }}>{f.username}</span>
                  {selected.has(f.id) && <Check size={16} style={{ color: 'var(--accent)' }} />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="accent" onClick={create} disabled={!name.trim() || selected.size === 0 || loading}>
            Create ({selected.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
