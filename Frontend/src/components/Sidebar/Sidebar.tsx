import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types/api.types';
import { HomeIcon, UsersIcon, ProfileIcon, PlusIcon, LogoutIcon, MessageIcon, BellIcon } from '../../utils/SvgFile';
import { useUser } from '../UserContext';
import { useIsMounted } from '../../hooks/useIsMounted';
import { notificationsService } from '../../services/notificationsService';
import Avatar from '../Avatar/Avatar';
import RecommendedUsers from '../RecommendedUsers/RecommendedUsers';
import './Sidebar.css';

interface SidebarProps {
	activePage: 'feed' | 'users' | 'profile' | 'messages' | 'notifications';
	user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, user }) => {
	const navigate = useNavigate();
	const { logout } = useUser();
	const isMounted = useIsMounted();
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		const fetchUnread = async () => {
			try {
				const count = await notificationsService.getUnreadCount();
				if (isMounted()) {
					setUnreadCount(count);
				}
			} catch (error) {
				console.error('Failed to fetch unread notifications count:', error);
			}
		};

		fetchUnread();
		const interval = setInterval(fetchUnread, 30000);
		return () => clearInterval(interval);
	}, [isMounted]);

	const handleNavigate = (page: 'feed' | 'users' | 'profile' | 'messages' | 'notifications') => {
		navigate(`/${page}`);
	};

	const handleNewPost = () => {
		navigate('/post/create');
	};

	const handleLogout = async () => {
		await logout();
		navigate('/login');
	};

	return (
		<aside className="sidebar">
			<div className="sidebar-content">
				<h1 className="sidebar-logo">Ugram</h1>

				<nav className="sidebar-nav">
					<button
						type="button"
						className={`nav-item ${activePage === 'feed' ? 'active' : ''}`}
						onClick={() => handleNavigate('feed')}
					>
						<HomeIcon />
						Feed
					</button>

					<button
						type="button"
						className={`nav-item ${activePage === 'users' ? 'active' : ''}`}
						onClick={() => handleNavigate('users')}
					>
						<UsersIcon />
						Users
					</button>

					<button
						type="button"
						className={`nav-item ${activePage === 'messages' ? 'active' : ''}`}
						onClick={() => handleNavigate('messages')}
					>
						<MessageIcon />
						Messages
					</button>

					<button
						type="button"
						className={`nav-item ${activePage === 'notifications' ? 'active' : ''}`}
						onClick={() => handleNavigate('notifications')}
					>
						<span className="nav-item-icon-wrapper">
							<BellIcon />
							{unreadCount > 0 && <span className="nav-item-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
						</span>
						Notifications
					</button>

					<button
						type="button"
						className={`nav-item ${activePage === 'profile' ? 'active' : ''}`}
						onClick={() => handleNavigate('profile')}
					>
						<ProfileIcon />
						<span>Profile</span>
					</button>

					<button type="button" className="new-post-button" onClick={handleNewPost}>
						<PlusIcon />
						<span>New Post</span>
					</button>
				</nav>

				<RecommendedUsers limit={5} />
			</div>

			<div className="sidebar-footer">
				{user && (
					<div className="user-info">
						<Avatar src={user.avatar} name={user.username} size="medium" className="user-avatar" />
						<div className="user-details">
							<span className="user-name">{user.username}</span>
							<span className="user-email">{user.email}</span>
						</div>
					</div>
				)}

				<button type="button" className="logout-button" onClick={handleLogout}>
					<LogoutIcon />
					Logout
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
