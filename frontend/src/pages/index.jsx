import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { mlService } from '@/services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, AreaChart, Area, Legend
} from 'recharts';
import { Users, TrendingUp, Award, Activity, Heart, Share2, MessageCircle, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

import { useRouter } from 'next/router';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="glass-card p-6"
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-400 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold mt-1">{value}</h3>
                {trend && (
                    <p className={`text-xs mt-2 flex items-center ${trend > 0 ? 'text-green-400' : 'text-rose-400'}`}>
                        <TrendingUp size={12} className="mr-1" />
                        {Math.abs(trend)}% from last month
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-xl bg-${color}/10 text-${color}`}>
                <Icon size={24} />
            </div>
        </div>
    </motion.div>
);

export default function Dashboard({ user, loading }) {
    const router = useRouter();
    const [metrics, setMetrics] = useState([]);
    const [topInfluencers, setTopInfluencers] = useState([]);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [dashboardStats, setDashboardStats] = useState({
        total_likes: 0,
        total_shares: 0,
        total_comments: 0,
        system_accuracy: 0,
        engagement_trend: []
    });

    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'viewer') {
                router.push('/predict');
                return;
            }
            mlService.getMetrics().then(setMetrics);
            mlService.getTopInfluencers().then(setTopInfluencers);
            mlService.getAnalyticsTopInfluencers(10).then(setAnalyticsData);
            mlService.getDashboardStats().then(setDashboardStats);
        }
    }, [loading, user, router]);

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="ml-4 text-slate-400">Loading System...</p>
        </div>
    );

    if (!user) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <p className="text-slate-400">Redirecting to login...</p>
        </div>
    );

    const chartData = metrics.map(m => ({
        name: m.model_name,
        acc: parseFloat((m.accuracy * 100).toFixed(2)),
        prec: parseFloat((m.precision * 100).toFixed(2)),
        rec: parseFloat((m.recall * 100).toFixed(2)),
        f1: parseFloat((m.f1_score * 100).toFixed(2)),
    }));

    // Sample engagement data for visualization (replace with actual data from API)
    const engagementTrendData = [
        { month: 'Jan', likes: 4200, shares: 1800, comments: 950 },
        { month: 'Feb', likes: 5100, shares: 2100, comments: 1200 },
        { month: 'Mar', likes: 6800, shares: 2800, comments: 1450 },
        { month: 'Apr', likes: 7500, shares: 3200, comments: 1680 },
        { month: 'May', likes: 8900, shares: 3900, comments: 1920 },
        { month: 'Jun', likes: 10200, shares: 4500, comments: 2250 },
    ];

    const likesData = [
        { category: 'High Influence', value: 45000 },
        { category: 'Medium Influence', value: 28000 },
        { category: 'Low Influence', value: 12000 },
    ];

    const sharesData = [
        { category: 'High Influence', value: 18000 },
        { category: 'Medium Influence', value: 9500 },
        { category: 'Low Influence', value: 3200 },
    ];

    const commentsData = [
        { category: 'High Influence', value: 8500 },
        { category: 'Medium Influence', value: 4200 },
        { category: 'Low Influence', value: 1800 },
    ];

    return (
        <Layout user={user}>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title={dashboardStats?.platform === 'YouTube' ? "Total Views" : "Total Likes"} value={dashboardStats.total_likes.toLocaleString()} icon={dashboardStats?.platform === 'YouTube' ? Eye : Heart} color="primary" trend={12} />
                <StatCard title="Total Shares" value={dashboardStats.total_shares.toLocaleString()} icon={Share2} color="secondary" trend={8} />
                <StatCard title="Total Comments" value={dashboardStats.total_comments.toLocaleString()} icon={MessageCircle} color="accent" trend={15} />
                <StatCard title="System Accuracy" value={`${dashboardStats.system_accuracy}%`} icon={Activity} color="emerald" trend={1.5} />
            </div>

            {/* Engagement Trends Over Time */}
            <div className="glass-card p-6 mb-8">
                <h3 className="text-xl font-bold mb-6">Engagement Trends Over Time</h3>
                <div className="h-[350px] w-full flex items-center justify-center">
                    {dashboardStats.engagement_trend && dashboardStats.engagement_trend.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboardStats.engagement_trend}>
                                <defs>
                                    <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="month" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="likes" stroke="#6366f1" fillOpacity={1} fill="url(#colorLikes)" strokeWidth={2} />
                                <Area type="monotone" dataKey="shares" stroke="#a855f7" fillOpacity={1} fill="url(#colorShares)" strokeWidth={2} />
                                <Area type="monotone" dataKey="comments" stroke="#f43f5e" fillOpacity={1} fill="url(#colorComments)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center text-slate-500">
                            <Activity size={48} className="mx-auto mb-4 opacity-10" />
                            <p className="font-medium">No active analytics campaign</p>
                            <p className="text-xs mt-2 text-slate-600 italic">Dashboard will populate after your first dataset is trained.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Individual Engagement Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Likes Distribution */}
                <div className="glass-card p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <Heart size={20} />
                        </div>
                        <h3 className="text-lg font-bold">Likes by Influence Level</h3>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={likesData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis type="number" stroke="#64748b" />
                                <YAxis dataKey="category" type="category" stroke="#64748b" width={120} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Shares Distribution */}
                <div className="glass-card p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                            <Share2 size={20} />
                        </div>
                        <h3 className="text-lg font-bold">Shares by Influence Level</h3>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sharesData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis type="number" stroke="#64748b" />
                                <YAxis dataKey="category" type="category" stroke="#64748b" width={120} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#a855f7" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Comments Distribution */}
                <div className="glass-card p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-accent/10 text-accent rounded-lg">
                            <MessageCircle size={20} />
                        </div>
                        <h3 className="text-lg font-bold">Comments by Influence Level</h3>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={commentsData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis type="number" stroke="#64748b" />
                                <YAxis dataKey="category" type="category" stroke="#64748b" width={120} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#f43f5e" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Model Performance & Top Influencers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Model Accuracy Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6">Model Performance Comparison</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="acc" name="Accuracy %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="f1" name="F1 Score %" fill="#a855f7" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Influencers Section */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Top {analyticsData?.platform || 'Social'} Influencers</h3>
                        {analyticsData && (
                            <div className="text-xs text-slate-400">
                                Analyzed: {analyticsData.total_analyzed} accounts
                            </div>
                        )}
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {analyticsData && analyticsData.influencers && analyticsData.influencers.length > 0 ? (
                            analyticsData.influencers.map((inf, i) => (
                                <motion.div
                                    key={inf.account_id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-sm">
                                                #{i + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <p className="font-bold text-white">
                                                        {analyticsData?.platform === 'YouTube' ? inf.account_id : `@${inf.account_id}`}
                                                    </p>
                                                    {inf.is_viral && (
                                                        <span className="px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-bold rounded-full flex items-center space-x-1">
                                                            <span>🔥</span>
                                                            <span>VIRAL</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {inf.followers.toLocaleString()} {analyticsData?.platform === 'YouTube' ? 'subscribers' : 'followers'} • {inf.performance_level}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-secondary">{inf.engagement_rate}%</p>
                                            <p className="text-xs text-slate-500">Engagement</p>
                                        </div>
                                    </div>

                                    {/* Engagement Breakdown */}
                                    <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/5">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center space-x-1 mb-1">
                                                <Eye size={14} className="text-primary" />
                                                <p className="text-xs font-bold text-primary">{inf.likes.toLocaleString()}</p>
                                            </div>
                                            <p className="text-xs text-slate-500">{analyticsData?.platform === 'YouTube' ? 'Views' : 'Likes'}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center space-x-1 mb-1">
                                                <Share2 size={14} className="text-secondary" />
                                                <p className="text-xs font-bold text-secondary">{inf.shares.toLocaleString()}</p>
                                            </div>
                                            <p className="text-xs text-slate-500">Shares</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center space-x-1 mb-1">
                                                <MessageCircle size={14} className="text-accent" />
                                                <p className="text-xs font-bold text-accent">{inf.comments.toLocaleString()}</p>
                                            </div>
                                            <p className="text-xs text-slate-500">Comments</p>
                                        </div>
                                    </div>

                                    {/* Total Engagement Bar */}
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-slate-400">Total Engagement</span>
                                            <span className="font-bold text-white">{inf.total_engagement.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
                                                style={{
                                                    width: `${analyticsData.viral_threshold > 0
                                                        ? Math.min(100, (inf.total_engagement / analyticsData.viral_threshold) * 100)
                                                        : 0}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-slate-500">
                                <Users size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-medium">No influencer data yet</p>
                                <p className="text-sm mt-2 text-slate-600">Upload a YouTube, Facebook, or Instagram dataset to see analytics</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
