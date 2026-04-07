import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RecommendedUsers from '../../components/RecommendedUsers/RecommendedUsers';
import { usersService } from '../../services/usersService';
import { PopularUser } from '../../types/api.types';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
	useNavigate: () => mockNavigate,
}));
jest.mock('../../services/usersService');

const mockUsersService = usersService as jest.Mocked<typeof usersService>;

describe('RecommendedUsers', () => {
	const mockUsers: PopularUser[] = [
		{
			id: 'user-1',
			username: 'alice',
			firstName: 'Alice',
			lastName: 'Smith',
			fullName: 'Alice Smith',
			email: 'alice@test.com',
			avatar: '/avatar1.jpg',
			popularityScore: 42,
		},
		{
			id: 'user-2',
			username: 'bob',
			firstName: 'Bob',
			lastName: 'Jones',
			fullName: 'Bob Jones',
			email: 'bob@test.com',
			avatar: '/avatar2.jpg',
			popularityScore: 35,
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('shows loading state initially', async () => {
		mockUsersService.getRecommendedUsers.mockImplementation(() => new Promise(jest.fn()));
		render(<RecommendedUsers />);
		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	it('renders title', async () => {
		mockUsersService.getRecommendedUsers.mockResolvedValue(mockUsers);
		render(<RecommendedUsers />);

		await waitFor(() => {
			expect(screen.getByText('Suggested for you')).toBeInTheDocument();
		});
	});

	it('renders with horizontal variant', async () => {
		mockUsersService.getRecommendedUsers.mockResolvedValue(mockUsers);
		const { container } = render(<RecommendedUsers variant="horizontal" />);

		await waitFor(() => {
			expect(container.querySelector('.recommended-users--horizontal')).toBeInTheDocument();
		});
	});

	it('renders with vertical variant by default', async () => {
		mockUsersService.getRecommendedUsers.mockResolvedValue(mockUsers);
		const { container } = render(<RecommendedUsers />);

		await waitFor(() => {
			expect(container.querySelector('.recommended-users--vertical')).toBeInTheDocument();
		});
	});

	it('renders recommended users list', async () => {
		mockUsersService.getRecommendedUsers.mockResolvedValue(mockUsers);
		render(<RecommendedUsers />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
			expect(screen.getByText('bob')).toBeInTheDocument();
		});
	});

	it('displays popularity scores', async () => {
		mockUsersService.getRecommendedUsers.mockResolvedValue(mockUsers);
		render(<RecommendedUsers />);

		await waitFor(() => {
			expect(screen.getByText('42 pts')).toBeInTheDocument();
			expect(screen.getByText('35 pts')).toBeInTheDocument();
		});
	});

	it('navigates to user profile on click', async () => {
		mockUsersService.getRecommendedUsers.mockResolvedValue(mockUsers);
		render(<RecommendedUsers />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
		});

		const userButton = screen.getByText('alice').closest('button');
		if (userButton) {
			fireEvent.click(userButton);
		}

		expect(mockNavigate).toHaveBeenCalledWith('/profile/alice');
	});

	it('renders nothing when no users returned', async () => {
		mockUsersService.getRecommendedUsers.mockResolvedValue([]);
		const { container } = render(<RecommendedUsers />);

		await waitFor(() => {
			expect(container.firstChild).toBeNull();
		});
	});

	it('calls service with custom limit', async () => {
		mockUsersService.getRecommendedUsers.mockResolvedValue(mockUsers);
		render(<RecommendedUsers limit={10} />);

		await waitFor(() => {
			expect(mockUsersService.getRecommendedUsers).toHaveBeenCalledWith(10);
		});
	});

	it('handles fetch error gracefully', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
		mockUsersService.getRecommendedUsers.mockRejectedValue(new Error('Network error'));

		render(<RecommendedUsers />);

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch recommended users:', expect.any(Error));
		});

		consoleSpy.mockRestore();
	});
});
