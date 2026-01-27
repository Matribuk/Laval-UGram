import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { toast } from 'react-toastify';
import { SignupFormValues } from '../../types/api.types';
import { signupSchema } from '../../utils/validationSchemas';
import { useUser } from '../../components/UserContext';
import AuthHeader from '../../components/AuthHeader';
import FormField from '../../components/FormField';
import PasswordInput from '../../components/PasswordInput';
import './SignupPage.css';

const SignupPage: React.FC = () => {
	const navigate = useNavigate();
	const { signup } = useUser();

	const handleSubmit = async (values: SignupFormValues) => {
		try {
			await signup({
				email: values.email,
				password: values.password,
				username: values.username,
				firstName: values.firstName,
				lastName: values.lastName,
			});
			toast.success('Account created successfully! Welcome to Ugram!');
			navigate('/feed');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Signup failed. Please try again.');
		}
	};

	return (
		<div className="signup-container">
			<AuthHeader tagline="Join the community" />

			<div className="signup-card">
				<h2 className="signup-title">Create an account</h2>
				<p className="signup-subtitle">Enter your details to get started</p>

				<Formik
					initialValues={{
						firstName: '',
						lastName: '',
						username: '',
						email: '',
						password: '',
						confirmPassword: '',
					}}
					validationSchema={signupSchema}
					onSubmit={handleSubmit}
				>
					{({ errors, touched }) => (
						<Form>
							<div className="form-row">
								<FormField
									name="firstName"
									label="First Name"
									placeholder="John"
									error={errors.firstName}
									touched={touched.firstName}
								/>
								<FormField
									name="lastName"
									label="Last Name"
									placeholder="Doe"
									error={errors.lastName}
									touched={touched.lastName}
								/>
							</div>

							<FormField
								name="username"
								label="Username"
								placeholder="johndoe"
								error={errors.username}
								touched={touched.username}
								required
							/>

							<FormField
								name="email"
								label="Email"
								type="email"
								placeholder="name@example.com"
								error={errors.email}
								touched={touched.email}
								required
							/>

							<PasswordInput
								name="password"
								label="Password *"
								placeholder="At least 6 characters"
								error={errors.password}
								touched={touched.password}
							/>

							<FormField
								name="confirmPassword"
								label="Confirm Password"
								type="password"
								placeholder="Repeat your password"
								error={errors.confirmPassword}
								touched={touched.confirmPassword}
								required
							/>

							<button type="submit" className="create-account-button">
								Create account
							</button>
						</Form>
					)}
				</Formik>

				<p className="signin-link">
					Already have an account? <Link to="/login">Sign in</Link>
				</p>
			</div>
		</div>
	);
};

export default SignupPage;
