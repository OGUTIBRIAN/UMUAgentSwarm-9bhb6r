import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CAMPUSES } from '@/constants/umuData';
import { toast } from 'sonner';
import { Mail, Lock, ShieldCheck, Building2, ChevronRight, Loader2, GraduationCap } from 'lucide-react';

type Step = 'email' | 'otp' | 'password';

const Login = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [campusId, setCampusId] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Verification code sent to ${email}`);
    setStep('otp');
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the verification code');
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    // Check if user has a profile with campus
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('campus_id, role')
      .eq('id', data.user!.id)
      .single();
    if (!profile?.campus_id) {
      setIsNewUser(true);
      setStep('password');
    } else {
      // Already set up — just signed in
      toast.success('Welcome back!');
    }
  };

  // ── Step 3: Set password + campus (new users) ───────────────────────────────
  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!campusId) return toast.error('Please select your campus');
    setLoading(true);
    // Update password
    const { error: pwErr } = await supabase.auth.updateUser({ password });
    if (pwErr) { setLoading(false); toast.error(pwErr.message); return; }
    // Update profile with campus
    const { error: profErr } = await supabase
      .from('user_profiles')
      .update({ campus_id: campusId, role: 'staff' })
      .eq('email', email);
    setLoading(false);
    if (profErr) { toast.error(profErr.message); return; }
    toast.success('Account set up successfully! Welcome to UMU Agent Swarm.');
  };

  // ── Login with password ────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Enter your email and password');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Welcome back!');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.3)] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[hsl(var(--primary))]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">UMU Agent Swarm</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Staff Portal — Uganda Martyrs University</p>
        </div>

        {/* Card */}
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-xl">
          {/* Mode tabs */}
          {step === 'email' && (
            <div className="flex border-b border-[hsl(var(--border))]">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${mode === 'login' ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${mode === 'register' ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
              >
                Register
              </button>
            </div>
          )}

          <div className="p-6 space-y-5">
            {/* Step indicator */}
            {step !== 'email' && (
              <div className="flex items-center gap-2 mb-1">
                {(['email', 'otp', 'password'] as Step[]).map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      step === s ? 'bg-[hsl(var(--primary))] text-white' :
                      ['email', 'otp', 'password'].indexOf(step) > i ? 'bg-[hsl(142,72%,45%)] text-white' :
                      'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'
                    }`}>
                      {i + 1}
                    </div>
                    {i < 2 && <div className={`w-8 h-0.5 ${['email', 'otp', 'password'].indexOf(step) > i ? 'bg-[hsl(142,72%,45%)]' : 'bg-[hsl(var(--border))]'}`} />}
                  </div>
                ))}
              </div>
            )}

            {/* STEP 1 — Email */}
            {step === 'email' && mode === 'register' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5 block">Staff Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@umu.ac.ug"
                      className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary)/0.6)] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5 block">Your Campus</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    <select
                      value={campusId} onChange={(e) => setCampusId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-sm text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--primary)/0.6)] cursor-pointer appearance-none"
                    >
                      <option value="">Select your campus…</option>
                      {CAMPUSES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit" disabled={loading || !email || !campusId}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Send Verification Code</span><ChevronRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}

            {/* STEP 1 — Login with password */}
            {step === 'email' && mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5 block">Staff Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@umu.ac.ug"
                      className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary)/0.6)] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    <input
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary)/0.6)] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)]"
                    />
                  </div>
                </div>
                <button
                  type="submit" disabled={loading || !email || !password}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ChevronRight className="w-4 h-4" /></>}
                </button>
                <button
                  type="button" onClick={() => { setMode('register'); setStep('email'); }}
                  className="w-full text-center text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                  Don't have an account? Register here
                </button>
              </form>
            )}

            {/* STEP 2 — OTP */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary)/0.15)] border border-[hsl(var(--primary)/0.3)] flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 text-[hsl(var(--primary))]" />
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Enter the 4-digit code sent to<br />
                    <span className="font-semibold text-[hsl(var(--foreground))] mono">{email}</span>
                  </p>
                </div>
                <input
                  type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="0 0 0 0"
                  maxLength={4}
                  className="w-full text-center text-2xl font-bold tracking-[0.5em] py-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--primary)/0.6)] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)]"
                />
                <button
                  type="submit" disabled={loading || otp.length < 4}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code'}
                </button>
                <button type="button" onClick={() => setStep('email')} className="w-full text-center text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  ← Back
                </button>
              </form>
            )}

            {/* STEP 3 — Set password & campus */}
            {step === 'password' && isNewUser && (
              <form onSubmit={handleSetup} className="space-y-4">
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
                    Email verified! Set up your account to continue.
                  </p>
                  <label className="text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5 block">Your Campus</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    <select
                      value={campusId} onChange={(e) => setCampusId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-sm text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--primary)/0.6)] cursor-pointer appearance-none"
                    >
                      <option value="">Select your campus…</option>
                      {CAMPUSES.map((c) => (
                        <option key={c.id} value={c.id}>{c.agentName} — {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--foreground))] mb-1.5 block">Set Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    <input
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary)/0.6)] focus:ring-1 focus:ring-[hsl(var(--primary)/0.3)]"
                    />
                  </div>
                </div>
                <button
                  type="submit" disabled={loading || !password || !campusId}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Setup & Enter Dashboard'}
                </button>
              </form>
            )}
          </div>

          {/* Footer note */}
          <div className="px-6 pb-4 text-center">
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
              Uganda Martyrs University — AI Agent Swarm v1.0<br />
              For IT support: <span className="mono">registrar@umu.ac.ug</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
