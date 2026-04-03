import React from 'react';
import Avatar from '../Avatar/Avatar';
import { Conversation } from '../../types/api.types';
import { getTimeAgo } from '../../utils/helpers';
import './ConversationItem.css';

interface ConversationItemProps {
	conversation: Conversation;
	onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = React.memo(({ conversation, onClick }) => {
	const { otherUser, lastMessage, unreadCount } = conversation;

	return (
		<div
			className={`conversation-item ${unreadCount > 0 ? 'conversation-item-unread' : ''}`}
			onClick={onClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => e.key === 'Enter' && onClick()}
		>
			<Avatar src={otherUser.avatar} name={otherUser.username} size="medium" />
			<div className="conversation-item-content">
				<div className="conversation-item-header">
					<span className="conversation-item-username">{otherUser.username}</span>
					{lastMessage && <span className="conversation-item-time">{getTimeAgo(lastMessage.createdAt)}</span>}
				</div>
				<p className="conversation-item-preview">{lastMessage?.content || 'No messages yet'}</p>
			</div>
			{unreadCount > 0 && <span className="conversation-item-badge">{unreadCount}</span>}
		</div>
	);
});

ConversationItem.displayName = 'ConversationItem';

export default ConversationItem;
