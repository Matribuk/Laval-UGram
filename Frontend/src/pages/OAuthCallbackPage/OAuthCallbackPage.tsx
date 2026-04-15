import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUser } from '../../components/UserContext';
import { authService } from '../../services/authService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import './OAuthCallbackPage.css';

const OAuthCallbackPage: React.FC = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { setUser } = useUser();
	const [error, setError] = useState<string | null>(null);
	const isMountedRef = useRef(true);

	useEffect(() => {
		isMountedRef.current = true;

		const handleOAuthCallback = async () => {
			const token = searchParams.get('token');
			const userParam = searchParams.get('user');
			const errorParam = searchParams.get('error');

			if (errorParam) {
				if (isMountedRef.current) {
					setError(errorParam);
					toast.error('Google login failed. Please try again.');
					setTimeout(() => navigate('/login'), 3000);
				}
				return;
			}

			if (!token) {
				if (isMountedRef.current) {
					setError('No authentication token received');
					toast.error('Authentication failed. No token received.');
					setTimeout(() => navigate('/login'), 3000);
				}
				return;
			}

			try {
				localStorage.setItem('auth_token', token);

				if (userParam) {
					const user = JSON.parse(decodeURIComponent(userParam));
					localStorage.setItem('auth_user', JSON.stringify(user));
					if (isMountedRef.current) {
						setUser(user);
					}
				} else {
					const authData = await authService.getTokenInfo();
					if (isMountedRef.current) {
						setUser(authData.user);
					}
				}

				if (isMountedRef.current) {
					toast.success('Successfully logged in with Google!');
					navigate('/feed');
				}
			} catch (err) {
				if (isMountedRef.current) {
					console.error('OAuth callback error:', err);
					setError('Failed to complete authentication');
					toast.error('Authentication failed. Please try again.');
					localStorage.removeItem('auth_token');
					localStorage.removeItem('auth_user');
					setTimeout(() => navigate('/login'), 3000);
				}
			}
		};

		handleOAuthCallback();

		return () => {
			isMountedRef.current = false;
		};
	}, [searchParams, navigate, setUser]);

	if (error) {
		return (
			<div className="oauth-callback-container">
				<div className="oauth-callback-card">
					<div className="oauth-error-icon">!</div>
					<h2>Authentication Failed</h2>
					<p>{error}</p>
					<p className="oauth-redirect-message">Redirecting to login...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="oauth-callback-container">
			<LoadingSpinner message="Completing authentication..." />
		</div>
	);
};

export default OAuthCallbackPage;
