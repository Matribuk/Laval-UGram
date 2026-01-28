import api from './api';
import { User, BackendUser, PaginatedResponse } from '../types/api.types';
import { transformBackendUser } from '../utils/transformers';

export const usersService = {
	async getAllUsers(): Promise<User[]> {
		const response = await api.get<PaginatedResponse<BackendUser>>('/users?limit=100');
		return response.data.data.map(transformBackendUser);
	},

	async getUserById(id: string): Promise<User> {
		const response = await api.get<BackendUser>(`/users/${id}`);
		return transformBackendUser(response.data);
	},

	async getCurrentUser(): Promise<User> {
		const response = await api.get<BackendUser>('/users/me');
		return transformBackendUser(response.data);
	},

	async searchUsers(query: string): Promise<User[]> {
		const response = await api.get<PaginatedResponse<BackendUser>>('/users/search', {
			params: { q: query, limit: 100 },
		});
		return response.data.data.map(transformBackendUser);
	},

	async updateUser(id: string, data: Partial<User>): Promise<User> {
		const response = await api.patch<BackendUser>(`/users/${id}`, data);
		return transformBackendUser(response.data);
	},

	async uploadProfilePicture(id: string, file: File): Promise<User> {
		const formData = new FormData();
		formData.append('image', file);
		const response = await api.post<BackendUser>(`/users/${id}/profile-picture`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return transformBackendUser(response.data);
	},
};
