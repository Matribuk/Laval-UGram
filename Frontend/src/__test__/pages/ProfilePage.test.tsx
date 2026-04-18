import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProfilePage from '../../pages/ProfilePage/ProfilePage';
import { mockNavigate, useParams } from '../../__mocks__/react-router-dom';
import * as UserContext from '../../components/UserContext';
import { usersService } from '../../services/usersService';
import { postsService } from '../../services/postsService';
import { toast } from 'react-toastify';

jest.mock('react-router-dom');
jest.mock('../../components/UserContext');
jest.mock('../../services/usersService');
jest.mock('../../services/postsService');
jest.mock('../../components/RecommendedUsers/RecommendedUsers', () => {
	const MockRecommendedUsers = () => <div data-testid="recommended-users" />;
	MockRecommendedUsers.displayName = 'RecommendedUsers';
	return MockRecommendedUsers;
});
jest.mock('react-toastify', () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
	},
}));

jest.mock('../../services/notificationsService', () => ({
	notificationsService: {
		getUnreadCount: jest.fn().mockResolvedValue(0),
	},
}));
jest.mock('../../utils/SvgFile', () => ({
	HomeIcon: () => <svg data-testid="home-icon" />,
	UsersIcon: () => <svg data-testid="users-icon" />,
	ProfileIcon: () => <svg data-testid="profile-icon" />,
	PlusIcon: () => <svg data-testid="plus-icon" />,
	LogoutIcon: () => <svg data-testid="logout-icon" />,
	GridIcon: () => <svg data-testid="grid-icon" />,
	SettingsIcon: () => <svg data-testid="settings-icon" />,
	EmailIcon: () => <svg data-testid="email-icon" />,
	CalendarIcon: () => <svg data-testid="calendar-icon" />,
	PhoneIcon: () => <svg data-testid="phone-icon" />,
	MessageIcon: () => <svg data-testid="message-icon" />,
	BellIcon: () => <svg data-testid="bell-icon" />,
}));

jest.mock('../../services/notificationsService', () => ({
	notificationsService: {
		getUnreadCount: jest.fn().mockResolvedValue(0),
	},
}));

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;
const mockUsersService = usersService as jest.Mocked<typeof usersService>;
const mockPostsService = postsService as jest.Mocked<typeof postsService>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;

