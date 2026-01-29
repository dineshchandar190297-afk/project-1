import { useState, useEffect } from 'react';
import { mlService } from '@/services/api';
import {
    History,
    Trash2,
    Download,
    Search,
    Calendar,
    TrendingUp,
    User,
    ChevronRight,
    Filter,
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PredictionHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('All');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await mlService.getPredictionHistory();
            setHistory(data);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this prediction record?')) return;

        try {
            await mlService.deletePrediction(id);
            setHistory(history.filter(item => item.id !== id));
        } catch (err) {
            alert('Failed to delete prediction');
        }
    };

    const handleDownload = (item) => {
        const reportContent = `
INFLUENCE.AI - PREDICTION REPORT
-------------------------------
Date: ${new Date(item.created_at).toLocaleString()}
Prediction ID: #${item.id}

INPUT DATA:
- Followers/Reach: ${item.input_data.followers || item.input_data.subscribers || 0}
- Avg. Likes/Views: ${item.input_data.likes || item.input_data.views || 0}
- Avg. Shares: ${item.input_data.shares || 0}
- Avg. Comments: ${item.input_data.comments || 0}

RESULTS:
- Influence Score: ${item.influence_score.toFixed(2)}
- Performance Level: ${item.influence_level}

This report was generated automatically by Influence.AI Predictive Analytics.
        `;

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Prediction_Report_${item.id}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = JSON.stringify(item.input_data).toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.influence_level.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterLevel === 'All' || item.influence_level === filterLevel;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 pb-20">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by metrics or level..."
                        className="glass-input w-full pl-12 h-12"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
                        {['All', 'High', 'Medium', 'Low'].map((level) => (
                            <button
                                key={level}
                                onClick={() => setFilterLevel(level)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterLevel === level ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                    <p className="text-slate-400">Loading your history...</p>
                </div>
            ) : filteredHistory.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {filteredHistory.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-all group"
                            >
                                <div className="flex items-start md:items-center space-x-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${item.influence_level === 'High' ? 'bg-emerald-500/20 text-emerald-400' :
                                            item.influence_level === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-slate-500/20 text-slate-400'
                                        }`}>
                                        <TrendingUp size={24} />
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-3 mb-1">
                                            <h4 className="text-lg font-bold">Prediction #{item.id}</h4>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.influence_level === 'High' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    item.influence_level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                                }`}>
                                                {item.influence_level} Influence
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-500">
                                            <div className="flex items-center space-x-1">
                                                <Calendar size={14} />
                                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <User size={14} />
                                                <span>{item.input_data.followers || item.input_data.subscribers || 0} Followers</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <TrendingUp size={14} />
                                                <span>Score: {item.influence_score.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 self-end md:self-center">
                                    <button
                                        onClick={() => handleDownload(item)}
                                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center space-x-2"
                                        title="Download Report"
                                    >
                                        <Download size={18} />
                                        <span className="text-xs font-medium md:hidden lg:block">Report</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-3 rounded-xl bg-accent/5 hover:bg-accent/10 text-accent/60 hover:text-accent transition-all"
                                        title="Delete Record"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="glass-card py-20 text-center">
                    <History size={64} className="mx-auto text-slate-700 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold mb-2">No history found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        Your prediction history will appear here once you start analyzing social media impact.
                    </p>
                    <button
                        onClick={() => router.push('/predict')}
                        className="btn-primary mt-6 px-8"
                    >
                        Start Prediction
                    </button>
                </div>
            )}
        </div>
    );
}
