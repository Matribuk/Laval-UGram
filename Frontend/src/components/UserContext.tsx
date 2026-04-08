import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { usersService } from '../services/usersService';
import { User, LoginRequest, SignupRequest } from '../types/api.types';

interface UserContextType {
	user: User | null;
	setUser: (user: User | null) => void;
	updateUser: (user: User) => void;
	login: (credentials: LoginRequest) => Promise<void>;
	signup: (userData: SignupRequest) => Promise<void>;
	logout: () => Promise<void>;
	loading: boolean;
	error: string | null;
	isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
	children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				setLoading(true);
				const token = authService.getStoredToken();
				const storedUser = authService.getStoredUser();

				if (token && storedUser) {
					if (token.startsWith('google_') || token.startsWith('microsoft_')) {
						setUser(storedUser);
					} else {
						try {
							const freshUser = await usersService.getCurrentUser();
							setUser(freshUser);
							localStorage.setItem('auth_user', JSON.stringify(freshUser));
						} catch (err: unknown) {
							if ((err as { response?: { status?: number } })?.response?.status === 401) {
								console.warn('Token expired or invalid, logging out');
								localStorage.removeItem('auth_token');
								localStorage.removeItem('auth_user');
								setUser(null);
							} else {
								console.warn('Could not verify token (API may be down), keeping user logged in:', err);
								setUser(storedUser);
							}
						}
					}
				} else if (storedUser) {
					setUser(storedUser);
				} else {
					setUser(null);
				}
				setError(null);
			} catch (err) {
				console.error('Error checking auth:', err);
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

	const login = async (credentials: LoginRequest) => {
		try {
			setLoading(true);
			setError(null);
			const authData = await authService.login(credentials);
			setUser(authData.user);
		} catch (err) {
			console.error('Login error:', err);
			const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
			setError(errorMessage);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const signup = async (userData: SignupRequest) => {
		try {
			setLoading(true);
			setError(null);
			await authService.signup(userData);
			await login({ email: userData.email, password: userData.password });
		} catch (err) {
			console.error('Signup error:', err);
			const errorMessage = err instanceof Error ? err.message : 'Signup failed. Please try again.';
			setError(errorMessage);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const updateUser = (updatedUser: User) => {
		setUser(updatedUser);
		localStorage.setItem('auth_user', JSON.stringify(updatedUser));
	};

	const logout = async () => {
		try {
			await authService.logout();
			setUser(null);
		} catch (err) {
			console.error('Logout error:', err);
		}
	};

	const isAuthenticated = !!user && !!authService.getStoredToken();

	return (
		<UserContext.Provider value={{ user, setUser, updateUser, login, signup, logout, loading, error, isAuthenticated }}>
			{children}
		</UserContext.Provider>
	);
};

export const useUser = (): UserContextType => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
};
