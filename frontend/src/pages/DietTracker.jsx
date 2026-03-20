import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Salad, X, Trash2 } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout'];
const emptyForm = { mealName: '', mealType: 'breakfast', calories: '', protein: '', carbs: '', fats: '', fiber: '', servingSize: '1 serving', date: new Date().toISOString().split('T')[0] };

const mealTypeColor = { breakfast: 'var(--warning)', lunch: 'var(--accent)', dinner: 'var(--purple)', snack: 'var(--success)', 'pre-workout': '#fbbf24', 'post-workout': '#ec4899' };

const DietTracker = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const calGoal = user?.dailyCalorieGoal || 2000;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, sRes] = await Promise.all([api.get('/diet'), api.get('/diet/summary')]);
      setMeals(mRes.data || []);
      setSummary(sRes.data.summary || {});
    } catch { toast.error('Failed to load meals'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/diet', form);
      toast.success('Meal logged! 🥗');
      setShowModal(false);
      setForm(emptyForm);
      fetchData();
    } catch { toast.error('Failed to save meal'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/diet/${id}`); setMeals(prev => prev.filter(m => m._id !== id)); toast.success('Meal deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const macroChart = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [{ data: [summary.protein || 1, summary.carbs || 1, summary.fats || 1], backgroundColor: ['rgba(16,185,129,0.7)', 'rgba(34,211,238,0.7)', 'rgba(168,85,247,0.7)'], borderColor: ['#10b981', '#22d3ee', '#a855f7'], borderWidth: 1 }],
  };

  const calPct = Math.min((summary.calories / calGoal) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Diet Tracker</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Monitor your nutrition and macros</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm flex-shrink-0" onClick={() => setShowModal(true)}><Plus size={16} /> Log Meal</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Today's Calorie Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>{summary.calories || 0} kcal consumed</span>
              <span className="font-semibold" style={{ color: 'var(--success)' }}>{calGoal} goal</span>
            </div>
            <div className="progress-bar h-3">
              <motion.div className="progress-fill h-full" initial={{ width: 0 }} animate={{ width: `${calPct}%` }} transition={{ duration: 1 }} />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{calGoal - (summary.calories || 0)} kcal remaining</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[['Protein', summary.protein, '#10b981', '150g goal'], ['Carbs', summary.carbs, '#22d3ee', '250g goal'], ['Fats', summary.fats, '#a855f7', '80g goal']].map(([n, v, c, goal]) => (
              <div key={n} className="glass-card p-3 text-center">
                <p className="text-xl font-black" style={{ color: c }}>{v || 0}g</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{goal}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Macro Split</h3>
          <Doughnut data={macroChart} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#64748b', boxWidth: 10, font: { size: 11 } } } }, cutout: '70%' }} />
        </div>
      </div>

      {/* Meal list */}
      <div className="space-y-3">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />) :
          meals.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Salad className="mx-auto mb-3" size={36} style={{ color: 'var(--text-subtle)' }} />
              <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No meals logged yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Start tracking your nutrition!</p>
            </div>
          ) : meals.map((m, i) => (
            <motion.div key={m._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card-hover p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid var(--border)' }}>
                  {m.mealType === 'breakfast' ? '🌅' : m.mealType === 'lunch' ? '☀️' : m.mealType === 'dinner' ? '🌙' : '🍎'}
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{m.mealName}</p>
                  <div className="flex gap-2 mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <span>{m.calories} kcal</span>
                    <span>P: {m.protein}g</span><span>C: {m.carbs}g</span><span>F: {m.fats}g</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-primary text-[10px]">{m.mealType}</span>
                <button onClick={() => handleDelete(m._id)} className="btn-icon w-7 h-7 hover:!text-red-400 hover:!bg-[rgba(239,68,68,0.1)]">
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))
        }
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
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Log Meal</h3>
                <button onClick={() => setShowModal(false)} className="btn-icon"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="input-label">Meal Name*</label>
                  <input className="input-field" placeholder="e.g. Chicken & Rice" required value={form.mealName} onChange={e => setForm({ ...form, mealName: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Meal Type</label>
                    <select className="input-field" value={form.mealType} onChange={e => setForm({ ...form, mealType: e.target.value })}>
                      {MEAL_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Calories*</label>
                    <input type="number" className="input-field" placeholder="500" required value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} />
                  </div>
                  <div><label className="input-label">Protein (g)</label>
                    <input type="number" className="input-field" placeholder="40" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} /></div>
                  <div><label className="input-label">Carbs (g)</label>
                    <input type="number" className="input-field" placeholder="60" value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} /></div>
                  <div><label className="input-label">Fats (g)</label>
                    <input type="number" className="input-field" placeholder="15" value={form.fats} onChange={e => setForm({ ...form, fats: e.target.value })} /></div>
                  <div><label className="input-label">Serving Size</label>
                    <input className="input-field" placeholder="1 cup" value={form.servingSize} onChange={e => setForm({ ...form, servingSize: e.target.value })} /></div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" className="btn-secondary flex-1 py-2.5 text-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1 py-2.5 text-sm">Save Meal</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DietTracker;
