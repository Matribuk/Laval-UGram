import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types/api.types';
import { LogoutIcon } from '../../utils/SvgFile';
import { useUser } from '../UserContext';
import Sidebar from '../Sidebar/Sidebar';
import MobileNav from '../MobileNav/MobileNav';
import './PageLayout.css';

interface PageLayoutProps {
	activePage: 'feed' | 'users' | 'profile';
	user: User | null;
	children: React.ReactNode;
	className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
	activePage,
	user,
	children,
	className = '',
}) => {
	const navigate = useNavigate();
	const { logout } = useUser();

	const handleLogout = async () => {
		await logout();
		navigate('/login');
	};

	return (
		<div className={`page-layout ${className}`}>
			<header className="mobile-header">
				<span className="mobile-header-logo">Ugram</span>
				<button type="button" className="mobile-header-logout" onClick={handleLogout}>
					<LogoutIcon />
				</button>
			</header>
			<Sidebar activePage={activePage} user={user} />
			<main className="page-main-content">{children}</main>
			<MobileNav activePage={activePage} />
		</div>
	);
};

export default PageLayout;
