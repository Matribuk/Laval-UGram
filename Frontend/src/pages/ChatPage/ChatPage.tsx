import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Message, User } from '../../types/api.types';
import { useUser } from '../../components/UserContext';
import { useIsMounted } from '../../hooks/useIsMounted';
import PageLayout from '../../components/PageLayout/PageLayout';
import Avatar from '../../components/Avatar/Avatar';
import MessageBubble from '../../components/MessageBubble/MessageBubble';
import MessageInput from '../../components/MessageInput/MessageInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { BackArrowIcon } from '../../utils/SvgFile';
import { messagesService } from '../../services/messagesService';
import { usersService } from '../../services/usersService';
import './ChatPage.css';

const ChatPage: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const { user: currentUser } = useUser();
	const isMounted = useIsMounted();
	const [messages, setMessages] = useState<Message[]>([]);
	const [otherUser, setOtherUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			if (!userId) {
				return;
			}

			try {
				setLoading(true);
				const [messagesData, userData] = await Promise.all([
					messagesService.getMessagesWithUser(userId),
					usersService.getUserById(userId),
				]);

				if (isMounted()) {
					setMessages(messagesData.messages);
					setOtherUser(userData);

					const unreadMessages = messagesData.messages.filter((m) => !m.read && m.senderId === userId);
					await Promise.all(unreadMessages.map((m) => messagesService.markAsRead(m.id)));
				}
			} catch (error) {
				if (isMounted()) {
					console.error('Failed to fetch messages:', error);
					toast.error('Failed to load conversation');
				}
			} finally {
				if (isMounted()) {
					setLoading(false);
				}
			}
		};

		fetchData();
	}, [userId, isMounted]);

	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	const handleSendMessage = async (content: string) => {
		if (!userId || sending) {
			return;
		}

		try {
			setSending(true);
			const newMessage = await messagesService.sendMessage({
				receiverId: userId,
				content,
			});
			setMessages((prev) => [...prev, newMessage]);
		} catch (error) {
			console.error('Failed to send message:', error);
			toast.error('Failed to send message');
		} finally {
			setSending(false);
		}
	};

	const handleBack = () => {
		navigate('/messages');
	};

	if (loading) {
		return (
			<PageLayout activePage="messages" user={currentUser}>
				<LoadingSpinner message="Loading conversation..." />
			</PageLayout>
		);
	}

	return (
		<PageLayout activePage="messages" user={currentUser} className="chat-page-layout">
			<div className="chat-container">
				<header className="chat-header">
					<button type="button" className="chat-back-button" onClick={handleBack}>
						<BackArrowIcon />
					</button>
					{otherUser && (
						<div className="chat-user-info">
							<Avatar src={otherUser.avatar} name={otherUser.username} size="small" />
							<span className="chat-username">{otherUser.username}</span>
						</div>
					)}
				</header>

				<div className="chat-messages">
					{messages.length === 0 ? (
						<p className="chat-empty">No messages yet. Start the conversation!</p>
					) : (
						messages.map((message) => (
							<MessageBubble key={message.id} message={message} isOwn={message.senderId === currentUser?.id} />
						))
					)}
					<div ref={messagesEndRef} />
				</div>

				<MessageInput onSend={handleSendMessage} disabled={sending} />
			</div>
		</PageLayout>
	);
};

export default ChatPage;
