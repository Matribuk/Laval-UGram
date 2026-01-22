import React from 'react';
import { currentUser } from '../../utils/mockData';
import PageLayout from '../../components/PageLayout';
import MessagesPanel from '../../components/MessagesPanel';
import './MessagesPage.css';

const MessagesPage: React.FC = () => {
	return (
		<PageLayout activePage="messages" user={currentUser} hideMessagesPanel>
			<div className="messages-page">
				<MessagesPanel isFullPage />
			</div>
		</PageLayout>
	);
};

export default MessagesPage;
