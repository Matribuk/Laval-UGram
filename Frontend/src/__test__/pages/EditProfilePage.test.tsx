import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditProfilePage from '../../pages/SettingsPage/EditProfilePage';
import { mockNavigate } from '../../__mocks__/react-router-dom';
import * as UserContext from '../../components/UserContext';
import { usersService } from '../../services/usersService';
import { toast } from 'react-toastify';

jest.mock('react-router-dom');
jest.mock('../../components/UserContext');
jest.mock('../../services/usersService');
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
	BackArrowIcon: () => <svg data-testid="back-arrow-icon" />,
	CameraIcon: () => <svg data-testid="camera-icon" />,
	MessageIcon: () => <svg data-testid="message-icon" />,
}));

const mockUseUser = UserContext.useUser as jest.MockedFunction<typeof UserContext.useUser>;
const mockUsersService = usersService as jest.Mocked<typeof usersService>;

describe('EditProfilePage', () => {
	const mockUser = {
		id: 'user-123',
		username: 'johndoe',
		email: 'john@example.com',
		firstName: 'John',
		lastName: 'Doe',
		fullName: 'John Doe',
		phoneNumber: '+1234567890',
		avatar: '/avatar.jpg',
	};

	const mockUpdateUser = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseUser.mockReturnValue({
			user: mockUser,
			setUser: jest.fn(),
			updateUser: mockUpdateUser,
			login: jest.fn(),
			signup: jest.fn(),
			logout: jest.fn(),
			loading: false,
			error: null,
			isAuthenticated: true,
		});
	});

	it('renders edit profile form', () => {
		render(<EditProfilePage />);
		expect(screen.getByRole('heading', { name: 'Edit Profile' })).toBeInTheDocument();
		expect(screen.getByLabelText('First Name')).toBeInTheDocument();
		expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
	});

	it('renders with current user data', () => {
		render(<EditProfilePage />);
		expect(screen.getByDisplayValue('John')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
		expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
		expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
	});

	it('renders username display', () => {
		const { container } = render(<EditProfilePage />);
		const avatarUsername = container.querySelector('.avatar-username');
		expect(avatarUsername).toHaveTextContent('johndoe');
	});

	it('renders change photo button', () => {
		render(<EditProfilePage />);
		expect(screen.getByText('Change profile photo')).toBeInTheDocument();
	});

	it('navigates back on back button click', () => {
		render(<EditProfilePage />);
		const backButton = screen.getByTestId('back-arrow-icon').closest('button');
		if (backButton) {
			fireEvent.click(backButton);
		}
		expect(mockNavigate).toHaveBeenCalledWith('/profile');
	});

	it('navigates back on cancel button click', () => {
		render(<EditProfilePage />);
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(mockNavigate).toHaveBeenCalledWith('/profile');
	});

	it('submits form successfully', async () => {
		mockUsersService.updateUser.mockResolvedValue({
			...mockUser,
			firstName: 'Jane',
		});

		render(<EditProfilePage />);

		fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Jane' } });
		fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

		await waitFor(() => {
			expect(mockUsersService.updateUser).toHaveBeenCalledWith('user-123', {
				firstName: 'Jane',
				lastName: 'Doe',
				email: 'john@example.com',
				phoneNumber: '+1234567890',
			});
			expect(toast.success).toHaveBeenCalledWith('Profile updated successfully');
			expect(mockNavigate).toHaveBeenCalledWith('/profile');
		});
	});

	it('shows error toast on submission failure', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
		mockUsersService.updateUser.mockRejectedValue(new Error('Network error'));

		render(<EditProfilePage />);

		fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Failed to update profile');
		});

		consoleSpy.mockRestore();
	});

	it('uploads profile picture successfully', async () => {
		mockUsersService.uploadProfilePicture.mockResolvedValue({
			...mockUser,
			avatar: '/new-avatar.jpg',
		});

		const { container } = render(<EditProfilePage />);

		const file = new File(['test'], 'avatar.png', { type: 'image/png' });
		const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
		Object.defineProperty(fileInput, 'files', { value: [file] });
		fireEvent.change(fileInput);

		await waitFor(() => {
			expect(mockUsersService.uploadProfilePicture).toHaveBeenCalledWith('user-123', file);
			expect(toast.success).toHaveBeenCalledWith('Profile picture updated successfully');
			expect(mockUpdateUser).toHaveBeenCalled();
		});
	});

	it('shows error toast on picture upload failure', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
		mockUsersService.uploadProfilePicture.mockRejectedValue(new Error('Upload failed'));

		const { container } = render(<EditProfilePage />);

		const file = new File(['test'], 'avatar.png', { type: 'image/png' });
		const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
		Object.defineProperty(fileInput, 'files', { value: [file] });
		fireEvent.change(fileInput);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Failed to upload profile picture');
		});

		consoleSpy.mockRestore();
	});

	it('returns null when no current user', () => {
		mockUseUser.mockReturnValue({
			user: null,
			setUser: jest.fn(),
			updateUser: jest.fn(),
			login: jest.fn(),
			signup: jest.fn(),
			logout: jest.fn(),
			loading: false,
			error: null,
			isAuthenticated: false,
		});

		const { container } = render(<EditProfilePage />);
		expect(container.firstChild).toBeNull();
	});

	it('renders personal information section', () => {
		render(<EditProfilePage />);
		expect(screen.getByText('Personal Information')).toBeInTheDocument();
		expect(screen.getByText('Update your personal details')).toBeInTheDocument();
	});
});
