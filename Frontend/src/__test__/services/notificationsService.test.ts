import { notificationsService } from '../../services/notificationsService';
import api from '../../services/api';

jest.mock('../../services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('notificationsService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const mockBackendNotification = {
		id: 'notif-1',
		type: 'like' as const,
		referenceId: 'post-1',
		read: false,
		actor: {
			id: 'user-1',
			username: 'johndoe',
			email: 'john@example.com',
			firstName: 'John',
			lastName: 'Doe',
			profilePictureUrl: null,
		},
		createdAt: '2024-01-15T10:30:00.000Z',
	};

	describe('getNotifications', () => {
		it('fetches notifications with pagination', async () => {
			mockApi.get.mockResolvedValue({
				data: {
					data: [mockBackendNotification],
					meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
				},
			});

			const result = await notificationsService.getNotifications(1, 20);

			expect(mockApi.get).toHaveBeenCalledWith('/notifications', {
				params: { page: 1, limit: 20 },
			});
			expect(result.notifications).toHaveLength(1);
			expect(result.notifications[0].id).toBe('notif-1');
			expect(result.notifications[0].actor.username).toBe('johndoe');
			expect(result.total).toBe(1);
		});

		it('calculates unread count correctly', async () => {
			mockApi.get.mockResolvedValue({
				data: {
					data: [mockBackendNotification, { ...mockBackendNotification, id: 'notif-2', read: true }],
					meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
				},
			});

			const result = await notificationsService.getNotifications();

			expect(result.unreadCount).toBe(1);
		});
	});

	describe('getUnreadCount', () => {
		it('returns unread notification count', async () => {
			mockApi.get.mockResolvedValue({
				data: {
					data: [
						mockBackendNotification,
						{ ...mockBackendNotification, id: 'notif-2', read: true },
						{ ...mockBackendNotification, id: 'notif-3', read: false },
					],
					meta: { total: 3, page: 1, limit: 100, totalPages: 1 },
				},
			});

			const count = await notificationsService.getUnreadCount();

			expect(count).toBe(2);
		});
	});

	describe('markAsRead', () => {
		it('marks a notification as read', async () => {
			const readNotification = { ...mockBackendNotification, read: true };
			mockApi.patch.mockResolvedValue({ data: readNotification });

			const result = await notificationsService.markAsRead('notif-1');

			expect(mockApi.patch).toHaveBeenCalledWith('/notifications/notif-1/read');
			expect(result.read).toBe(true);
		});
	});

	describe('markAllAsRead', () => {
		it('marks all notifications as read', async () => {
			mockApi.patch.mockResolvedValue({ data: null });

			await notificationsService.markAllAsRead();

			expect(mockApi.patch).toHaveBeenCalledWith('/notifications/read-all');
		});
	});
});
