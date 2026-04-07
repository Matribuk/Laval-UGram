import { IMAGE_FILTERS } from '../components/ImageFilters';

export const applyFilterToImage = (file: File, filterName: string): Promise<File> => {
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
		const reader = new FileReader();

		reader.onload = (e) => {
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

						const filteredFile = new File([blob], file.name, {
							type: file.type || 'image/jpeg',
							lastModified: Date.now(),
						});

						resolve(filteredFile);
					},
					file.type || 'image/jpeg',
					0.92,
				);
			};

			img.onerror = () => {
				reject(new Error('Could not load image'));
			};

			img.src = e.target?.result as string;
		};

		reader.onerror = () => {
			reject(new Error('Could not read file'));
		};

		reader.readAsDataURL(file);
	});
};
