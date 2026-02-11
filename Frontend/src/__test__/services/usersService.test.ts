import { usersService } from '../../services/usersService';
import api from '../../services/api';

jest.mock('../../services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('usersService', () => {
	const mockBackendUser = {
		id: 'user-123',
		username: 'johndoe',
		email: 'john@example.com',
		firstName: 'John',
		lastName: 'Doe',
		profilePictureUrl: '/uploads/avatar.jpg',
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getAllUsers', () => {
		it('returns transformed users', async () => {
			mockApi.get.mockResolvedValue({
				data: { data: [mockBackendUser] },
			});

			const users = await usersService.getAllUsers();

			expect(mockApi.get).toHaveBeenCalledWith('/users?limit=100');
			expect(users).toHaveLength(1);
			expect(users[0].username).toBe('johndoe');
			expect(users[0].fullName).toBe('John Doe');
		});
	});

	describe('getUserById', () => {
		it('returns transformed user', async () => {
			mockApi.get.mockResolvedValue({ data: mockBackendUser });

			const user = await usersService.getUserById('user-123');

			expect(mockApi.get).toHaveBeenCalledWith('/users/user-123');
			expect(user.username).toBe('johndoe');
		});
	});

	describe('getCurrentUser', () => {
		it('returns current user', async () => {
			mockApi.get.mockResolvedValue({ data: mockBackendUser });

			const user = await usersService.getCurrentUser();

			expect(mockApi.get).toHaveBeenCalledWith('/users/me');
			expect(user.email).toBe('john@example.com');
		});
	});

	describe('searchUsers', () => {
		it('searches users with query', async () => {
			mockApi.get.mockResolvedValue({
				data: { data: [mockBackendUser] },
			});

			const users = await usersService.searchUsers('john');

			expect(mockApi.get).toHaveBeenCalledWith('/users/search', {
				params: { q: 'john', limit: 100 },
			});
			expect(users).toHaveLength(1);
		});
	});

	describe('updateUser', () => {
		it('updates user data', async () => {
			mockApi.patch.mockResolvedValue({ data: mockBackendUser });

			const user = await usersService.updateUser('user-123', { firstName: 'Jane' });

			expect(mockApi.patch).toHaveBeenCalledWith('/users/user-123', { firstName: 'Jane' });
			expect(user.username).toBe('johndoe');
		});
	});

	describe('uploadProfilePicture', () => {
		it('uploads profile picture', async () => {
			mockApi.post.mockResolvedValue({ data: mockBackendUser });
			const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });

			const user = await usersService.uploadProfilePicture('user-123', file);

			expect(mockApi.post).toHaveBeenCalledWith(
				'/users/user-123/profile-picture',
				expect.any(FormData),
				expect.objectContaining({
					headers: { 'Content-Type': 'multipart/form-data' },
				})
			);
			expect(user.username).toBe('johndoe');
		});
	});
});
