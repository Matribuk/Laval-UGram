import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommentsSection from '../../components/CommentsSection/CommentsSection';
import { postsService } from '../../services/postsService';
import { useUser } from '../../components/UserContext';
import { Comment } from '../../types/api.types';

jest.mock('react-router-dom');
jest.mock('../../services/postsService');
jest.mock('../../components/UserContext');
jest.mock('react-toastify', () => ({
	toast: {
		error: jest.fn(),
		success: jest.fn(),
	},
}));

const mockPostsService = postsService as jest.Mocked<typeof postsService>;
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

describe('CommentsSection', () => {
	const mockUser = {
		id: 'user-123',
		username: 'currentuser',
		email: 'current@example.com',
		firstName: 'Current',
		lastName: 'User',
		fullName: 'Current User',
	};

	const mockComments: Comment[] = [
		{
			id: 'comment-1',
			content: 'Great post!',
			imageId: 'post-123',
			user: {
				id: 'user-456',
				username: 'johndoe',
				email: 'john@example.com',
				firstName: 'John',
				lastName: 'Doe',
			},
			createdAt: new Date().toISOString(),
		},
		{
			id: 'comment-2',
			content: 'Nice photo!',
			imageId: 'post-123',
			user: {
				id: 'user-123',
				username: 'currentuser',
				email: 'current@example.com',
				firstName: 'Current',
				lastName: 'User',
			},
			createdAt: new Date().toISOString(),
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseUser.mockReturnValue({
			user: mockUser,
			loading: false,
			isAuthenticated: true,
			error: null,
			login: jest.fn(),
			logout: jest.fn(),
			signup: jest.fn(),
			updateUser: jest.fn(),
			setUser: jest.fn(),
		});
	});

	it('shows loading state initially', () => {
		mockPostsService.getComments.mockImplementation(() => new Promise(jest.fn()));

		render(<CommentsSection postId="post-123" />);

		expect(screen.getByText('Loading comments...')).toBeInTheDocument();
	});

	it('fetches comments on mount', async () => {
		mockPostsService.getComments.mockResolvedValue(mockComments);

		render(<CommentsSection postId="post-123" />);

		await waitFor(() => {
			expect(mockPostsService.getComments).toHaveBeenCalledWith('post-123');
		});
	});

	it('displays comments after loading', async () => {
		mockPostsService.getComments.mockResolvedValue(mockComments);

		render(<CommentsSection postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByText('Great post!')).toBeInTheDocument();
			expect(screen.getByText('Nice photo!')).toBeInTheDocument();
		});
	});

	it('displays comment count in title', async () => {
		mockPostsService.getComments.mockResolvedValue(mockComments);

		render(<CommentsSection postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByText('Comments (2)')).toBeInTheDocument();
		});
	});

	it('displays empty state when no comments', async () => {
		mockPostsService.getComments.mockResolvedValue([]);

		render(<CommentsSection postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
		});
	});

	it('displays comment author username', async () => {
		mockPostsService.getComments.mockResolvedValue(mockComments);

		render(<CommentsSection postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByText('johndoe')).toBeInTheDocument();
			expect(screen.getByText('currentuser')).toBeInTheDocument();
		});
	});

	it('shows delete button only for own comments', async () => {
		mockPostsService.getComments.mockResolvedValue(mockComments);

		const { container } = render(<CommentsSection postId="post-123" />);

		await waitFor(() => {
			const deleteButtons = container.querySelectorAll('.comment-delete-btn');
			expect(deleteButtons).toHaveLength(1);
		});
	});

	it('adds new comment on form submit', async () => {
		mockPostsService.getComments.mockResolvedValue([]);
		const newComment: Comment = {
			id: 'comment-new',
			content: 'New comment',
			imageId: 'post-123',
			user: {
				id: 'user-123',
				username: 'currentuser',
				email: 'current@example.com',
				firstName: 'Current',
				lastName: 'User',
			},
			createdAt: new Date().toISOString(),
		};
		mockPostsService.addComment.mockResolvedValue(newComment);

		render(<CommentsSection postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
		});

		const input = screen.getByPlaceholderText('Add a comment...');
		const submitButton = screen.getByRole('button');

		fireEvent.change(input, { target: { value: 'New comment' } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mockPostsService.addComment).toHaveBeenCalledWith('post-123', 'New comment');
			expect(screen.getByText('New comment')).toBeInTheDocument();
		});
	});

	it('clears input after adding comment', async () => {
		mockPostsService.getComments.mockResolvedValue([]);
		mockPostsService.addComment.mockResolvedValue({
			id: 'comment-new',
			content: 'New comment',
			imageId: 'post-123',
			user: {
				id: 'user-123',
				username: 'currentuser',
				email: 'current@example.com',
				firstName: 'Current',
				lastName: 'User',
			},
			createdAt: new Date().toISOString(),
		});

		render(<CommentsSection postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
		});

		const input = screen.getByPlaceholderText('Add a comment...') as HTMLInputElement;

		fireEvent.change(input, { target: { value: 'New comment' } });
		fireEvent.click(screen.getByRole('button'));

		await waitFor(() => {
			expect(input.value).toBe('');
		});
	});

	it('does not submit empty comment', async () => {
		mockPostsService.getComments.mockResolvedValue([]);

		render(<CommentsSection postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
		});

		const submitButton = screen.getByRole('button');
		fireEvent.click(submitButton);

		expect(mockPostsService.addComment).not.toHaveBeenCalled();
	});

	it('deletes comment when delete button clicked', async () => {
		mockPostsService.getComments.mockResolvedValue(mockComments);
		mockPostsService.deleteComment.mockResolvedValue();

		const { container } = render(<CommentsSection postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByText('Nice photo!')).toBeInTheDocument();
		});

		const deleteButton = container.querySelector('.comment-delete-btn');
		if (deleteButton) {
			fireEvent.click(deleteButton);
		}

		await waitFor(() => {
			expect(mockPostsService.deleteComment).toHaveBeenCalledWith('post-123', 'comment-2');
			expect(screen.queryByText('Nice photo!')).not.toBeInTheDocument();
		});
	});

	it('calls onCommentCountChange when comments are fetched', async () => {
		mockPostsService.getComments.mockResolvedValue(mockComments);
		const onCommentCountChange = jest.fn();

		render(<CommentsSection postId="post-123" onCommentCountChange={onCommentCountChange} />);

		await waitFor(() => {
			expect(onCommentCountChange).toHaveBeenCalledWith(2);
		});
	});

	it('calls onCommentCountChange when comment is added', async () => {
		mockPostsService.getComments.mockResolvedValue([]);
		mockPostsService.addComment.mockResolvedValue({
			id: 'comment-new',
			content: 'New comment',
			imageId: 'post-123',
			user: {
				id: 'user-123',
				username: 'currentuser',
				email: 'current@example.com',
				firstName: 'Current',
				lastName: 'User',
			},
			createdAt: new Date().toISOString(),
		});
		const onCommentCountChange = jest.fn();

		render(<CommentsSection postId="post-123" onCommentCountChange={onCommentCountChange} />);

		await waitFor(() => {
			expect(onCommentCountChange).toHaveBeenCalledWith(0);
		});

		const input = screen.getByPlaceholderText('Add a comment...');
		fireEvent.change(input, { target: { value: 'New comment' } });
		fireEvent.click(screen.getByRole('button'));

		await waitFor(() => {
			expect(onCommentCountChange).toHaveBeenCalledWith(1);
		});
	});

	it('calls onCommentCountChange when comment is deleted', async () => {
		mockPostsService.getComments.mockResolvedValue(mockComments);
		mockPostsService.deleteComment.mockResolvedValue();
		const onCommentCountChange = jest.fn();

		const { container } = render(<CommentsSection postId="post-123" onCommentCountChange={onCommentCountChange} />);

		await waitFor(() => {
			expect(onCommentCountChange).toHaveBeenCalledWith(2);
		});

		const deleteButton = container.querySelector('.comment-delete-btn');
		if (deleteButton) {
			fireEvent.click(deleteButton);
		}

		await waitFor(() => {
			expect(onCommentCountChange).toHaveBeenCalledWith(1);
		});
	});

	it('disables submit button when input is empty', async () => {
		mockPostsService.getComments.mockResolvedValue([]);

		render(<CommentsSection postId="post-123" />);

		await waitFor(() => {
			const submitButton = screen.getByRole('button');
			expect(submitButton).toBeDisabled();
		});
	});

	it('enables submit button when input has value', async () => {
		mockPostsService.getComments.mockResolvedValue([]);

		render(<CommentsSection postId="post-123" />);

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
		});

		const input = screen.getByPlaceholderText('Add a comment...');
		fireEvent.change(input, { target: { value: 'New comment' } });

		const submitButton = screen.getByRole('button');
		expect(submitButton).not.toBeDisabled();
	});

	it('renders comment form', async () => {
		mockPostsService.getComments.mockResolvedValue([]);

		const { container } = render(<CommentsSection postId="post-123" />);

		await waitFor(() => {
			expect(container.querySelector('.comment-form')).toBeInTheDocument();
			expect(container.querySelector('.comment-input')).toBeInTheDocument();
			expect(container.querySelector('.comment-submit-btn')).toBeInTheDocument();
		});
	});
});
