import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyState from '../../components/EmptyState/EmptyState';

describe('EmptyState', () => {
	it('renders with title and icon', () => {
		render(<EmptyState icon={<span data-testid="test-icon">📭</span>} title="No items found" />);
		expect(screen.getByText('No items found')).toBeInTheDocument();
		expect(screen.getByTestId('test-icon')).toBeInTheDocument();
	});

	it('renders subtitle when provided', () => {
		render(
			<EmptyState
				icon={<span>📭</span>}
				title="No items found"
				subtitle="Try adding some items to get started"
			/>
		);
		expect(screen.getByText('Try adding some items to get started')).toBeInTheDocument();
	});

	it('does not render subtitle when not provided', () => {
		const { container } = render(<EmptyState icon={<span>📭</span>} title="No items" />);
		expect(container.querySelector('.empty-state-subtitle')).not.toBeInTheDocument();
	});

	it('applies correct CSS classes', () => {
		const { container } = render(<EmptyState icon={<span>📭</span>} title="Empty" />);
		expect(container.querySelector('.empty-state')).toBeInTheDocument();
		expect(container.querySelector('.empty-state-icon')).toBeInTheDocument();
		expect(container.querySelector('.empty-state-title')).toBeInTheDocument();
	});
});
