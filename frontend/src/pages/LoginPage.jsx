import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) { toast.success('Welcome back! 💪'); navigate('/dashboard'); }
    else toast.error(result.message);
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[100px]"
          style={{ background: 'radial-gradient(circle, var(--primary), transparent 65%)', transform: 'translate(-50%, -50%)' }} />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-[0.05] blur-[80px]"
          style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full relative z-10"
        style={{ maxWidth: '420px' }}
      >
        {/* Card */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          {/* Logo */}
          <Link to="/" className="flex items-center no-underline" style={{ gap: '0.625rem', marginBottom: '2rem' }}>
            <div className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '36px', height: '36px', borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))'
              }}>
              <Zap size={18} color="#fff" fill="#fff" />
            </div>
            <span className="font-display" style={{ fontWeight: 900, fontSize: '1.25rem', background: 'linear-gradient(135deg, var(--primary-light), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FitMind AI</span>
          </Link>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Welcome back</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Sign in to continue your fitness journey</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 1 }} />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '42px', width: '100%' }}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 1 }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  style={{ paddingLeft: '42px', paddingRight: '44px', width: '100%' }}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                    width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                  }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  Sign In <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '1.75rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ fontWeight: 600, color: 'var(--primary-light)', textDecoration: 'none' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