describe('ProfilePage', () => {
	const mockCurrentUser = {
		id: 'user-123',
		username: 'johndoe',
		email: 'john@example.com',
		firstName: 'John',
		lastName: 'Doe',
		fullName: 'John Doe',
	};

	const mockProfileUser = {
		id: 'user-123',
		username: 'johndoe',
		email: 'john@example.com',
		firstName: 'John',
		lastName: 'Doe',
		fullName: 'John Doe',
		phoneNumber: '+1234567890',
		createdAt: '2024-01-01T00:00:00Z',
		avatar: '/avatar.jpg',
	};

	const mockPosts = [
		{
			id: 'post-1',
			imageUrl: '/image1.jpg',
			thumbnailUrl: '/image1.jpg',
			mediumUrl: '/image1.jpg',
			caption: '',
			tags: [],
			mentions: [],
			author: { username: 'johndoe' },
			timeAgo: '',
			createdAt: '',
			likeCount: 0,
			commentCount: 0,
			likedByCurrentUser: false,
		},
		{
			id: 'post-2',
			imageUrl: '/image2.jpg',
			thumbnailUrl: '/image2.jpg',
			mediumUrl: '/image2.jpg',
			caption: '',
			tags: [],
			mentions: [],
			author: { username: 'johndoe' },
			timeAgo: '',
			createdAt: '',
			likeCount: 0,
			commentCount: 0,
			likedByCurrentUser: false,
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseParams.mockReturnValue({});
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

	it('shows loading spinner while fetching profile', async () => {
		mockUsersService.getAllUsers.mockImplementation(() => new Promise(jest.fn()));
		render(<ProfilePage />);
		expect(screen.getByText('Loading profile...')).toBeInTheDocument();
	});

	it('renders own profile with edit button', async () => {
		mockUsersService.getAllUsers.mockResolvedValue([mockProfileUser]);
		mockPostsService.getUserPosts.mockResolvedValue(mockPosts);

		render(<ProfilePage />);

		await waitFor(() => {
			expect(screen.getByText('Edit Profile')).toBeInTheDocument();
		});

		expect(screen.getByText('John Doe')).toBeInTheDocument();
	});

	it('renders profile posts count', async () => {
		mockUsersService.getAllUsers.mockResolvedValue([mockProfileUser]);
		mockPostsService.getUserPosts.mockResolvedValue(mockPosts);

		render(<ProfilePage />);

		await waitFor(() => {
			expect(screen.getByText('2')).toBeInTheDocument();
			expect(screen.getByText('posts')).toBeInTheDocument();
		});
	});

	it('renders posts grid', async () => {
		mockUsersService.getAllUsers.mockResolvedValue([mockProfileUser]);
		mockPostsService.getUserPosts.mockResolvedValue(mockPosts);

		const { container } = render(<ProfilePage />);

		await waitFor(() => {
			const thumbnails = container.querySelectorAll('.post-thumbnail');
			expect(thumbnails.length).toBe(2);
		});
	});

	it('navigates to edit profile on button click', async () => {
		mockUsersService.getAllUsers.mockResolvedValue([mockProfileUser]);
		mockPostsService.getUserPosts.mockResolvedValue(mockPosts);

		render(<ProfilePage />);

		await waitFor(() => {
			expect(screen.getByText('Edit Profile')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText('Edit Profile'));
		expect(mockNavigate).toHaveBeenCalledWith('/profile/edit');
	});

	it('navigates to post detail on thumbnail click', async () => {
		mockUsersService.getAllUsers.mockResolvedValue([mockProfileUser]);
		mockPostsService.getUserPosts.mockResolvedValue(mockPosts);

		const { container } = render(<ProfilePage />);

		await waitFor(() => {
			const thumbnails = container.querySelectorAll('.post-thumbnail');
			expect(thumbnails.length).toBe(2);
		});

		const firstThumbnail = container.querySelector('.post-thumbnail');
		if (firstThumbnail) {
			fireEvent.click(firstThumbnail);
		}
		expect(mockNavigate).toHaveBeenCalledWith('/post/post-1');
	});

	it('renders empty state when no posts', async () => {
		mockUsersService.getAllUsers.mockResolvedValue([mockProfileUser]);
		mockPostsService.getUserPosts.mockResolvedValue([]);

		render(<ProfilePage />);

		await waitFor(() => {
			expect(screen.getByText('No posts yet')).toBeInTheDocument();
			expect(screen.getByText('Share your first moment!')).toBeInTheDocument();
		});
	});

	it('shows error and redirects when user not found', async () => {
		mockUsersService.getAllUsers.mockResolvedValue([]);

		render(<ProfilePage />);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('User not found');
			expect(mockNavigate).toHaveBeenCalledWith('/users');
		});
	});

	it('shows error toast on fetch failure', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
		mockUsersService.getAllUsers.mockRejectedValue(new Error('Network error'));

		render(<ProfilePage />);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Failed to load profile');
		});

		consoleSpy.mockRestore();
	});

	it('renders other user profile without edit button', async () => {
		mockUseParams.mockReturnValue({ username: 'otheruser' });
		const otherUser = { ...mockProfileUser, id: 'user-456', username: 'otheruser' };
		mockUsersService.getAllUsers.mockResolvedValue([otherUser]);
		mockPostsService.getUserPosts.mockResolvedValue([]);

		render(<ProfilePage />);

		await waitFor(() => {
			expect(screen.getByText('otheruser')).toBeInTheDocument();
		});

		expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
	});

	it('shows phone number when available', async () => {
		mockUsersService.getAllUsers.mockResolvedValue([mockProfileUser]);
		mockPostsService.getUserPosts.mockResolvedValue([]);

		render(<ProfilePage />);

		await waitFor(() => {
			expect(screen.getByText('+1234567890')).toBeInTheDocument();
		});
	});

	it('renders joined date', async () => {
		mockUsersService.getAllUsers.mockResolvedValue([mockProfileUser]);
		mockPostsService.getUserPosts.mockResolvedValue([]);

		render(<ProfilePage />);

		await waitFor(() => {
			expect(screen.getByText(/Joined/)).toBeInTheDocument();
		});
	});
});
