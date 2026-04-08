import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { notificationsService } from '../../services/notificationsService';

jest.mock('react-router-dom', () => ({
	useNavigate: () => jest.fn(),
}));

jest.mock('../../services/notificationsService');
jest.mock('../../utils/SvgFile', () => ({
	BellIcon: () => <svg data-testid="bell-icon" />,
	HeartIcon: () => <svg data-testid="heart-icon" />,
	CommentIcon: () => <svg data-testid="comment-icon" />,
	MessageIcon: () => <svg data-testid="message-icon" />,
	LogoutIcon: () => <svg data-testid="logout-icon" />,
}));

jest.mock('../../components/UserContext', () => ({
	useUser: () => ({ user: { id: 'u1', username: 'me', email: 'me@test.com' }, logout: jest.fn() }),
}));

jest.mock('../../components/Avatar/Avatar', () => ({
	__esModule: true,
	default: ({ name }: { name: string }) => <div data-testid="avatar">{name}</div>,
}));

jest.mock('../../components/EmptyState/EmptyState', () => ({
	__esModule: true,
	default: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock('../../components/common/LoadingSpinner/LoadingSpinner', () => ({
	LoadingSpinner: () => <div>Loading...</div>,
}));

jest.mock('../../components/PageLayout/PageLayout', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import NotificationsPage from '../../pages/NotificationsPage/NotificationsPage';

const mockNotificationsService = notificationsService as jest.Mocked<typeof notificationsService>;

describe('NotificationsPage', () => {
	const mockNotification = {
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
			fullName: 'John Doe',
			avatar: undefined,
		},
		createdAt: '2024-01-15T10:30:00.000Z',
		timeAgo: '2h ago',
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockNotificationsService.getNotifications.mockResolvedValue({
			notifications: [],
			total: 0,
			unreadCount: 0,
		});
	});

	it('renders page title', async () => {
		render(<NotificationsPage />);

		await waitFor(() => {
			expect(screen.getByText('Notifications')).toBeInTheDocument();
		});
	});

	it('shows empty state when no notifications', async () => {
		render(<NotificationsPage />);

		await waitFor(() => {
			expect(screen.getByText('No notifications yet')).toBeInTheDocument();
		});
	});

	it('renders notifications list', async () => {
		mockNotificationsService.getNotifications.mockResolvedValue({
			notifications: [mockNotification],
			total: 1,
			unreadCount: 1,
		});

		render(<NotificationsPage />);

		await waitFor(() => {
			expect(screen.getAllByText('johndoe').length).toBeGreaterThan(0);
			expect(screen.getByText('liked your post')).toBeInTheDocument();
			expect(screen.getByText('2h ago')).toBeInTheDocument();
		});
	});

	it('shows mark all as read button when unread notifications exist', async () => {
		mockNotificationsService.getNotifications.mockResolvedValue({
			notifications: [mockNotification],
			total: 1,
			unreadCount: 1,
		});

		render(<NotificationsPage />);

		await waitFor(() => {
			expect(screen.getByText('Mark all as read')).toBeInTheDocument();
		});
	});

	it('calls markAllAsRead when button clicked', async () => {
		mockNotificationsService.getNotifications.mockResolvedValue({
			notifications: [mockNotification],
			total: 1,
			unreadCount: 1,
		});
		mockNotificationsService.markAllAsRead.mockResolvedValue();

		render(<NotificationsPage />);

		await waitFor(() => {
			expect(screen.getByText('Mark all as read')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText('Mark all as read'));

		await waitFor(() => {
			expect(mockNotificationsService.markAllAsRead).toHaveBeenCalled();
		});
	});

	it('hides mark all as read button when all notifications are read', async () => {
		mockNotificationsService.getNotifications.mockResolvedValue({
			notifications: [{ ...mockNotification, read: true }],
			total: 1,
			unreadCount: 0,
		});

		render(<NotificationsPage />);

		await waitFor(() => {
			expect(screen.queryByText('Mark all as read')).not.toBeInTheDocument();
		});
	});
});
