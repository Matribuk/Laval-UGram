import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types/api.types';
import { currentUser } from '../../utils/mockData';
import PageLayout from '../../components/PageLayout';
import SearchInput from '../../components/SearchInput';
import UserCard from '../../components/UserCard';
import usersData from '../../__data__/users.json';
import './UsersPage.css';

const UsersPage: React.FC = () => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState('');

	const users: User[] = usersData.users.map((u) => ({
		id: u.id,
		username: u.username,
		fullName: u.fullName,
		email: u.email,
		avatar: u.avatar || undefined,
	}));

	const filteredUsers = users.filter(
		(user) =>
			user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.email.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleUserClick = (user: User) => {
		navigate(`/profile/${user.username}`);
	};

	return (
		<PageLayout activePage="users" user={currentUser}>
			<h1 className="users-page-title">Discover</h1>

			<SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search users..." />

			<div className="users-list">
				{filteredUsers.map((user) => (
					<UserCard
						key={user.id}
						username={user.username}
						fullName={user.fullName}
						email={user.email}
						avatar={user.avatar}
						onClick={() => handleUserClick(user)}
					/>
				))}
			</div>
		</PageLayout>
	);
};

export default UsersPage;
