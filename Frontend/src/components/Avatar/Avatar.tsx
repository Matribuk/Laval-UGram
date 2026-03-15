import React from 'react';
import './Avatar.css';

interface AvatarProps {
	src?: string;
	name: string;
	size?: 'small' | 'medium' | 'large';
	className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'medium', className = '' }) => {
	const initial = name.charAt(0).toUpperCase();

	return (
		<div className={`avatar avatar-${size} ${className}`}>
			{src ? <img src={src} alt={name} /> : <span>{initial}</span>}
		</div>
	);
};

export default Avatar;
