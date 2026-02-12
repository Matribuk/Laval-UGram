import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PageLayout from '../../components/PageLayout/PageLayout';
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
}));

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;

describe('PageLayout', () => {
	const mockUser = {
		id: 'user-123',
		username: 'johndoe',
		email: 'john@example.com',
		firstName: 'John',
		lastName: 'Doe',
		fullName: 'John Doe',
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

	it('renders children', () => {
		render(
			<PageLayout activePage="feed" user={mockUser}>
				<div>Page Content</div>
			</PageLayout>
		);
		expect(screen.getByText('Page Content')).toBeInTheDocument();
	});

	it('renders mobile header with logo', () => {
		const { container } = render(
			<PageLayout activePage="feed" user={mockUser}>
				<div>Content</div>
			</PageLayout>
		);
		expect(container.querySelector('.mobile-header-logo')).toHaveTextContent('Ugram');
	});

	it('renders sidebar', () => {
		const { container } = render(
			<PageLayout activePage="feed" user={mockUser}>
				<div>Content</div>
			</PageLayout>
		);
		expect(container.querySelector('.sidebar')).toBeInTheDocument();
	});

	it('renders mobile nav', () => {
		const { container } = render(
			<PageLayout activePage="feed" user={mockUser}>
				<div>Content</div>
			</PageLayout>
		);
		expect(container.querySelector('.mobile-nav')).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const { container } = render(
			<PageLayout activePage="feed" user={mockUser} className="custom-layout">
				<div>Content</div>
			</PageLayout>
		);
		expect(container.querySelector('.page-layout.custom-layout')).toBeInTheDocument();
	});

	it('calls logout on mobile header logout click', async () => {
		const { container } = render(
			<PageLayout activePage="feed" user={mockUser}>
				<div>Content</div>
			</PageLayout>
		);

		const logoutButton = container.querySelector('.mobile-header-logout');
		fireEvent.click(logoutButton!);

		expect(mockLogout).toHaveBeenCalled();
	});

	it('applies correct CSS classes', () => {
		const { container } = render(
			<PageLayout activePage="feed" user={mockUser}>
				<div>Content</div>
			</PageLayout>
		);
		expect(container.querySelector('.page-layout')).toBeInTheDocument();
		expect(container.querySelector('.mobile-header')).toBeInTheDocument();
		expect(container.querySelector('.page-main-content')).toBeInTheDocument();
	});
});
