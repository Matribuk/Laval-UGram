import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { UserProvider, useUser } from '../../components/UserContext';
import { authService } from '../../services/authService';

jest.mock('../../services/authService');

const mockAuthService = authService as jest.Mocked<typeof authService>;

const TestConsumer: React.FC = () => {
	const { user, loading, isAuthenticated, error } = useUser();
	return (
		<div>
			<span data-testid="loading">{loading ? 'loading' : 'not-loading'}</span>
			<span data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
			<span data-testid="user">{user ? user.username : 'no-user'}</span>
			<span data-testid="error">{error || 'no-error'}</span>
		</div>
	);
};

describe('UserContext', () => {
	const mockUser = {
		id: 'user-123',
		username: 'johndoe',
		email: 'john@example.com',
		firstName: 'John',
		lastName: 'Doe',
		fullName: 'John Doe',
	};

	beforeEach(() => {
		jest.clearAllMocks();
		localStorage.clear();
	});

	describe('useUser hook', () => {
		it('throws error when used outside provider', () => {
			const consoleError = jest.spyOn(console, 'error').mockImplementation(jest.fn());

			expect(() => render(<TestConsumer />)).toThrow('useUser must be used within a UserProvider');

			consoleError.mockRestore();
		});
	});

	describe('UserProvider', () => {
		it('shows loading initially', async () => {
			mockAuthService.getStoredToken.mockReturnValue(null);
			mockAuthService.getStoredUser.mockReturnValue(null);

			render(
				<UserProvider>
					<TestConsumer />
				</UserProvider>,
			);

			expect(screen.getByTestId('loading')).toHaveTextContent('loading');

			await waitFor(() => {
				expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
			});
		});

		it('loads user from storage', async () => {
			mockAuthService.getStoredToken.mockReturnValue('test-token');
			mockAuthService.getStoredUser.mockReturnValue(mockUser);
			mockAuthService.getTokenInfo.mockResolvedValue({ user: mockUser, token: 'test-token' });

			render(
				<UserProvider>
					<TestConsumer />
				</UserProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId('user')).toHaveTextContent('johndoe');
			});
		});

		it('handles google token', async () => {
			mockAuthService.getStoredToken.mockReturnValue('google_token');
			mockAuthService.getStoredUser.mockReturnValue(mockUser);

			render(
				<UserProvider>
					<TestConsumer />
				</UserProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId('user')).toHaveTextContent('johndoe');
			});
		});

		it('handles microsoft token', async () => {
			mockAuthService.getStoredToken.mockReturnValue('microsoft_token');
			mockAuthService.getStoredUser.mockReturnValue(mockUser);

			render(
				<UserProvider>
					<TestConsumer />
				</UserProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId('user')).toHaveTextContent('johndoe');
			});
		});

		it('keeps user logged in when API is down', async () => {
			mockAuthService.getStoredToken.mockReturnValue('test-token');
			mockAuthService.getStoredUser.mockReturnValue(mockUser);
			mockAuthService.getTokenInfo.mockRejectedValue(new Error('Network error'));

			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());

			render(
				<UserProvider>
					<TestConsumer />
				</UserProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId('user')).toHaveTextContent('johndoe');
			});

			consoleSpy.mockRestore();
		});

		it('logs out on 401 error', async () => {
			mockAuthService.getStoredToken.mockReturnValue('test-token');
			mockAuthService.getStoredUser.mockReturnValue(mockUser);
			mockAuthService.getTokenInfo.mockRejectedValue({ response: { status: 401 } });

			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());

			render(
				<UserProvider>
					<TestConsumer />
				</UserProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId('user')).toHaveTextContent('no-user');
			});

			consoleSpy.mockRestore();
		});

		it('handles no token but has stored user', async () => {
			mockAuthService.getStoredToken.mockReturnValue(null);
			mockAuthService.getStoredUser.mockReturnValue(mockUser);

			render(
				<UserProvider>
					<TestConsumer />
				</UserProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId('user')).toHaveTextContent('johndoe');
			});
		});
	});

	describe('login', () => {
		it('logs in successfully', async () => {
			mockAuthService.getStoredToken.mockReturnValue(null);
			mockAuthService.getStoredUser.mockReturnValue(null);
			mockAuthService.login.mockResolvedValue({ user: mockUser, token: 'new-token' });

			const LoginButton: React.FC = () => {
				const { login, user } = useUser();
				return (
					<>
						<button type="button" onClick={() => login({ email: 'test@example.com', password: 'password' })}>
							Login
						</button>
						<span data-testid="user">{user?.username || 'no-user'}</span>
					</>
				);
			};

			render(
				<UserProvider>
					<LoginButton />
				</UserProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId('user')).toHaveTextContent('no-user');
			});

			await act(async () => {
				screen.getByText('Login').click();
			});

			await waitFor(() => {
				expect(screen.getByTestId('user')).toHaveTextContent('johndoe');
			});
		});
	});

	describe('logout', () => {
		it('logs out successfully', async () => {
			mockAuthService.getStoredToken.mockReturnValue('test-token');
			mockAuthService.getStoredUser.mockReturnValue(mockUser);
			mockAuthService.getTokenInfo.mockResolvedValue({ user: mockUser, token: 'test-token' });
			mockAuthService.logout.mockResolvedValue(undefined);

			const LogoutButton: React.FC = () => {
				const { logout, user } = useUser();
				return (
					<>
						<button type="button" onClick={() => logout()}>
							Logout
						</button>
						<span data-testid="user">{user?.username || 'no-user'}</span>
					</>
				);
			};

			render(
				<UserProvider>
					<LogoutButton />
				</UserProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId('user')).toHaveTextContent('johndoe');
			});

			await act(async () => {
				screen.getByText('Logout').click();
			});

			await waitFor(() => {
				expect(screen.getByTestId('user')).toHaveTextContent('no-user');
			});
		});
	});

	describe('updateUser', () => {
		it('updates user in context and localStorage', async () => {
			mockAuthService.getStoredToken.mockReturnValue('test-token');
			mockAuthService.getStoredUser.mockReturnValue(mockUser);
			mockAuthService.getTokenInfo.mockResolvedValue({ user: mockUser, token: 'test-token' });

			const UpdateButton: React.FC = () => {
				const { updateUser, user } = useUser();
				return (
					<>
						<button type="button" onClick={() => updateUser({ ...mockUser, username: 'updateduser' })}>
							Update
						</button>
						<span data-testid="user">{user?.username || 'no-user'}</span>
					</>
				);
			};

			render(
				<UserProvider>
					<UpdateButton />
				</UserProvider>,
			);

			await waitFor(() => {
				expect(screen.getByTestId('user')).toHaveTextContent('johndoe');
			});

			await act(async () => {
				screen.getByText('Update').click();
			});

			expect(screen.getByTestId('user')).toHaveTextContent('updateduser');
		});
	});
});
