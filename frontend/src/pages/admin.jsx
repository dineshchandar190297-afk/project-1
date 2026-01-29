import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Activity, Settings } from 'lucide-react';

export default function AdminPage({ user, loading }) {
    if (loading) return null;
    if (!user || user.role !== 'admin') {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0f172a] text-white">
                <h1 className="text-2xl font-bold">403 - Forbidden Access</h1>
            </div>
        );
    }

    return (
        <Layout user={user}>
            <div className="mb-10">
                <h2 className="text-3xl font-bold font-outfit uppercase tracking-tight">System Administration</h2>
                <p className="text-slate-400">Control system parameters and user access levels</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center">
                            <Users size={20} className="mr-2 text-primary" />
                            Manage Users
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-slate-500 text-sm uppercase tracking-wider">
                                        <th className="pb-4 font-medium">Username</th>
                                        <th className="pb-4 font-medium">Email</th>
                                        <th className="pb-4 font-medium">Role</th>
                                        <th className="pb-4 font-medium text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr>
                                        <td className="py-4 font-medium">dinesh</td>
                                        <td className="py-4 text-slate-400">dinesh@example.com</td>
                                        <td className="py-4">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold uppercase">Administrator</span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full inline-block mr-2" />
                                            <span className="text-emerald-500 text-sm">Online</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center">
                            <Activity size={20} className="mr-2 text-secondary" />
                            System Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">API Latency</span>
                                <span className="text-emerald-400 font-mono">12ms</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">DB Connection</span>
                                <span className="text-emerald-400">Connected</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Memory Usage</span>
                                <span className="text-slate-400 font-mono">142MB</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 border-accent/20">
                        <h3 className="text-xl font-bold mb-6 flex items-center">
                            <ShieldCheck size={20} className="mr-2 text-accent" />
                            Security Sync
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">JWT Validation Keys are rotating in 14 hours.</p>
                        <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all">
                            Rotate Keys Now
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
