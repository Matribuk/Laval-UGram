import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message } from '../../types/api.types';
import conversationsData from '../../__data__/conversations.json';
import Avatar from '../Avatar';
import { BackArrowIcon, SendIcon } from '../../utils/SvgFile';
import './MessagesPanel.css';

interface MessagesPanelProps {
	isFullPage?: boolean;
}

const MessagesPanel: React.FC<MessagesPanelProps> = ({ isFullPage = false }) => {
	const [conversations, setConversations] = useState<Conversation[]>(conversationsData.conversations);
	const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
	const [newMessage, setNewMessage] = useState('');
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const currentUserId = 1;

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		if (selectedConversation) {
			scrollToBottom();
		}
	}, [selectedConversation?.messages.length, selectedConversation]);

	const formatTime = (timestamp: string) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
		} else if (diffDays === 1) {
			return 'Yesterday';
		} else if (diffDays < 7) {
			return date.toLocaleDateString('en-US', { weekday: 'short' });
		} else {
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		}
	};

	const handleSelectConversation = (conversation: Conversation) => {
		const updatedConversations = conversations.map((c) => {
			if (c.id === conversation.id) {
				return {
					...c,
					unreadCount: 0,
					messages: c.messages.map((m) => ({ ...m, read: true })),
				};
			}
			return c;
		});
		setConversations(updatedConversations);
		setSelectedConversation({
			...conversation,
			unreadCount: 0,
			messages: conversation.messages.map((m) => ({ ...m, read: true })),
		});
	};

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMessage.trim() || !selectedConversation) {
			return;
		}

		const newMsg: Message = {
			id: Date.now(),
			senderId: currentUserId,
			senderUsername: 'kiki',
			content: newMessage.trim(),
			timestamp: new Date().toISOString(),
			read: true,
		};

		const updatedConversation = {
			...selectedConversation,
			messages: [...selectedConversation.messages, newMsg],
			lastMessage: newMessage.trim(),
			lastMessageTime: new Date().toISOString(),
		};

		const updatedConversations = conversations.map((c) =>
			c.id === selectedConversation.id ? updatedConversation : c
		);

		setConversations(updatedConversations);
		setSelectedConversation(updatedConversation);
		setNewMessage('');

		setTimeout(() => {
			inputRef.current?.focus();
			scrollToBottom();
		}, 0);
	};

	const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

	return (
		<div className={`messages-panel ${isFullPage ? 'full-page' : ''}`}>
			{!selectedConversation ? (
				<div className="conversations-list">
					<div className="messages-header">
						<h3>Messages</h3>
						{totalUnread > 0 && <span className="total-unread">{totalUnread}</span>}
					</div>
					{conversations.length === 0 ? (
						<div className="no-conversations">
							<p>No conversations yet</p>
						</div>
					) : (
						conversations.map((conversation) => (
							<button
								type="button"
								key={conversation.id}
								className={`conversation-item ${conversation.unreadCount > 0 ? 'has-unread' : ''}`}
								onClick={() => handleSelectConversation(conversation)}
							>
								<Avatar
									name={conversation.participantFullName}
									src={conversation.participantAvatar || undefined}
									size="medium"
								/>
								<div className="conversation-info">
									<div className="conversation-header">
										<span className="conversation-name">{conversation.participantUsername}</span>
										<span className="conversation-time">{formatTime(conversation.lastMessageTime)}</span>
									</div>
									<p className="conversation-preview">{conversation.lastMessage}</p>
								</div>
								{conversation.unreadCount > 0 && (
									<span className="unread-badge">{conversation.unreadCount}</span>
								)}
							</button>
						))
					)}
				</div>
			) : (
				<div className="chat-window">
					<div className="chat-header">
						<button type="button" className="back-button" onClick={() => setSelectedConversation(null)}>
							<BackArrowIcon width={20} height={20} />
						</button>
						<Avatar
							name={selectedConversation.participantFullName}
							src={selectedConversation.participantAvatar || undefined}
							size="small"
						/>
						<span className="chat-username">{selectedConversation.participantUsername}</span>
					</div>
					<div className="chat-messages">
						{selectedConversation.messages.map((message) => (
							<div
								key={message.id}
								className={`message ${message.senderId === currentUserId ? 'sent' : 'received'}`}
							>
								<div className="message-content">{message.content}</div>
								<span className="message-time">{formatTime(message.timestamp)}</span>
							</div>
						))}
						<div ref={messagesEndRef} />
					</div>
					<form className="chat-input-form" onSubmit={handleSendMessage}>
						<input
							ref={inputRef}
							type="text"
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							placeholder="Type a message..."
							className="chat-input"
						/>
						<button type="submit" className="send-button" disabled={!newMessage.trim()}>
							<SendIcon width={18} height={18} />
						</button>
					</form>
				</div>
			)}
		</div>
	);
};

export default MessagesPanel;
