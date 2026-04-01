import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '../../pages/HomePage/HomePage';
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
}));

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;
const mockPostsService = postsService as jest.Mocked<typeof postsService>;

describe('HomePage', () => {
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
			caption: 'First post',
			tags: ['tag1'],
			mentions: [],
		},
		{
			id: 'post-2',
			author: { username: 'bob', avatar: '/avatar2.jpg' },
			timeAgo: '',
			createdAt: new Date().toISOString(),
			imageUrl: '/image2.jpg',
			caption: 'Second post',
			tags: ['tag2'],
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

	it('shows loading spinner while fetching posts', async () => {
		mockPostsService.getAllPosts.mockImplementation(() => new Promise(jest.fn()));
		render(<HomePage />);
		expect(screen.getByText('Loading posts...')).toBeInTheDocument();
	});

	it('renders feed with posts', async () => {
		mockPostsService.getAllPosts.mockResolvedValue(mockPosts);
		render(<HomePage />);

		await waitFor(() => {
			expect(screen.getByRole('heading', { name: 'Feed' })).toBeInTheDocument();
		});

		expect(screen.getByText('First post')).toBeInTheDocument();
		expect(screen.getByText('Second post')).toBeInTheDocument();
	});

	it('renders empty state when no posts', async () => {
		mockPostsService.getAllPosts.mockResolvedValue([]);
		render(<HomePage />);

		await waitFor(() => {
			expect(screen.getByText('No posts yet. Be the first to share something!')).toBeInTheDocument();
		});
	});

	it('shows end message after posts', async () => {
		mockPostsService.getAllPosts.mockResolvedValue(mockPosts);
		render(<HomePage />);

		await waitFor(() => {
			expect(screen.getByText("You've reached the end")).toBeInTheDocument();
		});
	});

	it('shows error toast on fetch failure', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
		mockPostsService.getAllPosts.mockRejectedValue(new Error('Network error'));
		render(<HomePage />);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Failed to load posts');
		});

		consoleSpy.mockRestore();
	});

	it('handles non-array response', async () => {
		mockPostsService.getAllPosts.mockResolvedValue(null as unknown as typeof mockPosts);
		render(<HomePage />);

		await waitFor(() => {
			expect(screen.getByText('No posts yet. Be the first to share something!')).toBeInTheDocument();
		});
	});

	it('renders PostCard for each post', async () => {
		mockPostsService.getAllPosts.mockResolvedValue(mockPosts);
		const { container } = render(<HomePage />);

		await waitFor(() => {
			const postCards = container.querySelectorAll('.post-card');
			expect(postCards.length).toBe(2);
		});
	});
});
