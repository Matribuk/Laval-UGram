import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
	fullScreen?: boolean;
	message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false, message }) => {
	const content = (
		<div className="loading-spinner-container">
			<div className="loading-spinner" />
			{message && <p className="loading-message">{message}</p>}
		</div>
	);

	if (fullScreen) {
		return <div className="loading-spinner-fullscreen">{content}</div>;
	}

	return content;
};

export default LoadingSpinner;
