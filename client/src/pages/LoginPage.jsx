import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5 font-extrabold text-[22px] tracking-[-0.03em] text-[var(--ink-0)]">
      <div className="flex items-center gap-[3px]" style={{ height: 22 }}>
        {[40, 70, 100, 60, 30].map((h, i) => (
          <span key={i} className="block w-[3px] rounded-sm" style={{ height: `${h}%`, background: 'var(--accent)' }} />
        ))}
      </div>
      Pulse
    </div>
  );
}

function AuthHero() {
  return (
    <div
      className="flex-1 p-12 relative overflow-hidden flex flex-col justify-between"
      style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
    >
      <div className="relative z-10">
        <span className="inline-flex items-center px-3 py-1 rounded-full border border-current text-[12px] font-semibold uppercase tracking-[0.08em] opacity-70">
          A quieter messenger
        </span>
      </div>
      <div className="relative z-10">
        <div className="text-[58px] font-extrabold leading-[0.95] tracking-[-0.04em]" style={{ textWrap: 'balance' }}>
          Say what you mean.<br />
          <span className="italic font-medium">To who you mean.</span>
        </div>
        <div className="mt-6 text-base max-w-[420px] opacity-75">
          End‑to‑end encrypted messaging, calls, and shared moments — built for small circles, not feeds.
        </div>
      </div>
      {/* Soundwave background decoration */}
      <svg className="absolute top-1/2 opacity-[0.18]" style={{ right: -80, transform: 'translateY(-50%)' }}
        width="460" height="460" viewBox="0 0 460 460">
        {Array.from({ length: 38 }).map((_, i) => (
          <rect key={i} x={i * 12} y={230 - (Math.sin(i * 0.4) * 100 + 90) / 2}
            width="5" rx="3" height={Math.sin(i * 0.4) * 100 + 90} fill="currentColor" />
        ))}
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1" style={{ background: 'var(--bg-0)' }}>
      {/* Form side */}
      <div className="flex flex-col flex-1 min-w-0 px-16 py-12">
        <Wordmark />
        <div className="flex-1 flex flex-col justify-center max-w-[420px]">
          <h1 className="text-[44px] font-extrabold tracking-[-0.03em] leading-[1.05]" style={{ color: 'var(--ink-0)' }}>
            Welcome back.
          </h1>
          <p className="text-[17px] mt-3" style={{ color: 'var(--ink-2)' }}>
            Sign in to pick up your conversations.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[18px] mt-9">
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-1 top-1 h-10 w-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--bg-2)]"
                  style={{ color: 'var(--ink-3)' }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'var(--ink-3)' }}>At least 6 characters</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--ink-0)', cursor: 'pointer' }}>Forgot?</span>
              </div>
            </div>

            {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}

            <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
              {loading ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={16} /></>}
            </Button>
          </form>

          <p className="mt-8 text-sm" style={{ color: 'var(--ink-3)' }}>
            New here?{' '}
            <Link to="/register" className="font-semibold" style={{ color: 'var(--ink-0)' }}>
              Create an account →
            </Link>
          </p>
        </div>
        <div className="text-xs" style={{ color: 'var(--ink-3)' }}>© 2026 Pulse Labs · End‑to‑end encrypted</div>
      </div>

      {/* Hero side */}
      <div className="hidden lg:flex flex-1 min-w-0">
        <AuthHero />
      </div>
    </div>
  );
}
