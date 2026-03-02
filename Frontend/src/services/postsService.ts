import api from './api';
import { Post, BackendPost, PaginatedResponse } from '../types/api.types';
import { transformBackendPost } from '../utils/transformers';
import { ENDPOINTS } from './endpoints';

interface CreatePostData {
	description: string;
	hashtags?: string[];
	mentions?: string[];
	file: File;
}

interface UpdatePostData {
	description?: string;
	hashtags?: string[];
	mentions?: string[];
}

export const postsService = {
	async getAllPosts(): Promise<Post[]> {
		const response = await api.get<PaginatedResponse<BackendPost>>(`${ENDPOINTS.IMAGES.BASE}?limit=100`);
		return response.data.data.map(transformBackendPost);
	},

	async getPostById(id: string): Promise<Post> {
		const response = await api.get<BackendPost>(ENDPOINTS.IMAGES.BY_ID(id));
		return transformBackendPost(response.data);
	},

	async getUserPosts(userId: string): Promise<Post[]> {
		const response = await api.get<PaginatedResponse<BackendPost>>(ENDPOINTS.IMAGES.USER_IMAGES(userId) + '?limit=100');
		return response.data.data.map(transformBackendPost);
	},

	async getPostsByHashtag(hashtag: string): Promise<Post[]> {
		const response = await api.get<PaginatedResponse<BackendPost>>(ENDPOINTS.IMAGES.BY_HASHTAG(hashtag) + '?limit=100');
		return response.data.data.map(transformBackendPost);
	},

	async searchByDescription(description: string): Promise<Post[]> {
		const response = await api.get<PaginatedResponse<BackendPost>>(
			`${ENDPOINTS.IMAGES.SEARCH}?description=${encodeURIComponent(description)}&limit=100`,
		);
		return response.data.data.map(transformBackendPost);
	},

	async createPost(data: CreatePostData): Promise<Post> {
		const formData = new FormData();
		formData.append('image', data.file);
		formData.append('description', data.description);
		if (data.hashtags && data.hashtags.length > 0) {
			data.hashtags.forEach((tag) => formData.append('hashtags', tag));
		}
		if (data.mentions && data.mentions.length > 0) {
			data.mentions.forEach((mention) => formData.append('mentionedUserIds', mention));
		}

		const response = await api.post<BackendPost>(ENDPOINTS.IMAGES.BASE, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return transformBackendPost(response.data);
	},

	async updatePost(id: string, data: UpdatePostData): Promise<Post> {
		const response = await api.patch<BackendPost>(ENDPOINTS.IMAGES.BY_ID(id), data);
		return transformBackendPost(response.data);
	},

	async deletePost(id: string): Promise<void> {
		await api.delete(ENDPOINTS.IMAGES.BY_ID(id));
	},
};
