import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PostDetailPage from '../../pages/PostDetailPage/PostDetailPage';
import { mockNavigate, useParams } from '../../__mocks__/react-router-dom';
import * as UserContext from '../../components/UserContext';
import { postsService } from '../../services/postsService';
import { toast } from 'react-toastify';

jest.mock('react-router-dom');
jest.mock('../../components/UserContext');
jest.mock('../../services/postsService');
jest.mock('react-toastify', () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
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
}));

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;
const mockPostsService = postsService as jest.Mocked<typeof postsService>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;

describe('PostDetailPage', () => {
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
		caption: 'Test caption @mentioned',
		tags: ['nature', 'photography'],
		mentions: ['mentioned'],
		author: { username: 'johndoe', avatar: '/avatar.jpg' },
		timeAgo: '2 hours ago',
		createdAt: '2024-01-01T00:00:00Z',
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
	});

	it('shows loading spinner while fetching post', async () => {
		mockPostsService.getPostById.mockImplementation(() => new Promise(() => {}));
		render(<PostDetailPage />);
		expect(screen.getByText('Loading post...')).toBeInTheDocument();
	});

	it('renders post details successfully', async () => {
		mockPostsService.getPostById.mockResolvedValue(mockPost);

		const { container } = render(<PostDetailPage />);

		await waitFor(() => {
			expect(container.querySelector('.author-username')).toHaveTextContent('johndoe');
		});

		expect(screen.getByAltText('Test caption @mentioned')).toBeInTheDocument();
		expect(container.querySelector('.post-tags')).toBeInTheDocument();
	});

	it('shows edit and delete buttons for post owner', async () => {
		mockPostsService.getPostById.mockResolvedValue(mockPost);

		render(<PostDetailPage />);

		await waitFor(() => {
			expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
		});
	});

	it('hides edit and delete buttons for non-owner', async () => {
		const otherUserPost = { ...mockPost, author: { username: 'otheruser', avatar: '/other.jpg' } };
		mockPostsService.getPostById.mockResolvedValue(otherUserPost);

		const { container } = render(<PostDetailPage />);

		await waitFor(() => {
			expect(container.querySelector('.author-username')).toHaveTextContent('otheruser');
		});

		expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
	});

	it('navigates to edit page on edit button click', async () => {
		mockPostsService.getPostById.mockResolvedValue(mockPost);

		render(<PostDetailPage />);

		await waitFor(() => {
			expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
		});

		fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
		expect(mockNavigate).toHaveBeenCalledWith('/post/post-123/edit');
	});

	it('shows delete confirmation modal', async () => {
		mockPostsService.getPostById.mockResolvedValue(mockPost);

		render(<PostDetailPage />);

		await waitFor(() => {
			expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
		});

		fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

		expect(screen.getByText('Delete Post')).toBeInTheDocument();
		expect(screen.getByText('Are you sure you want to delete this post? This action cannot be undone.')).toBeInTheDocument();
	});

	it('deletes post successfully', async () => {
		mockPostsService.getPostById.mockResolvedValue(mockPost);
		mockPostsService.deletePost.mockResolvedValue(undefined);

		render(<PostDetailPage />);

		await waitFor(() => {
			expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
		});

		fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

		const confirmButton = screen.getAllByRole('button', { name: 'Delete' })[1];
		fireEvent.click(confirmButton);

		await waitFor(() => {
			expect(mockPostsService.deletePost).toHaveBeenCalledWith('post-123');
			expect(toast.success).toHaveBeenCalledWith('Post deleted successfully');
			expect(mockNavigate).toHaveBeenCalledWith('/feed');
		});
	});

	it('shows error toast on delete failure', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		mockPostsService.getPostById.mockResolvedValue(mockPost);
		mockPostsService.deletePost.mockRejectedValue(new Error('Delete failed'));

		render(<PostDetailPage />);

		await waitFor(() => {
			expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
		});

		fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
		const confirmButton = screen.getAllByRole('button', { name: 'Delete' })[1];
		fireEvent.click(confirmButton);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Failed to delete post');
		});

		consoleSpy.mockRestore();
	});

	it('shows empty state when post not found', async () => {
		mockPostsService.getPostById.mockResolvedValue(null);

		render(<PostDetailPage />);

		await waitFor(() => {
			expect(screen.getByText('Post not found')).toBeInTheDocument();
			expect(screen.getByText("This post may have been deleted or doesn't exist.")).toBeInTheDocument();
		});
	});

	it('shows error toast on fetch failure', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		mockPostsService.getPostById.mockRejectedValue(new Error('Network error'));

		render(<PostDetailPage />);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Failed to load post');
		});

		consoleSpy.mockRestore();
	});

	it('renders mentions section when post has mentions', async () => {
		mockPostsService.getPostById.mockResolvedValue(mockPost);

		const { container } = render(<PostDetailPage />);

		await waitFor(() => {
			expect(screen.getByText('Mentions:')).toBeInTheDocument();
			expect(container.querySelector('.post-mentions')).toBeInTheDocument();
		});
	});

	it('does not render mentions section when no mentions', async () => {
		const postWithoutMentions = { ...mockPost, mentions: [] };
		mockPostsService.getPostById.mockResolvedValue(postWithoutMentions);

		render(<PostDetailPage />);

		await waitFor(() => {
			expect(screen.getByText('johndoe')).toBeInTheDocument();
		});

		expect(screen.queryByText('Mentions:')).not.toBeInTheDocument();
	});

	it('does not render tags section when no tags', async () => {
		const postWithoutTags = { ...mockPost, tags: [] };
		mockPostsService.getPostById.mockResolvedValue(postWithoutTags);

		render(<PostDetailPage />);

		await waitFor(() => {
			expect(screen.getByText('johndoe')).toBeInTheDocument();
		});

		expect(screen.queryByText('#nature')).not.toBeInTheDocument();
	});

	it('does not fetch post when id is missing', async () => {
		mockUseParams.mockReturnValue({});

		render(<PostDetailPage />);

		await waitFor(() => {
			expect(mockPostsService.getPostById).not.toHaveBeenCalled();
		});
	});

	it('cancels delete on cancel button click', async () => {
		mockPostsService.getPostById.mockResolvedValue(mockPost);

		render(<PostDetailPage />);

		await waitFor(() => {
			expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
		});

		fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
		expect(screen.getByText('Delete Post')).toBeInTheDocument();

		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

		await waitFor(() => {
			expect(screen.queryByText('Delete Post')).not.toBeInTheDocument();
		});
	});
});
