import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { mockNavigate } from '../../__mocks__/react-router-dom';
import * as UserContext from '../../components/UserContext';

jest.mock('react-router-dom');
jest.mock('../../components/UserContext');
jest.mock('../../utils/SvgFile', () => ({
	HomeIcon: () => <svg data-testid="home-icon" />,
	UsersIcon: () => <svg data-testid="users-icon" />,
	ProfileIcon: () => <svg data-testid="profile-icon" />,
	PlusIcon: () => <svg data-testid="plus-icon" />,
	LogoutIcon: () => <svg data-testid="logout-icon" />,
	MessageIcon: () => <svg data-testid="message-icon" />,
	BellIcon: () => <svg data-testid="bell-icon" />,
}));

jest.mock('../../services/notificationsService', () => ({
	notificationsService: {
		getUnreadCount: jest.fn().mockResolvedValue(0),
	},
}));

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;

describe('Sidebar', () => {
	const mockUser = {
		id: 'user-123',
		username: 'johndoe',
		email: 'john@example.com',
		firstName: 'John',
		lastName: 'Doe',
		fullName: 'John Doe',
		avatar: 'https://example.com/avatar.jpg',
	};

	const mockLogout = jest.fn().mockResolvedValue(undefined);

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseUser.mockReturnValue({
			user: mockUser,
			setUser: jest.fn(),
			updateUser: jest.fn(),
			login: jest.fn(),
			signup: jest.fn(),
			logout: mockLogout,
			loading: false,
			error: null,
			isAuthenticated: true,
		});
	});

	it('renders logo', () => {
		render(<Sidebar activePage="feed" user={mockUser} />);
		expect(screen.getByText('Ugram')).toBeInTheDocument();
	});

	it('renders navigation items', () => {
		render(<Sidebar activePage="feed" user={mockUser} />);
		expect(screen.getByText('Feed')).toBeInTheDocument();
		expect(screen.getByText('Users')).toBeInTheDocument();
		expect(screen.getByText('Profile')).toBeInTheDocument();
		expect(screen.getByText('New Post')).toBeInTheDocument();
	});

	it('marks feed as active', () => {
		const { container } = render(<Sidebar activePage="feed" user={mockUser} />);
		const activeItem = container.querySelector('.nav-item.active');
		expect(activeItem).toHaveTextContent('Feed');
	});

	it('marks users as active', () => {
		const { container } = render(<Sidebar activePage="users" user={mockUser} />);
		const activeItem = container.querySelector('.nav-item.active');
		expect(activeItem).toHaveTextContent('Users');
	});

	it('marks profile as active', () => {
		const { container } = render(<Sidebar activePage="profile" user={mockUser} />);
		const activeItem = container.querySelector('.nav-item.active');
		expect(activeItem).toHaveTextContent('Profile');
	});

	it('navigates to feed on click', () => {
		render(<Sidebar activePage="users" user={mockUser} />);
		fireEvent.click(screen.getByText('Feed'));
		expect(mockNavigate).toHaveBeenCalledWith('/feed');
	});

	it('navigates to users on click', () => {
		render(<Sidebar activePage="feed" user={mockUser} />);
		fireEvent.click(screen.getByText('Users'));
		expect(mockNavigate).toHaveBeenCalledWith('/users');
	});

	it('navigates to profile on click', () => {
		render(<Sidebar activePage="feed" user={mockUser} />);
		fireEvent.click(screen.getByText('Profile'));
		expect(mockNavigate).toHaveBeenCalledWith('/profile');
	});

	it('navigates to create post on click', () => {
		render(<Sidebar activePage="feed" user={mockUser} />);
		fireEvent.click(screen.getByText('New Post'));
		expect(mockNavigate).toHaveBeenCalledWith('/post/create');
	});

	it('displays user info when user is provided', () => {
		render(<Sidebar activePage="feed" user={mockUser} />);
		expect(screen.getByText('johndoe')).toBeInTheDocument();
		expect(screen.getByText('john@example.com')).toBeInTheDocument();
	});

	it('does not display user info when user is null', () => {
		render(<Sidebar activePage="feed" user={null} />);
		expect(screen.queryByText('johndoe')).not.toBeInTheDocument();
	});

	it('calls logout and navigates to login', async () => {
		render(<Sidebar activePage="feed" user={mockUser} />);
		fireEvent.click(screen.getByText('Logout'));

		expect(mockLogout).toHaveBeenCalled();
	});

	it('renders navigation icons', () => {
		render(<Sidebar activePage="feed" user={mockUser} />);
		expect(screen.getByTestId('home-icon')).toBeInTheDocument();
		expect(screen.getByTestId('users-icon')).toBeInTheDocument();
		expect(screen.getByTestId('profile-icon')).toBeInTheDocument();
		expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
		expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
	});

	it('applies correct CSS classes', () => {
		const { container } = render(<Sidebar activePage="feed" user={mockUser} />);
		expect(container.querySelector('.sidebar')).toBeInTheDocument();
		expect(container.querySelector('.sidebar-content')).toBeInTheDocument();
		expect(container.querySelector('.sidebar-nav')).toBeInTheDocument();
		expect(container.querySelector('.sidebar-footer')).toBeInTheDocument();
	});
});
