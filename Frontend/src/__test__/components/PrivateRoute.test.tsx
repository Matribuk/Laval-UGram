import React from 'react';
import { render, screen } from '@testing-library/react';
import { PrivateRoute, RestrictedRoute, NotFoundRedirect } from '../../components/PrivateRoute';
import * as UserContext from '../../components/UserContext';

jest.mock('react-router-dom');
jest.mock('../../components/UserContext');

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;

describe('PrivateRoute', () => {
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
	});

	describe('PrivateRoute', () => {
		it('shows loading spinner when loading', () => {
			mockUseUser.mockReturnValue({
				user: null,
				setUser: jest.fn(),
				updateUser: jest.fn(),
				login: jest.fn(),
				signup: jest.fn(),
				logout: jest.fn(),
				loading: true,
				error: null,
				isAuthenticated: false,
			});

			render(
				<PrivateRoute>
					<div>Protected Content</div>
				</PrivateRoute>
			);

			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		it('renders children when authenticated', () => {
			mockUseUser.mockReturnValue({
				user: mockUser,
				setUser: jest.fn(),
				updateUser: jest.fn(),
				login: jest.fn(),
				signup: jest.fn(),
				logout: jest.fn(),
				loading: false,
				error: null,
				isAuthenticated: true,
			});

			render(
				<PrivateRoute>
					<div>Protected Content</div>
				</PrivateRoute>
			);

			expect(screen.getByText('Protected Content')).toBeInTheDocument();
		});

		it('redirects to login when not authenticated', () => {
			mockUseUser.mockReturnValue({
				user: null,
				setUser: jest.fn(),
				updateUser: jest.fn(),
				login: jest.fn(),
				signup: jest.fn(),
				logout: jest.fn(),
				loading: false,
				error: null,
				isAuthenticated: false,
			});

			render(
				<PrivateRoute>
					<div>Protected Content</div>
				</PrivateRoute>
			);

			expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
		});
	});

	describe('RestrictedRoute', () => {
		it('shows loading spinner when loading', () => {
			mockUseUser.mockReturnValue({
				user: null,
				setUser: jest.fn(),
				updateUser: jest.fn(),
				login: jest.fn(),
				signup: jest.fn(),
				logout: jest.fn(),
				loading: true,
				error: null,
				isAuthenticated: false,
			});

			render(
				<RestrictedRoute>
					<div>Login Page</div>
				</RestrictedRoute>
			);

			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		it('renders children when not authenticated', () => {
			mockUseUser.mockReturnValue({
				user: null,
				setUser: jest.fn(),
				updateUser: jest.fn(),
				login: jest.fn(),
				signup: jest.fn(),
				logout: jest.fn(),
				loading: false,
				error: null,
				isAuthenticated: false,
			});

			render(
				<RestrictedRoute>
					<div>Login Page</div>
				</RestrictedRoute>
			);

			expect(screen.getByText('Login Page')).toBeInTheDocument();
		});

		it('redirects to feed when authenticated', () => {
			mockUseUser.mockReturnValue({
				user: mockUser,
				setUser: jest.fn(),
				updateUser: jest.fn(),
				login: jest.fn(),
				signup: jest.fn(),
				logout: jest.fn(),
				loading: false,
				error: null,
				isAuthenticated: true,
			});

			render(
				<RestrictedRoute>
					<div>Login Page</div>
				</RestrictedRoute>
			);

			expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
		});
	});

	describe('NotFoundRedirect', () => {
		it('shows loading spinner when loading', () => {
			mockUseUser.mockReturnValue({
				user: null,
				setUser: jest.fn(),
				updateUser: jest.fn(),
				login: jest.fn(),
				signup: jest.fn(),
				logout: jest.fn(),
				loading: true,
				error: null,
				isAuthenticated: false,
			});

			render(<NotFoundRedirect />);

			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		it('redirects when not loading', () => {
			mockUseUser.mockReturnValue({
				user: null,
				setUser: jest.fn(),
				updateUser: jest.fn(),
				login: jest.fn(),
				signup: jest.fn(),
				logout: jest.fn(),
				loading: false,
				error: null,
				isAuthenticated: false,
			});

			const { container } = render(<NotFoundRedirect />);
			expect(container.innerHTML).toBe('');
		});
	});
});
