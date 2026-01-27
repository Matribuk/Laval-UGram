import React from 'react';
import { User } from '../../types/api.types';
import Sidebar from '../Sidebar';
import MobileNav from '../MobileNav';
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
	return (
		<div className={`page-layout ${className}`}>
			<Sidebar activePage={activePage} user={user} />
			<main className="page-main-content">{children}</main>
			<MobileNav activePage={activePage} />
		</div>
	);
};

export default PageLayout;
