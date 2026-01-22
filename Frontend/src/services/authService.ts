import { User, LoginRequest, SignupRequest, AuthResponse } from '../types/api.types';

// TODO: Remplacer par de vrais appels API quand le backend sera disponible
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
		// TODO: Appeler le vrai endpoint API
		const mockUser: User = {
			id: 1,
			username: 'johndoe',
			fullName: 'John Doe',
			email: credentials.email,
		};
		const mockToken = 'mock_token_' + Date.now();

		localStorage.setItem(this.TOKEN_KEY, mockToken);
		localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));

		return { user: mockUser, token: mockToken };
	}

	async signup(userData: SignupRequest): Promise<AuthResponse> {
		// TODO: Appeler le vrai endpoint API
		const mockUser: User = {
			id: Date.now(),
			username: userData.username,
			fullName: userData.fullName,
			email: userData.email,
		};
		const mockToken = 'mock_token_' + Date.now();

		localStorage.setItem(this.TOKEN_KEY, mockToken);
		localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));

		return { user: mockUser, token: mockToken };
	}

	async logout(): Promise<void> {
		localStorage.removeItem(this.TOKEN_KEY);
		localStorage.removeItem(this.USER_KEY);
	}

	async getTokenInfo(): Promise<AuthResponse> {
		// TODO: Appeler le vrai endpoint API pour valider le token
		const token = this.getStoredToken();
		const user = this.getStoredUser();

		if (!token || !user) {
			throw new Error('Not authenticated');
		}

		return { user, token };
	}
}

export const authService = new AuthService();
