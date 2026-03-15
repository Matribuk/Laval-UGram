import { getInitial, formatDate, truncateText, parseMentions, parseTags, getTimeAgo } from '../../utils/helpers';

describe('helpers', () => {
	describe('getInitial', () => {
		it('returns uppercase first character', () => {
			expect(getInitial('john')).toBe('J');
		});

		it('handles already uppercase', () => {
			expect(getInitial('Alice')).toBe('A');
		});

		it('handles single character', () => {
			expect(getInitial('x')).toBe('X');
		});
	});

	describe('formatDate', () => {
		it('formats date correctly', () => {
			const date = new Date('2024-03-15');
			const result = formatDate(date);
			expect(result).toContain('Mar');
			expect(result).toContain('2024');
		});
	});

	describe('truncateText', () => {
		it('returns original text if shorter than maxLength', () => {
			expect(truncateText('hello', 10)).toBe('hello');
		});

		it('returns original text if equal to maxLength', () => {
			expect(truncateText('hello', 5)).toBe('hello');
		});

		it('truncates and adds ellipsis if longer than maxLength', () => {
			expect(truncateText('hello world', 5)).toBe('hello...');
		});
	});

	describe('parseMentions', () => {
		it('returns empty array for text without mentions', () => {
			expect(parseMentions('hello world')).toEqual([]);
		});

		it('extracts single mention', () => {
			expect(parseMentions('hello @john')).toEqual(['john']);
		});

		it('extracts multiple mentions', () => {
			expect(parseMentions('hello @john and @jane')).toEqual(['john', 'jane']);
		});

		it('handles mentions with underscores and numbers', () => {
			expect(parseMentions('@user_123')).toEqual(['user_123']);
		});
	});

	describe('parseTags', () => {
		it('parses comma-separated tags', () => {
			expect(parseTags('tag1, tag2, tag3')).toEqual(['tag1', 'tag2', 'tag3']);
		});

		it('parses space-separated tags', () => {
			expect(parseTags('tag1 tag2 tag3')).toEqual(['tag1', 'tag2', 'tag3']);
		});

		it('removes # prefix', () => {
			expect(parseTags('#tag1 #tag2')).toEqual(['tag1', 'tag2']);
		});

		it('filters empty tags', () => {
			expect(parseTags('tag1,, tag2')).toEqual(['tag1', 'tag2']);
		});

		it('handles mixed separators', () => {
			expect(parseTags('#tag1, tag2 #tag3')).toEqual(['tag1', 'tag2', 'tag3']);
		});
	});

	describe('getTimeAgo', () => {
		it('returns "just now" for recent times', () => {
			const now = new Date().toISOString();
			expect(getTimeAgo(now)).toBe('just now');
		});

		it('returns minutes ago', () => {
			const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
			expect(getTimeAgo(date)).toBe('5 minutes ago');
		});

		it('returns singular minute', () => {
			const date = new Date(Date.now() - 1 * 60 * 1000).toISOString();
			expect(getTimeAgo(date)).toBe('1 minute ago');
		});

		it('returns hours ago', () => {
			const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
			expect(getTimeAgo(date)).toBe('3 hours ago');
		});

		it('returns singular hour', () => {
			const date = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
			expect(getTimeAgo(date)).toBe('1 hour ago');
		});

		it('returns days ago', () => {
			const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
			expect(getTimeAgo(date)).toBe('3 days ago');
		});

		it('returns singular day', () => {
			const date = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
			expect(getTimeAgo(date)).toBe('1 day ago');
		});

		it('returns weeks ago', () => {
			const date = new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000).toISOString();
			expect(getTimeAgo(date)).toBe('2 weeks ago');
		});

		it('returns singular week', () => {
			const date = new Date(Date.now() - 1 * 7 * 24 * 60 * 60 * 1000).toISOString();
			expect(getTimeAgo(date)).toBe('1 week ago');
		});

		it('returns months ago', () => {
			const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
			expect(getTimeAgo(date)).toBe('2 months ago');
		});

		it('returns singular month', () => {
			const date = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
			expect(getTimeAgo(date)).toBe('1 month ago');
		});
	});
});
