import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UsersPage from '../../pages/UsersPage/UsersPage';
import { mockNavigate } from '../../__mocks__/react-router-dom';
import * as UserContext from '../../components/UserContext';
import { usersService } from '../../services/usersService';
import { toast } from 'react-toastify';

jest.mock('react-router-dom');
jest.mock('../../components/UserContext');
jest.mock('../../services/usersService');
jest.mock('react-toastify', () => ({
	toast: {
		error: jest.fn(),
	},
}));
jest.mock('../../utils/SvgFile', () => ({
	HomeIcon: () => <svg data-testid="home-icon" />,
	UsersIcon: () => <svg data-testid="users-icon" />,
	ProfileIcon: () => <svg data-testid="profile-icon" />,
	PlusIcon: () => <svg data-testid="plus-icon" />,
	LogoutIcon: () => <svg data-testid="logout-icon" />,
	SearchIcon: () => <svg data-testid="search-icon" />,
	MessageIcon: () => <svg data-testid="message-icon" />,
}));

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;
const mockUsersService = usersService as jest.Mocked<typeof usersService>;

describe('UsersPage', () => {
	const mockCurrentUser = {
		id: 'current-user',
		username: 'currentuser',
		email: 'current@example.com',
		firstName: 'Current',
		lastName: 'User',
		fullName: 'Current User',
	};

	const mockUsers = [
		{
			id: 'user-1',
			username: 'alice',
			email: 'alice@example.com',
			firstName: 'Alice',
			lastName: 'Smith',
			fullName: 'Alice Smith',
			avatar: '/avatar1.jpg',
		},
		{
			id: 'user-2',
			username: 'bob',
			email: 'bob@example.com',
			firstName: 'Bob',
			lastName: 'Jones',
			fullName: 'Bob Jones',
			avatar: '/avatar2.jpg',
		},
		{
			id: 'current-user',
			username: 'currentuser',
			email: 'current@example.com',
			firstName: 'Current',
			lastName: 'User',
			fullName: 'Current User',
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseUser.mockReturnValue({
			user: mockCurrentUser,
			setUser: jest.fn(),
			updateUser: jest.fn(),
			login: jest.fn(),
			signup: jest.fn(),
			logout: jest.fn(),
			loading: false,
			error: null,
			isAuthenticated: true,
		});
	});

	it('shows loading spinner while fetching users', async () => {
		mockUsersService.getAllUsers.mockImplementation(() => new Promise(jest.fn()));
		render(<UsersPage />);
		expect(screen.getByText('Loading users...')).toBeInTheDocument();
	});

	it('renders users page with title', async () => {
		mockUsersService.getAllUsers.mockResolvedValue(mockUsers);
		render(<UsersPage />);

		await waitFor(() => {
			expect(screen.getByRole('heading', { name: 'Discover' })).toBeInTheDocument();
		});
	});

	it('renders users excluding current user from users list', async () => {
		mockUsersService.getAllUsers.mockResolvedValue(mockUsers);
		const { container } = render(<UsersPage />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
			expect(screen.getByText('bob')).toBeInTheDocument();
		});

		const userCards = container.querySelectorAll('.users-list .user-card');
		expect(userCards.length).toBe(2);
	});

	it('renders search input', async () => {
		mockUsersService.getAllUsers.mockResolvedValue(mockUsers);
		render(<UsersPage />);

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
		});
	});

	it('filters users by username', async () => {
		mockUsersService.getAllUsers.mockResolvedValue(mockUsers);
		render(<UsersPage />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
		});

		fireEvent.change(screen.getByPlaceholderText('Search users...'), {
			target: { value: 'alice' },
		});

		expect(screen.getByText('alice')).toBeInTheDocument();
		expect(screen.queryByText('bob')).not.toBeInTheDocument();
	});

	it('filters users by fullName', async () => {
		mockUsersService.getAllUsers.mockResolvedValue(mockUsers);
		render(<UsersPage />);

		await waitFor(() => {
			expect(screen.getByText('Bob Jones')).toBeInTheDocument();
		});

		fireEvent.change(screen.getByPlaceholderText('Search users...'), {
			target: { value: 'Jones' },
		});

		expect(screen.getByText('bob')).toBeInTheDocument();
		expect(screen.queryByText('alice')).not.toBeInTheDocument();
	});

	it('filters users by email', async () => {
		mockUsersService.getAllUsers.mockResolvedValue(mockUsers);
		render(<UsersPage />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
		});

		fireEvent.change(screen.getByPlaceholderText('Search users...'), {
			target: { value: 'bob@example' },
		});

		expect(screen.getByText('bob')).toBeInTheDocument();
		expect(screen.queryByText('alice')).not.toBeInTheDocument();
	});

	it('shows empty state when no users match filter', async () => {
		mockUsersService.getAllUsers.mockResolvedValue(mockUsers);
		render(<UsersPage />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
		});

		fireEvent.change(screen.getByPlaceholderText('Search users...'), {
			target: { value: 'nonexistent' },
		});

		expect(screen.getByText('No users found')).toBeInTheDocument();
	});

	it('navigates to user profile on click', async () => {
		mockUsersService.getAllUsers.mockResolvedValue(mockUsers);
		render(<UsersPage />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
		});

		const aliceCard = screen.getByText('alice').closest('.user-card');
		if (aliceCard) {
			fireEvent.click(aliceCard);
		}

		expect(mockNavigate).toHaveBeenCalledWith('/profile/alice');
	});

	it('shows error toast on fetch failure', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
		mockUsersService.getAllUsers.mockRejectedValue(new Error('Network error'));
		render(<UsersPage />);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Failed to load users');
		});

		consoleSpy.mockRestore();
	});

	it('handles non-array response', async () => {
		mockUsersService.getAllUsers.mockResolvedValue(null as unknown as typeof mockUsers);
		render(<UsersPage />);

		await waitFor(() => {
			expect(screen.getByText('No users found')).toBeInTheDocument();
		});
	});
});
