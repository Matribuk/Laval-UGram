import { messagesService } from '../../services/messagesService';
import api from '../../services/api';

jest.mock('../../services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('messagesService', () => {
	const mockBackendUser = {
		id: 'user-123',
		username: 'johndoe',
		email: 'john@example.com',
		firstName: 'John',
		lastName: 'Doe',
		profilePictureUrl: null,
	};

	const mockBackendMessage = {
		id: 'msg-1',
		senderId: 'user-123',
		receiverId: 'user-456',
		content: 'Hello!',
		read: false,
		createdAt: '2024-01-01T00:00:00Z',
		sender: mockBackendUser,
		receiver: { ...mockBackendUser, id: 'user-456', username: 'janedoe' },
	};

	const mockBackendConversation = {
		otherUser: mockBackendUser,
		lastMessage: mockBackendMessage,
		unreadCount: 2,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getConversations', () => {
		it('returns transformed conversations', async () => {
			mockApi.get.mockResolvedValue({
				data: [mockBackendConversation],
			});

			const conversations = await messagesService.getConversations();

			expect(mockApi.get).toHaveBeenCalledWith('/messages/conversations');
			expect(conversations).toHaveLength(1);
			expect(conversations[0].unreadCount).toBe(2);
			expect(conversations[0].otherUser.username).toBe('johndoe');
		});

		it('handles empty conversations list', async () => {
			mockApi.get.mockResolvedValue({ data: [] });

			const conversations = await messagesService.getConversations();

			expect(conversations).toHaveLength(0);
		});
	});

	describe('getMessagesWithUser', () => {
		it('returns transformed messages with pagination meta', async () => {
			mockApi.get.mockResolvedValue({
				data: {
					data: [mockBackendMessage],
					meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
				},
			});

			const result = await messagesService.getMessagesWithUser('user-456');

			expect(mockApi.get).toHaveBeenCalledWith('/messages/user-456?page=1&limit=50');
			expect(result.messages).toHaveLength(1);
			expect(result.messages[0].content).toBe('Hello!');
			expect(result.meta.total).toBe(1);
		});

		it('supports custom pagination parameters', async () => {
			mockApi.get.mockResolvedValue({
				data: {
					data: [],
					meta: { total: 0, page: 2, limit: 20, totalPages: 0 },
				},
			});

			await messagesService.getMessagesWithUser('user-456', 2, 20);

			expect(mockApi.get).toHaveBeenCalledWith('/messages/user-456?page=2&limit=20');
		});
	});

	describe('sendMessage', () => {
		it('sends message and returns transformed result', async () => {
			mockApi.post.mockResolvedValue({ data: mockBackendMessage });

			const message = await messagesService.sendMessage({
				receiverId: 'user-456',
				content: 'Hello!',
			});

			expect(mockApi.post).toHaveBeenCalledWith('/messages', {
				receiverId: 'user-456',
				content: 'Hello!',
			});
			expect(message.content).toBe('Hello!');
			expect(message.senderId).toBe('user-123');
		});
	});

	describe('markAsRead', () => {
		it('marks message as read and returns transformed message', async () => {
			const readMessage = { ...mockBackendMessage, read: true };
			mockApi.patch.mockResolvedValue({ data: readMessage });

			const message = await messagesService.markAsRead('msg-1');

			expect(mockApi.patch).toHaveBeenCalledWith('/messages/msg-1/read');
			expect(message.read).toBe(true);
		});
	});
});
