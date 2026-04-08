export interface User {
	id: string;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string;
	profilePictureUrl?: string;
	createdAt?: string;
	fullName: string;
	avatar?: string;
}

export interface CurrentUser {
	name: string;
	email: string;
	avatar?: string;
}

export interface ProfileUser {
	username: string;
	fullName: string;
	email: string;
	phoneNumber?: string;
	joinedDate: string;
	avatar?: string;
}

export interface PostAuthor {
	username: string;
	avatar?: string;
}

export interface Post {
	id: string;
	author: PostAuthor;
	timeAgo: string;
	createdAt: string;
	imageUrl: string;
	thumbnailUrl: string;
	mediumUrl: string;
	caption: string;
	tags: string[];
	mentions: string[];
}

export interface ProfilePost {
	id: string;
	imageUrl: string;
	thumbnailUrl: string;
	mediumUrl: string;
}

export interface LoginFormValues {
	email: string;
	password: string;
}

export interface SignupFormValues {
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface EditProfileFormValues {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
}

export interface CreatePostFormValues {
	caption: string;
	tags: string;
	imageFile: File | null;
}

export interface EditPostFormValues {
	caption: string;
	tags: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface SignupRequest {
	email: string;
	password: string;
	username: string;
	firstName: string;
	lastName: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}

export interface BackendUser {
	id: string;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
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
	mediumUrl?: string;
	thumbnailUrl?: string;
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

export interface LikeStatus {
	likeCount: number;
	likedByCurrentUser: boolean;
}

export interface Comment {
	id: string;
	content: string;
	imageId: string;
	user: BackendUser;
	createdAt: string;
}

export interface BackendMessage {
	id: string;
	senderId: string;
	receiverId: string;
	content: string;
	read: boolean;
	createdAt: string;
	sender: BackendUser;
	receiver: BackendUser;
}

export interface Message {
	id: string;
	senderId: string;
	receiverId: string;
	content: string;
	read: boolean;
	createdAt: string;
	sender: User;
	receiver: User;
}

export interface BackendConversation {
	otherUser: BackendUser;
	lastMessage: BackendMessage | null;
	unreadCount: number;
}

export interface Conversation {
	otherUser: User;
	lastMessage: Message | null;
	unreadCount: number;
}

export interface SendMessageRequest {
	receiverId: string;
	content: string;
}

export interface BackendPopularUser {
	id: string;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	profilePictureUrl?: string;
	popularityScore: number;
}

export interface PopularUser {
	id: string;
	username: string;
	firstName: string;
	lastName: string;
	fullName: string;
	email: string;
	avatar?: string;
	popularityScore: number;
}

export type NotificationType = 'like' | 'comment' | 'message';

export interface BackendNotification {
	id: string;
	type: NotificationType;
	referenceId: string;
	read: boolean;
	actor: BackendUser;
	createdAt: string;
}

export interface Notification {
	id: string;
	type: NotificationType;
	referenceId: string;
	read: boolean;
	actor: User;
	createdAt: string;
	timeAgo: string;
}
