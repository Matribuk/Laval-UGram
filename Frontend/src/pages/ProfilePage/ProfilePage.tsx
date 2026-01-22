import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProfilePost, ProfileUser } from '../../types/api.types';
import { currentUser, isCurrentUser } from '../../utils/mockData';
import PageLayout from '../../components/PageLayout';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import { GridIcon, SettingsIcon, EmailIcon, CalendarIcon, PhoneIcon } from '../../utils/SvgFile';
import usersData from '../../__data__/users.json';
import postsData from '../../__data__/posts.json';
import './ProfilePage.css';

interface RawPost {
	id: number;
	authorUsername: string;
	imageUrl: string;
}

const ProfilePage: React.FC = () => {
	const navigate = useNavigate();
	const { username } = useParams<{ username: string }>();

	const profileUsername = username || currentUser.name;
	const isOwnProfile = isCurrentUser(profileUsername);

	const foundUser = usersData.users.find((u) => u.username === profileUsername);
	const profileUser: ProfileUser = foundUser
		? {
				username: foundUser.username,
				fullName: foundUser.fullName,
				email: foundUser.email,
				phoneNumber: foundUser.phoneNumber || undefined,
				joinedDate: foundUser.joinedDate,
				avatar: foundUser.avatar || undefined,
			}
		: {
				username: profileUsername,
				fullName: 'Unknown User',
				email: '',
				phoneNumber: undefined,
				joinedDate: 'Unknown',
				avatar: undefined,
			};

	const localPosts: RawPost[] = JSON.parse(localStorage.getItem('posts') || '[]');
	const allPosts: RawPost[] = [...localPosts, ...postsData.posts];

	const userPosts = allPosts.filter((p) => p.authorUsername === profileUsername);
	const posts: ProfilePost[] = userPosts.map((p) => ({
		id: p.id,
		imageUrl: p.imageUrl,
	}));

	const handleEditProfile = () => {
		navigate('/profile/edit');
	};

	const handlePostClick = (postId: number) => {
		navigate(`/post/${postId}`);
	};

	return (
		<PageLayout activePage="profile" user={currentUser}>
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
						<h2 className="profile-fullname">{profileUser.fullName}</h2>
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
								Joined {profileUser.joinedDate}
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
