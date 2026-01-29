import axios from 'axios';

// Fallback to construction based on current URL if on Render
let API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com') && API_BASE.includes('127.0.0.1')) {
    // Attempting to autofix if the user forgot the environment variable
    API_BASE = window.location.origin.replace('-ui', '-api');
}

const API_URL = API_BASE + (API_BASE.endsWith('/') ? 'api' : '/api');
console.log('🚀 SYSTEM STATUS: Connecting to API at:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
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
