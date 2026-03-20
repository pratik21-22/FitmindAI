import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Loader, Calendar, Beef, Map, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PlanGenerator = () => {
  const { user } = useAuth();
  const [planType, setPlanType] = useState('both');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    if (!user?.weight || !user?.height || !user?.age) {
      toast.error('Please update your weight/height/age in Profile first to get an accurate plan.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/ai/generate-plan', { planType });
      setPlan(data.plan);
      toast.success('Plan generated successfully! 🪄');
    } catch { toast.error('Failed to generate plan. Try again later.'); }
    finally { setLoading(false); }
  };

  const downloadPlan = () => {
    if (!plan) return;
    const blob = new Blob([plan], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FitMind_${planType}_Plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const planCards = [
    { id: 'workout', icon: Calendar, title: 'Workout Only', desc: 'Weekly exercise schedule with sets/reps', color: 'var(--success)', glow: 'rgba(16,185,129,0.15)' },
    { id: 'diet', icon: Beef, title: 'Diet Only', desc: '7-day meal plan with macro breakdown', color: 'var(--accent)', glow: 'rgba(34,211,238,0.15)' },
    { id: 'both', icon: Map, title: 'Complete Plan', desc: 'Full workout and nutrition strategy', color: 'var(--purple)', glow: 'rgba(168,85,247,0.15)' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
          AI <span className="gradient-text">Plan Generator</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Get a fully personalized weekly schedule tailored to your exact profile and goal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {planCards.map(t => (
          <button key={t.id} onClick={() => setPlanType(t.id)}
            className="glass-card-hover p-6 text-left transition-all relative overflow-hidden"
            style={planType === t.id ? { borderColor: 'var(--primary)', boxShadow: 'var(--shadow-glow)' } : {}}>
            {planType === t.id && <div className="absolute inset-0" style={{ background: 'rgba(99,102,241,0.06)' }} />}
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: t.glow, border: `1px solid ${t.color}40` }}>
                <t.icon size={24} style={{ color: t.color }} />
              </div>
              <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{t.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center">
        <button onClick={generatePlan} disabled={loading}
          className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? (
            <><Loader className="animate-spin" size={20} /> Generating your master plan...</>
          ) : (
            <><Zap size={20} /> Generate {planType === 'both' ? 'Complete' : planType === 'workout' ? 'Workout' : 'Diet'} Plan</>
          )}
        </button>
      </div>

      {plan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card mt-12 p-8 relative" style={{ border: '1px solid var(--border-hover)' }}>
          <button onClick={downloadPlan} className="absolute top-6 right-6 btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
            <Download size={14} /> Download (.md)
          </button>

          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-black gradient-text mb-6 mt-0" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-10 mb-4 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }} {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-6 mb-3" style={{ color: 'var(--accent)' }} {...props} />,
                ul: ({node, ...props}) => <ul className="space-y-2 mb-6" {...props} />,
                li: ({node, ...props}) => <li className="leading-relaxed" style={{ color: 'var(--text-secondary)' }} {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold" style={{ color: 'var(--text-primary)' }} {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 pl-4 italic my-6 py-2 pr-4 rounded-r-lg" style={{ borderColor: 'var(--purple)', color: 'var(--text-secondary)', background: 'rgba(168,85,247,0.06)' }} {...props} />,
              }}
            >{plan}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PlanGenerator;
