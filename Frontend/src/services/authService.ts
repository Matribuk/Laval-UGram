import { User, LoginRequest, SignupRequest, AuthResponse, BackendUser } from '../types/api.types';
import api from './api';
import { AxiosError } from 'axios';
import { transformBackendUser } from '../utils/transformers';
import { ENDPOINTS } from './endpoints';

interface BackendAuthResponse {
	accessToken: string;
	user: BackendUser;
}

class AuthService {
	private readonly TOKEN_KEY = 'auth_token';
	private readonly USER_KEY = 'auth_user';

	getStoredToken(): string | null {
		return localStorage.getItem(this.TOKEN_KEY);
	}

	getStoredUser(): User | null {
		const userStr = localStorage.getItem(this.USER_KEY);
		if (userStr) {
			try {
				return JSON.parse(userStr);
			} catch {
				return null;
			}
		}
		return null;
	}

	async login(credentials: LoginRequest): Promise<AuthResponse> {
		try {
			const response = await api.post<BackendAuthResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
			const { accessToken, user: backendUser } = response.data;

			const user = transformBackendUser(backendUser);

			localStorage.setItem(this.TOKEN_KEY, accessToken);
			localStorage.setItem(this.USER_KEY, JSON.stringify(user));

			return { user, token: accessToken };
		} catch (error) {
			const axiosError = error as AxiosError<{ message?: string }>;
			const errorMessage = axiosError.response?.data?.message || 'Login failed. Please check your credentials.';
			throw new Error(errorMessage);
		}
	}

	async signup(userData: SignupRequest): Promise<AuthResponse> {
		try {
			const response = await api.post<BackendAuthResponse>(ENDPOINTS.AUTH.REGISTER, userData);
			const { accessToken, user: backendUser } = response.data;

			const user = transformBackendUser(backendUser);

			localStorage.setItem(this.TOKEN_KEY, accessToken);
			localStorage.setItem(this.USER_KEY, JSON.stringify(user));

			return { user, token: accessToken };
		} catch (error) {
			const axiosError = error as AxiosError<{ message?: string }>;
			const errorMessage = axiosError.response?.data?.message || 'Signup failed. Please try again.';
			throw new Error(errorMessage);
		}
	}

	async logout(): Promise<void> {
		try {
			await api.post(ENDPOINTS.AUTH.LOGOUT);
		} catch (error) {
			// eslint-disable-next-line no-console
			console.debug('Logout API failed, but proceeding anyway', error);
		}

		localStorage.removeItem(this.TOKEN_KEY);
		localStorage.removeItem(this.USER_KEY);
	}

	async getTokenInfo(): Promise<AuthResponse> {
		const token = this.getStoredToken();
		const user = this.getStoredUser();

		if (!token || !user) {
			throw new Error('Not authenticated');
		}

		return { user, token };
	}
}

export const authService = new AuthService();
