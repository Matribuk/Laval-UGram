import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from '../../components/UserCard/UserCard';

describe('UserCard', () => {
	const defaultProps = {
		username: 'johndoe',
		fullName: 'John Doe',
		email: 'john@example.com',
	};

	it('renders username', () => {
		render(<UserCard {...defaultProps} />);
		expect(screen.getByText('johndoe')).toBeInTheDocument();
	});

	it('renders full name', () => {
		render(<UserCard {...defaultProps} />);
		expect(screen.getByText('John Doe')).toBeInTheDocument();
	});

	it('renders email', () => {
		render(<UserCard {...defaultProps} />);
		expect(screen.getByText('john@example.com')).toBeInTheDocument();
	});

	it('renders avatar with image when provided', () => {
		render(<UserCard {...defaultProps} avatar="https://example.com/avatar.jpg" />);
		const img = screen.getByRole('img', { name: 'johndoe' });
		expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
	});

	it('renders avatar with initial when no image provided', () => {
		render(<UserCard {...defaultProps} />);
		expect(screen.getByText('J')).toBeInTheDocument();
	});

	it('calls onClick when card is clicked', () => {
		const handleClick = jest.fn();
		render(<UserCard {...defaultProps} onClick={handleClick} />);
		const card = screen.getByText('johndoe').closest('.user-card');
		fireEvent.click(card!);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('applies correct CSS classes', () => {
		const { container } = render(<UserCard {...defaultProps} />);
		expect(container.querySelector('.user-card')).toBeInTheDocument();
		expect(container.querySelector('.user-card-info')).toBeInTheDocument();
		expect(container.querySelector('.user-card-username')).toBeInTheDocument();
		expect(container.querySelector('.user-card-fullname')).toBeInTheDocument();
		expect(container.querySelector('.user-card-email')).toBeInTheDocument();
	});
});
