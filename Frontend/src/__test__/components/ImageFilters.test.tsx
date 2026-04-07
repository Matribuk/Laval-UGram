import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageFilters, { IMAGE_FILTERS } from '../../components/ImageFilters';

describe('ImageFilters', () => {
	const mockPreview = 'data:image/jpeg;base64,test123';
	const mockOnFilterSelect = jest.fn();

	beforeEach(() => {
		mockOnFilterSelect.mockClear();
	});

	it('renders preview image', () => {
		render(<ImageFilters preview={mockPreview} selectedFilter="normal" onFilterSelect={mockOnFilterSelect} />);

		const previewImage = screen.getByAltText('Preview');
		expect(previewImage).toBeInTheDocument();
		expect(previewImage).toHaveAttribute('src', mockPreview);
	});

	it('renders all filter options', () => {
		render(<ImageFilters preview={mockPreview} selectedFilter="normal" onFilterSelect={mockOnFilterSelect} />);

		IMAGE_FILTERS.forEach((filter) => {
			expect(screen.getByText(filter.label)).toBeInTheDocument();
		});
	});

	it('applies active class to selected filter', () => {
		const { container } = render(
			<ImageFilters preview={mockPreview} selectedFilter="sepia" onFilterSelect={mockOnFilterSelect} />,
		);

		const activeButton = container.querySelector('.filter-option.active');
		expect(activeButton).toBeInTheDocument();
		expect(activeButton).toHaveTextContent('Sepia');
	});

	it('calls onFilterSelect when filter is clicked', () => {
		render(<ImageFilters preview={mockPreview} selectedFilter="normal" onFilterSelect={mockOnFilterSelect} />);

		const sepiaButton = screen.getByText('Sepia').closest('button');
		if (sepiaButton) {
			fireEvent.click(sepiaButton);
		}

		expect(mockOnFilterSelect).toHaveBeenCalledWith('sepia');
	});

	it('applies filter style to preview image', () => {
		render(<ImageFilters preview={mockPreview} selectedFilter="grayscale" onFilterSelect={mockOnFilterSelect} />);

		const previewImage = screen.getByAltText('Preview');
		expect(previewImage).toHaveStyle({ filter: 'grayscale(100%)' });
	});

	it('applies no filter style when normal is selected', () => {
		render(<ImageFilters preview={mockPreview} selectedFilter="normal" onFilterSelect={mockOnFilterSelect} />);

		const previewImage = screen.getByAltText('Preview');
		expect(previewImage).not.toHaveStyle({ filter: 'grayscale(100%)' });
	});

	it('renders thumbnail images with filter styles', () => {
		render(<ImageFilters preview={mockPreview} selectedFilter="normal" onFilterSelect={mockOnFilterSelect} />);

		const thumbnails = screen.getAllByAltText(/^(Normal|B&W|Sepia|Contrast|Bright|Vivid|Warm|Cool|Vintage)$/);
		expect(thumbnails).toHaveLength(IMAGE_FILTERS.length);
	});

	it('has correct number of filter options', () => {
		const { container } = render(
			<ImageFilters preview={mockPreview} selectedFilter="normal" onFilterSelect={mockOnFilterSelect} />,
		);

		const filterButtons = container.querySelectorAll('.filter-option');
		expect(filterButtons).toHaveLength(IMAGE_FILTERS.length);
	});
});
