import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageBubble from '../../components/MessageBubble/MessageBubble';
import { Message } from '../../types/api.types';

describe('MessageBubble', () => {
	const mockMessage: Message = {
		id: 'msg-1',
		senderId: 'user-1',
		receiverId: 'user-2',
		content: 'Hello, how are you?',
		read: false,
		createdAt: new Date().toISOString(),
		sender: {
			id: 'user-1',
			username: 'alice',
			email: 'alice@test.com',
			firstName: 'Alice',
			lastName: 'Smith',
			fullName: 'Alice Smith',
		},
		receiver: {
			id: 'user-2',
			username: 'bob',
			email: 'bob@test.com',
			firstName: 'Bob',
			lastName: 'Jones',
			fullName: 'Bob Jones',
		},
	};

	it('renders message content', () => {
		render(<MessageBubble message={mockMessage} isOwn={false} />);
		expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
	});

	it('renders timestamp element', () => {
		const { container } = render(<MessageBubble message={mockMessage} isOwn={false} />);
		const timeElement = container.querySelector('.message-bubble-time');
		expect(timeElement).toBeInTheDocument();
	});

	it('applies own message class when isOwn is true', () => {
		const { container } = render(<MessageBubble message={mockMessage} isOwn={true} />);
		expect(container.firstChild).toHaveClass('message-bubble', 'message-bubble-own');
	});

	it('applies other message class when isOwn is false', () => {
		const { container } = render(<MessageBubble message={mockMessage} isOwn={false} />);
		expect(container.firstChild).toHaveClass('message-bubble', 'message-bubble-other');
	});
});
