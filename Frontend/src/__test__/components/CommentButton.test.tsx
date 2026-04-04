import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CommentButton from '../../components/CommentButton/CommentButton';

describe('CommentButton', () => {
	const defaultProps = {
		count: 0,
		isActive: false,
		onClick: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders comment count', () => {
		render(<CommentButton {...defaultProps} count={5} />);
		expect(screen.getByText('5')).toBeInTheDocument();
	});

	it('renders zero count', () => {
		render(<CommentButton {...defaultProps} count={0} />);
		expect(screen.getByText('0')).toBeInTheDocument();
	});

	it('calls onClick when clicked', () => {
		const onClick = jest.fn();
		render(<CommentButton {...defaultProps} onClick={onClick} />);

		const button = screen.getByRole('button');
		fireEvent.click(button);

		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('applies active class when isActive is true', () => {
		const { container } = render(<CommentButton {...defaultProps} isActive={true} />);
		expect(container.querySelector('.comment-button.active')).toBeInTheDocument();
	});

	it('does not apply active class when isActive is false', () => {
		const { container } = render(<CommentButton {...defaultProps} isActive={false} />);
		expect(container.querySelector('.comment-button')).toBeInTheDocument();
		expect(container.querySelector('.comment-button.active')).not.toBeInTheDocument();
	});

	it('has correct aria-label when not active', () => {
		render(<CommentButton {...defaultProps} isActive={false} />);
		expect(screen.getByRole('button', { name: 'Show comments' })).toBeInTheDocument();
	});

	it('has correct aria-label when active', () => {
		render(<CommentButton {...defaultProps} isActive={true} />);
		expect(screen.getByRole('button', { name: 'Hide comments' })).toBeInTheDocument();
	});

	it('displays large comment count correctly', () => {
		render(<CommentButton {...defaultProps} count={999} />);
		expect(screen.getByText('999')).toBeInTheDocument();
	});

	it('renders comment icon', () => {
		const { container } = render(<CommentButton {...defaultProps} />);
		expect(container.querySelector('svg')).toBeInTheDocument();
	});

	it('applies correct CSS class', () => {
		const { container } = render(<CommentButton {...defaultProps} />);
		expect(container.querySelector('.comment-button')).toBeInTheDocument();
		expect(container.querySelector('.comment-count')).toBeInTheDocument();
	});
});
