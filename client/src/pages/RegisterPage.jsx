import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft, Camera } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5 font-extrabold text-[22px] tracking-[-0.03em]" style={{ color: 'var(--ink-0)' }}>
      <div className="flex items-center gap-[3px]" style={{ height: 22 }}>
        {[40, 70, 100, 60, 30].map((h, i) => (
          <span key={i} className="block w-[3px] rounded-sm" style={{ height: `${h}%`, background: 'var(--accent)' }} />
        ))}
      </div>
      Pulse
    </div>
  );
}

function PasswordMeter({ value }) {
  let score = 0;
  if (value.length >= 6)         score++;
  if (/[A-Z]/.test(value))       score++;
  if (/\d/.test(value))          score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['var(--ink-4)', 'var(--danger)', 'var(--warn)', 'var(--info)', 'var(--accent)'];
  return (
    <div className="flex items-center gap-2.5 mt-1">
      <div className="flex gap-0.5 flex-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex-1 h-1 rounded transition-all"
            style={{ background: i < score ? colors[score] : 'var(--bg-2)' }} />
        ))}
      </div>
      <span className="text-[11px] font-semibold w-14 text-right" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  );
}

const STEPS = [
  { title: 'Who are you?',    sub: 'This is how friends find you.' },
  { title: 'Secure it.',      sub: 'An email for recovery + a password.' },
  { title: 'One last thing.', sub: 'Add a photo and bio — skip if you want.' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ username: '', name: '', email: '', password: '', bio: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setData(d => ({ ...d, [k]: e.target.value }));

  const canNext = () => {
    if (step === 0) return data.name.trim().length >= 2 && data.username.length >= 3;
    if (step === 1) return data.email.includes('@') && data.password.length >= 6;
    return true;
  };

  const next = async () => {
    if (step < STEPS.length - 1) { setStep(s => s + 1); return; }
    setError('');
    setLoading(true);
    try {
      await register(data.username, data.email, data.password, data.bio);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col px-16 py-12" style={{ background: 'var(--bg-0)' }}>
      <div className="flex items-center justify-between">
        <Wordmark />
        <Link to="/login">
          <Button variant="ghost" size="sm">Already have an account?</Button>
        </Link>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mt-10 max-w-[480px]">
        {STEPS.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded transition-colors"
            style={{ background: i <= step ? 'var(--accent)' : 'var(--bg-2)' }} />
        ))}
      </div>
      <div className="text-xs font-semibold tracking-[0.06em] mt-3" style={{ color: 'var(--ink-3)' }}>
        STEP {step + 1} OF {STEPS.length}
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-[480px]">
        <h1 className="text-[40px] font-extrabold tracking-[-0.03em] leading-[1.05]" style={{ color: 'var(--ink-0)' }}>
          {STEPS[step].title}
        </h1>
        <p className="text-[17px] mt-3" style={{ color: 'var(--ink-2)' }}>{STEPS[step].sub}</p>

        <div className="mt-8 flex flex-col gap-[18px]">
          {step === 0 && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label>Display name</Label>
                <Input placeholder="Ava Chen" value={data.name} onChange={set('name')} autoFocus />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Username</Label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-sm" style={{ color: 'var(--ink-3)' }}>@</span>
                  <Input
                    placeholder="ava"
                    className="pl-8"
                    value={data.username}
                    onChange={e => setData(d => ({ ...d, username: e.target.value.replace(/[^a-z0-9_.]/gi, '').toLowerCase() }))}
                  />
                </div>
                {data.username.length >= 3 && (
                  <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>✓ @{data.username} looks good</span>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" value={data.email} onChange={set('email')} autoFocus />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Password</Label>
                <Input type="password" placeholder="At least 6 characters" value={data.password} onChange={set('password')} />
                <PasswordMeter value={data.password} />
              </div>
              {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-5">
                <div className="relative">
                  <Avatar name={data.name || 'You'} size={96} />
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--ink-0)', color: 'var(--bg-0)', boxShadow: '0 0 0 3px var(--bg-0)' }}
                  >
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <div className="font-bold text-lg">{data.name || 'Your name'}</div>
                  <div className="text-sm" style={{ color: 'var(--ink-3)' }}>@{data.username || 'yourhandle'}</div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Short bio (optional)</Label>
                <textarea
                  className="w-full p-3.5 rounded-xl text-[15px] border border-transparent transition-all outline-none resize-none"
                  style={{ background: 'var(--bg-1)', color: 'var(--ink-1)', height: 80 }}
                  placeholder="Designer. Likes rain."
                  value={data.bio}
                  onChange={set('bio')}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" size="lg" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft size={16} /> Back
            </Button>
          )}
          <Button size="lg" onClick={next} disabled={!canNext() || loading} className="flex-1">
            {loading ? 'Creating account…' : step === STEPS.length - 1 ? 'Enter Pulse' : 'Continue'}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      <div className="text-xs" style={{ color: 'var(--ink-3)' }}>By continuing you agree to our Terms and Privacy.</div>
    </div>
  );
}
