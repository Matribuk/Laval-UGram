import {
	User,
	Post,
	PostAuthor,
	BackendUser,
	BackendPost,
	BackendMessage,
	Message,
	BackendConversation,
	Conversation,
} from '../types/api.types';
import { buildImageUrl } from './constants';

export const transformBackendUser = (backendUser: BackendUser): User => {
	const avatar = backendUser.profilePictureUrl ? buildImageUrl(backendUser.profilePictureUrl) : undefined;

	return {
		id: backendUser.id,
		username: backendUser.username,
		email: backendUser.email,
		firstName: backendUser.firstName,
		lastName: backendUser.lastName,
		phoneNumber: backendUser.phoneNumber,
		profilePictureUrl: avatar,
		createdAt: backendUser.createdAt,
		fullName: `${backendUser.firstName} ${backendUser.lastName}`,
		avatar,
	};
};

export const transformBackendPost = (backendPost: BackendPost): Post => {
	const imageUrl = buildImageUrl(backendPost.url);
	const avatar = backendPost.user.profilePictureUrl ? buildImageUrl(backendPost.user.profilePictureUrl) : undefined;

	const author: PostAuthor = {
		username: backendPost.user.username,
		avatar,
	};

	return {
		id: backendPost.id,
		author,
		timeAgo: '',
		createdAt: backendPost.createdAt,
		imageUrl,
		caption: backendPost.description || '',
		tags: backendPost.hashtags.map((h) => h.name),
		mentions: backendPost.mentions.map((m) => m.mentionedUser.username),
	};
};

export const transformBackendMessage = (backendMessage: BackendMessage): Message => ({
	id: backendMessage.id,
	senderId: backendMessage.senderId,
	receiverId: backendMessage.receiverId,
	content: backendMessage.content,
	read: backendMessage.read,
	createdAt: backendMessage.createdAt,
	sender: transformBackendUser(backendMessage.sender),
	receiver: transformBackendUser(backendMessage.receiver),
});

export const transformBackendConversation = (backendConversation: BackendConversation): Conversation => ({
	otherUser: transformBackendUser(backendConversation.otherUser),
	lastMessage: backendConversation.lastMessage ? transformBackendMessage(backendConversation.lastMessage) : null,
	unreadCount: backendConversation.unreadCount,
});
