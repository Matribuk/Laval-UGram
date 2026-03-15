import { API_BASE_URL } from '../services/endpoints';

export const buildImageUrl = (url: string): string => {
	if (!url) {
		return '';
	}
	if (url.startsWith('http')) {
		return url;
	}
	const prefix = url.startsWith('/') ? '' : '/';
	return `${API_BASE_URL}${prefix}${url}`;
};
