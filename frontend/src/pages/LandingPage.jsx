import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Brain,
  Check,
  ChevronRight,
  Dumbbell,
  Github,
  LineChart,
  Linkedin,
  PlayCircle,
  Salad,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from 'lucide-react';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#about', label: 'About' },
];

const features = [
  {
    icon: Brain,
    title: 'AI Fitness Plans',
    desc: 'Generate personalized weekly plans based on your body metrics, goals, and lifestyle.',
  },
  {
    icon: Dumbbell,
    title: 'Workout Tracking',
    desc: 'Track sets, reps, and intensity with clean analytics built for progression.',
  },
  {
    icon: Salad,
    title: 'Nutrition Logging',
    desc: 'Log meals, macros, and calories with smart recommendations from your AI coach.',
  },
  {
    icon: LineChart,
    title: 'Progress Analytics',
    desc: 'Visualize trends in weight, performance, and body metrics to stay on target.',
  },
  {
    icon: Target,
    title: 'Goal Engine',
    desc: 'Stay focused with milestones, adaptive targets, and weekly success insights.',
  },
  {
    icon: Shield,
    title: 'Streaks & Motivation',
    desc: 'Build consistency with streaks, XP, and achievement badges that reward momentum.',
  },
];

const stats = [
  { value: '50K+', label: 'Users Worldwide' },
  { value: '95%', label: 'Success Rate' },
  { value: '10M+', label: 'Workouts Logged' },
  { value: '4.9/5', label: 'Average Rating' },
];

const testimonials = [
  {
    name: 'Aarav Mehta',
    role: 'Software Engineer',
    text: 'FitMind AI gave me structure. I lost 9kg in 4 months while preserving muscle.',
  },
  {
    name: 'Nisha Rao',
    role: 'Product Manager',
    text: 'The AI coach feels like a personal trainer in my pocket. Super practical daily advice.',
  },
  {
    name: 'Rahul Verma',
    role: 'College Athlete',
    text: 'The workout and macro tracking combo is exactly what I needed for consistency.',
  },
];

