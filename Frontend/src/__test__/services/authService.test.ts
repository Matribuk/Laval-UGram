import { authService } from '../../services/authService';
import api from '../../services/api';

jest.mock('../../services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('authService', () => {
	const mockBackendUser = {
		id: 'user-123',
		username: 'johndoe',
		email: 'john@example.com',
		firstName: 'John',
		lastName: 'Doe',
	};

	const mockAuthResponse = {
		accessToken: 'mock-token',
		user: mockBackendUser,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		localStorage.clear();
	});

	describe('getStoredToken', () => {
		it('returns null when no token stored', () => {
			expect(authService.getStoredToken()).toBeNull();
		});

		it('returns token when stored', () => {
			localStorage.setItem('auth_token', 'test-token');
			expect(authService.getStoredToken()).toBe('test-token');
		});
	});

	describe('getStoredUser', () => {
		it('returns null when no user stored', () => {
			expect(authService.getStoredUser()).toBeNull();
		});

		it('returns user when stored', () => {
			const user = { id: '1', username: 'test' };
			localStorage.setItem('auth_user', JSON.stringify(user));
			expect(authService.getStoredUser()).toEqual(user);
		});

		it('returns null for invalid JSON', () => {
			localStorage.setItem('auth_user', 'invalid-json');
			expect(authService.getStoredUser()).toBeNull();
		});
	});

	describe('login', () => {
		it('stores token and user on successful login', async () => {
			mockApi.post.mockResolvedValue({ data: mockAuthResponse });

			const result = await authService.login({ email: 'john@example.com', password: 'password' });

			expect(result.token).toBe('mock-token');
			expect(result.user.username).toBe('johndoe');
			expect(localStorage.getItem('auth_token')).toBe('mock-token');
			expect(localStorage.getItem('auth_user')).toBeTruthy();
		});

		it('throws error on failed login', async () => {
			mockApi.post.mockRejectedValue({
				response: { data: { message: 'Invalid credentials' } },
			});

			await expect(authService.login({ email: 'wrong@example.com', password: 'wrong' })).rejects.toThrow(
				'Invalid credentials',
			);
		});

		it('throws default error message when no response message', async () => {
			mockApi.post.mockRejectedValue({});

			await expect(authService.login({ email: 'test@example.com', password: 'test' })).rejects.toThrow(
				'Login failed. Please check your credentials.',
			);
		});
	});

	describe('signup', () => {
		it('stores token and user on successful signup', async () => {
			mockApi.post.mockResolvedValue({ data: mockAuthResponse });

			const result = await authService.signup({
				email: 'john@example.com',
				password: 'password',
				username: 'johndoe',
				firstName: 'John',
				lastName: 'Doe',
			});

			expect(result.token).toBe('mock-token');
			expect(result.user.username).toBe('johndoe');
			expect(localStorage.getItem('auth_token')).toBe('mock-token');
		});

		it('throws error on failed signup', async () => {
			mockApi.post.mockRejectedValue({
				response: { data: { message: 'Email already exists' } },
			});

			await expect(
				authService.signup({
					email: 'existing@example.com',
					password: 'password',
					username: 'test',
					firstName: 'Test',
					lastName: 'User',
				}),
			).rejects.toThrow('Email already exists');
		});

		it('throws default error message when no response message', async () => {
			mockApi.post.mockRejectedValue({});

			await expect(
				authService.signup({
					email: 'test@example.com',
					password: 'password',
					username: 'test',
					firstName: 'Test',
					lastName: 'User',
				}),
			).rejects.toThrow('Signup failed. Please try again.');
		});
	});

	describe('logout', () => {
		it('clears stored token and user', async () => {
			localStorage.setItem('auth_token', 'test-token');
			localStorage.setItem('auth_user', JSON.stringify({ id: '1' }));

			await authService.logout();

			expect(localStorage.getItem('auth_token')).toBeNull();
			expect(localStorage.getItem('auth_user')).toBeNull();
		});
	});

	describe('getTokenInfo', () => {
		it('returns token and user when authenticated', async () => {
			localStorage.setItem('auth_token', 'test-token');
			localStorage.setItem('auth_user', JSON.stringify({ id: '1', username: 'test' }));

			const result = await authService.getTokenInfo();

			expect(result.token).toBe('test-token');
			expect(result.user.username).toBe('test');
		});

		it('throws error when not authenticated', async () => {
			await expect(authService.getTokenInfo()).rejects.toThrow('Not authenticated');
		});

		it('throws error when token missing', async () => {
			localStorage.setItem('auth_user', JSON.stringify({ id: '1' }));
			await expect(authService.getTokenInfo()).rejects.toThrow('Not authenticated');
		});

		it('throws error when user missing', async () => {
			localStorage.setItem('auth_token', 'test-token');
			await expect(authService.getTokenInfo()).rejects.toThrow('Not authenticated');
		});
	});
});
