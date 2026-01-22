import React from 'react';
import { CurrentUser } from '../../types/api.types';
import Sidebar from '../Sidebar';
import MobileNav from '../MobileNav';
import MessagesPanel from '../MessagesPanel';
import './PageLayout.css';

interface PageLayoutProps {
	activePage: 'feed' | 'users' | 'profile' | 'messages';
	user: CurrentUser;
	children: React.ReactNode;
	className?: string;
	hideMessagesPanel?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
	activePage,
	user,
	children,
	className = '',
	hideMessagesPanel = false,
}) => {
	return (
		<div className={`page-layout ${className}`}>
			<Sidebar activePage={activePage} user={user} />
			<main className="page-main-content">{children}</main>
			{!hideMessagesPanel && <MessagesPanel />}
			<MobileNav activePage={activePage} />
		</div>
	);
};

export default PageLayout;
