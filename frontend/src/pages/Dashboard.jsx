import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Tooltip, Legend, Filler
} from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { Flame, Dumbbell, Salad, TrendingUp, Bot, Zap } from 'lucide-react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, Filler);

const chartDefaults = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(99,102,241,0.06)' }, ticks: { color: '#475569', font: { size: 11, family: 'Inter' } } },
    y: { grid: { color: 'rgba(99,102,241,0.06)' }, ticks: { color: '#475569', font: { size: 11, family: 'Inter' } } },
  },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalWorkouts: 0, totalCalories: 0, totalDuration: 0 });
  const [chartData, setChartData] = useState({ labels: [], calories: [], duration: [] });
  const [dietSummary, setDietSummary] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, dRes] = await Promise.all([api.get('/workouts/stats'), api.get('/diet/summary')]);
        const { chart, ...rest } = wRes.data;
        setStats(rest);
        setChartData(chart || { labels: [], calories: [], duration: [] });
        setDietSummary(dRes.data.summary);
        setRecentWorkouts(wRes.data.workouts?.slice(0, 5) || []);
      } catch { /* silent */ } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const caloriesData = {
    labels: chartData.labels,
    datasets: [{
      label: 'Calories Burned',
      data: chartData.calories,
      fill: true,
      borderColor: 'var(--primary)',
      backgroundColor: 'rgba(99,102,241,0.08)',
      borderWidth: 2,
      tension: 0.4,
      pointBackgroundColor: '#080c18',
      pointBorderColor: 'var(--primary-light)',
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  };

  const macroData = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [{
      data: [dietSummary.protein || 0, dietSummary.carbs || 0, dietSummary.fats || 0],
      backgroundColor: ['rgba(16,185,129,0.7)', 'rgba(34,211,238,0.7)', 'rgba(168,85,247,0.7)'],
      borderColor: ['#10b981', '#22d3ee', '#a855f7'],
      borderWidth: 1,
    }],
  };

  const statCards = [
    { icon: Flame, label: 'Calories Burned', value: stats.totalCalories || 0, unit: 'kcal (7 days)', accent: 'stat-warning', iconColor: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
    { icon: Dumbbell, label: 'Workouts (7 days)', value: stats.totalWorkouts || 0, unit: 'sessions', accent: 'stat-success', iconColor: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
    { icon: Salad, label: 'Calories Today', value: dietSummary.calories || 0, unit: `/ ${user?.dailyCalorieGoal || 2000} goal`, accent: 'stat-accent', iconColor: 'var(--accent)', bg: 'rgba(34,211,238,0.1)' },
    { icon: TrendingUp, label: 'XP Points', value: user?.xp || 0, unit: `Level ${user?.level || 1}`, accent: 'stat-primary', iconColor: 'var(--primary-light)', bg: 'rgba(99,102,241,0.1)' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0] || 'Athlete'}</span> 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Here's your fitness overview for today.</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, unit, accent, iconColor, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`glass-card p-5 ${accent}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={20} style={{ color: iconColor }} />
              </div>
            </div>
            <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{loading ? '–' : value.toLocaleString()}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{unit}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-5 lg:col-span-2">
          <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Weekly Calorie Burn</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Actual calories burned per day (last 7 days)</p>
          {chartData.labels.length > 0 ? (
            <Line data={caloriesData} options={chartDefaults} height={100} />
          ) : (
            <div className="h-24 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No workout data yet — log workouts to see your chart!
            </div>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card p-5">
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Today's Macros</h3>
          {(dietSummary.protein + dietSummary.carbs + dietSummary.fats) > 0 ? (
            <>
              <Doughnut data={macroData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#64748b', boxWidth: 10, font: { size: 11 } } } }, cutout: '72%' }} />
              <div className="mt-4 space-y-2">
                {[['Protein', dietSummary.protein, '#10b981'], ['Carbs', dietSummary.carbs, '#22d3ee'], ['Fats', dietSummary.fats, '#a855f7']].map(([n, v, c]) => (
                  <div key={n} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: c }} />{n}
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v || 0}g</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-24 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Log meals to see your macros!
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick actions + recent workouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card p-5">
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Log Workout', to: '/workouts', icon: Dumbbell, color: 'var(--success)' },
              { label: 'Log Meal', to: '/diet', icon: Salad, color: 'var(--accent)' },
              { label: 'Ask AI', to: '/ai-chat', icon: Bot, color: 'var(--purple)' },
              { label: 'Generate Plan', to: '/plans', icon: Zap, color: 'var(--warning)' },
            ].map(({ label, to, icon: Icon, color }) => (
              <Link key={label} to={to}
                className="glass-card-hover p-4 flex flex-col items-center gap-2 text-center no-underline">
                <Icon size={22} style={{ color }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass-card p-5">
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Recent Workouts</h3>
          {recentWorkouts.length === 0 ? (
            <div className="text-center py-8">
              <Dumbbell className="mx-auto mb-2" size={28} style={{ color: 'var(--text-subtle)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No workouts yet this week</p>
              <Link to="/workouts" className="primary-text text-xs font-semibold mt-2 inline-block no-underline">Log your first →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentWorkouts.map(w => (
                <div key={w._id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{w.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{w.type} · {w.duration} min</p>
                  </div>
                  <span className="badge badge-success text-[11px]">{w.caloriesBurned} kcal</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Streak & badges */}
      {(user?.streak > 0 || user?.badges?.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="glass-card p-5">
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Achievements</h3>
          <div className="flex items-center gap-4 flex-wrap">
            {user?.streak > 0 && (
              <div className="glass-card p-3 flex items-center gap-2">
                <span className="fire-icon text-2xl">🔥</span>
                <div>
                  <p className="text-lg font-black gradient-text">{user.streak}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Day Streak</p>
                </div>
              </div>
            )}
            {user?.badges?.map((badge, i) => (
              <div key={i} className="glass-card p-3 text-center">
                <div className="text-2xl">{badge.icon}</div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{badge.name}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
