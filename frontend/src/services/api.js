import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000') + '/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 seconds
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const response = await api.post('/auth/login', formData);
        return response.data;
    },
    register: async (username, email, password, role) => {
        const response = await api.post('/auth/register', { username, email, password, role });
        return response.data;
    },
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

export const mlService = {
    uploadDataset: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/ml/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    trainModel: async (datasetId) => {
        const response = await api.post(`/ml/train?dataset_id=${datasetId}`);
        return response.data;
    },
    getMetrics: async () => {
        const response = await api.get('/ml/metrics');
        return response.data;
    },
    predictInfluence: async (data) => {
        const response = await api.post('/ml/predict', data);
        return response.data;
    },
    getTopInfluencers: async () => {
        const response = await api.get('/ml/top-influencers');
        return response.data;
    },
    getAnalyticsTopInfluencers: async (limit = 10) => {
        const response = await api.get(`/ml/analytics-top-influencers?limit=${limit}`);
        return response.data;
    },
    getDashboardStats: async () => {
        const response = await api.get('/ml/dashboard-stats');
        return response.data;
    },
    getPredictionHistory: async () => {
        const response = await api.get('/ml/predictions-history');
        return response.data;
    },
    deletePrediction: async (id) => {
        const response = await api.delete(`/ml/predictions/${id}`);
        return response.data;
    },
};

export default api;