const pricing = [
  {
    title: 'Starter',
    price: 'Free',
    subtitle: 'Perfect to start your transformation',
    features: ['AI chat assistant', 'Workout tracker', 'Basic nutrition logging'],
    cta: 'Start Free',
    primary: false,
  },
  {
    title: 'Pro',
    price: '$12/mo',
    subtitle: 'For serious, measurable progress',
    features: ['Advanced AI plans', 'Deep analytics', 'Priority AI responses', 'Streak intelligence'],
    cta: 'Upgrade to Pro',
    primary: true,
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-grid" style={{ background: 'var(--bg-primary)' }}>
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(8, 12, 24, 0.88)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(99,102,241,0.15)',
        }}
      >
        <div className="page-container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 no-underline flex-shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span className="font-display font-black text-lg gradient-text">FitMind AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseOver={(event) => {
                  event.currentTarget.style.color = 'var(--primary-light)';
                }}
                onMouseOut={(event) => {
                  event.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm px-4 py-2 hidden sm:inline-flex">Sign In</Link>
            <Link to="/signup" className="btn-primary text-sm px-5 py-2">
              Get Started <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden" style={{ paddingTop: '8.5rem', paddingBottom: '6rem' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none select-none">
          <div className="w-[860px] h-[520px] rounded-full opacity-[0.12] blur-[120px]" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        </div>
        <div className="absolute top-32 right-[10%] w-72 h-72 rounded-full opacity-[0.09] blur-[90px] pointer-events-none" style={{ background: 'radial-gradient(circle, #22d3ee, transparent 70%)' }} />

        <div className="page-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="badge badge-primary text-xs mb-6 inline-flex px-3.5 py-1.5 gap-1.5"
              >
                <Sparkles size={13} /> AI-Powered Fitness OS
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.65 }}
                className="font-display text-5xl md:text-6xl font-black leading-[1.05] tracking-tight"
              >
                Build the
                <span className="gradient-text"> strongest version </span>
                of yourself, one guided day at a time.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.55 }}
                className="text-lg mt-6 max-w-xl leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                FitMind AI combines coaching, tracking, and analytics into one premium experience so you can stay consistent and hit goals faster.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.55 }}
                className="flex flex-col sm:flex-row gap-4 mt-9"
              >
                <Link to="/signup" className="btn-primary text-base px-8 py-3.5">
                  Start Your Fitness Journey 🚀 <ArrowRight size={17} />
                </Link>
                <a href="#preview" className="btn-secondary text-base px-7 py-3.5 inline-flex items-center justify-center gap-2">
                  <PlayCircle size={17} /> Watch Demo
                </a>
              </motion.div>

              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((item) => (
                  <div key={item.label} className="glass-card p-3 text-center">
                    <p className="font-display font-black text-2xl gradient-text">{item.value}</p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              id="preview"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.65 }}
              className="relative"
            >
              <div className="glass-card p-5 md:p-6" style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>FitMind Dashboard</p>
                  <span className="badge badge-success text-[10px]">Live Preview</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-card p-4">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Weekly Adherence</p>
                    <p className="font-display text-3xl mt-1 gradient-text">92%</p>
                    <div className="progress-bar h-2 mt-3"><div className="progress-fill" style={{ width: '92%' }} /></div>
                  </div>
                  <div className="glass-card p-4">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories Today</p>
                    <p className="font-display text-3xl mt-1 gradient-text">1,940</p>
                    <p className="text-xs mt-2" style={{ color: 'var(--success)' }}>On track</p>
                  </div>
                  <div className="glass-card p-4 sm:col-span-2">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI Coach Insight</p>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                      “Increase protein by 20g today and add one low-intensity recovery walk for faster fat-loss progress.”
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24">
        <div className="page-container">
          <div className="section-header">
            <span className="badge badge-accent mb-4 inline-flex">Features</span>
            <h2>Everything You Need To <span className="gradient-text">Win Consistently</span></h2>
            <p>Built like a modern SaaS product, designed for outcomes not noise.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="glass-card-hover p-6"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.16)', border: '1px solid rgba(99,102,241,0.28)' }}>
                  <Icon size={19} style={{ color: 'var(--primary-light)' }} />
                </div>
                <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24" style={{ background: 'rgba(99,102,241,0.04)' }}>
        <div className="page-container">
          <div className="section-header">
            <span className="badge badge-primary mb-4 inline-flex">How It Works</span>
            <h2>From Sign Up To Results In <span className="gradient-text">Three Steps</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Set Your Baseline', desc: 'Tell us your goals, activity level, and current stats.' },
              { step: '02', title: 'Receive AI Strategy', desc: 'Get personalized training and nutrition instructions instantly.' },
              { step: '03', title: 'Track & Optimize', desc: 'Log progress daily and refine your plan using smart insights.' },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="glass-card p-6 text-center"
              >
                <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
                  <span className="font-display font-black gradient-text">{item.step}</span>
                </div>
                <h3 className="mt-4 font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="page-container">
          <div className="section-header">
            <span className="badge badge-accent mb-4 inline-flex">See FitMind AI in Action</span>
            <h2>Product Preview</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {["AI Coach Chat", "Workout & Nutrition", "Progress Analytics"].map((label, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="glass-card p-5"
              >
                <div className="h-40 rounded-xl mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(34,211,238,0.08))', border: '1px solid var(--border)' }}>
                  <div className="text-center">
                    <Bot size={24} style={{ color: 'var(--primary-light)', margin: '0 auto 0.4rem' }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Elegant glassmorphism panels with focused insights and actionable recommendations.</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24" style={{ background: 'rgba(34,211,238,0.03)' }}>
        <div className="page-container">
          <div className="section-header">
            <span className="badge badge-primary mb-4 inline-flex"><Users size={12} /> Social Proof</span>
            <h2>Trusted By High-Performing Users</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  "{item.text}"
                </p>
                <div className="mt-4">
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24">
        <div className="page-container">
          <div className="section-header">
            <span className="badge badge-accent mb-4 inline-flex">Pricing</span>
            <h2>Simple Pricing, <span className="gradient-text">Powerful Value</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {pricing.map((plan) => (
              <div
                key={plan.title}
                className="glass-card p-7"
                style={plan.primary ? { border: '1px solid rgba(99,102,241,0.45)', boxShadow: '0 0 30px rgba(99,102,241,0.18)' } : undefined}
              >
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{plan.title}</p>
                <p className="font-display text-4xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>{plan.price}</p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{plan.subtitle}</p>

                <div className="mt-5 space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Check size={14} style={{ color: 'var(--success)' }} /> {feature}
                    </div>
                  ))}
                </div>

                <Link to="/signup" className={plan.primary ? 'btn-primary mt-6 w-full justify-center' : 'btn-secondary mt-6 w-full justify-center'}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20">
        <div className="page-container">
          <div className="glass-card p-8 md:p-10 text-center max-w-5xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-black">Built For Ambitious People Who Want Real Progress</h2>
            <p className="mt-4 text-base max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              FitMind AI combines world-class design with practical coaching systems so anyone can train smarter, eat better, and stay consistent.
            </p>
            <Link to="/signup" className="btn-primary mt-8 inline-flex">
              Start Your Fitness Journey 🚀 <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border-subtle)' }} className="py-10">
        <div className="page-container grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                <Zap size={13} color="#fff" fill="#fff" />
              </div>
              <span className="font-display font-black text-lg gradient-text">FitMind AI</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your premium AI-powered fitness operating system.</p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <a href="#about" style={{ color: 'var(--text-secondary)' }}>About</a>
            <a href="#" style={{ color: 'var(--text-secondary)' }}>Contact</a>
            <a href="#" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--text-secondary)' }}>Terms</a>
          </div>

          <div className="flex md:justify-end items-center gap-3">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="btn-icon"><Linkedin size={16} /></a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="btn-icon"><Github size={16} /></a>
          </div>
        </div>

        <div className="page-container mt-8 text-xs" style={{ color: 'var(--text-muted)' }}>
          © 2026 FitMind AI. Designed for high performers.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
