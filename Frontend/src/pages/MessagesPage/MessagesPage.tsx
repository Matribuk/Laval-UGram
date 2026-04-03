import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Conversation } from '../../types/api.types';
import { useUser } from '../../components/UserContext';
import { useIsMounted } from '../../hooks/useIsMounted';
import PageLayout from '../../components/PageLayout/PageLayout';
import SearchInput from '../../components/SearchInput/SearchInput';
import ConversationItem from '../../components/ConversationItem/ConversationItem';
import EmptyState from '../../components/EmptyState/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { MessageIcon } from '../../utils/SvgFile';
import { messagesService } from '../../services/messagesService';
import './MessagesPage.css';

const MessagesPage: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useUser();
	const isMounted = useIsMounted();
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchConversations = async () => {
			try {
				setLoading(true);
				const data = await messagesService.getConversations();
				if (isMounted()) {
					setConversations(Array.isArray(data) ? data : []);
				}
			} catch (error) {
				if (isMounted()) {
					console.error('Failed to fetch conversations:', error);
					toast.error('Failed to load conversations');
					setConversations([]);
				}
			} finally {
				if (isMounted()) {
					setLoading(false);
				}
			}
		};

		fetchConversations();
	}, [isMounted]);

	const filteredConversations = useMemo(
		() =>
			conversations.filter(
				(conv) =>
					conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
					conv.otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
			),
		[conversations, searchQuery],
	);

	const handleConversationClick = useCallback(
		(conversation: Conversation) => {
			navigate(`/messages/${conversation.otherUser.id}`);
		},
		[navigate],
	);

	if (loading) {
		return (
			<PageLayout activePage="messages" user={user}>
				<LoadingSpinner message="Loading conversations..." />
			</PageLayout>
		);
	}

	return (
		<PageLayout activePage="messages" user={user}>
			<h1 className="messages-page-title">Messages</h1>

			<SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search conversations..." />

			<div className="conversations-list">
				{filteredConversations.length === 0 ? (
					<EmptyState
						icon={<MessageIcon width={48} height={48} />}
						title={searchQuery ? 'No conversations found' : 'No conversations yet'}
						subtitle={searchQuery ? 'Try a different search' : 'Start a conversation from a user profile'}
					/>
				) : (
					filteredConversations.map((conversation) => (
						<ConversationItem
							key={conversation.otherUser.id}
							conversation={conversation}
							onClick={() => handleConversationClick(conversation)}
						/>
					))
				)}
			</div>
		</PageLayout>
	);
};

export default MessagesPage;
