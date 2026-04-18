import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EditPostPage from '../../pages/EditPostPage/EditPostPage';
import { mockNavigate, useParams } from '../../__mocks__/react-router-dom';
import * as UserContext from '../../components/UserContext';
import { postsService } from '../../services/postsService';
import { usersService } from '../../services/usersService';
import { toast } from 'react-toastify';

jest.mock('react-router-dom');
jest.mock('../../components/UserContext');
jest.mock('../../services/postsService');
jest.mock('../../services/usersService');
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
	BackArrowIcon: () => <svg data-testid="back-arrow-icon" />,
	MessageIcon: () => <svg data-testid="message-icon" />,
	BellIcon: () => <svg data-testid="bell-icon" />,
}));

jest.mock('../../services/notificationsService', () => ({
	notificationsService: {
		getUnreadCount: jest.fn().mockResolvedValue(0),
	},
}));

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;
const mockPostsService = postsService as jest.Mocked<typeof postsService>;
const mockUsersService = usersService as jest.Mocked<typeof usersService>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;

describe('EditPostPage', () => {
	const mockCurrentUser = {
		id: 'user-123',
		username: 'johndoe',
		email: 'john@example.com',
		firstName: 'John',
		lastName: 'Doe',
		fullName: 'John Doe',
	};

	const mockPost = {
		id: 'post-123',
		imageUrl: '/image.jpg',
		thumbnailUrl: '/image.jpg',
		mediumUrl: '/image.jpg',
		caption: 'Original caption',
		tags: ['nature', 'photography'],
		mentions: [],
		author: { username: 'johndoe', avatar: '/avatar.jpg' },
		timeAgo: '2 hours ago',
		createdAt: '2024-01-01T00:00:00Z',
		likeCount: 0,
		commentCount: 0,
		likedByCurrentUser: false,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseParams.mockReturnValue({ id: 'post-123' });
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
		mockUsersService.getAllUsers.mockResolvedValue([]);
	});

	it('shows loading spinner while fetching post', async () => {
		mockPostsService.getPostById.mockImplementation(() => new Promise(jest.fn()));
		render(<EditPostPage />);
		expect(screen.getByText('Loading post...')).toBeInTheDocument();
	});

	it('renders edit form with post data', async () => {
		mockPostsService.getPostById.mockResolvedValue(mockPost);

		render(<EditPostPage />);

		await waitFor(() => {
			expect(screen.getByRole('heading', { name: 'Edit Post' })).toBeInTheDocument();
		});

		expect(screen.getByDisplayValue('Original caption')).toBeInTheDocument();
		expect(screen.getByDisplayValue('nature, photography')).toBeInTheDocument();
		expect(screen.getByAltText('Original caption')).toBeInTheDocument();
	});

	it('shows empty state when post not found', async () => {
		mockPostsService.getPostById.mockResolvedValue(null as never);

		render(<EditPostPage />);

		await waitFor(() => {
			expect(screen.getByText('Post not found')).toBeInTheDocument();
			expect(screen.getByText("This post may have been deleted or doesn't exist.")).toBeInTheDocument();
		});
	});

	it('shows access denied for non-owner', async () => {
		const otherUserPost = { ...mockPost, author: { username: 'otheruser', avatar: '/other.jpg' } };
		mockPostsService.getPostById.mockResolvedValue(otherUserPost);

		render(<EditPostPage />);

		await waitFor(() => {
			expect(screen.getByText('Access denied')).toBeInTheDocument();
			expect(screen.getByText('You can only edit your own posts.')).toBeInTheDocument();
		});
	});

	it('updates post successfully', async () => {
		mockPostsService.getPostById.mockResolvedValue(mockPost);
		mockPostsService.updatePost.mockResolvedValue({ ...mockPost, caption: 'Updated caption' });

		render(<EditPostPage />);

		await waitFor(() => {
			expect(screen.getByDisplayValue('Original caption')).toBeInTheDocument();
		});

		const captionInput = screen.getByDisplayValue('Original caption');
		fireEvent.change(captionInput, { target: { value: 'Updated caption' } });

		fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

		await waitFor(() => {
			expect(mockPostsService.updatePost).toHaveBeenCalledWith('post-123', {
				description: 'Updated caption',
				hashtags: ['nature', 'photography'],
			});
			expect(toast.success).toHaveBeenCalledWith('Post updated successfully');
			expect(mockNavigate).toHaveBeenCalledWith('/post/post-123', { replace: true });
		});
	});

	it('shows error toast on update failure', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
		mockPostsService.getPostById.mockResolvedValue(mockPost);
		mockPostsService.updatePost.mockRejectedValue(new Error('Update failed'));

		render(<EditPostPage />);

		await waitFor(() => {
			expect(screen.getByDisplayValue('Original caption')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Failed to update post');
		});

		consoleSpy.mockRestore();
	});

	it('shows error toast on fetch failure', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
		mockPostsService.getPostById.mockRejectedValue(new Error('Network error'));

		render(<EditPostPage />);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Failed to load post');
		});

		consoleSpy.mockRestore();
	});

	it('navigates back on cancel', async () => {
		mockPostsService.getPostById.mockResolvedValue(mockPost);

		render(<EditPostPage />);

		await waitFor(() => {
			expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
		});

		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(mockNavigate).toHaveBeenCalledWith(-1);
	});

	it('does not fetch post when id is missing', async () => {
		mockUseParams.mockReturnValue({});

		render(<EditPostPage />);

		await waitFor(() => {
			expect(mockPostsService.getPostById).not.toHaveBeenCalled();
		});
	});

	it('renders with empty tags', async () => {
		const postWithoutTags = { ...mockPost, tags: undefined };
		mockPostsService.getPostById.mockResolvedValue(postWithoutTags as never);

		render(<EditPostPage />);

		await waitFor(() => {
			expect(screen.getByRole('heading', { name: 'Edit Post' })).toBeInTheDocument();
		});

		const tagsInput = screen.getByPlaceholderText(/nature, photography, sunset/);
		expect(tagsInput).toHaveValue('');
	});

	it('renders description and hashtags labels', async () => {
		mockPostsService.getPostById.mockResolvedValue(mockPost);

		render(<EditPostPage />);

		await waitFor(() => {
			expect(screen.getByText('Description')).toBeInTheDocument();
			expect(screen.getByText('Hashtags')).toBeInTheDocument();
		});
	});
});
