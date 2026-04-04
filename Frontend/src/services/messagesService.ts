import api from './api';
import {
	Message,
	Conversation,
	BackendMessage,
	BackendConversation,
	PaginatedResponse,
	SendMessageRequest,
} from '../types/api.types';
import { transformBackendMessage, transformBackendConversation } from '../utils/transformers';
import { ENDPOINTS } from './endpoints';

export const messagesService = {
	async getConversations(): Promise<Conversation[]> {
		const response = await api.get<BackendConversation[]>(ENDPOINTS.MESSAGES.CONVERSATIONS);
		return response.data.map(transformBackendConversation);
	},

	async getMessagesWithUser(
		userId: string,
		page = 1,
		limit = 50,
	): Promise<{
		messages: Message[];
		meta: { total: number; page: number; limit: number; totalPages: number };
	}> {
		const response = await api.get<PaginatedResponse<BackendMessage>>(
			`${ENDPOINTS.MESSAGES.WITH_USER(userId)}?page=${page}&limit=${limit}`,
		);
		return {
			messages: response.data.data.map(transformBackendMessage),
			meta: response.data.meta,
		};
	},

	async sendMessage(data: SendMessageRequest): Promise<Message> {
		const response = await api.post<BackendMessage>(ENDPOINTS.MESSAGES.BASE, data);
		return transformBackendMessage(response.data);
	},

	async markAsRead(messageId: string): Promise<Message> {
		const response = await api.patch<BackendMessage>(ENDPOINTS.MESSAGES.MARK_READ(messageId));
		return transformBackendMessage(response.data);
	},
};
