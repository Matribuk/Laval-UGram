import { transformBackendUser, transformBackendPost } from '../../utils/transformers';
import { BackendUser, BackendPost } from '../../types/api.types';

describe('transformers', () => {
	describe('transformBackendUser', () => {
		const mockBackendUser: BackendUser = {
			id: 'user-123',
			username: 'johndoe',
			email: 'john@example.com',
			firstName: 'John',
			lastName: 'Doe',
			phoneNumber: '+1234567890',
			profilePictureUrl: '/uploads/avatar.jpg',
			createdAt: '2024-01-01T00:00:00Z',
		};

		it('transforms backend user to frontend user', () => {
			const result = transformBackendUser(mockBackendUser);
			expect(result.id).toBe('user-123');
			expect(result.username).toBe('johndoe');
			expect(result.email).toBe('john@example.com');
			expect(result.firstName).toBe('John');
			expect(result.lastName).toBe('Doe');
			expect(result.fullName).toBe('John Doe');
		});

		it('builds avatar URL from profilePictureUrl', () => {
			const result = transformBackendUser(mockBackendUser);
			expect(result.avatar).toContain('/uploads/avatar.jpg');
		});

		it('handles missing profilePictureUrl', () => {
			const userWithoutAvatar = { ...mockBackendUser, profilePictureUrl: undefined };
			const result = transformBackendUser(userWithoutAvatar);
			expect(result.avatar).toBeUndefined();
		});

		it('preserves phoneNumber', () => {
			const result = transformBackendUser(mockBackendUser);
			expect(result.phoneNumber).toBe('+1234567890');
		});

		it('preserves createdAt', () => {
			const result = transformBackendUser(mockBackendUser);
			expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
		});
	});

	describe('transformBackendPost', () => {
		const mockBackendPost: BackendPost = {
			id: 'post-123',
			url: '/uploads/post-image.jpg',
			description: 'Hello world',
			user: {
				id: 'user-123',
				username: 'johndoe',
				email: 'john@example.com',
				firstName: 'John',
				lastName: 'Doe',
				profilePictureUrl: '/uploads/avatar.jpg',
			},
			hashtags: [
				{ id: 'tag-1', name: 'photography' },
				{ id: 'tag-2', name: 'nature' },
			],
			mentions: [
				{
					id: 'mention-1',
					mentionedUser: {
						id: 'user-456',
						username: 'janedoe',
						email: 'jane@example.com',
						firstName: 'Jane',
						lastName: 'Doe',
					},
				},
			],
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-01-02T00:00:00Z',
		};

		it('transforms backend post to frontend post', () => {
			const result = transformBackendPost(mockBackendPost);
			expect(result.id).toBe('post-123');
			expect(result.caption).toBe('Hello world');
			expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
		});

		it('builds imageUrl from url', () => {
			const result = transformBackendPost(mockBackendPost);
			expect(result.imageUrl).toContain('/uploads/post-image.jpg');
		});

		it('transforms author correctly', () => {
			const result = transformBackendPost(mockBackendPost);
			expect(result.author.username).toBe('johndoe');
			expect(result.author.avatar).toContain('/uploads/avatar.jpg');
		});

		it('extracts hashtag names', () => {
			const result = transformBackendPost(mockBackendPost);
			expect(result.tags).toEqual(['photography', 'nature']);
		});

		it('extracts mentioned usernames', () => {
			const result = transformBackendPost(mockBackendPost);
			expect(result.mentions).toEqual(['janedoe']);
		});

		it('handles missing description', () => {
			const postWithoutDescription = { ...mockBackendPost, description: undefined };
			const result = transformBackendPost(postWithoutDescription);
			expect(result.caption).toBe('');
		});

		it('handles author without profile picture', () => {
			const postWithoutAvatar = {
				...mockBackendPost,
				user: { ...mockBackendPost.user, profilePictureUrl: undefined },
			};
			const result = transformBackendPost(postWithoutAvatar);
			expect(result.author.avatar).toBeUndefined();
		});

		it('initializes timeAgo as empty string', () => {
			const result = transformBackendPost(mockBackendPost);
			expect(result.timeAgo).toBe('');
		});
	});
});
