import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types/api.types';
import { HomeIcon, UsersIcon, ProfileIcon, PlusIcon, LogoutIcon } from '../../utils/SvgFile';
import { useUser } from '../UserContext';
import Avatar from '../Avatar';
import './Sidebar.css';

interface SidebarProps {
	activePage: 'feed' | 'users' | 'profile';
	user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, user }) => {
	const navigate = useNavigate();
	const { logout } = useUser();

	const handleNavigate = (page: 'feed' | 'users' | 'profile') => {
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
