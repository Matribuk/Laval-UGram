import { IMAGE_FILTERS } from '../components/ImageFilters';

/**
 * Apply a CSS filter to an image and return a new File with the filter applied
 * @param file - Original image file
 * @param filterName - Name of the filter to apply
 * @returns Promise<File> - New file with the filter applied
 */
export const applyFilterToImage = (file: File, filterName: string): Promise<File> => {
	return new Promise((resolve, reject) => {
		// If no filter or normal filter, return original file
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

				// Apply the CSS filter
				ctx.filter = filter.style.filter as string;
				ctx.drawImage(img, 0, 0);

				// Convert canvas to blob
				canvas.toBlob(
					(blob) => {
						if (!blob) {
							reject(new Error('Could not create blob from canvas'));
							return;
						}

						// Create a new file with the same name but filtered content
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
