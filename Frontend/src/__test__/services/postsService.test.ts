import { postsService } from '../../services/postsService';
import api from '../../services/api';

jest.mock('../../services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('postsService', () => {
	const mockBackendPost = {
		id: 'post-123',
		url: '/uploads/image.jpg',
		description: 'Test caption',
		user: {
			id: 'user-123',
			username: 'johndoe',
			email: 'john@example.com',
			firstName: 'John',
			lastName: 'Doe',
		},
		hashtags: [{ id: 'tag-1', name: 'test' }],
		mentions: [],
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z',
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getAllPosts', () => {
		it('returns transformed posts', async () => {
			mockApi.get.mockResolvedValue({
				data: { data: [mockBackendPost] },
			});

			const posts = await postsService.getAllPosts();

			expect(mockApi.get).toHaveBeenCalledWith('/images?limit=100');
			expect(posts).toHaveLength(1);
			expect(posts[0].caption).toBe('Test caption');
			expect(posts[0].tags).toEqual(['test']);
		});
	});

	describe('getPostById', () => {
		it('returns transformed post', async () => {
			mockApi.get.mockResolvedValue({ data: mockBackendPost });

			const post = await postsService.getPostById('post-123');

			expect(mockApi.get).toHaveBeenCalledWith('/images/post-123');
			expect(post.id).toBe('post-123');
		});
	});

	describe('getUserPosts', () => {
		it('returns user posts', async () => {
			mockApi.get.mockResolvedValue({
				data: { data: [mockBackendPost] },
			});

			const posts = await postsService.getUserPosts('user-123');

			expect(mockApi.get).toHaveBeenCalledWith('/users/user-123/images?limit=100');
			expect(posts).toHaveLength(1);
		});
	});

	describe('getPostsByHashtag', () => {
		it('returns posts by hashtag', async () => {
			mockApi.get.mockResolvedValue({
				data: { data: [mockBackendPost] },
			});

			const posts = await postsService.getPostsByHashtag('test');

			expect(mockApi.get).toHaveBeenCalledWith('/images/hashtag/test?limit=100');
			expect(posts).toHaveLength(1);
		});
	});

	describe('searchByDescription', () => {
		it('returns posts matching description', async () => {
			mockApi.get.mockResolvedValue({
				data: { data: [mockBackendPost] },
			});

			const posts = await postsService.searchByDescription('test query');

			expect(mockApi.get).toHaveBeenCalledWith('/images/search?description=test%20query&limit=100');
			expect(posts).toHaveLength(1);
		});
	});

	describe('createPost', () => {
		it('creates post with file and data', async () => {
			mockApi.post.mockResolvedValue({ data: mockBackendPost });
			const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' });

			const post = await postsService.createPost({
				description: 'Test caption',
				hashtags: ['tag1', 'tag2'],
				mentions: ['user1'],
				file,
			});

			expect(mockApi.post).toHaveBeenCalledWith('/images', expect.any(FormData), expect.anything());
			expect(post.caption).toBe('Test caption');
		});

		it('creates post without optional fields', async () => {
			mockApi.post.mockResolvedValue({ data: mockBackendPost });
			const file = new File(['test'], 'image.jpg', { type: 'image/jpeg' });

			await postsService.createPost({
				description: 'Simple post',
				file,
			});

			expect(mockApi.post).toHaveBeenCalled();
		});
	});

	describe('updatePost', () => {
		it('updates post data', async () => {
			mockApi.patch.mockResolvedValue({ data: mockBackendPost });

			const post = await postsService.updatePost('post-123', {
				description: 'Updated caption',
				hashtags: ['newtag'],
			});

			expect(mockApi.patch).toHaveBeenCalledWith('/images/post-123', {
				description: 'Updated caption',
				hashtags: ['newtag'],
			});
			expect(post.id).toBe('post-123');
		});
	});

	describe('deletePost', () => {
		it('deletes post', async () => {
			mockApi.delete.mockResolvedValue({});

			await postsService.deletePost('post-123');

			expect(mockApi.delete).toHaveBeenCalledWith('/images/post-123');
		});
	});

	describe('getLikeStatus', () => {
		it('returns like status for a post', async () => {
			const mockLikeStatus = { likeCount: 5, likedByCurrentUser: true };
			mockApi.get.mockResolvedValue({ data: mockLikeStatus });

			const status = await postsService.getLikeStatus('post-123');

			expect(mockApi.get).toHaveBeenCalledWith('/images/post-123/likes');
			expect(status).toEqual(mockLikeStatus);
		});
	});

	describe('likePost', () => {
		it('likes a post and returns updated status', async () => {
			const mockLikeStatus = { likeCount: 6, likedByCurrentUser: true };
			mockApi.post.mockResolvedValue({ data: mockLikeStatus });

			const status = await postsService.likePost('post-123');

			expect(mockApi.post).toHaveBeenCalledWith('/images/post-123/likes');
			expect(status).toEqual(mockLikeStatus);
		});
	});

	describe('unlikePost', () => {
		it('unlikes a post and returns updated status', async () => {
			const mockLikeStatus = { likeCount: 4, likedByCurrentUser: false };
			mockApi.delete.mockResolvedValue({ data: mockLikeStatus });

			const status = await postsService.unlikePost('post-123');

			expect(mockApi.delete).toHaveBeenCalledWith('/images/post-123/likes');
			expect(status).toEqual(mockLikeStatus);
		});
	});

	describe('getComments', () => {
		it('returns comments for a post', async () => {
			const mockComments = [
				{
					id: 'comment-1',
					content: 'Great post!',
					imageId: 'post-123',
					user: { id: 'user-1', username: 'johndoe', email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
					createdAt: '2024-01-01T00:00:00Z',
				},
			];
			mockApi.get.mockResolvedValue({ data: { data: mockComments } });

			const comments = await postsService.getComments('post-123');

			expect(mockApi.get).toHaveBeenCalledWith('/images/post-123/comments');
			expect(comments).toEqual(mockComments);
		});
	});

	describe('addComment', () => {
		it('adds a comment to a post', async () => {
			const mockComment = {
				id: 'comment-new',
				content: 'Nice photo!',
				imageId: 'post-123',
				user: { id: 'user-1', username: 'johndoe', email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
				createdAt: '2024-01-01T00:00:00Z',
			};
			mockApi.post.mockResolvedValue({ data: mockComment });

			const comment = await postsService.addComment('post-123', 'Nice photo!');

			expect(mockApi.post).toHaveBeenCalledWith('/images/post-123/comments', { content: 'Nice photo!' });
			expect(comment).toEqual(mockComment);
		});
	});

	describe('deleteComment', () => {
		it('deletes a comment from a post', async () => {
			mockApi.delete.mockResolvedValue({});

			await postsService.deleteComment('post-123', 'comment-1');

			expect(mockApi.delete).toHaveBeenCalledWith('/images/post-123/comments/comment-1');
		});
	});
});
