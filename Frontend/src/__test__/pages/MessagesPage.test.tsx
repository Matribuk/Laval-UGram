import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessagesPage from '../../pages/MessagesPage/MessagesPage';
import * as UserContext from '../../components/UserContext';
import { messagesService } from '../../services/messagesService';
import { toast } from 'react-toastify';
import { Conversation } from '../../types/api.types';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
	useNavigate: () => mockNavigate,
}));
jest.mock('../../components/UserContext');
jest.mock('../../services/messagesService');
jest.mock('react-toastify', () => ({
	toast: {
		error: jest.fn(),
	},
}));
jest.mock('../../utils/SvgFile', () => ({
	HomeIcon: () => <svg data-testid="home-icon" />,
	UsersIcon: () => <svg data-testid="users-icon" />,
	ProfileIcon: () => <svg data-testid="profile-icon" />,
	PlusIcon: () => <svg data-testid="plus-icon" />,
	LogoutIcon: () => <svg data-testid="logout-icon" />,
	MessageIcon: () => <svg data-testid="message-icon" />,
	SearchIcon: () => <svg data-testid="search-icon" />,
}));
jest.mock('../../utils/helpers', () => ({
	getTimeAgo: jest.fn(() => '1 hour ago'),
}));

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;
const mockMessagesService = messagesService as jest.Mocked<typeof messagesService>;

describe('MessagesPage', () => {
	const mockUser = {
		id: 'user-1',
		username: 'johndoe',
		email: 'john@test.com',
		firstName: 'John',
		lastName: 'Doe',
		fullName: 'John Doe',
	};

	const mockConversations: Conversation[] = [
		{
			otherUser: {
				id: 'user-2',
				username: 'alice',
				email: 'alice@test.com',
				firstName: 'Alice',
				lastName: 'Smith',
				fullName: 'Alice Smith',
			},
			lastMessage: {
				id: 'msg-1',
				senderId: 'user-2',
				receiverId: 'user-1',
				content: 'Hello there!',
				read: true,
				createdAt: new Date().toISOString(),
				sender: {
					id: 'user-2',
					username: 'alice',
					email: 'alice@test.com',
					firstName: 'Alice',
					lastName: 'Smith',
					fullName: 'Alice Smith',
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
		},
		{
			otherUser: {
				id: 'user-3',
				username: 'bob',
				email: 'bob@test.com',
				firstName: 'Bob',
				lastName: 'Jones',
				fullName: 'Bob Jones',
			},
			lastMessage: null,
			unreadCount: 2,
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseUser.mockReturnValue({
			user: mockUser,
			setUser: jest.fn(),
			updateUser: jest.fn(),
			login: jest.fn(),
			signup: jest.fn(),
			logout: jest.fn(),
			loading: false,
			error: null,
			isAuthenticated: true,
		});
	});

	it('shows loading spinner while fetching conversations', async () => {
		mockMessagesService.getConversations.mockImplementation(() => new Promise(jest.fn()));
		render(<MessagesPage />);
		expect(screen.getByText('Loading conversations...')).toBeInTheDocument();
	});

	it('renders page title', async () => {
		mockMessagesService.getConversations.mockResolvedValue(mockConversations);
		render(<MessagesPage />);

		await waitFor(() => {
			expect(screen.getByRole('heading', { name: 'Messages' })).toBeInTheDocument();
		});
	});

	it('renders conversations list', async () => {
		mockMessagesService.getConversations.mockResolvedValue(mockConversations);
		render(<MessagesPage />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
			expect(screen.getByText('bob')).toBeInTheDocument();
		});
	});

	it('renders empty state when no conversations', async () => {
		mockMessagesService.getConversations.mockResolvedValue([]);
		render(<MessagesPage />);

		await waitFor(() => {
			expect(screen.getByText('No conversations yet')).toBeInTheDocument();
		});
	});

	it('filters conversations by username', async () => {
		mockMessagesService.getConversations.mockResolvedValue(mockConversations);
		render(<MessagesPage />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
		});

		const searchInput = screen.getByPlaceholderText('Search conversations...');
		await userEvent.type(searchInput, 'alice');

		expect(screen.getByText('alice')).toBeInTheDocument();
		expect(screen.queryByText('bob')).not.toBeInTheDocument();
	});

	it('filters conversations by full name', async () => {
		mockMessagesService.getConversations.mockResolvedValue(mockConversations);
		render(<MessagesPage />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
		});

		const searchInput = screen.getByPlaceholderText('Search conversations...');
		await userEvent.type(searchInput, 'Bob Jones');

		expect(screen.queryByText('alice')).not.toBeInTheDocument();
		expect(screen.getByText('bob')).toBeInTheDocument();
	});

	it('shows empty state when search has no results', async () => {
		mockMessagesService.getConversations.mockResolvedValue(mockConversations);
		render(<MessagesPage />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
		});

		const searchInput = screen.getByPlaceholderText('Search conversations...');
		await userEvent.type(searchInput, 'nonexistent');

		expect(screen.getByText('No conversations found')).toBeInTheDocument();
	});

	it('navigates to chat when conversation is clicked', async () => {
		mockMessagesService.getConversations.mockResolvedValue(mockConversations);
		render(<MessagesPage />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
		});

		const conversationItem = screen.getByText('alice').closest('[role="button"]');
		fireEvent.click(conversationItem!);

		expect(mockNavigate).toHaveBeenCalledWith('/messages/user-2');
	});

	it('shows error toast on fetch failure', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
		mockMessagesService.getConversations.mockRejectedValue(new Error('Network error'));
		render(<MessagesPage />);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Failed to load conversations');
		});

		consoleSpy.mockRestore();
	});

	it('handles non-array response', async () => {
		mockMessagesService.getConversations.mockResolvedValue(null as unknown as Conversation[]);
		render(<MessagesPage />);

		await waitFor(() => {
			expect(screen.getByText('No conversations yet')).toBeInTheDocument();
		});
	});
});
