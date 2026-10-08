import axios from 'axios'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('medflowToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let refreshPromise = null;

async function refreshTokens() {
    const refreshToken = localStorage.getItem('medflowRefreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token');
    }

    const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`,
        {refresh_token: refreshToken}
    );

    localStorage.setItem('medflowToken', response.data.access_token);
    localStorage.setItem('medflowRefreshToken', response.data.refresh_token);
    return response.data.access_token;
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = refreshTokens().finally(() => {
                    refreshPromise = null;
                });
            }

            const newAccessToken = await refreshPromise;

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
        } catch (refreshError) {
            localStorage.removeItem('medflowToken');
            localStorage.removeItem('medflowRefreshToken');
            window.location.href = '/login';

            return Promise.reject(refreshError);
        }
    }
);

export default apiClient;