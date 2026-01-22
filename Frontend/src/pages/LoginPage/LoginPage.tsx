import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { LoginFormValues } from '../../types/api.types';
import { loginSchema } from '../../utils/validationSchemas';
import { useUser } from '../../components/UserContext';
import AuthHeader from '../../components/AuthHeader';
import FormField from '../../components/FormField';
import PasswordInput from '../../components/PasswordInput';
import './LoginPage.css';

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const { login } = useUser();
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (values: LoginFormValues) => {
		try {
			setError(null);
			await login({ email: values.email, password: values.password });
			navigate('/feed');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Login failed');
		}
	};

	return (
		<div className="login-container">
			<AuthHeader tagline="Share your moments" />

			<div className="login-card">
				<h2 className="login-title">Sign in</h2>
				<p className="login-subtitle">Enter your email and password to access your account</p>

				{error && <div className="login-error">{error}</div>}

				<Formik initialValues={{ email: '', password: '' }} validationSchema={loginSchema} onSubmit={handleSubmit}>
					{({ errors, touched }) => (
						<Form>
							<FormField
								name="email"
								label="Email"
								type="email"
								placeholder="name@example.com"
								error={errors.email}
								touched={touched.email}
							/>

							<PasswordInput
								name="password"
								label="Password"
								placeholder="Enter your password"
								error={errors.password}
								touched={touched.password}
							/>

							<button type="submit" className="sign-in-button">
								Sign in
							</button>
						</Form>
					)}
				</Formik>

				<p className="signup-link">
					Don't have an account? <Link to="/signup">Create one</Link>
				</p>
			</div>
		</div>
	);
};

export default LoginPage;
