import React from 'react';
import { render, screen } from '@testing-library/react';
import MentionText from '../../components/MentionText/MentionText';

jest.mock('react-router-dom');

describe('MentionText', () => {
	it('renders plain text without mentions', () => {
		render(<MentionText text="Hello world" />);
		expect(screen.getByText('Hello world')).toBeInTheDocument();
	});

	it('renders mention as a link', () => {
		render(<MentionText text="Hello @johndoe" />);
		const link = screen.getByRole('link', { name: '@johndoe' });
		expect(link).toHaveAttribute('href', '/profile/johndoe');
	});

	it('renders multiple mentions as links', () => {
		render(<MentionText text="Hello @john and @jane" />);
		const johnLink = screen.getByRole('link', { name: '@john' });
		const janeLink = screen.getByRole('link', { name: '@jane' });
		expect(johnLink).toHaveAttribute('href', '/profile/john');
		expect(janeLink).toHaveAttribute('href', '/profile/jane');
	});

	it('renders text between mentions correctly', () => {
		render(<MentionText text="Hey @alice check this out @bob" />);
		expect(screen.getByText('Hey')).toBeInTheDocument();
		expect(screen.getByText('check this out')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: '@alice' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: '@bob' })).toBeInTheDocument();
	});

	it('handles mentions with underscores', () => {
		render(<MentionText text="Hello @john_doe" />);
		const link = screen.getByRole('link', { name: '@john_doe' });
		expect(link).toHaveAttribute('href', '/profile/john_doe');
	});

	it('handles mentions with numbers', () => {
		render(<MentionText text="Hello @user123" />);
		const link = screen.getByRole('link', { name: '@user123' });
		expect(link).toHaveAttribute('href', '/profile/user123');
	});

	it('applies custom className', () => {
		const { container } = render(<MentionText text="Hello" className="custom-class" />);
		expect(container.firstChild).toHaveClass('custom-class');
	});

	it('applies mention-link class to mention links', () => {
		render(<MentionText text="Hello @john" />);
		const link = screen.getByRole('link', { name: '@john' });
		expect(link).toHaveClass('mention-link');
	});
});
