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
	BackendPopularUser,
	PopularUser,
	BackendNotification,
	Notification,
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
	const thumbnailUrl = backendPost.thumbnailUrl ? buildImageUrl(backendPost.thumbnailUrl) : imageUrl;
	const mediumUrl = backendPost.mediumUrl ? buildImageUrl(backendPost.mediumUrl) : imageUrl;
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
		thumbnailUrl,
		mediumUrl,
		caption: backendPost.description || '',
		tags: backendPost.hashtags.map((h) => h.name),
		mentions: backendPost.mentions.map((m) => m.mentionedUser.username),
		likeCount: backendPost.likeCount ?? 0,
		commentCount: backendPost.commentCount ?? 0,
		likedByCurrentUser: backendPost.likedByCurrentUser ?? false,
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

export const transformBackendPopularUser = (backendPopularUser: BackendPopularUser): PopularUser => {
	const avatar = backendPopularUser.profilePictureUrl ? buildImageUrl(backendPopularUser.profilePictureUrl) : undefined;

	return {
		id: backendPopularUser.id,
		username: backendPopularUser.username,
		firstName: backendPopularUser.firstName,
		lastName: backendPopularUser.lastName,
		fullName: `${backendPopularUser.firstName} ${backendPopularUser.lastName}`,
		email: backendPopularUser.email,
		avatar,
		popularityScore: backendPopularUser.popularityScore,
	};
};

export const formatTimeAgo = (dateString: string): string => {
	const date = new Date(dateString);
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (seconds < 60) {
		return 'just now';
	}

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) {
		return `${minutes}m ago`;
	}

	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		return `${hours}h ago`;
	}

	const days = Math.floor(hours / 24);
	if (days < 7) {
		return `${days}d ago`;
	}

	const weeks = Math.floor(days / 7);
	if (weeks < 4) {
		return `${weeks}w ago`;
	}

	return date.toLocaleDateString();
};

export const transformBackendNotification = (backendNotification: BackendNotification): Notification => ({
	id: backendNotification.id,
	type: backendNotification.type,
	referenceId: backendNotification.referenceId,
	read: backendNotification.read,
	actor: transformBackendUser(backendNotification.actor),
	createdAt: backendNotification.createdAt,
	timeAgo: formatTimeAgo(backendNotification.createdAt),
});
