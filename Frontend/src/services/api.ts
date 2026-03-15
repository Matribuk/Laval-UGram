import axios, { AxiosError } from 'axios';
import * as Sentry from '@sentry/react';
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
		Sentry.captureException(error, {
			tags: {
				type: 'api_error',
				status: error.response?.status,
			},
			contexts: {
				api: {
					url: error.config?.url,
					method: error.config?.method,
					baseURL: error.config?.baseURL,
				},
			},
		});

		if (error.response?.status === 401) {
			localStorage.removeItem('auth_token');
			localStorage.removeItem('auth_user');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	},
);

export default api;
