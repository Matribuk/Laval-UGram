import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { EditProfileFormValues } from '../../types/api.types';
import { editProfileSchema } from '../../utils/validationSchemas';
import { currentUser } from '../../utils/mockData';
import PageLayout from '../../components/PageLayout';
import Avatar from '../../components/Avatar';
import FormField from '../../components/FormField';
import { BackArrowIcon, CameraIcon } from '../../utils/SvgFile';
import './EditProfilePage.css';

const EditProfilePage: React.FC = () => {
	const navigate = useNavigate();

	const profileUser = {
		username: currentUser.name,
		avatar: currentUser.avatar,
	};

	const handleGoBack = () => {
		navigate('/profile');
	};

	const handleChangePhoto = () => {
		// TODO: Implement photo change functionality
	};

	const handleCancel = () => {
		navigate('/profile');
	};

	const handleSubmit = (_values: EditProfileFormValues) => {
		// TODO: Implement save changes API call
		navigate('/profile');
	};

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
						<Avatar src={profileUser.avatar} name={profileUser.username} size="large" className="avatar-large" />
						<button type="button" className="avatar-change-button" onClick={handleChangePhoto}>
							<CameraIcon />
						</button>
					</div>
					<div className="avatar-info">
						<span className="avatar-username">{profileUser.username}</span>
						<button type="button" className="change-photo-link" onClick={handleChangePhoto}>
							Change profile photo
						</button>
					</div>
				</div>
			</div>

			<div className="edit-profile-card">
				<div className="card-header">
					<h2 className="card-title">Personal Information</h2>
					<p className="card-subtitle">Update your personal details</p>
				</div>

				<Formik
					initialValues={{
						firstName: 'killian',
						lastName: 'cottrelle',
						email: currentUser.email,
						phoneNumber: '',
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
								placeholder="+1 (555) 000-0000"
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
		</PageLayout>
	);
};

export default EditProfilePage;
