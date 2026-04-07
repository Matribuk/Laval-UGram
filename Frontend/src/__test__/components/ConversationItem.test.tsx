import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConversationItem from '../../components/ConversationItem/ConversationItem';
import { Conversation } from '../../types/api.types';

describe('ConversationItem', () => {
	const mockOnClick = jest.fn();

	const mockConversation: Conversation = {
		otherUser: {
			id: 'user-2',
			username: 'janedoe',
			email: 'jane@test.com',
			firstName: 'Jane',
			lastName: 'Doe',
			fullName: 'Jane Doe',
			avatar: '/avatar.jpg',
		},
		lastMessage: {
			id: 'msg-1',
			senderId: 'user-2',
			receiverId: 'user-1',
			content: 'Hey, how are you?',
			read: true,
			createdAt: new Date().toISOString(),
			sender: {
				id: 'user-2',
				username: 'janedoe',
				email: 'jane@test.com',
				firstName: 'Jane',
				lastName: 'Doe',
				fullName: 'Jane Doe',
			},
			receiver: {
				id: 'user-1',
				username: 'johndoe',
				email: 'john@test.com',
				firstName: 'John',
				lastName: 'Doe',
				fullName: 'John Doe',
			},
		},
		unreadCount: 0,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders username', () => {
		render(<ConversationItem conversation={mockConversation} onClick={mockOnClick} />);
		expect(screen.getByText('janedoe')).toBeInTheDocument();
	});

	it('renders last message preview', () => {
		render(<ConversationItem conversation={mockConversation} onClick={mockOnClick} />);
		expect(screen.getByText('Hey, how are you?')).toBeInTheDocument();
	});

	it('renders timestamp element when last message exists', () => {
		const { container } = render(<ConversationItem conversation={mockConversation} onClick={mockOnClick} />);
		const timeElement = container.querySelector('.conversation-item-time');
		expect(timeElement).toBeInTheDocument();
	});

	it('renders "No messages yet" when no last message', () => {
		const conversationNoMessage: Conversation = {
			...mockConversation,
			lastMessage: null,
		};
		render(<ConversationItem conversation={conversationNoMessage} onClick={mockOnClick} />);
		expect(screen.getByText('No messages yet')).toBeInTheDocument();
	});

	it('shows unread badge when unreadCount > 0', () => {
		const conversationUnread: Conversation = {
			...mockConversation,
			unreadCount: 3,
		};
		render(<ConversationItem conversation={conversationUnread} onClick={mockOnClick} />);
		expect(screen.getByText('3')).toBeInTheDocument();
	});

	it('does not show unread badge when unreadCount is 0', () => {
		render(<ConversationItem conversation={mockConversation} onClick={mockOnClick} />);
		expect(screen.queryByText('0')).not.toBeInTheDocument();
	});

	it('applies unread class when has unread messages', () => {
		const conversationUnread: Conversation = {
			...mockConversation,
			unreadCount: 2,
		};
		const { container } = render(<ConversationItem conversation={conversationUnread} onClick={mockOnClick} />);
		expect(container.firstChild).toHaveClass('conversation-item-unread');
	});

	it('calls onClick when clicked', () => {
		render(<ConversationItem conversation={mockConversation} onClick={mockOnClick} />);
		fireEvent.click(screen.getByRole('button'));
		expect(mockOnClick).toHaveBeenCalledTimes(1);
	});

	it('calls onClick when Enter key is pressed', () => {
		render(<ConversationItem conversation={mockConversation} onClick={mockOnClick} />);
		fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
		expect(mockOnClick).toHaveBeenCalledTimes(1);
	});

	it('does not call onClick for other keys', () => {
		render(<ConversationItem conversation={mockConversation} onClick={mockOnClick} />);
		fireEvent.keyDown(screen.getByRole('button'), { key: 'Space' });
		expect(mockOnClick).not.toHaveBeenCalled();
	});

	it('has correct accessibility attributes', () => {
		render(<ConversationItem conversation={mockConversation} onClick={mockOnClick} />);
		const item = screen.getByRole('button');
		expect(item).toHaveAttribute('tabIndex', '0');
	});
});
