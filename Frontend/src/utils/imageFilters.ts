import { IMAGE_FILTERS } from '../components/ImageFilters';

export const applyFilterToImage = (file: File, filterName: string, dataUrl: string): Promise<File> => {
	return new Promise((resolve, reject) => {
		if (!filterName || filterName === 'normal') {
			resolve(file);
			return;
		}

		const filter = IMAGE_FILTERS.find((f) => f.name === filterName);
		if (!filter || !filter.style.filter) {
			resolve(file);
			return;
		}

		const img = new Image();

		img.onload = () => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			if (!ctx) {
				reject(new Error('Could not get canvas context'));
				return;
			}

			canvas.width = img.width;
			canvas.height = img.height;

			ctx.filter = filter.style.filter as string;
			ctx.drawImage(img, 0, 0);

			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error('Could not create blob from canvas'));
						return;
					}

					resolve(
						new File([blob], file.name, {
							type: file.type || 'image/jpeg',
							lastModified: Date.now(),
						}),
					);
				},
				file.type || 'image/jpeg',
				0.92,
			);
		};

		img.onerror = () => {
			reject(new Error('Could not load image'));
		};

		img.src = dataUrl;
	});
};
