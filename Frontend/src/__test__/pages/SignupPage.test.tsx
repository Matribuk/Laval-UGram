import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupPage from '../../pages/SignupPage/SignupPage';
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
	GoogleIcon: () => <svg data-testid="google-icon" />,
}));

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;

describe('SignupPage', () => {
	const mockSignup = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseUser.mockReturnValue({
			user: null,
			setUser: jest.fn(),
			updateUser: jest.fn(),
			login: jest.fn(),
			signup: mockSignup,
			logout: jest.fn(),
			loading: false,
			error: null,
			isAuthenticated: false,
		});
	});

	it('renders signup form', () => {
		render(<SignupPage />);
		expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
		expect(screen.getByLabelText('First Name')).toBeInTheDocument();
		expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
		expect(screen.getByLabelText('Username *')).toBeInTheDocument();
		expect(screen.getByLabelText('Email *')).toBeInTheDocument();
		expect(screen.getByLabelText('Password *')).toBeInTheDocument();
		expect(screen.getByLabelText('Confirm Password *')).toBeInTheDocument();
	});

	it('renders auth header with tagline', () => {
		render(<SignupPage />);
		expect(screen.getByText('Join the community')).toBeInTheDocument();
	});

	it('renders signin link', () => {
		render(<SignupPage />);
		expect(screen.getByText('Already have an account?')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
	});

	it('submits form with valid data', async () => {
		mockSignup.mockResolvedValue(undefined);
		render(<SignupPage />);

		fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
		fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
		fireEvent.change(screen.getByLabelText('Username *'), { target: { value: 'johndoe' } });
		fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'john@example.com' } });
		fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password123' } });
		fireEvent.change(screen.getByLabelText('Confirm Password *'), { target: { value: 'password123' } });
		fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

		await waitFor(() => {
			expect(mockSignup).toHaveBeenCalledWith({
				email: 'john@example.com',
				password: 'password123',
				username: 'johndoe',
				firstName: 'John',
				lastName: 'Doe',
			});
		});
	});

	it('shows success toast and navigates on successful signup', async () => {
		mockSignup.mockResolvedValue(undefined);
		render(<SignupPage />);

		fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
		fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
		fireEvent.change(screen.getByLabelText('Username *'), { target: { value: 'johndoe' } });
		fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'john@example.com' } });
		fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password123' } });
		fireEvent.change(screen.getByLabelText('Confirm Password *'), { target: { value: 'password123' } });
		fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

		await waitFor(() => {
			expect(toast.success).toHaveBeenCalledWith('Account created successfully! Welcome to Ugram!');
			expect(mockNavigate).toHaveBeenCalledWith('/feed');
		});
	});

	it('shows error toast on signup failure', async () => {
		mockSignup.mockRejectedValue(new Error('Email already exists'));
		render(<SignupPage />);

		fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
		fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
		fireEvent.change(screen.getByLabelText('Username *'), { target: { value: 'johndoe' } });
		fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'john@example.com' } });
		fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password123' } });
		fireEvent.change(screen.getByLabelText('Confirm Password *'), { target: { value: 'password123' } });
		fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Email already exists');
		});
	});

	it('shows generic error on non-Error failure', async () => {
		mockSignup.mockRejectedValue('Something went wrong');
		render(<SignupPage />);

		fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
		fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
		fireEvent.change(screen.getByLabelText('Username *'), { target: { value: 'johndoe' } });
		fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'john@example.com' } });
		fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password123' } });
		fireEvent.change(screen.getByLabelText('Confirm Password *'), { target: { value: 'password123' } });
		fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Signup failed. Please try again.');
		});
	});

	it('renders subtitle text', () => {
		render(<SignupPage />);
		expect(screen.getByText('Enter your details to get started')).toBeInTheDocument();
	});
});
