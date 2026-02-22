export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const ENDPOINTS = {
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
		LOGOUT: '/auth/logout',
		GOOGLE: '/auth/google',
		GOOGLE_CALLBACK: '/auth/google/callback',
	},

	USERS: {
		BASE: '/users',
		BY_ID: (id: string) => `/users/${id}`,
		ME: '/users/me',
		SEARCH: '/users/search',
		PROFILE_PICTURE: (id: string) => `/users/${id}/profile-picture`,
	},

	IMAGES: {
		BASE: '/images',
		BY_ID: (id: string) => `/images/${id}`,
		SEARCH: '/images/search',
		BY_HASHTAG: (hashtag: string) => `/images/hashtag/${hashtag}`,
		USER_IMAGES: (userId: string) => `/images/user/${userId}`,
	},
} as const;

export const OAUTH_URLS = {
	GOOGLE: `${API_BASE_URL}/api${ENDPOINTS.AUTH.GOOGLE}`,
};
