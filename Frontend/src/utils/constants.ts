export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

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
