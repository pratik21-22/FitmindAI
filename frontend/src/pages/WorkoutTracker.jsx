import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Dumbbell, Filter, Trash2, X, Flame, Clock } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TYPES = ['strength', 'cardio', 'flexibility', 'sports', 'hiit', 'yoga', 'other'];
const INTENSITIES = ['low', 'medium', 'high'];

const emptyForm = { name: '', type: 'strength', duration: '', caloriesBurned: '', sets: '', reps: '', notes: '', intensity: 'medium', date: new Date().toISOString().split('T')[0] };

const intensityColor = { low: 'var(--accent)', medium: 'var(--success)', high: 'var(--warning)' };
const intensityBg = { low: 'rgba(34,211,238,0.12)', medium: 'rgba(16,185,129,0.12)', high: 'rgba(245,158,11,0.12)' };
const intensityBorder = { low: 'rgba(34,211,238,0.25)', medium: 'rgba(16,185,129,0.25)', high: 'rgba(245,158,11,0.25)' };

const WorkoutTracker = () => {
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const [wRes, sRes] = await Promise.all([api.get('/workouts'), api.get('/workouts/stats')]);
      setWorkouts(wRes.data.workouts || []);
      setStats(sRes.data);
    } catch { toast.error('Failed to load workouts'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchWorkouts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workouts', form);
      toast.success('Workout logged! 💪');
      setShowModal(false);
      setForm(emptyForm);
      fetchWorkouts();
    } catch { toast.error('Failed to save workout'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/workouts/${id}`);
      toast.success('Workout deleted');
      setWorkouts(prev => prev.filter(w => w._id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = filter ? workouts.filter(w => w.type === filter) : workouts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Workout Tracker</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Log and track your training sessions</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm flex-shrink-0" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Log Workout
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'This Week', value: stats.totalWorkouts || 0, unit: 'sessions', color: 'var(--success)' },
          { label: 'Duration', value: stats.totalDuration || 0, unit: 'minutes', color: 'var(--accent)' },
          { label: 'Calories', value: stats.totalCalories || 0, unit: 'kcal burned', color: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.unit}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />
        {['', ...TYPES].map(t => (
          <button key={t || 'all'} onClick={() => setFilter(t)}
            className="text-xs px-3 py-1.5 rounded-full border transition-all"
            style={filter === t
              ? { borderColor: 'var(--primary)', background: 'rgba(99,102,241,0.12)', color: 'var(--primary-light)' }
              : { borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }
            }>
            {t ? t.charAt(0).toUpperCase() + t.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Workout list */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Dumbbell className="mx-auto mb-3" size={36} style={{ color: 'var(--text-subtle)' }} />
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No workouts found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Start logging your training sessions!</p>
          </div>
        ) : (
          filtered.map((w, i) => (
            <motion.div key={w._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card-hover p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: intensityBg[w.intensity], border: `1px solid ${intensityBorder[w.intensity]}` }}>
                  <Dumbbell size={18} style={{ color: intensityColor[w.intensity] }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{w.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="badge badge-accent text-[10px] py-0">{w.type}</span>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Clock size={10} /> {w.duration} min</span>
                    {w.caloriesBurned > 0 && <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Flame size={10} /> {w.caloriesBurned} kcal</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>{new Date(w.date).toLocaleDateString()}</span>
                <button onClick={() => handleDelete(w._id)} className="btn-icon w-8 h-8 hover:!text-red-400 hover:!bg-[rgba(239,68,68,0.1)]">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md p-6" style={{ border: '1px solid var(--border-hover)' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Log Workout</h3>
                <button onClick={() => setShowModal(false)} className="btn-icon"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="input-label">Workout Name*</label>
                    <input className="input-field" placeholder="e.g. Morning Run" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Type</label>
                    <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Intensity</label>
                    <select className="input-field" value={form.intensity} onChange={e => setForm({ ...form, intensity: e.target.value })}>
                      {INTENSITIES.map(i => <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Duration (min)*</label>
                    <input type="number" className="input-field" placeholder="30" required value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Calories Burned</label>
                    <input type="number" className="input-field" placeholder="250" value={form.caloriesBurned} onChange={e => setForm({ ...form, caloriesBurned: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Sets</label>
                    <input type="number" className="input-field" placeholder="3" value={form.sets} onChange={e => setForm({ ...form, sets: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Reps</label>
                    <input type="number" className="input-field" placeholder="10" value={form.reps} onChange={e => setForm({ ...form, reps: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="input-label">Date</label>
                    <input type="date" className="input-field" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="input-label">Notes</label>
                    <textarea className="input-field resize-none" rows={2} placeholder="Optional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" className="btn-secondary flex-1 py-2.5 text-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1 py-2.5 text-sm">Save Workout</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutTracker;
