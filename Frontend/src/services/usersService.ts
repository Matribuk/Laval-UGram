import api from './api';
import { User, BackendUser, PaginatedResponse } from '../types/api.types';
import { transformBackendUser } from '../utils/transformers';
import { ENDPOINTS } from './endpoints';

export const usersService = {
	async getAllUsers(): Promise<User[]> {
		const response = await api.get<PaginatedResponse<BackendUser>>(`${ENDPOINTS.USERS.BASE}?limit=100`);
		return response.data.data.map(transformBackendUser);
	},

	async getUserById(id: string): Promise<User> {
		const response = await api.get<BackendUser>(ENDPOINTS.USERS.BY_ID(id));
		return transformBackendUser(response.data);
	},

	async getCurrentUser(): Promise<User> {
		const response = await api.get<BackendUser>(ENDPOINTS.USERS.ME);
		return transformBackendUser(response.data);
	},

	async searchUsers(query: string): Promise<User[]> {
		const response = await api.get<PaginatedResponse<BackendUser>>(ENDPOINTS.USERS.SEARCH, {
			params: { q: query, limit: 100 },
		});
		return response.data.data.map(transformBackendUser);
	},

	async updateUser(id: string, data: Partial<User>): Promise<User> {
		const response = await api.patch<BackendUser>(ENDPOINTS.USERS.BY_ID(id), data);
		return transformBackendUser(response.data);
	},

	async uploadProfilePicture(id: string, file: File): Promise<User> {
		const formData = new FormData();
		formData.append('image', file);
		const response = await api.post<BackendUser>(ENDPOINTS.USERS.PROFILE_PICTURE(id), formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return transformBackendUser(response.data);
	},

	async deleteUser(id: string): Promise<void> {
		await api.delete(ENDPOINTS.USERS.BY_ID(id));
	},
};
