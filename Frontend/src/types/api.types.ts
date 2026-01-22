export interface User {
	id: number;
	username: string;
	fullName: string;
	email: string;
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
	id: number;
	author: PostAuthor;
	timeAgo: string;
	createdAt: string;
	imageUrl: string;
	caption: string;
	tags: string[];
	mentions: string[];
}

export interface ProfilePost {
	id: number;
	imageUrl: string;
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
	fullName: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}

export interface Message {
	id: number;
	senderId: number;
	senderUsername: string;
	content: string;
	timestamp: string;
	read: boolean;
}

export interface Conversation {
	id: number;
	participantId: number;
	participantUsername: string;
	participantFullName: string;
	participantAvatar?: string | null;
	lastMessage: string;
	lastMessageTime: string;
	unreadCount: number;
	messages: Message[];
}
