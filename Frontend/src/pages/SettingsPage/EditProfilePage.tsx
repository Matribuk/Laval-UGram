import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import { EditProfileFormValues } from '../../types/api.types';
import { editProfileSchema } from '../../utils/validationSchemas';
import { useUser } from '../../components/UserContext';
import PageLayout from '../../components/PageLayout/PageLayout';
import Avatar from '../../components/Avatar/Avatar';
import FormField from '../../components/FormField/FormField';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { BackArrowIcon, CameraIcon } from '../../utils/SvgFile';
import { usersService } from '../../services/usersService';
import './EditProfilePage.css';

const EditProfilePage: React.FC = () => {
	const navigate = useNavigate();
	const { user: currentUser, updateUser, logout } = useUser();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | undefined>(currentUser?.avatar);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const handleGoBack = () => {
		navigate('/profile');
	};

	const handleChangePhoto = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file || !currentUser) {
			return;
		}

		try {
			const updatedUser = await usersService.uploadProfilePicture(currentUser.id, file);
			setAvatarPreview(updatedUser.avatar);
			updateUser(updatedUser);
			toast.success('Profile picture updated successfully');
		} catch (error) {
			console.error('Failed to upload profile picture:', error);
			toast.error('Failed to upload profile picture');
		}
	};

	const handleCancel = () => {
		navigate('/profile');
	};

	const handleSubmit = async (values: EditProfileFormValues) => {
		if (!currentUser) {
			return;
		}

		try {
			const updateData: Partial<{
				firstName: string;
				lastName: string;
				email: string;
				phoneNumber: string;
			}> = {
				firstName: values.firstName,
				lastName: values.lastName,
				email: values.email,
			};

			if (values.phoneNumber && values.phoneNumber.trim() !== '') {
				updateData.phoneNumber = values.phoneNumber;
			}

			const updatedUser = await usersService.updateUser(currentUser.id, updateData);
			updateUser(updatedUser);
			toast.success('Profile updated successfully');
			navigate('/profile');
		} catch (error) {
			console.error('Failed to update profile:', error);
			toast.error('Failed to update profile');
		}
	};

	const handleDeleteAccount = async () => {
		if (!currentUser) {
			return;
		}

		try {
			await usersService.deleteUser(currentUser.id);
			toast.success('Account deleted successfully');
			logout();
			navigate('/login');
		} catch (error) {
			console.error('Failed to delete account:', error);
			toast.error('Failed to delete account');
		}
		setShowDeleteModal(false);
	};

	if (!currentUser) {
		return null;
	}

	return (
		<PageLayout activePage="profile" user={currentUser}>
			<div className="edit-profile-header">
				<button type="button" className="back-button" onClick={handleGoBack}>
					<BackArrowIcon />
				</button>
				<h1 className="edit-profile-title">Edit Profile</h1>
			</div>

			<div className="edit-profile-card">
				<div className="avatar-section">
					<div className="avatar-container">
						<Avatar src={avatarPreview} name={currentUser.username} size="large" className="avatar-large" />
						<button type="button" className="avatar-change-button" onClick={handleChangePhoto}>
							<CameraIcon />
						</button>
					</div>
					<div className="avatar-info">
						<span className="avatar-username">{currentUser.username}</span>
						<button type="button" className="change-photo-link" onClick={handleChangePhoto}>
							Change profile photo
						</button>
					</div>
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					style={{ display: 'none' }}
					onChange={handleFileChange}
				/>
			</div>

			<div className="edit-profile-card">
				<div className="card-header">
					<h2 className="card-title">Personal Information</h2>
					<p className="card-subtitle">Update your personal details</p>
				</div>

				<Formik
					initialValues={{
						firstName: currentUser.firstName,
						lastName: currentUser.lastName,
						email: currentUser.email,
						phoneNumber: currentUser.phoneNumber || '',
					}}
					validationSchema={editProfileSchema}
					onSubmit={handleSubmit}
				>
					{({ errors, touched }) => (
						<Form className="edit-profile-form">
							<div className="form-row">
								<FormField name="firstName" label="First Name" error={errors.firstName} touched={touched.firstName} />
								<FormField name="lastName" label="Last Name" error={errors.lastName} touched={touched.lastName} />
							</div>

							<FormField name="email" label="Email" type="email" error={errors.email} touched={touched.email} />

							<FormField
								name="phoneNumber"
								label="Phone Number"
								type="tel"
								placeholder="+1 234-567-8900"
								error={errors.phoneNumber}
								touched={touched.phoneNumber}
							/>

							<div className="form-actions">
								<button type="button" className="btn btn-secondary" onClick={handleCancel}>
									Cancel
								</button>
								<button type="submit" className="btn btn-primary">
									Save Changes
								</button>
							</div>
						</Form>
					)}
				</Formik>
			</div>

			<div className="edit-profile-card danger-zone">
				<div className="card-header">
					<h2 className="card-title danger-title">Danger Zone</h2>
					<p className="card-subtitle">Irreversible actions</p>
				</div>
				<div className="danger-zone-content">
					<div className="danger-zone-info">
						<h3>Delete Account</h3>
						<p>Once you delete your account, there is no going back. All your data will be permanently removed.</p>
					</div>
					<button type="button" className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
						Delete Account
					</button>
				</div>
			</div>

			<ConfirmModal
				isOpen={showDeleteModal}
				title="Delete Account"
				message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
				confirmLabel="Delete Account"
				cancelLabel="Cancel"
				onConfirm={handleDeleteAccount}
				onCancel={() => setShowDeleteModal(false)}
				isDangerous
			/>
		</PageLayout>
	);
};

export default EditProfilePage;
