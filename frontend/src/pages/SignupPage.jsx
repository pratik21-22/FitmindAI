import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

const goals = [
  { value: 'lose_fat', label: '🔥 Lose Fat', desc: 'Burn fat, get lean' },
  { value: 'build_muscle', label: '💪 Build Muscle', desc: 'Gain strength & size' },
  { value: 'maintain', label: '⚖️ Maintain', desc: 'Stay at current weight' },
  { value: 'improve_endurance', label: '🏃 Endurance', desc: 'Run faster & longer' },
];

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    weight: '', height: '', age: '',
    gender: 'male', goal: 'lose_fat', activityLevel: 'moderate',
  });
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleNext = () => {
    if (!form.name.trim()) { toast.error('Please enter your full name'); return; }
    if (!form.email.trim()) { toast.error('Please enter your email'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signup(form);
    if (result.success) { toast.success('Welcome to FitMind AI! 🎉'); navigate('/dashboard'); }
    else toast.error(result.message);
  };

  const iconStyle = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 1 };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-14"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[700px] h-[700px] rounded-full opacity-[0.06] blur-[100px]"
          style={{ background: 'radial-gradient(circle, var(--accent), transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        <div className="absolute w-64 h-64 rounded-full opacity-[0.05] blur-[80px]"
          style={{ background: 'radial-gradient(circle, var(--primary), transparent 70%)', top: '25%', left: '25%' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full relative z-10"
        style={{ maxWidth: '480px' }}
      >
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          {/* Logo */}
          <Link to="/" className="flex items-center no-underline" style={{ gap: '0.625rem', marginBottom: '1.75rem' }}>
            <div className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '36px', height: '36px', borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))'
              }}>
              <Zap size={18} color="#fff" fill="#fff" />
            </div>
            <span className="font-display" style={{ fontWeight: 900, fontSize: '1.25rem', background: 'linear-gradient(135deg, var(--primary-light), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FitMind AI</span>
          </Link>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Create account</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>Build your personalized AI fitness profile</p>

          {/* Step indicator */}
          <div className="flex items-center" style={{ gap: '0.75rem', marginBottom: '2rem' }}>
            {[1, 2].map(s => (
              <div key={s} className="flex items-center" style={{ gap: '0.5rem' }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%', fontSize: '0.75rem', fontWeight: 700,
                    transition: 'all 0.3s',
                    background: s <= step ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'rgba(255,255,255,0.06)',
                    color: s <= step ? '#fff' : 'var(--text-muted)',
                    border: s <= step ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {s < step ? <Check size={13} /> : s}
                </div>
                {s < 2 && (
                  <div style={{ height: '1px', width: '48px', transition: 'all 0.5s', background: step > s ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
            ))}
            <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem', color: 'var(--text-muted)' }}>
              Step {step} of 2 — {step === 1 ? 'Basic Info' : 'Your Goals'}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} style={iconStyle} />
                      <input type="text" className="input-field" style={{ paddingLeft: '42px', width: '100%' }}
                        placeholder="Alex Johnson" value={form.name} onChange={e => update('name', e.target.value)} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} style={iconStyle} />
                      <input type="email" className="input-field" style={{ paddingLeft: '42px', width: '100%' }}
                        placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={iconStyle} />
                      <input type={showPass ? 'text' : 'password'} className="input-field" style={{ paddingLeft: '42px', paddingRight: '44px', width: '100%' }}
                        placeholder="Min. 6 characters" value={form.password} onChange={e => update('password', e.target.value)} />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button type="button" onClick={handleNext} className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>Continue <ArrowRight size={15} /></span>
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Physical stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {[
                      { label: 'Weight (kg)', field: 'weight', placeholder: '70' },
                      { label: 'Height (cm)', field: 'height', placeholder: '175' },
                      { label: 'Age', field: 'age', placeholder: '25' },
                    ].map(({ label, field, placeholder }) => (
                      <div key={field}>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{label}</label>
                        <input type="number" className="input-field" style={{ textAlign: 'center', width: '100%' }} placeholder={placeholder}
                          value={form[field]} onChange={e => update(field, e.target.value)} />
                      </div>
                    ))}
                  </div>

                  {/* Gender */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Gender</label>
                    <select className="input-field" style={{ width: '100%' }} value={form.gender} onChange={e => update('gender', e.target.value)}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other / Prefer not to say</option>
                    </select>
                  </div>

                  {/* Goals */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Primary Fitness Goal</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {goals.map(g => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => update('goal', g.value)}
                          style={{
                            padding: '0.75rem', borderRadius: '12px', textAlign: 'left', transition: 'all 0.2s', cursor: 'pointer',
                            background: form.goal === g.value ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${form.goal === g.value ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}`,
                            color: form.goal === g.value ? 'var(--primary-light)' : 'var(--text-secondary)',
                          }}
                        >
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{g.label}</div>
                          <div style={{ fontSize: '0.6875rem', marginTop: '0.125rem', opacity: 0.7 }}>{g.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity Level */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Activity Level</label>
                    <select className="input-field" style={{ width: '100%' }} value={form.activityLevel} onChange={e => update('activityLevel', e.target.value)}>
                      <option value="sedentary">Sedentary — mostly sitting</option>
                      <option value="light">Light — 1–3 days/week</option>
                      <option value="moderate">Moderate — 3–5 days/week</option>
                      <option value="active">Active — 6–7 days/week</option>
                      <option value="very_active">Very Active — athlete/trainer</option>
                    </select>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.75rem', fontSize: '0.875rem' }} onClick={() => setStep(1)}>
                      ← Back
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '0.75rem', fontSize: '0.875rem', opacity: loading ? 0.6 : 1 }}>
                      {loading ? 'Creating…' : 'Create Account 🚀'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '1.75rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary-light)', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
