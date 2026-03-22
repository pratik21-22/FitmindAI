import { useEffect, useMemo, useState } from 'react';
import { Bell, X, CheckCheck, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/workouts': 'Workout Tracker',
  '/diet': 'Diet Tracker',
  '/ai-chat': 'AI Assistant',
  '/plans': 'Plan Generator',
  '/progress': 'Progress Tracker',
  '/profile': 'Profile',
};

const buildNotifications = (user) => {
  const notes = [];
  const hour = new Date().getHours();

  if (user?.streak > 0)
    notes.push({ id: 'streak', icon: '🔥', title: `${user.streak}-day streak active!`, body: "Keep it up — log today's activity to keep your streak alive.", time: 'Now' });
  if (user?.badges?.length > 0) {
    const latest = user.badges[user.badges.length - 1];
    notes.push({ id: 'badge', icon: latest.icon, title: `Badge earned: ${latest.name}`, body: 'Check your achievements on the Dashboard.', time: 'Recent' });
  }
  if (hour >= 6 && hour < 10)
    notes.push({ id: 'morning', icon: '🌅', title: 'Good morning!', body: 'Start the day right — log your breakfast and plan your workout.', time: 'Morning tip' });
  else if (hour >= 17 && hour < 21)
    notes.push({ id: 'evening', icon: '🌙', title: 'Evening check-in', body: "Have you logged today's meals and water intake?", time: 'Evening tip' });
  if ((user?.xp || 0) % 500 > 450) {
    const xpToNext = 500 - ((user.xp || 0) % 500);
    notes.push({ id: 'levelup', icon: '⭐', title: `${xpToNext} XP to next level!`, body: 'Log a workout or chat with AI to earn XP.', time: 'Goal' });
  }
  if (notes.length === 0)
    notes.push({ id: 'welcome', icon: '👋', title: 'Welcome to FitMind AI', body: 'Start by logging your first workout or chatting with your AI coach!', time: 'Tip' });
  return notes;
};

const quickNavItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/diet', label: 'Diet Tracker' },
  { to: '/ai-chat', label: 'AI Assistant' },
  { to: '/plans', label: 'Plan Generator' },
  { to: '/progress', label: 'Progress Tracker' },
  { to: '/profile', label: 'Profile' },
];

const Topbar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[pathname] || 'FitMind AI';
  const [panelOpen, setPanelOpen] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState('');

  const notifications = buildNotifications(user).filter(n => !dismissed.has(n.id));
  const hasUnread = notifications.length > 0;
  const dismissAll = () => setDismissed(new Set(buildNotifications(user).map(n => n.id)));
  const filteredQuickNav = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return quickNavItems;
    return quickNavItems.filter((item) => item.label.toLowerCase().includes(normalized));
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if (event.key === 'Escape') {
        setCommandOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleCommandNavigate = (to) => {
    setCommandOpen(false);
    setQuery('');
    navigate(to);
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b flex-shrink-0 relative"
      style={{
        background: 'rgba(8, 12, 24, 0.92)',
        backdropFilter: 'blur(24px)',
        borderColor: 'var(--border)',
      }}
    >
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setCommandOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs border transition-colors"
          style={{
            color: 'var(--text-secondary)',
            borderColor: 'var(--border-subtle)',
            background: 'rgba(255,255,255,0.02)',
          }}
          aria-label="Open quick search"
        >
          <Search size={14} />
          Quick search
          <span className="px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.06)' }}>Ctrl K</span>
        </button>

        {/* Bell */}
        <div className="relative">
          <button
            id="notification-bell"
            onClick={() => setPanelOpen(o => !o)}
            className="btn-icon relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full pulse-glow"
                style={{ background: 'var(--primary)' }} />
            )}
          </button>

          <AnimatePresence>
            {panelOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-12 w-80 glass-card z-50 overflow-hidden"
                style={{ border: '1px solid var(--border-hover)' }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button onClick={dismissAll} className="text-[11px] flex items-center gap-1 transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseOver={e => e.currentTarget.style.color = 'var(--primary-light)'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <CheckCheck size={13} /> Clear all
                      </button>
                    )}
                    <button onClick={() => setPanelOpen(false)} className="btn-icon w-6 h-6"><X size={14} /></button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <span className="text-2xl">✅</span>
                      <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>All caught up!</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="flex gap-3 px-4 py-3 border-b transition-colors"
                        style={{ borderColor: 'var(--border-subtle)' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <div className="text-lg flex-shrink-0 mt-0.5">{n.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{n.body}</p>
                          <p className="text-[11px] mt-1" style={{ color: 'var(--text-subtle)' }}>{n.time}</p>
                        </div>
                        <button
                          onClick={() => setDismissed(d => new Set([...d, n.id]))}
                          className="btn-icon w-6 h-6 flex-shrink-0 mt-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff' }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>

      <AnimatePresence>
        {commandOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="command-overlay"
            onClick={() => setCommandOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="command-card"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="command-head">
                <Search size={16} />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search pages..."
                  className="command-input"
                />
                <button className="btn-icon w-7 h-7" onClick={() => setCommandOpen(false)}>
                  <X size={14} />
                </button>
              </div>

              <div className="command-results">
                {filteredQuickNav.map((item) => (
                  <button
                    key={item.to}
                    className="command-item"
                    onClick={() => handleCommandNavigate(item.to)}
                  >
                    <span>{item.label}</span>
                    <span className="command-path">{item.to}</span>
                  </button>
                ))}
                {filteredQuickNav.length === 0 && (
                  <div className="command-empty">No matching pages</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Topbar;
