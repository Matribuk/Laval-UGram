import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';

describe('LoadingSpinner', () => {
	it('renders spinner without message by default', () => {
		const { container } = render(<LoadingSpinner />);
		expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
		expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
	});

	it('renders with message when provided', () => {
		render(<LoadingSpinner message="Loading data..." />);
		expect(screen.getByText('Loading data...')).toBeInTheDocument();
	});

	it('renders in fullscreen mode', () => {
		const { container } = render(<LoadingSpinner fullScreen />);
		expect(container.querySelector('.loading-spinner-fullscreen')).toBeInTheDocument();
	});

	it('renders without fullscreen wrapper by default', () => {
		const { container } = render(<LoadingSpinner />);
		expect(container.querySelector('.loading-spinner-fullscreen')).not.toBeInTheDocument();
		expect(container.querySelector('.loading-spinner-container')).toBeInTheDocument();
	});

	it('renders fullscreen with message', () => {
		const { container } = render(<LoadingSpinner fullScreen message="Please wait..." />);
		expect(container.querySelector('.loading-spinner-fullscreen')).toBeInTheDocument();
		expect(screen.getByText('Please wait...')).toBeInTheDocument();
	});
});
