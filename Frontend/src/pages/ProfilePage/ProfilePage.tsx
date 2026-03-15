import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ProfilePost, User } from '../../types/api.types';
import { useUser } from '../../components/UserContext';
import PageLayout from '../../components/PageLayout/PageLayout';
import Avatar from '../../components/Avatar/Avatar';
import EmptyState from '../../components/EmptyState/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { GridIcon, SettingsIcon, EmailIcon, CalendarIcon, PhoneIcon } from '../../utils/SvgFile';
import { usersService } from '../../services/usersService';
import { postsService } from '../../services/postsService';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
	const navigate = useNavigate();
	const { username } = useParams<{ username: string }>();
	const { user: currentUser } = useUser();

	const [profileUser, setProfileUser] = useState<User | null>(null);
	const [posts, setPosts] = useState<ProfilePost[]>([]);
	const [loading, setLoading] = useState(true);

	const profileUsername = username || currentUser?.username;
	const isOwnProfile = profileUsername === currentUser?.username;

	useEffect(() => {
		const fetchProfileData = async () => {
			if (!profileUsername) {
				return;
			}

			try {
				setLoading(true);

				const usersData = await usersService.getAllUsers();
				const users = Array.isArray(usersData) ? usersData : [];
				const user = users.find((u) => u.username === profileUsername);

				if (user) {
					setProfileUser(user);

					const userPosts = await postsService.getUserPosts(user.id);
					const postsArray = Array.isArray(userPosts) ? userPosts : [];
					setPosts(
						postsArray.map((p) => ({
							id: p.id,
							imageUrl: p.imageUrl,
						})),
					);
				} else {
					toast.error('User not found');
					navigate('/users');
				}
			} catch (error) {
				console.error('Failed to fetch profile data:', error);
				toast.error('Failed to load profile');
			} finally {
				setLoading(false);
			}
		};

		fetchProfileData();
	}, [profileUsername, navigate]);

	const handleEditProfile = () => {
		navigate('/profile/edit');
	};

	const handlePostClick = (postId: string) => {
		navigate(`/post/${postId}`);
	};

	if (loading) {
		return (
			<PageLayout activePage={isOwnProfile ? 'profile' : 'users'} user={currentUser}>
				<LoadingSpinner message="Loading profile..." />
			</PageLayout>
		);
	}

	if (!profileUser) {
		return (
			<PageLayout activePage={isOwnProfile ? 'profile' : 'users'} user={currentUser}>
				<EmptyState
					icon={<GridIcon width={48} height={48} />}
					title="User not found"
					subtitle="This user doesn't exist"
				/>
			</PageLayout>
		);
	}

	const fullName = profileUser.fullName;
	const joinedDate = profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString() : 'Unknown';

	return (
		<PageLayout activePage={isOwnProfile ? 'profile' : 'users'} user={currentUser}>
			<div className="profile-header">
				<Avatar src={profileUser.avatar} name={profileUser.username} size="large" className="profile-avatar-large" />

				<div className="profile-info">
					<div className="profile-title-row">
						<h1 className="profile-username">{profileUser.username}</h1>
						{isOwnProfile && (
							<button type="button" className="edit-profile-button" onClick={handleEditProfile}>
								<SettingsIcon />
								Edit Profile
							</button>
						)}
					</div>

					<div className="profile-stats">
						<span className="stat-number">{posts.length}</span>
						<span className="stat-label">posts</span>
					</div>

					<div className="profile-details">
						<h2 className="profile-fullname">{fullName}</h2>
						<div className="profile-meta">
							<span className="profile-email">
								<EmailIcon />
								{profileUser.email}
							</span>
							{profileUser.phoneNumber && (
								<span className="profile-phone">
									<PhoneIcon />
									{profileUser.phoneNumber}
								</span>
							)}
							<span className="profile-joined">
								<CalendarIcon />
								Joined {joinedDate}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className="profile-divider" />

			<div className="profile-tabs">
				<button type="button" className="profile-tab active">
					<GridIcon />
					POSTS
				</button>
			</div>

			<div className="profile-content">
				{posts.length > 0 ? (
					<div className="posts-grid">
						{posts.map((post) => (
							<div key={post.id} className="post-thumbnail" onClick={() => handlePostClick(post.id)}>
								<img src={post.imageUrl} alt="Post" />
							</div>
						))}
					</div>
				) : (
					<EmptyState
						icon={<GridIcon width={48} height={48} />}
						title="No posts yet"
						subtitle={isOwnProfile ? 'Share your first moment!' : "This user hasn't posted yet."}
					/>
				)}
			</div>
		</PageLayout>
	);
};

export default ProfilePage;
