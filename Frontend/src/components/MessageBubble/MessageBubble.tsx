import React from 'react';
import { Message } from '../../types/api.types';
import { getTimeAgo } from '../../utils/helpers';
import './MessageBubble.css';

interface MessageBubbleProps {
	message: Message;
	isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
	return (
		<div className={`message-bubble ${isOwn ? 'message-bubble-own' : 'message-bubble-other'}`}>
			<p className="message-bubble-content">{message.content}</p>
			<span className="message-bubble-time">{getTimeAgo(message.createdAt)}</span>
		</div>
	);
};

export default MessageBubble;
