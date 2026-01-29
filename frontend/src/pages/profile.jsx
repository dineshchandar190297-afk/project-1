import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Award } from 'lucide-react';

export default function ProfilePage({ user, loading }) {
    if (loading) return null;
    if (!user) return null;

    return (
        <Layout user={user}>
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card overflow-hidden"
                >
                    {/* Header/Cover */}
                    <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 border-b border-white/5" />

                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-8">
                            <div className="p-1 bg-[#0f172a] rounded-2xl">
                                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-2xl">
                                    <User size={48} />
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${user.role === 'admin' ? 'bg-accent/10 border-accent/20 text-accent' :
                                        user.role === 'analyst' ? 'bg-primary/10 border-primary/20 text-primary' :
                                            'bg-slate-500/10 border-slate-500/20 text-slate-400'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold font-outfit uppercase tracking-tight">{user.username}</h2>
                            <p className="text-slate-400 flex items-center space-x-2">
                                <Mail size={16} />
                                <span>{user.email}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                <div className="p-2 w-fit bg-primary/10 text-primary rounded-lg mb-3">
                                    <Shield size={20} />
                                </div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Access Level</p>
                                <p className="font-semibold text-lg capitalize">{user.role}</p>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                <div className="p-2 w-fit bg-secondary/10 text-secondary rounded-lg mb-3">
                                    <Calendar size={20} />
                                </div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Joined Date</p>
                                <p className="font-semibold text-lg">January 2026</p>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                <div className="p-2 w-fit bg-accent/10 text-accent rounded-lg mb-3">
                                    <Award size={20} />
                                </div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Status</p>
                                <p className="font-semibold text-lg">Verified Account</p>
                            </div>
                        </div>

                        <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                            <h4 className="font-bold mb-2 flex items-center">
                                <Shield size={18} className="mr-2 text-primary" />
                                Your Permissions
                            </h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                As a <strong>{user.role}</strong>, you have the ability to
                                {user.role === 'admin' ? ' manage all system users, upload datasets, train models, and perform infinite predictions.' :
                                    user.role === 'analyst' ? ' upload new social datasets, trigger training cycles, and perform influence predictions.' :
                                        ' perform unlimited user influence predictions and view system performance metrics.'}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
