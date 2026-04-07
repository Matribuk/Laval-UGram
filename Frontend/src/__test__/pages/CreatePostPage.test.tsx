import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreatePostPage from '../../pages/CreatePostPage/CreatePostPage';
import { mockNavigate } from '../../__mocks__/react-router-dom';
import * as UserContext from '../../components/UserContext';
import { usersService } from '../../services/usersService';

jest.mock('react-router-dom');
jest.mock('../../components/UserContext');
jest.mock('../../services/postsService');
jest.mock('../../services/usersService');
jest.mock('../../components/RecommendedUsers/RecommendedUsers', () => {
	const MockRecommendedUsers = () => <div data-testid="recommended-users" />;
	MockRecommendedUsers.displayName = 'RecommendedUsers';
	return MockRecommendedUsers;
});
jest.mock('../../components/ImageFilters', () => {
	const MockImageFilters = ({ preview }: { preview: string }) => (
		<div data-testid="image-filters">
			<img src={preview} alt="Preview" className="filtered-image" />
		</div>
	);
	MockImageFilters.displayName = 'ImageFilters';
	return { __esModule: true, default: MockImageFilters };
});
jest.mock('react-toastify', () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
	},
}));
jest.mock('../../utils/SvgFile', () => ({
	HomeIcon: () => <svg data-testid="home-icon" />,
	UsersIcon: () => <svg data-testid="users-icon" />,
	ProfileIcon: () => <svg data-testid="profile-icon" />,
	PlusIcon: () => <svg data-testid="plus-icon" />,
	LogoutIcon: () => <svg data-testid="logout-icon" />,
	CameraIcon: () => <svg data-testid="camera-icon" />,
	BackArrowIcon: () => <svg data-testid="back-arrow-icon" />,
	MessageIcon: () => <svg data-testid="message-icon" />,
}));

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;
const mockUsersService = usersService as jest.Mocked<typeof usersService>;

describe('CreatePostPage', () => {
	const mockUser = {
		id: 'user-123',
		username: 'johndoe',
		email: 'john@example.com',
		firstName: 'John',
		lastName: 'Doe',
		fullName: 'John Doe',
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseUser.mockReturnValue({
			user: mockUser,
			setUser: jest.fn(),
			updateUser: jest.fn(),
			login: jest.fn(),
			signup: jest.fn(),
			logout: jest.fn(),
			loading: false,
			error: null,
			isAuthenticated: true,
		});
		mockUsersService.getAllUsers.mockResolvedValue([]);
	});

	it('renders create post form', () => {
		render(<CreatePostPage />);
		expect(screen.getByRole('heading', { name: 'New Post' })).toBeInTheDocument();
		expect(screen.getByText('Description')).toBeInTheDocument();
		expect(screen.getByText('Hashtags')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
	});

	it('renders image upload component', () => {
		render(<CreatePostPage />);
		expect(screen.getByText('Click or drag an image here')).toBeInTheDocument();
	});

	it('shows image error when submitting without image', async () => {
		render(<CreatePostPage />);

		const captionInput = screen.getByPlaceholderText(/Write a caption/);
		fireEvent.change(captionInput, { target: { value: 'Test caption' } });

		fireEvent.click(screen.getByRole('button', { name: 'Share' }));

		await waitFor(() => {
			expect(screen.getByText('Image is required')).toBeInTheDocument();
		});
	});

	it('shows image filters when file is selected', async () => {
		const { container } = render(<CreatePostPage />);

		const file = new File(['test'], 'test.png', { type: 'image/png' });
		const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
		Object.defineProperty(fileInput, 'files', { value: [file] });
		fireEvent.change(fileInput);

		await waitFor(() => {
			expect(screen.getByTestId('image-filters')).toBeInTheDocument();
		});
	});

	it('navigates back on cancel', () => {
		render(<CreatePostPage />);

		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(mockNavigate).toHaveBeenCalledWith(-1);
	});

	it('renders hashtags input with placeholder', () => {
		render(<CreatePostPage />);
		expect(screen.getByPlaceholderText(/nature, photography, sunset/)).toBeInTheDocument();
	});

	it('renders description textarea with placeholder', () => {
		render(<CreatePostPage />);
		expect(screen.getByPlaceholderText(/Write a caption/)).toBeInTheDocument();
	});

	it('allows typing in caption field', () => {
		render(<CreatePostPage />);

		const captionInput = screen.getByPlaceholderText(/Write a caption/);
		fireEvent.change(captionInput, { target: { value: 'My caption' } });

		expect(captionInput).toHaveValue('My caption');
	});

	it('allows typing in tags field', () => {
		render(<CreatePostPage />);

		const tagsInput = screen.getByPlaceholderText(/nature, photography/);
		fireEvent.change(tagsInput, { target: { value: 'nature travel' } });

		expect(tagsInput).toHaveValue('nature travel');
	});

	it('renders page layout with sidebar and mobile nav', () => {
		const { container } = render(<CreatePostPage />);

		expect(container.querySelector('.sidebar')).toBeInTheDocument();
		expect(container.querySelector('.mobile-nav')).toBeInTheDocument();
	});

	it('renders back button in header', () => {
		render(<CreatePostPage />);

		expect(screen.getByTestId('back-arrow-icon')).toBeInTheDocument();
	});
});
