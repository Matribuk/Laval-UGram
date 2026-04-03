import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatPage from '../../pages/ChatPage/ChatPage';
import * as UserContext from '../../components/UserContext';
import { messagesService } from '../../services/messagesService';
import { usersService } from '../../services/usersService';
import { toast } from 'react-toastify';
import { Message, User } from '../../types/api.types';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
	useParams: () => ({ userId: 'user-2' }),
	useNavigate: () => mockNavigate,
}));
jest.mock('../../components/UserContext');
jest.mock('../../services/messagesService');
jest.mock('../../services/usersService');
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
	BackArrowIcon: () => <svg data-testid="back-arrow-icon" />,
	SendIcon: () => <svg data-testid="send-icon" />,
}));
jest.mock('../../utils/helpers', () => ({
	getTimeAgo: jest.fn(() => '5 min ago'),
}));

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;
const mockMessagesService = messagesService as jest.Mocked<typeof messagesService>;
const mockUsersService = usersService as jest.Mocked<typeof usersService>;

describe('ChatPage', () => {
	const mockCurrentUser = {
		id: 'user-1',
		username: 'johndoe',
		email: 'john@test.com',
		firstName: 'John',
		lastName: 'Doe',
		fullName: 'John Doe',
	};

	const mockOtherUser: User = {
		id: 'user-2',
		username: 'alice',
		email: 'alice@test.com',
		firstName: 'Alice',
		lastName: 'Smith',
		fullName: 'Alice Smith',
		avatar: '/avatar.jpg',
	};

	const mockMessages: Message[] = [
		{
			id: 'msg-1',
			senderId: 'user-2',
			receiverId: 'user-1',
			content: 'Hello!',
			read: true,
			createdAt: new Date().toISOString(),
			sender: mockOtherUser,
			receiver: mockCurrentUser,
		},
		{
			id: 'msg-2',
			senderId: 'user-1',
			receiverId: 'user-2',
			content: 'Hi there!',
			read: true,
			createdAt: new Date().toISOString(),
			sender: mockCurrentUser,
			receiver: mockOtherUser,
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseUser.mockReturnValue({
			user: mockCurrentUser,
			setUser: jest.fn(),
			updateUser: jest.fn(),
			login: jest.fn(),
			signup: jest.fn(),
			logout: jest.fn(),
			loading: false,
			error: null,
			isAuthenticated: true,
		});
		window.HTMLElement.prototype.scrollIntoView = jest.fn();
	});

	it('shows loading spinner while fetching data', async () => {
		mockMessagesService.getMessagesWithUser.mockImplementation(() => new Promise(jest.fn()));
		mockUsersService.getUserById.mockImplementation(() => new Promise(jest.fn()));
		render(<ChatPage />);
		expect(screen.getByText('Loading conversation...')).toBeInTheDocument();
	});

	it('renders chat header with user info', async () => {
		mockMessagesService.getMessagesWithUser.mockResolvedValue({
			messages: mockMessages,
			meta: { total: 2, page: 1, limit: 50, totalPages: 1 },
		});
		mockUsersService.getUserById.mockResolvedValue(mockOtherUser);
		mockMessagesService.markAsRead.mockResolvedValue(mockMessages[0]);

		render(<ChatPage />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
		});
	});

	it('renders messages', async () => {
		mockMessagesService.getMessagesWithUser.mockResolvedValue({
			messages: mockMessages,
			meta: { total: 2, page: 1, limit: 50, totalPages: 1 },
		});
		mockUsersService.getUserById.mockResolvedValue(mockOtherUser);
		mockMessagesService.markAsRead.mockResolvedValue(mockMessages[0]);

		render(<ChatPage />);

		await waitFor(() => {
			expect(screen.getByText('Hello!')).toBeInTheDocument();
			expect(screen.getByText('Hi there!')).toBeInTheDocument();
		});
	});

	it('renders empty state when no messages', async () => {
		mockMessagesService.getMessagesWithUser.mockResolvedValue({
			messages: [],
			meta: { total: 0, page: 1, limit: 50, totalPages: 0 },
		});
		mockUsersService.getUserById.mockResolvedValue(mockOtherUser);

		render(<ChatPage />);

		await waitFor(() => {
			expect(screen.getByText('No messages yet. Start the conversation!')).toBeInTheDocument();
		});
	});

	it('navigates back when back button is clicked', async () => {
		mockMessagesService.getMessagesWithUser.mockResolvedValue({
			messages: mockMessages,
			meta: { total: 2, page: 1, limit: 50, totalPages: 1 },
		});
		mockUsersService.getUserById.mockResolvedValue(mockOtherUser);
		mockMessagesService.markAsRead.mockResolvedValue(mockMessages[0]);

		render(<ChatPage />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
		});

		const backButton = screen.getByTestId('back-arrow-icon').closest('button');
		fireEvent.click(backButton!);

		expect(mockNavigate).toHaveBeenCalledWith('/messages');
	});

	it('sends message when form is submitted', async () => {
		const newMessage: Message = {
			id: 'msg-3',
			senderId: 'user-1',
			receiverId: 'user-2',
			content: 'New message',
			read: false,
			createdAt: new Date().toISOString(),
			sender: mockCurrentUser,
			receiver: mockOtherUser,
		};

		mockMessagesService.getMessagesWithUser.mockResolvedValue({
			messages: mockMessages,
			meta: { total: 2, page: 1, limit: 50, totalPages: 1 },
		});
		mockUsersService.getUserById.mockResolvedValue(mockOtherUser);
		mockMessagesService.markAsRead.mockResolvedValue(mockMessages[0]);
		mockMessagesService.sendMessage.mockResolvedValue(newMessage);

		render(<ChatPage />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
		});

		const input = screen.getByPlaceholderText('Type a message...');
		await userEvent.type(input, 'New message');
		fireEvent.submit(input.closest('form')!);

		await waitFor(() => {
			expect(mockMessagesService.sendMessage).toHaveBeenCalledWith({
				receiverId: 'user-2',
				content: 'New message',
			});
		});
	});

	it('shows error toast on fetch failure', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
		mockMessagesService.getMessagesWithUser.mockRejectedValue(new Error('Network error'));
		mockUsersService.getUserById.mockRejectedValue(new Error('Network error'));

		render(<ChatPage />);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Failed to load conversation');
		});

		consoleSpy.mockRestore();
	});

	it('shows error toast on send failure', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
		mockMessagesService.getMessagesWithUser.mockResolvedValue({
			messages: mockMessages,
			meta: { total: 2, page: 1, limit: 50, totalPages: 1 },
		});
		mockUsersService.getUserById.mockResolvedValue(mockOtherUser);
		mockMessagesService.markAsRead.mockResolvedValue(mockMessages[0]);
		mockMessagesService.sendMessage.mockRejectedValue(new Error('Send failed'));

		render(<ChatPage />);

		await waitFor(() => {
			expect(screen.getByText('alice')).toBeInTheDocument();
		});

		const input = screen.getByPlaceholderText('Type a message...');
		await userEvent.type(input, 'Test');
		fireEvent.submit(input.closest('form')!);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Failed to send message');
		});

		consoleSpy.mockRestore();
	});

	it('marks unread messages as read', async () => {
		const unreadMessage: Message = {
			...mockMessages[0],
			read: false,
		};

		mockMessagesService.getMessagesWithUser.mockResolvedValue({
			messages: [unreadMessage],
			meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
		});
		mockUsersService.getUserById.mockResolvedValue(mockOtherUser);
		mockMessagesService.markAsRead.mockResolvedValue({ ...unreadMessage, read: true });

		render(<ChatPage />);

		await waitFor(() => {
			expect(mockMessagesService.markAsRead).toHaveBeenCalledWith('msg-1');
		});
	});

	it('scrolls to bottom when messages load', async () => {
		mockMessagesService.getMessagesWithUser.mockResolvedValue({
			messages: mockMessages,
			meta: { total: 2, page: 1, limit: 50, totalPages: 1 },
		});
		mockUsersService.getUserById.mockResolvedValue(mockOtherUser);
		mockMessagesService.markAsRead.mockResolvedValue(mockMessages[0]);

		render(<ChatPage />);

		await waitFor(() => {
			expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
		});
	});
});
