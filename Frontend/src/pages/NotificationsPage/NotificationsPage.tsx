import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Notification, NotificationType } from '../../types/api.types';
import { useUser } from '../../components/UserContext';
import { useIsMounted } from '../../hooks/useIsMounted';
import PageLayout from '../../components/PageLayout/PageLayout';
import Avatar from '../../components/Avatar/Avatar';
import EmptyState from '../../components/EmptyState/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { BellIcon, HeartIcon, CommentIcon, MessageIcon } from '../../utils/SvgFile';
import { notificationsService } from '../../services/notificationsService';
import './NotificationsPage.css';

const getNotificationIcon = (type: NotificationType) => {
	switch (type) {
		case 'like':
			return <HeartIcon width={16} height={16} filled className="notification-type-icon like" />;
		case 'comment':
			return <CommentIcon width={16} height={16} className="notification-type-icon comment" />;
		case 'message':
			return <MessageIcon width={16} height={16} className="notification-type-icon message" />;
		default:
			return null;
	}
};

const getNotificationText = (type: NotificationType): string => {
	switch (type) {
		case 'like':
			return 'liked your post';
		case 'comment':
			return 'commented on your post';
		case 'message':
			return 'sent you a message';
		default:
			return '';
	}
};

const NotificationsPage: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useUser();
	const isMounted = useIsMounted();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [unreadCount, setUnreadCount] = useState(0);

	const fetchNotifications = useCallback(async () => {
		try {
			setLoading(true);
			const data = await notificationsService.getNotifications(1, 50);
			if (isMounted()) {
				setNotifications(data.notifications);
				setUnreadCount(data.unreadCount);
			}
		} catch (error) {
			if (isMounted()) {
				console.error('Failed to fetch notifications:', error);
				toast.error('Failed to load notifications');
			}
		} finally {
			if (isMounted()) {
				setLoading(false);
			}
		}
	}, [isMounted]);

	useEffect(() => {
		fetchNotifications();
	}, [fetchNotifications]);

	const handleNotificationClick = async (notification: Notification) => {
		if (!notification.read) {
			try {
				await notificationsService.markAsRead(notification.id);
				setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
				setUnreadCount((prev) => Math.max(0, prev - 1));
			} catch (error) {
				console.error('Failed to mark notification as read:', error);
			}
		}

		if (notification.type === 'message') {
			navigate(`/messages/${notification.actor.id}`);
		} else {
			navigate(`/post/${notification.referenceId}`);
		}
	};

	const handleMarkAllRead = async () => {
		try {
			await notificationsService.markAllAsRead();
			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
			setUnreadCount(0);
			toast.success('All notifications marked as read');
		} catch (error) {
			console.error('Failed to mark all as read:', error);
			toast.error('Failed to mark all as read');
		}
	};

	if (loading) {
		return (
			<PageLayout activePage="notifications" user={user}>
				<LoadingSpinner message="Loading notifications..." />
			</PageLayout>
		);
	}

	return (
		<PageLayout activePage="notifications" user={user}>
			<div className="notifications-page-header">
				<h1 className="notifications-page-title">Notifications</h1>
				{unreadCount > 0 && (
					<button type="button" className="mark-all-read-btn" onClick={handleMarkAllRead}>
						Mark all as read
					</button>
				)}
			</div>

			<div className="notifications-list">
				{notifications.length === 0 ? (
					<EmptyState
						icon={<BellIcon width={48} height={48} />}
						title="No notifications yet"
						subtitle="When someone interacts with your posts, you'll see it here"
					/>
				) : (
					notifications.map((notification) => (
						<button
							key={notification.id}
							type="button"
							className={`notification-item ${!notification.read ? 'unread' : ''}`}
							onClick={() => handleNotificationClick(notification)}
						>
							<div className="notification-avatar">
								<Avatar src={notification.actor.avatar} name={notification.actor.username} size="medium" />
								{getNotificationIcon(notification.type)}
							</div>
							<div className="notification-content">
								<p className="notification-text">
									<strong>{notification.actor.username}</strong> {getNotificationText(notification.type)}
								</p>
								<span className="notification-time">{notification.timeAgo}</span>
							</div>
							{!notification.read && <span className="notification-unread-dot" />}
						</button>
					))
				)}
			</div>
		</PageLayout>
	);
};

export default NotificationsPage;
