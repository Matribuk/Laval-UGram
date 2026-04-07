import { applyFilterToImage } from '../../utils/imageFilters';

describe('applyFilterToImage', () => {
	it('returns original file when filterName is empty', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
		const result = await applyFilterToImage(file, '');
		expect(result).toBe(file);
	});

	it('returns original file when filterName is normal', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
		const result = await applyFilterToImage(file, 'normal');
		expect(result).toBe(file);
	});

	it('returns original file for unknown filter', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
		const result = await applyFilterToImage(file, 'unknownfilter');
		expect(result).toBe(file);
	});

	it('returns original file for filter without style', async () => {
		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
		// 'normal' filter has no filter style
		const result = await applyFilterToImage(file, 'normal');
		expect(result).toBe(file);
	});
});
