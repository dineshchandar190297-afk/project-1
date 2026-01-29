import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { mlService } from '@/services/api';
import { motion } from 'framer-motion';
import { Upload, Database, Play, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TrainingPage({ user, loading }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [training, setTraining] = useState(false);
    const [datasetId, setDatasetId] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setStatus({ type: '', message: '' });
        try {
            const res = await mlService.uploadDataset(file);
            setDatasetId(res.dataset_id);
            setStatus({ type: 'success', message: 'Dataset uploaded successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Upload failed: ' + (err.response?.data?.detail || err.message) });
        } finally {
            setUploading(false);
        }
    };

    const handleTrain = async () => {
        if (!datasetId) return;
        setTraining(true);
        setStatus({ type: '', message: '' });
        try {
            await mlService.trainModel(datasetId);
            setStatus({ type: 'success', message: 'Model training complete! Results are updated in the Dashboard.' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Training failed: ' + (err.response?.data?.detail || err.message) });
        } finally {
            setTraining(false);
        }
    };

    if (loading) return null;

    return (
        <Layout user={user}>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Upload Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Step 1: Upload Dataset</h3>
                            <p className="text-slate-400">CSV file with: followers, likes, shares, comments</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-12 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept=".csv"
                        />
                        <Database size={48} className="text-slate-500 mb-4" />
                        <p className="text-lg font-semibold">{file ? file.name : 'Select CSV Dataset'}</p>
                        <p className="text-slate-500 text-sm mt-1">Recommended size: 1000+ rows for better accuracy</p>
                    </div>

                    {file && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="btn-primary w-full mt-6"
                        >
                            {uploading ? 'Uploading...' : 'Upload for Processing'}
                        </button>
                    )}
                </motion.div>

                {/* Training Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`glass-card p-8 transition-opacity ${!datasetId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                >
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-3 bg-secondary/10 text-secondary rounded-xl">
                            <Play size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Step 2: Train AI Models</h3>
                            <p className="text-slate-400">Execute Logistic Regression & Random Forest comparison</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 p-6 rounded-2xl mb-6">
                        <h4 className="font-semibold mb-2">Algorithm Pipeline:</h4>
                        <ul className="text-sm text-slate-400 space-y-2">
                            <li className="flex items-center"><div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" /> Data Cleaning & Mean Imputation</li>
                            <li className="flex items-center"><div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" /> Min-Max Normalization</li>
                            <li className="flex items-center"><div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" /> Feature Engineering (Engagement Ratios)</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleTrain}
                        disabled={training || !datasetId}
                        className="w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 border border-white/10 hover:bg-white/5 transition-all"
                    >
                        {training ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Training in progress...</span>
                            </>
                        ) : (
                            <>
                                <Play size={20} fill="white" />
                                <span>Start Training Pipeline</span>
                            </>
                        )}
                    </button>
                </motion.div>

                {status.message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-xl flex items-center space-x-3 ${status.type === 'success' ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' : 'bg-accent/10 border border-accent/20 text-accent'
                            }`}
                    >
                        {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <p className="font-medium text-sm">{status.message}</p>
                    </motion.div>
                )}
            </div>
        </Layout>
    );
}
