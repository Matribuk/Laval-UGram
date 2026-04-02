import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LikeButton from '../../components/LikeButton/LikeButton';
import { postsService } from '../../services/postsService';

jest.mock('../../services/postsService');
jest.mock('react-toastify', () => ({
	toast: {
		error: jest.fn(),
		success: jest.fn(),
	},
}));

const mockPostsService = postsService as jest.Mocked<typeof postsService>;

describe('LikeButton', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders like button with initial count of 0', async () => {
		mockPostsService.getLikeStatus.mockResolvedValue({
			likeCount: 0,
			likedByCurrentUser: false,
		});

		render(<LikeButton postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByText('0')).toBeInTheDocument();
		});
	});

	it('fetches like status on mount', async () => {
		mockPostsService.getLikeStatus.mockResolvedValue({
			likeCount: 5,
			likedByCurrentUser: true,
		});

		render(<LikeButton postId="post-123" />);

		await waitFor(() => {
			expect(mockPostsService.getLikeStatus).toHaveBeenCalledWith('post-123');
		});
	});

	it('displays correct like count from API', async () => {
		mockPostsService.getLikeStatus.mockResolvedValue({
			likeCount: 42,
			likedByCurrentUser: false,
		});

		render(<LikeButton postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByText('42')).toBeInTheDocument();
		});
	});

	it('applies liked class when likedByCurrentUser is true', async () => {
		mockPostsService.getLikeStatus.mockResolvedValue({
			likeCount: 5,
			likedByCurrentUser: true,
		});

		const { container } = render(<LikeButton postId="post-123" />);

		await waitFor(() => {
			expect(container.querySelector('.like-button.liked')).toBeInTheDocument();
		});
	});

	it('does not apply liked class when likedByCurrentUser is false', async () => {
		mockPostsService.getLikeStatus.mockResolvedValue({
			likeCount: 5,
			likedByCurrentUser: false,
		});

		const { container } = render(<LikeButton postId="post-123" />);

		await waitFor(() => {
			expect(container.querySelector('.like-button')).toBeInTheDocument();
			expect(container.querySelector('.like-button.liked')).not.toBeInTheDocument();
		});
	});

	it('calls likePost when clicking on unliked button', async () => {
		mockPostsService.getLikeStatus.mockResolvedValue({
			likeCount: 5,
			likedByCurrentUser: false,
		});
		mockPostsService.likePost.mockResolvedValue({
			likeCount: 6,
			likedByCurrentUser: true,
		});

		render(<LikeButton postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByText('5')).toBeInTheDocument();
		});

		const button = screen.getByRole('button');
		fireEvent.click(button);

		await waitFor(() => {
			expect(mockPostsService.likePost).toHaveBeenCalledWith('post-123');
			expect(screen.getByText('6')).toBeInTheDocument();
		});
	});

	it('calls unlikePost when clicking on liked button', async () => {
		mockPostsService.getLikeStatus.mockResolvedValue({
			likeCount: 5,
			likedByCurrentUser: true,
		});
		mockPostsService.unlikePost.mockResolvedValue({
			likeCount: 4,
			likedByCurrentUser: false,
		});

		render(<LikeButton postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByText('5')).toBeInTheDocument();
		});

		const button = screen.getByRole('button');
		fireEvent.click(button);

		await waitFor(() => {
			expect(mockPostsService.unlikePost).toHaveBeenCalledWith('post-123');
			expect(screen.getByText('4')).toBeInTheDocument();
		});
	});

	it('hides count when showCount is false', async () => {
		mockPostsService.getLikeStatus.mockResolvedValue({
			likeCount: 5,
			likedByCurrentUser: false,
		});

		render(<LikeButton postId="post-123" showCount={false} />);

		await waitFor(() => {
			expect(mockPostsService.getLikeStatus).toHaveBeenCalled();
		});

		expect(screen.queryByText('5')).not.toBeInTheDocument();
	});

	it('has correct aria-label for unliked state', async () => {
		mockPostsService.getLikeStatus.mockResolvedValue({
			likeCount: 0,
			likedByCurrentUser: false,
		});

		render(<LikeButton postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByRole('button', { name: 'Like' })).toBeInTheDocument();
		});
	});

	it('has correct aria-label for liked state', async () => {
		mockPostsService.getLikeStatus.mockResolvedValue({
			likeCount: 1,
			likedByCurrentUser: true,
		});

		render(<LikeButton postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByRole('button', { name: 'Unlike' })).toBeInTheDocument();
		});
	});

	it('disables button while loading', async () => {
		mockPostsService.getLikeStatus.mockResolvedValue({
			likeCount: 5,
			likedByCurrentUser: false,
		});

		type LikeStatusResolver = (value: { likeCount: number; likedByCurrentUser: boolean }) => void;
		const promiseRef: { resolve: LikeStatusResolver | null } = { resolve: null };
		mockPostsService.likePost.mockImplementation(
			() =>
				new Promise((resolve) => {
					promiseRef.resolve = resolve;
				}),
		);

		render(<LikeButton postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByText('5')).toBeInTheDocument();
		});

		const button = screen.getByRole('button');
		fireEvent.click(button);

		expect(button).toBeDisabled();

		if (promiseRef.resolve) {
			promiseRef.resolve({ likeCount: 6, likedByCurrentUser: true });
		}

		await waitFor(() => {
			expect(button).not.toBeDisabled();
		});
	});
});
