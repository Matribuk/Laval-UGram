import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { captureApiError } from '../utils/errorTracking';
import { API_BASE_URL } from './endpoints';

export const api = axios.create({
	baseURL: `${API_BASE_URL}/api`,
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('auth_token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

api.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		captureApiError(error);

		if (error.response?.status === 401) {
			localStorage.removeItem('auth_token');
			localStorage.removeItem('auth_user');
			window.location.href = '/login';
		}

		if (error.response?.status === 429) {
			toast.error('Too many requests. Please slow down and try again.');
		}

		return Promise.reject(error);
	},
);

export default api;
