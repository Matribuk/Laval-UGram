import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User } from '../../types/api.types';
import { useUser } from '../../components/UserContext';
import PageLayout from '../../components/PageLayout/PageLayout';
import SearchInput from '../../components/SearchInput/SearchInput';
import UserCard from '../../components/UserCard/UserCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { usersService } from '../../services/usersService';
import './UsersPage.css';

const UsersPage: React.FC = () => {
	const navigate = useNavigate();
	const { user: currentUser } = useUser();
	const [users, setUsers] = useState<User[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setLoading(true);
				const data = await usersService.getAllUsers();
				setUsers(Array.isArray(data) ? data : []);
			} catch (error) {
				console.error('Failed to fetch users:', error);
				toast.error('Failed to load users');
				setUsers([]);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	const filteredUsers = users.filter(
		(user) =>
			user.id !== currentUser?.id &&
			(user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
				user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				user.email.toLowerCase().includes(searchQuery.toLowerCase())),
	);

	const handleUserClick = (user: User) => {
		navigate(`/profile/${user.username}`);
	};

	if (loading) {
		return (
			<PageLayout activePage="users" user={currentUser}>
				<LoadingSpinner message="Loading users..." />
			</PageLayout>
		);
	}

	return (
		<PageLayout activePage="users" user={currentUser}>
			<h1 className="users-page-title">Discover</h1>

			<SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search users..." />

			<div className="users-list">
				{filteredUsers.length === 0 ? (
					<p className="users-empty">No users found</p>
				) : (
					filteredUsers.map((user) => (
						<UserCard
							key={user.id}
							username={user.username}
							fullName={user.fullName}
							email={user.email}
							avatar={user.avatar}
							onClick={() => handleUserClick(user)}
						/>
					))
				)}
			</div>
		</PageLayout>
	);
};

export default UsersPage;
