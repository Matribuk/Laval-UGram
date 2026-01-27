import { User, Post, PostAuthor } from '../types/api.types';
import { buildImageUrl } from './constants';

export interface BackendUser {
	id: string;
	username: string;
	email: string;
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	profilePictureUrl?: string;
	createdAt?: string;
}

export interface BackendHashtag {
	id: string;
	name: string;
}

export interface BackendMention {
	id: string;
	mentionedUser: BackendUser;
}

export interface BackendPost {
	id: string;
	url: string;
	description?: string;
	user: BackendUser;
	hashtags: BackendHashtag[];
	mentions: BackendMention[];
	createdAt: string;
	updatedAt: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

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
		fullName:
			backendUser.firstName && backendUser.lastName
				? `${backendUser.firstName} ${backendUser.lastName}`
				: backendUser.firstName || backendUser.lastName || '',
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
