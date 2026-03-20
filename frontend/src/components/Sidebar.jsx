import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Dumbbell, Salad, Bot, Map, TrendingUp,
  User, LogOut, Zap
} from 'lucide-react';

const nav = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Dumbbell, label: 'Workouts', to: '/workouts' },
  { icon: Salad, label: 'Diet', to: '/diet' },
  { icon: Bot, label: 'AI Assistant', to: '/ai-chat' },
  { icon: Map, label: 'My Plans', to: '/plans' },
  { icon: TrendingUp, label: 'Progress', to: '/progress' },
  { icon: User, label: 'Profile', to: '/profile' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const levelProgress = (user?.xp % 500) / 500 * 100;

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sidebar w-[72px] md:w-[260px] flex flex-col h-full z-30 flex-shrink-0"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b hidden md:flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
          <Zap size={17} color="#fff" fill="#fff" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display font-black text-lg gradient-text tracking-tight leading-none">FitMind AI</h1>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Powered by AI</p>
        </div>
      </div>
      {/* Mobile logo */}
      <div className="md:hidden flex justify-center py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
          <Zap size={17} color="#fff" fill="#fff" />
        </div>
      </div>

      {/* User badge */}
      <div className="hidden md:block mx-4 mt-4">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Athlete'}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Level {user?.level || 1} · {user?.xp || 0} XP</p>
            </div>
            {user?.streak > 0 && (
              <div className="badge badge-success text-[10px] flex items-center gap-1 flex-shrink-0">
                <span className="fire-icon">🔥</span> {user.streak}
              </div>
            )}
          </div>
          <div className="progress-bar h-1.5 w-full">
            <div className="progress-fill" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-0.5">
        {nav.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'text-white'
                  : 'hover:bg-[rgba(255,255,255,0.04)]'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)', border: '1px solid rgba(99,102,241,0.25)' }
                : { color: 'var(--text-muted)', border: '1px solid transparent' }
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} style={{ color: isActive ? 'var(--primary-light)' : 'var(--text-muted)' }}
                  className="group-hover:text-white transition-colors flex-shrink-0" />
                <span className="hidden md:block">{label}</span>
                {to === '/ai-chat' && (
                  <span className="ml-auto badge badge-purple text-[9px] py-0 px-1.5 hidden md:block">AI</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex justify-center md:justify-start items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={17} />
          <span className="hidden md:block">Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
