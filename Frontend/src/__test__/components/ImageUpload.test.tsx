import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageUpload from '../../components/ImageUpload/ImageUpload';

jest.mock('../../utils/SvgFile', () => ({
	CameraIcon: ({ width, height }: { width: number; height: number }) => (
		<svg data-testid="camera-icon" width={width} height={height} />
	),
}));

describe('ImageUpload', () => {
	it('renders upload placeholder when no preview', () => {
		render(<ImageUpload preview={null} onFileSelect={() => {}} />);
		expect(screen.getByText('Click or drag an image here')).toBeInTheDocument();
		expect(screen.getByTestId('camera-icon')).toBeInTheDocument();
	});

	it('renders preview image when provided', () => {
		render(<ImageUpload preview="https://example.com/image.jpg" onFileSelect={() => {}} />);
		const img = screen.getByRole('img', { name: 'Preview' });
		expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
	});

	it('renders error message when provided', () => {
		render(<ImageUpload preview={null} onFileSelect={() => {}} error="Image is required" />);
		expect(screen.getByText('Image is required')).toBeInTheDocument();
	});

	it('applies has-preview class when preview exists', () => {
		const { container } = render(<ImageUpload preview="test.jpg" onFileSelect={() => {}} />);
		expect(container.querySelector('.has-preview')).toBeInTheDocument();
	});

	it('applies has-error class when error exists', () => {
		const { container } = render(<ImageUpload preview={null} onFileSelect={() => {}} error="Error" />);
		expect(container.querySelector('.has-error')).toBeInTheDocument();
	});

	it('opens file dialog on click', () => {
		render(<ImageUpload preview={null} onFileSelect={() => {}} />);
		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		const clickSpy = jest.spyOn(fileInput, 'click');

		const dropZone = document.querySelector('.image-upload-zone');
		fireEvent.click(dropZone!);

		expect(clickSpy).toHaveBeenCalled();
	});

	it('calls onFileSelect when file is selected', () => {
		const handleFileSelect = jest.fn();
		render(<ImageUpload preview={null} onFileSelect={handleFileSelect} />);

		const file = new File(['test'], 'test.png', { type: 'image/png' });
		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

		Object.defineProperty(fileInput, 'files', { value: [file] });
		fireEvent.change(fileInput);

		expect(handleFileSelect).toHaveBeenCalledWith(file);
	});

	it('handles drag over event', () => {
		const { container } = render(<ImageUpload preview={null} onFileSelect={() => {}} />);
		const dropZone = container.querySelector('.image-upload-zone');

		const dragOverEvent = new Event('dragover', { bubbles: true });
		Object.defineProperty(dragOverEvent, 'preventDefault', { value: jest.fn() });

		fireEvent.dragOver(dropZone!);
	});

	it('handles file drop', () => {
		const handleFileSelect = jest.fn();
		const { container } = render(<ImageUpload preview={null} onFileSelect={handleFileSelect} />);
		const dropZone = container.querySelector('.image-upload-zone');

		const file = new File(['test'], 'test.png', { type: 'image/png' });

		fireEvent.drop(dropZone!, {
			dataTransfer: { files: [file] },
		});

		expect(handleFileSelect).toHaveBeenCalledWith(file);
	});

	it('rejects non-image files on drop', () => {
		const handleFileSelect = jest.fn();
		const { container } = render(<ImageUpload preview={null} onFileSelect={handleFileSelect} />);
		const dropZone = container.querySelector('.image-upload-zone');

		const file = new File(['test'], 'test.txt', { type: 'text/plain' });

		fireEvent.drop(dropZone!, {
			dataTransfer: { files: [file] },
		});

		expect(handleFileSelect).not.toHaveBeenCalled();
	});

	it('accepts only images via input', () => {
		render(<ImageUpload preview={null} onFileSelect={() => {}} />);
		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		expect(fileInput).toHaveAttribute('accept', 'image/*');
	});
});
