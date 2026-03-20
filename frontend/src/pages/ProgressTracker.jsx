import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ProgressTracker = () => {
  const { user, updateUser } = useAuth();
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    weight: user?.weight || '', chest: '', waist: '', hips: '', arms: '', thighs: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/progress');
      setEntries(data || []);
      if (data.length > 0) {
        const latest = data[0];
        setForm(prev => ({
          ...prev, weight: latest.weight,
          chest: latest.measurements?.chest || '', waist: latest.measurements?.waist || '',
          hips: latest.measurements?.hips || '', arms: latest.measurements?.arms || '',
          thighs: latest.measurements?.thighs || '',
        }));
      }
    } catch { toast.error('Failed to load progress'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        weight: Number(form.weight), date: form.date,
        measurements: { chest: Number(form.chest) || 0, waist: Number(form.waist) || 0, hips: Number(form.hips) || 0, arms: Number(form.arms) || 0, thighs: Number(form.thighs) || 0 }
      };
      await api.post('/progress', payload);
      if (new Date(form.date) >= new Date(entries[0]?.date || 0)) {
        await api.put('/auth/profile', { weight: Number(form.weight) });
        updateUser({ weight: Number(form.weight) });
      }
      toast.success('Progress saved! 📈');
      setShowModal(false);
      fetchEntries();
    } catch { toast.error('Failed to save progress'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/progress/${id}`); setEntries(prev => prev.filter(e => e._id !== id)); toast.success('Entry deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const dates = sortedEntries.map(e => new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));

  const chartData = {
    labels: dates,
    datasets: [{
      label: 'Weight (kg)',
      data: sortedEntries.map(e => e.weight),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.08)',
      borderWidth: 2,
      pointBackgroundColor: '#080c18',
      pointBorderColor: '#818cf8',
      pointBorderWidth: 2,
      pointRadius: 4,
      fill: true,
      tension: 0.3
    }]
  };

  const getWeightTrend = () => {
    if (entries.length < 2) return null;
    const current = entries[0].weight;
    const previous = entries[1].weight;
    const diff = current - previous;
    const isGoalLoss = user?.goal === 'lose_fat';
    let color = 'var(--purple)', Icon = Minus;
    if (diff < 0) { color = isGoalLoss ? 'var(--success)' : 'var(--warning)'; Icon = TrendingDown; }
    else if (diff > 0) { color = isGoalLoss ? 'var(--warning)' : 'var(--accent)'; Icon = TrendingUp; }
    return { diff: Math.abs(diff).toFixed(1), color, Icon, isSame: diff === 0 };
  };
  const trend = getWeightTrend();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Progress Tracker</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Track your body transformation</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm flex-shrink-0" onClick={() => setShowModal(true)}><Plus size={16} /> Log Progress</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" style={{ background: 'rgba(99,102,241,0.06)' }} />
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Current Weight</h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>
                {entries[0]?.weight || user?.weight || '--'}<span className="text-xl font-semibold" style={{ color: 'var(--text-muted)' }}>kg</span>
              </span>
              {trend && !trend.isSame && (
                <span className="flex items-center text-sm font-medium mb-1.5 px-2 py-0.5 rounded-md" style={{ color: trend.color, background: `${trend.color}15` }}>
                  <trend.Icon size={14} className="mr-1" /> {trend.diff} kg
                </span>
              )}
            </div>
            {entries.length > 0 && <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>Last updated: {new Date(entries[0].date).toLocaleDateString()}</p>}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Latest Measurements</h3>
            {entries.length === 0 || !entries[0].measurements ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No measurements logged yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(entries[0].measurements).filter(([_, v]) => v > 0).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <span className="capitalize" style={{ color: 'var(--text-primary)' }}>{k}</span>
                    <span className="font-mono" style={{ color: 'var(--accent)' }}>{v} cm</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5 lg:col-span-2 flex flex-col">
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Weight History</h3>
          <div className="flex-1 min-h-[250px] relative">
            {entries.length < 2 ? (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-center">
                <TrendingUp className="mb-2" size={32} style={{ color: 'var(--text-subtle)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Need at least 2 entries to show graph</p>
              </div>
            ) : (
              <Line data={chartData} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                scales: {
                  x: { grid: { color: 'rgba(99,102,241,0.06)' }, ticks: { color: '#64748b' } },
                  y: { grid: { color: 'rgba(99,102,241,0.06)' }, ticks: { color: '#64748b' } }
                }
              }} />
            )}
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>History Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead style={{ background: 'rgba(99,102,241,0.04)' }}>
              <tr className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Weight</th>
                <th className="px-5 py-3 font-medium text-center">Measurements (cm)</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ color: 'var(--text-secondary)' }}>
              {loading ? (
                <tr><td colSpan="4" className="px-5 py-4 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan="4" className="px-5 py-8 text-center" style={{ color: 'var(--text-muted)' }}>No progress entries yet.</td></tr>
              ) : (
                entries.map(e => (
                  <tr key={e._id} className="transition-colors" onMouseOver={ev => ev.currentTarget.style.background = 'rgba(99,102,241,0.03)'}
                    onMouseOut={ev => ev.currentTarget.style.background = 'transparent'}>
                    <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right"><span className="font-mono" style={{ color: 'var(--primary-light)' }}>{e.weight} kg</span></td>
                    <td className="px-5 py-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                      {e.measurements ? `C:${e.measurements.chest || '-'} W:${e.measurements.waist || '-'} H:${e.measurements.hips || '-'} A:${e.measurements.arms || '-'} T:${e.measurements.thighs || '-'}` : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleDelete(e._id)} className="btn-icon w-7 h-7 hover:!text-red-400 hover:!bg-[rgba(239,68,68,0.1)]"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-lg p-6" style={{ border: '1px solid var(--border-hover)' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Log Progress Entry</h3>
                <button onClick={() => setShowModal(false)} className="btn-icon"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="input-label">Weight (kg)*</label>
                    <input type="number" step="0.1" className="input-field text-lg font-mono" style={{ color: 'var(--primary-light)' }}
                      required value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="input-label">Date*</label>
                    <input type="date" className="input-field" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                  </div>
                </div>
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Optional Measurements (cm)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['chest', 'waist', 'hips', 'arms', 'thighs'].map(m => (
                      <div key={m}>
                        <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>{m}</label>
                        <input type="number" step="0.5" className="input-field py-1.5 text-sm" placeholder="—" value={form[m]} onChange={e => setForm({...form, [m]: e.target.value})} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" className="btn-secondary flex-1 py-2.5 text-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary flex-1 py-2.5 text-sm inline-flex justify-center items-center gap-2"><TrendingUp size={16} /> Save Entry</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressTracker;
