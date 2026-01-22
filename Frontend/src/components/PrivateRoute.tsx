import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { LoadingSpinner } from './common/LoadingSpinner/LoadingSpinner';

interface PrivateRouteProps {
	children: React.ReactElement;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
	const { user, loading, isAuthenticated } = useUser();

	if (loading) {
		return <LoadingSpinner fullScreen message="Loading..." />;
	}

	return isAuthenticated && user ? <>{children}</> : <Navigate to="/login" />;
};

export const RestrictedRoute: React.FC<PrivateRouteProps> = ({ children }) => {
	const { user, loading, isAuthenticated } = useUser();

	if (loading) {
		return <LoadingSpinner fullScreen message="Loading..." />;
	}

	return !isAuthenticated || !user ? <>{children}</> : <Navigate to="/feed" />;
};
