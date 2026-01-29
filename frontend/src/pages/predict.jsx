import { useState } from 'react';
import Layout from '@/components/Layout';
import { mlService } from '@/services/api';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Info } from 'lucide-react';

export default function PredictionPage({ user, loading }) {
    const [formData, setFormData] = useState({
        followers: 10000,
        likes: 500,
        shares: 50,
        comments: 30
    });
    const [result, setResult] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPredicting(true);
        setError('');
        try {
            const data = await mlService.predictInfluence(formData);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Prediction failed. Is the model trained?');
        } finally {
            setPredicting(false);
        }
    };

    if (loading) return null;

    return (
        <Layout user={user}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-8"
                    >
                        <h3 className="text-xl font-bold mb-6 flex items-center">
                            <Search className="mr-2 text-primary" size={20} />
                            Input Parameters
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Total Followers</label>
                                <input
                                    type="number"
                                    value={formData.followers}
                                    onChange={(e) => setFormData({ ...formData, followers: parseInt(e.target.value) })}
                                    className="glass-input w-full"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Average Likes</label>
                                <input
                                    type="number"
                                    value={formData.likes}
                                    onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) })}
                                    className="glass-input w-full"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Average Shares</label>
                                <input
                                    type="number"
                                    value={formData.shares}
                                    onChange={(e) => setFormData({ ...formData, shares: parseInt(e.target.value) })}
                                    className="glass-input w-full"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Average Comments</label>
                                <input
                                    type="number"
                                    value={formData.comments}
                                    onChange={(e) => setFormData({ ...formData, comments: parseInt(e.target.value) })}
                                    className="glass-input w-full"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={predicting}
                                className="btn-primary w-full"
                            >
                                {predicting ? 'Calculating...' : 'Predict Influence'}
                            </button>
                        </form>
                    </motion.div>
                </div>

                <div className="lg:col-span-2">
                    {result ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-10 text-center h-full flex flex-col justify-center border-primary/20"
                        >
                            <div className="mb-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto flex items-center justify-center text-white shadow-2xl shadow-primary/30 mb-6">
                                    <TrendingUp size={48} />
                                </div>
                                <h2 className="text-4xl font-bold mb-2">Analysis Result</h2>
                                <p className="text-slate-400">Based on our advanced ML model</p>
                            </div>

                            <div className="flex justify-center space-x-12 mb-10">
                                <div className="text-center">
                                    <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Influence Score</p>
                                    <p className="text-5xl font-extrabold text-white">{result.influence_score}<span className="text-xl text-primary font-bold">/100</span></p>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Impact Level</p>
                                    <p className={`text-4xl font-bold ${result.influence_level === 'High' ? 'text-emerald-400' :
                                            result.influence_level === 'Medium' ? 'text-amber-400' : 'text-slate-400'
                                        }`}>
                                        {result.influence_level}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-start text-left">
                                <Info size={24} className="text-primary mt-1 mr-4 flex-shrink-0" />
                                <p className="text-slate-300 text-sm">
                                    This user demonstrates a <strong>{result.influence_level}</strong> level of influence.
                                    Their engagement metrics suggest a reach that is optimized for {
                                        result.influence_level === 'High' ? 'large-scale brand campaigns and viral reach.' :
                                            result.influence_level === 'Medium' ? 'targeted, niche community interaction.' :
                                                'personal branding and close-knit network growth.'
                                    }
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="glass-card p-10 h-full flex items-center justify-center text-center border-dashed border-2 border-white/5 bg-transparent">
                            <div>
                                <Search size={64} className="text-slate-700 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-slate-500">Ready to Analyze</h3>
                                <p className="text-slate-600 mt-2">Enter user metrics on the left to generate prediction</p>
                                {error && <p className="text-accent mt-4 bg-accent/10 p-4 rounded-xl">{error}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
