import { buildImageUrl } from '../../utils/constants';
import { API_BASE_URL } from '../../services/endpoints';

describe('constants', () => {
	describe('buildImageUrl', () => {
		it('returns empty string for empty url', () => {
			expect(buildImageUrl('')).toBe('');
		});

		it('returns url as-is if starts with http', () => {
			expect(buildImageUrl('http://example.com/image.jpg')).toBe('http://example.com/image.jpg');
		});

		it('returns url as-is if starts with https', () => {
			expect(buildImageUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
		});

		it('prepends API_BASE_URL for relative urls starting with /', () => {
			expect(buildImageUrl('/uploads/image.jpg')).toBe(`${API_BASE_URL}/uploads/image.jpg`);
		});

		it('prepends API_BASE_URL with / for relative urls not starting with /', () => {
			expect(buildImageUrl('uploads/image.jpg')).toBe(`${API_BASE_URL}/uploads/image.jpg`);
		});
	});

	describe('API_BASE_URL', () => {
		it('is defined', () => {
			expect(API_BASE_URL).toBeDefined();
			expect(typeof API_BASE_URL).toBe('string');
		});
	});
});
