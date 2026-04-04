import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileNav from '../../components/MobileNav/MobileNav';
import { mockNavigate } from '../../__mocks__/react-router-dom';

jest.mock('react-router-dom');
jest.mock('../../utils/SvgFile', () => ({
	HomeIcon: () => <svg data-testid="home-icon" />,
	UsersIcon: () => <svg data-testid="users-icon" />,
	ProfileIcon: () => <svg data-testid="profile-icon" />,
	PlusIcon: () => <svg data-testid="plus-icon" />,
	MessageIcon: () => <svg data-testid="message-icon" />,
}));

describe('MobileNav', () => {
	beforeEach(() => {
		mockNavigate.mockClear();
	});

	it('renders all navigation items', () => {
		render(<MobileNav activePage="feed" />);
		expect(screen.getByText('Feed')).toBeInTheDocument();
		expect(screen.getByText('Users')).toBeInTheDocument();
		expect(screen.getByText('Profile')).toBeInTheDocument();
	});

	it('renders navigation icons', () => {
		render(<MobileNav activePage="feed" />);
		expect(screen.getByTestId('home-icon')).toBeInTheDocument();
		expect(screen.getByTestId('users-icon')).toBeInTheDocument();
		expect(screen.getByTestId('profile-icon')).toBeInTheDocument();
		expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
	});

	it('marks feed as active', () => {
		const { container } = render(<MobileNav activePage="feed" />);
		const activeItem = container.querySelector('.mobile-nav-item.active');
		expect(activeItem).toHaveTextContent('Feed');
	});

	it('marks users as active', () => {
		const { container } = render(<MobileNav activePage="users" />);
		const activeItem = container.querySelector('.mobile-nav-item.active');
		expect(activeItem).toHaveTextContent('Users');
	});

	it('marks profile as active', () => {
		const { container } = render(<MobileNav activePage="profile" />);
		const activeItem = container.querySelector('.mobile-nav-item.active');
		expect(activeItem).toHaveTextContent('Profile');
	});

	it('navigates to feed on click', () => {
		render(<MobileNav activePage="users" />);
		fireEvent.click(screen.getByText('Feed'));
		expect(mockNavigate).toHaveBeenCalledWith('/feed');
	});

	it('navigates to users on click', () => {
		render(<MobileNav activePage="feed" />);
		fireEvent.click(screen.getByText('Users'));
		expect(mockNavigate).toHaveBeenCalledWith('/users');
	});

	it('navigates to profile on click', () => {
		render(<MobileNav activePage="feed" />);
		fireEvent.click(screen.getByText('Profile'));
		expect(mockNavigate).toHaveBeenCalledWith('/profile');
	});

	it('navigates to create post on plus click', () => {
		render(<MobileNav activePage="feed" />);
		const createButton = screen.getByTestId('plus-icon').closest('button');
		if (createButton) {
			fireEvent.click(createButton);
		}
		expect(mockNavigate).toHaveBeenCalledWith('/post/create');
	});

	it('applies correct CSS classes', () => {
		const { container } = render(<MobileNav activePage="feed" />);
		expect(container.querySelector('.mobile-nav')).toBeInTheDocument();
		expect(container.querySelector('.mobile-nav-create')).toBeInTheDocument();
	});
});
