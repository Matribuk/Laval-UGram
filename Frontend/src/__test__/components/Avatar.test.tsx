import React from 'react';
import { render, screen } from '@testing-library/react';
import Avatar from '../../components/Avatar/Avatar';

describe('Avatar', () => {
	it('renders with image when src is provided', () => {
		render(<Avatar src="https://example.com/avatar.jpg" name="John Doe" />);
		const img = screen.getByRole('img', { name: 'John Doe' });
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
	});

	it('renders initial when no src is provided', () => {
		render(<Avatar name="John Doe" />);
		expect(screen.getByText('J')).toBeInTheDocument();
	});

	it('renders uppercase initial', () => {
		render(<Avatar name="alice" />);
		expect(screen.getByText('A')).toBeInTheDocument();
	});

	it('applies default medium size class', () => {
		const { container } = render(<Avatar name="John" />);
		expect(container.firstChild).toHaveClass('avatar', 'avatar-medium');
	});

	it('applies small size class', () => {
		const { container } = render(<Avatar name="John" size="small" />);
		expect(container.firstChild).toHaveClass('avatar-small');
	});

	it('applies large size class', () => {
		const { container } = render(<Avatar name="John" size="large" />);
		expect(container.firstChild).toHaveClass('avatar-large');
	});

	it('applies custom className', () => {
		const { container } = render(<Avatar name="John" className="custom-class" />);
		expect(container.firstChild).toHaveClass('custom-class');
	});
});
