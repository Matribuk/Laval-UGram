import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PopularUser } from '../../types/api.types';
import { usersService } from '../../services/usersService';
import { useIsMounted } from '../../hooks/useIsMounted';
import Avatar from '../Avatar/Avatar';
import './RecommendedUsers.css';

interface RecommendedUsersProps {
	limit?: number;
	variant?: 'vertical' | 'horizontal';
}

const RecommendedUsers: React.FC<RecommendedUsersProps> = ({ limit = 5, variant = 'vertical' }) => {
	const navigate = useNavigate();
	const isMounted = useIsMounted();
	const [users, setUsers] = useState<PopularUser[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchRecommendedUsers = async () => {
			try {
				setLoading(true);
				const data = await usersService.getRecommendedUsers(limit);
				if (isMounted()) {
					setUsers(data);
				}
			} catch (error) {
				console.error('Failed to fetch recommended users:', error);
			} finally {
				if (isMounted()) {
					setLoading(false);
				}
			}
		};

		fetchRecommendedUsers();
	}, [limit, isMounted]);

	const handleUserClick = useCallback(
		(username: string) => {
			navigate(`/profile/${username}`);
		},
		[navigate],
	);

	if (loading) {
		return (
			<div className={`recommended-users recommended-users--${variant}`}>
				<h3 className="recommended-users-title">Suggested for you</h3>
				<div className="recommended-users-loading">Loading...</div>
			</div>
		);
	}

	if (users.length === 0) {
		return null;
	}

	return (
		<div className={`recommended-users recommended-users--${variant}`}>
			<h3 className="recommended-users-title">Suggested for you</h3>
			<ul className="recommended-users-list">
				{users.map((user) => (
					<li key={user.id} className="recommended-user-item">
						<button type="button" className="recommended-user-button" onClick={() => handleUserClick(user.username)}>
							<Avatar src={user.avatar} name={user.username} size={variant === 'horizontal' ? 'medium' : 'small'} />
							<div className="recommended-user-info">
								<span className="recommended-user-username">{user.username}</span>
								<span className="recommended-user-score">{user.popularityScore} pts</span>
							</div>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default React.memo(RecommendedUsers);
