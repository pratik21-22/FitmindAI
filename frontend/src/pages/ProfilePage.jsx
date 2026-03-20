import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Save, Shield, Medal } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: '', weight: '', height: '', age: '',
    gender: '', goal: '', activityLevel: '',
    dailyCalorieGoal: '', dailyStepsGoal: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '', weight: user.weight || '', height: user.height || '', age: user.age || '',
        gender: user.gender || 'male', goal: user.goal || 'lose_fat', activityLevel: user.activityLevel || 'moderate',
        dailyCalorieGoal: user.dailyCalorieGoal || 2000, dailyStepsGoal: user.dailyStepsGoal || 10000,
      });
    }
  }, [user]);

  const handleChange = (e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data);
      toast.success('Profile updated successfully! 🚀');
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Manage your personal information and goals</p>
        </div>
        <button onClick={handleSubmit} disabled={loading}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2 disabled:opacity-50 flex-shrink-0">
          <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold mb-4 relative"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-card)', border: '2px solid var(--success)' }}>
                <Shield size={12} style={{ color: 'var(--success)' }} />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            <div className="flex items-center justify-center gap-4 text-sm mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <p className="font-bold text-lg" style={{ color: 'var(--primary-light)' }}>{user?.level || 1}</p>
                <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Level</p>
              </div>
              <div>
                <p className="font-bold text-lg" style={{ color: 'var(--accent)' }}>{user?.xp || 0}</p>
                <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Total XP</p>
              </div>
              <div>
                <p className="font-bold text-lg" style={{ color: 'var(--warning)' }}>{user?.streak || 0}</p>
                <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Day Streak</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Medal size={16} style={{ color: 'var(--purple)' }} />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Your Trophies</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {user?.badges?.length > 0 ? (
                user.badges.map((b, i) => (
                  <div key={i} className="text-center p-3 rounded-xl" title={b.name}
                    style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid var(--border-subtle)' }}>
                    <div className="text-2xl mb-1">{b.icon}</div>
                    <p className="text-[10px] truncate w-full" style={{ color: 'var(--text-secondary)' }}>{b.name}</p>
                  </div>
                ))
              ) : (
                <p className="col-span-3 text-center text-xs py-4" style={{ color: 'var(--text-muted)' }}>Complete workouts to earn badges!</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Col */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass-card p-6">
          <form className="space-y-6 w-full">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-4 pb-2 border-b"
                style={{ color: 'var(--accent)', borderColor: 'rgba(34,211,238,0.2)' }}>
                <User size={16} /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Full Name</label>
                  <input name="name" className="input-field" value={form.name} onChange={handleChange} />
                </div>
                <div>
                  <label className="input-label">Email (read-only)</label>
                  <input className="input-field opacity-50 cursor-not-allowed" value={user?.email || ''} readOnly />
                </div>
                <div className="rounded-xl p-3" style={{ border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
                  <label className="text-[11px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Weight</label>
                  <div className="flex items-end gap-2" style={{ color: 'var(--primary-light)' }}>
                    <input type="number" name="weight" className="bg-transparent border-none text-xl font-bold w-16 p-0 focus:ring-0 text-center outline-none" style={{ color: 'var(--primary-light)' }} value={form.weight} onChange={handleChange} /> kg
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
                  <label className="text-[11px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Height</label>
                  <div className="flex items-end gap-2" style={{ color: 'var(--accent)' }}>
                    <input type="number" name="height" className="bg-transparent border-none text-xl font-bold w-16 p-0 focus:ring-0 text-center outline-none" style={{ color: 'var(--accent)' }} value={form.height} onChange={handleChange} /> cm
                  </div>
                </div>
                <div>
                  <label className="input-label">Age</label>
                  <input type="number" name="age" className="input-field" value={form.age} onChange={handleChange} />
                </div>
                <div>
                  <label className="input-label">Gender</label>
                  <select name="gender" className="input-field" value={form.gender} onChange={handleChange}>
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-4 pb-2 border-b"
                style={{ color: 'var(--success)', borderColor: 'rgba(16,185,129,0.2)' }}>
                <Settings size={16} /> Goals & Lifestyle
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Primary Goal</label>
                  <select name="goal" className="input-field" value={form.goal} onChange={handleChange}>
                    <option value="lose_fat">🔥 Lose Fat</option>
                    <option value="build_muscle">💪 Build Muscle</option>
                    <option value="maintain">⚖️ Maintain</option>
                    <option value="improve_endurance">🏃 Endurance</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Activity Level</label>
                  <select name="activityLevel" className="input-field" value={form.activityLevel} onChange={handleChange}>
                    <option value="sedentary">Sedentary (desk job)</option>
                    <option value="light">Light (1-3 days/week)</option>
                    <option value="moderate">Moderate (3-5 days/week)</option>
                    <option value="active">Active (6-7 days/week)</option>
                    <option value="very_active">Very Active (athlete)</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Daily Calorie Goal</label>
                  <div className="relative">
                    <input type="number" name="dailyCalorieGoal" className="input-field pr-12" value={form.dailyCalorieGoal} onChange={handleChange} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>kcal</span>
                  </div>
                </div>
                <div>
                  <label className="input-label">Daily Steps Goal</label>
                  <div className="relative">
                    <input type="number" step="1000" name="dailyStepsGoal" className="input-field pr-12" value={form.dailyStepsGoal} onChange={handleChange} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>steps</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
