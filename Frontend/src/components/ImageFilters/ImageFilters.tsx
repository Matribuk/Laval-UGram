import React, { useMemo, useCallback } from 'react';
import './ImageFilters.css';

export interface ImageFilter {
	name: string;
	label: string;
	style: React.CSSProperties;
}

export const IMAGE_FILTERS: ImageFilter[] = [
	{ name: 'normal', label: 'Normal', style: {} },
	{ name: 'grayscale', label: 'B&W', style: { filter: 'grayscale(100%)' } },
	{ name: 'sepia', label: 'Sepia', style: { filter: 'sepia(100%)' } },
	{ name: 'contrast', label: 'Contrast', style: { filter: 'contrast(150%)' } },
	{ name: 'brightness', label: 'Bright', style: { filter: 'brightness(120%)' } },
	{ name: 'saturate', label: 'Vivid', style: { filter: 'saturate(150%)' } },
	{ name: 'warm', label: 'Warm', style: { filter: 'sepia(30%) saturate(140%)' } },
	{ name: 'cool', label: 'Cool', style: { filter: 'saturate(80%) hue-rotate(20deg)' } },
	{ name: 'vintage', label: 'Vintage', style: { filter: 'sepia(40%) contrast(90%) brightness(90%)' } },
];

interface ImageFiltersProps {
	preview: string;
	selectedFilter: string;
	onFilterSelect: (filterName: string) => void;
}

const ImageFilters: React.FC<ImageFiltersProps> = ({ preview, selectedFilter, onFilterSelect }) => {
	const currentFilter = useMemo(
		() => IMAGE_FILTERS.find((f) => f.name === selectedFilter) || IMAGE_FILTERS[0],
		[selectedFilter],
	);

	const handleFilterClick = useCallback((filterName: string) => () => onFilterSelect(filterName), [onFilterSelect]);

	return (
		<div className="image-filters">
			<div className="image-filters-preview">
				<img src={preview} alt="Preview" style={currentFilter.style} className="filtered-image" />
			</div>

			<div className="image-filters-list">
				{IMAGE_FILTERS.map((filter) => (
					<button
						key={filter.name}
						type="button"
						className={`filter-option ${selectedFilter === filter.name ? 'active' : ''}`}
						onClick={handleFilterClick(filter.name)}
					>
						<div className="filter-thumbnail">
							<img src={preview} alt={filter.label} style={filter.style} />
						</div>
						<span className="filter-label">{filter.label}</span>
					</button>
				))}
			</div>
		</div>
	);
};

export default React.memo(ImageFilters);
