import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SearchPage from '../../pages/SearchPage/SearchPage';
import { useParams, useSearchParams } from '../../__mocks__/react-router-dom';
import * as UserContext from '../../components/UserContext';
import { postsService } from '../../services/postsService';
import { toast } from 'react-toastify';

jest.mock('react-router-dom');
jest.mock('../../components/UserContext');
jest.mock('../../services/postsService');
jest.mock('react-toastify', () => ({
	toast: {
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
	HeartIcon: () => <svg data-testid="heart-icon" />,
	CommentIcon: () => <svg data-testid="comment-icon" />,
	TrashIcon: () => <svg data-testid="trash-icon" />,
	SendIcon: () => <svg data-testid="send-icon" />,
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
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

describe('SearchPage', () => {
	const mockUser = {
		id: 'user-123',
		username: 'johndoe',
		email: 'john@example.com',
		firstName: 'John',
		lastName: 'Doe',
		fullName: 'John Doe',
	};

	const mockPosts = [
		{
			id: 'post-1',
			author: { username: 'alice', avatar: '/avatar1.jpg' },
			timeAgo: '',
			createdAt: new Date().toISOString(),
			imageUrl: '/image1.jpg',
			caption: 'Beach vacation',
			tags: ['travel'],
			mentions: [],
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
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
		mockPostsService.getComments.mockResolvedValue([]);
		mockPostsService.getLikeStatus.mockResolvedValue({ likeCount: 0, likedByCurrentUser: false });
	});

	describe('hashtag search', () => {
		beforeEach(() => {
			mockUseParams.mockReturnValue({ hashtag: 'travel' });
			mockUseSearchParams.mockReturnValue([new URLSearchParams(), jest.fn()]);
		});

		it('shows loading spinner while searching', async () => {
			mockPostsService.getPostsByHashtag.mockImplementation(() => new Promise(jest.fn()));
			render(<SearchPage />);
			expect(screen.getByText('Searching...')).toBeInTheDocument();
		});

		it('displays hashtag title', async () => {
			mockPostsService.getPostsByHashtag.mockResolvedValue(mockPosts);
			render(<SearchPage />);

			await waitFor(() => {
				expect(screen.getByRole('heading', { name: '#travel' })).toBeInTheDocument();
			});
		});

		it('renders posts for hashtag search', async () => {
			mockPostsService.getPostsByHashtag.mockResolvedValue(mockPosts);
			render(<SearchPage />);

			await waitFor(() => {
				expect(screen.getByText('Beach vacation')).toBeInTheDocument();
			});
			expect(mockPostsService.getPostsByHashtag).toHaveBeenCalledWith('travel');
		});

		it('shows empty state for no results', async () => {
			mockPostsService.getPostsByHashtag.mockResolvedValue([]);
			render(<SearchPage />);

			await waitFor(() => {
				expect(screen.getByText('No posts found with hashtag #travel')).toBeInTheDocument();
			});
		});

		it('shows error toast on fetch failure', async () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
			mockPostsService.getPostsByHashtag.mockRejectedValue(new Error('Network error'));
			render(<SearchPage />);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith('Failed to search posts');
			});
			consoleSpy.mockRestore();
		});
	});

	describe('description search', () => {
		beforeEach(() => {
			mockUseParams.mockReturnValue({});
			mockUseSearchParams.mockReturnValue([new URLSearchParams('q=vacation'), jest.fn()]);
		});

		it('displays search title', async () => {
			mockPostsService.searchByDescription.mockResolvedValue(mockPosts);
			render(<SearchPage />);

			await waitFor(() => {
				expect(screen.getByRole('heading', { name: 'Search: "vacation"' })).toBeInTheDocument();
			});
		});

		it('renders posts for description search', async () => {
			mockPostsService.searchByDescription.mockResolvedValue(mockPosts);
			render(<SearchPage />);

			await waitFor(() => {
				expect(screen.getByText('Beach vacation')).toBeInTheDocument();
			});
			expect(mockPostsService.searchByDescription).toHaveBeenCalledWith('vacation');
		});

		it('shows empty state for no results', async () => {
			mockPostsService.searchByDescription.mockResolvedValue([]);
			render(<SearchPage />);

			await waitFor(() => {
				expect(screen.getByText('No posts found matching "vacation"')).toBeInTheDocument();
			});
		});

		it('shows post count', async () => {
			mockPostsService.searchByDescription.mockResolvedValue(mockPosts);
			render(<SearchPage />);

			await waitFor(() => {
				expect(screen.getByText('1 post found')).toBeInTheDocument();
			});
		});

		it('shows plural post count for multiple posts', async () => {
			mockPostsService.searchByDescription.mockResolvedValue([...mockPosts, { ...mockPosts[0], id: 'post-2' }]);
			render(<SearchPage />);

			await waitFor(() => {
				expect(screen.getByText('2 posts found')).toBeInTheDocument();
			});
		});
	});

	describe('empty search', () => {
		it('shows empty state when no search term', async () => {
			mockUseParams.mockReturnValue({});
			mockUseSearchParams.mockReturnValue([new URLSearchParams(), jest.fn()]);

			render(<SearchPage />);

			await waitFor(() => {
				expect(screen.getByText('No posts found matching ""')).toBeInTheDocument();
			});
		});
	});
});
