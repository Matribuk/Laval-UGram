import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OAuthCallbackPage from '../../pages/OAuthCallbackPage/OAuthCallbackPage';
import { mockNavigate, useSearchParams } from '../../__mocks__/react-router-dom';
import * as UserContext from '../../components/UserContext';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';

jest.mock('react-router-dom');
jest.mock('../../components/UserContext');
jest.mock('../../services/authService');
jest.mock('react-toastify', () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
	},
}));

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;
const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

describe('OAuthCallbackPage', () => {
	const mockSetUser = jest.fn();

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
		jest.useFakeTimers();
		localStorage.clear();
		mockUseUser.mockReturnValue({
			user: null,
			setUser: mockSetUser,
			updateUser: jest.fn(),
			login: jest.fn(),
			signup: jest.fn(),
			logout: jest.fn(),
			loading: false,
			error: null,
			isAuthenticated: false,
		});
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('shows loading spinner while processing', () => {
		mockUseSearchParams.mockReturnValue([new URLSearchParams('token=abc123'), jest.fn()]);
		render(<OAuthCallbackPage />);
		expect(screen.getByText('Completing authentication...')).toBeInTheDocument();
	});

	it('handles successful OAuth with user param', async () => {
		const userParam = encodeURIComponent(JSON.stringify(mockUser));
		mockUseSearchParams.mockReturnValue([new URLSearchParams(`token=abc123&user=${userParam}`), jest.fn()]);

		render(<OAuthCallbackPage />);

		await waitFor(() => {
			expect(localStorage.getItem('auth_token')).toBe('abc123');
			expect(mockSetUser).toHaveBeenCalledWith(mockUser);
			expect(toast.success).toHaveBeenCalledWith('Successfully logged in with Google!');
			expect(mockNavigate).toHaveBeenCalledWith('/feed');
		});
	});

	it('fetches user info when no user param provided', async () => {
		mockUseSearchParams.mockReturnValue([new URLSearchParams('token=abc123'), jest.fn()]);
		mockAuthService.getTokenInfo.mockResolvedValue({ user: mockUser, token: 'abc123' });

		render(<OAuthCallbackPage />);

		await waitFor(() => {
			expect(mockAuthService.getTokenInfo).toHaveBeenCalled();
			expect(mockSetUser).toHaveBeenCalledWith(mockUser);
		});
	});

	it('shows error when error param is present', async () => {
		mockUseSearchParams.mockReturnValue([new URLSearchParams('error=access_denied'), jest.fn()]);

		render(<OAuthCallbackPage />);

		await waitFor(() => {
			expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
			expect(screen.getByText('access_denied')).toBeInTheDocument();
			expect(toast.error).toHaveBeenCalledWith('Google login failed. Please try again.');
		});

		jest.advanceTimersByTime(3000);
		expect(mockNavigate).toHaveBeenCalledWith('/login');
	});

	it('shows error when no token received', async () => {
		mockUseSearchParams.mockReturnValue([new URLSearchParams(''), jest.fn()]);

		render(<OAuthCallbackPage />);

		await waitFor(() => {
			expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
			expect(screen.getByText('No authentication token received')).toBeInTheDocument();
			expect(toast.error).toHaveBeenCalledWith('Authentication failed. No token received.');
		});

		jest.advanceTimersByTime(3000);
		expect(mockNavigate).toHaveBeenCalledWith('/login');
	});

	it('handles authentication error', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
		mockUseSearchParams.mockReturnValue([new URLSearchParams('token=abc123'), jest.fn()]);
		mockAuthService.getTokenInfo.mockRejectedValue(new Error('Network error'));

		render(<OAuthCallbackPage />);

		await waitFor(() => {
			expect(screen.getByText('Authentication Failed')).toBeInTheDocument();
			expect(toast.error).toHaveBeenCalledWith('Authentication failed. Please try again.');
			expect(localStorage.getItem('auth_token')).toBeNull();
		});

		jest.advanceTimersByTime(3000);
		expect(mockNavigate).toHaveBeenCalledWith('/login');
		consoleSpy.mockRestore();
	});

	it('shows redirect message on error', async () => {
		mockUseSearchParams.mockReturnValue([new URLSearchParams('error=server_error'), jest.fn()]);

		render(<OAuthCallbackPage />);

		await waitFor(() => {
			expect(screen.getByText('Redirecting to login...')).toBeInTheDocument();
		});
	});
});
