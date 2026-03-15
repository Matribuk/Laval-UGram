import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, UsersIcon, ProfileIcon, PlusIcon } from '../../utils/SvgFile';
import './MobileNav.css';

interface MobileNavProps {
	activePage: 'feed' | 'users' | 'profile';
}

const MobileNav: React.FC<MobileNavProps> = ({ activePage }) => {
	const navigate = useNavigate();

	return (
		<nav className="mobile-nav">
			<button
				type="button"
				className={`mobile-nav-item ${activePage === 'feed' ? 'active' : ''}`}
				onClick={() => navigate('/feed')}
			>
				<HomeIcon />
				<span>Feed</span>
			</button>

			<button
				type="button"
				className={`mobile-nav-item ${activePage === 'users' ? 'active' : ''}`}
				onClick={() => navigate('/users')}
			>
				<UsersIcon />
				<span>Users</span>
			</button>

			<button type="button" className="mobile-nav-item mobile-nav-create" onClick={() => navigate('/post/create')}>
				<PlusIcon />
			</button>

			<button
				type="button"
				className={`mobile-nav-item ${activePage === 'profile' ? 'active' : ''}`}
				onClick={() => navigate('/profile')}
			>
				<ProfileIcon />
				<span>Profile</span>
			</button>
		</nav>
	);
};

export default MobileNav;
