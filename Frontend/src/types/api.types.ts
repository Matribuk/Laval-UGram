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
	caption: string;
	tags: string[];
	mentions: string[];
}

export interface ProfilePost {
	id: string;
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
