import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthHeader from '../../components/AuthHeader/AuthHeader';

describe('AuthHeader', () => {
	it('renders logo', () => {
		render(<AuthHeader tagline="Welcome back" />);
		expect(screen.getByText('Ugram')).toBeInTheDocument();
	});

	it('renders tagline', () => {
		render(<AuthHeader tagline="Welcome back" />);
		expect(screen.getByText('Welcome back')).toBeInTheDocument();
	});

	it('applies correct CSS classes', () => {
		const { container } = render(<AuthHeader tagline="Test" />);
		expect(container.querySelector('.auth-header')).toBeInTheDocument();
		expect(container.querySelector('.logo')).toBeInTheDocument();
		expect(container.querySelector('.tagline')).toBeInTheDocument();
	});
});
