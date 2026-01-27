import React from 'react';
import Avatar from '../Avatar';
import './UserCard.css';

interface UserCardProps {
	username: string;
	fullName?: string;
	email: string;
	avatar?: string;
	onClick?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ username, fullName, email, avatar, onClick }) => {
	return (
		<div className="user-card" onClick={onClick}>
			<Avatar src={avatar} name={username} size="large" className="user-card-avatar" />
			<div className="user-card-info">
				<span className="user-card-username">{username}</span>
				<span className="user-card-fullname">{fullName || username}</span>
				<span className="user-card-email">{email}</span>
			</div>
		</div>
	);
};

export default UserCard;
