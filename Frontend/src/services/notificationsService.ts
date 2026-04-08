import api from './api';
import { ENDPOINTS } from './endpoints';
import { BackendNotification, Notification, PaginatedResponse } from '../types/api.types';
import { transformBackendNotification } from '../utils/transformers';

export interface NotificationsResponse {
	notifications: Notification[];
	total: number;
	unreadCount: number;
}

export const notificationsService = {
	async getNotifications(page = 1, limit = 20): Promise<NotificationsResponse> {
		const response = await api.get<PaginatedResponse<BackendNotification>>(ENDPOINTS.NOTIFICATIONS.BASE, {
			params: { page, limit },
		});

		const notifications = response.data.data.map(transformBackendNotification);
		const unreadCount = notifications.filter((n) => !n.read).length;

		return {
			notifications,
			total: response.data.meta.total,
			unreadCount,
		};
	},

	async getUnreadCount(): Promise<number> {
		const response = await api.get<PaginatedResponse<BackendNotification>>(ENDPOINTS.NOTIFICATIONS.BASE, {
			params: { page: 1, limit: 100 },
		});

		return response.data.data.filter((n) => !n.read).length;
	},

	async markAsRead(notificationId: string): Promise<Notification> {
		const response = await api.patch<BackendNotification>(ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
		return transformBackendNotification(response.data);
	},

	async markAllAsRead(): Promise<void> {
		await api.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
	},
};
