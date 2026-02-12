import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../../pages/LoginPage/LoginPage';
import { mockNavigate } from '../../__mocks__/react-router-dom';
import * as UserContext from '../../components/UserContext';
import { toast } from 'react-toastify';

jest.mock('react-router-dom');
jest.mock('../../components/UserContext');
jest.mock('react-toastify', () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
	},
}));
jest.mock('../../utils/SvgFile', () => ({
	EyeIcon: () => <svg data-testid="eye-icon" />,
	EyeOffIcon: () => <svg data-testid="eye-off-icon" />,
}));

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;

describe('LoginPage', () => {
	const mockLogin = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseUser.mockReturnValue({
			user: null,
			setUser: jest.fn(),
			updateUser: jest.fn(),
			login: mockLogin,
			signup: jest.fn(),
			logout: jest.fn(),
			loading: false,
			error: null,
			isAuthenticated: false,
		});
	});

	it('renders login form', () => {
		render(<LoginPage />);
		expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByLabelText('Password')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
	});

	it('renders auth header with tagline', () => {
		render(<LoginPage />);
		expect(screen.getByText('Share your moments')).toBeInTheDocument();
	});

	it('renders signup link', () => {
		render(<LoginPage />);
		expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Create one' })).toHaveAttribute('href', '/signup');
	});

	it('submits form with valid credentials', async () => {
		mockLogin.mockResolvedValue(undefined);
		render(<LoginPage />);

		fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
		fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
		fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

		await waitFor(() => {
			expect(mockLogin).toHaveBeenCalledWith({
				email: 'test@example.com',
				password: 'password123',
			});
		});
	});

	it('shows success toast and navigates on successful login', async () => {
		mockLogin.mockResolvedValue(undefined);
		render(<LoginPage />);

		fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
		fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
		fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

		await waitFor(() => {
			expect(toast.success).toHaveBeenCalledWith('Successfully logged in!');
			expect(mockNavigate).toHaveBeenCalledWith('/feed');
		});
	});

	it('shows error toast on login failure', async () => {
		mockLogin.mockRejectedValue(new Error('Invalid credentials'));
		render(<LoginPage />);

		fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
		fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
		fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
		});
	});

	it('shows generic error message on non-Error failure', async () => {
		mockLogin.mockRejectedValue('Something went wrong');
		render(<LoginPage />);

		fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
		fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
		fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Login failed. Please check your credentials.');
		});
	});

	it('renders subtitle text', () => {
		render(<LoginPage />);
		expect(screen.getByText('Enter your email and password to access your account')).toBeInTheDocument();
	});
});
