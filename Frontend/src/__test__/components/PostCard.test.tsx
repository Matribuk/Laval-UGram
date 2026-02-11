import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PostCard from '../../components/PostCard/PostCard';
import { mockNavigate } from '../../__mocks__/react-router-dom';

jest.mock('react-router-dom');

describe('PostCard', () => {
	const defaultProps = {
		id: 'post-123',
		author: {
			username: 'johndoe',
			avatar: 'https://example.com/avatar.jpg',
		},
		timeAgo: '2 hours ago',
		imageUrl: 'https://example.com/post-image.jpg',
		caption: 'This is a test caption',
		tags: ['photography', 'nature'],
	};

	beforeEach(() => {
		mockNavigate.mockClear();
	});

	it('renders author username', () => {
		render(<PostCard {...defaultProps} />);
		const usernameElements = screen.getAllByText('johndoe');
		expect(usernameElements.length).toBeGreaterThan(0);
	});

	it('renders time ago', () => {
		render(<PostCard {...defaultProps} />);
		expect(screen.getByText('2 hours ago')).toBeInTheDocument();
	});

	it('renders post image', () => {
		render(<PostCard {...defaultProps} />);
		const img = screen.getByRole('img', { name: 'This is a test caption' });
		expect(img).toHaveAttribute('src', 'https://example.com/post-image.jpg');
	});

	it('renders caption', () => {
		render(<PostCard {...defaultProps} />);
		expect(screen.getByText('This is a test caption')).toBeInTheDocument();
	});

	it('renders tags with hashtag symbol', () => {
		render(<PostCard {...defaultProps} />);
		expect(screen.getByText('#photography')).toBeInTheDocument();
		expect(screen.getByText('#nature')).toBeInTheDocument();
	});

	it('does not render tags section when tags array is empty', () => {
		render(<PostCard {...defaultProps} tags={[]} />);
		expect(screen.queryByText('#photography')).not.toBeInTheDocument();
	});

	it('navigates to post detail on image click', () => {
		render(<PostCard {...defaultProps} />);
		const postImage = screen.getByRole('img', { name: 'This is a test caption' });
		fireEvent.click(postImage.parentElement!);
		expect(mockNavigate).toHaveBeenCalledWith('/post/post-123');
	});

	it('renders avatar with author image', () => {
		render(<PostCard {...defaultProps} />);
		const avatar = screen.getByRole('img', { name: 'johndoe' });
		expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
	});

	it('renders avatar with initial when no author image', () => {
		render(<PostCard {...defaultProps} author={{ username: 'johndoe' }} />);
		expect(screen.getByText('J')).toBeInTheDocument();
	});

	it('links to author profile', () => {
		render(<PostCard {...defaultProps} />);
		const profileLinks = screen.getAllByRole('link');
		const authorLink = profileLinks.find((link) => link.getAttribute('href') === '/profile/johndoe');
		expect(authorLink).toBeInTheDocument();
	});

	it('applies correct CSS classes', () => {
		const { container } = render(<PostCard {...defaultProps} />);
		expect(container.querySelector('.post-card')).toBeInTheDocument();
		expect(container.querySelector('.post-header')).toBeInTheDocument();
		expect(container.querySelector('.post-image')).toBeInTheDocument();
		expect(container.querySelector('.post-content')).toBeInTheDocument();
		expect(container.querySelector('.post-tags')).toBeInTheDocument();
	});
});
