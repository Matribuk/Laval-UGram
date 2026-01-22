import React from 'react';
import './AuthHeader.css';

interface AuthHeaderProps {
	tagline: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ tagline }) => {
	return (
		<div className="auth-header">
			<h1 className="logo">Lumina</h1>
			<p className="tagline">{tagline}</p>
		</div>
	);
};

export default AuthHeader;
