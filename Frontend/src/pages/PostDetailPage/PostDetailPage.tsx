import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { currentUser, isCurrentUser } from '../../utils/mockData';
import { getTimeAgo } from '../../utils/helpers';
import PageLayout from '../../components/PageLayout';
import PageHeader from '../../components/PageHeader';
import Avatar from '../../components/Avatar';
import MentionText from '../../components/MentionText';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import { GridIcon } from '../../utils/SvgFile';
import postsData from '../../__data__/posts.json';
import './PostDetailPage.css';

const PostDetailPage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const localPosts = JSON.parse(localStorage.getItem('posts') || '[]');
	const allPosts = [...localPosts, ...postsData.posts];

	const post = allPosts.find((p) => p.id === Number(id));

	if (!post) {
		return (
			<PageLayout activePage="feed" user={currentUser}>
				<EmptyState
					icon={<GridIcon width={48} height={48} />}
					title="Post not found"
					subtitle="This post may have been deleted or doesn't exist."
				/>
			</PageLayout>
		);
	}

	const isOwner = isCurrentUser(post.authorUsername);
	const timeAgo = post.createdAt ? getTimeAgo(post.createdAt) : post.timeAgo;

	const handleConfirmDelete = () => {
		const updatedLocalPosts = localPosts.filter((p: { id: number }) => p.id !== post.id);
		localStorage.setItem('posts', JSON.stringify(updatedLocalPosts));
		navigate('/feed');
	};

	return (
		<PageLayout activePage="feed" user={currentUser}>
			<PageHeader title="Post" />

			<article className="post-detail">
				<div className="post-detail-author">
					<Link to={`/profile/${post.authorUsername}`} className="author-link">
						<Avatar name={post.authorUsername} size="medium" />
						<div className="author-info">
							<span className="author-username">{post.authorUsername}</span>
							<span className="post-time">{timeAgo}</span>
						</div>
					</Link>

					{isOwner && (
						<div className="post-actions">
							<button
								type="button"
								className="btn btn-secondary btn-sm"
								onClick={() => navigate(`/post/${post.id}/edit`)}
							>
								Edit
							</button>
							<button type="button" className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
								Delete
							</button>
						</div>
					)}
				</div>

				<div className="post-detail-image">
					<img src={post.imageUrl} alt={post.caption} />
				</div>

				<div className="post-detail-content">
					<p className="post-caption">
						<Link to={`/profile/${post.authorUsername}`} className="caption-username">
							{post.authorUsername}
						</Link>{' '}
						<MentionText text={post.caption} />
					</p>

					{post.tags && post.tags.length > 0 && (
						<div className="post-tags">
							{post.tags.map((tag: string, index: number) => (
								<span key={index} className="post-tag">
									#{tag}
								</span>
							))}
						</div>
					)}

					{post.mentions && post.mentions.length > 0 && (
						<div className="post-mentions">
							<span className="mentions-label">Mentions: </span>
							{post.mentions.map((mention: string, index: number) => (
								<Link key={index} to={`/profile/${mention}`} className="mention-link">
									@{mention}
								</Link>
							))}
						</div>
					)}
				</div>
			</article>

			<ConfirmModal
				isOpen={showDeleteConfirm}
				title="Delete Post"
				message="Are you sure you want to delete this post? This action cannot be undone."
				confirmLabel="Delete"
				onConfirm={handleConfirmDelete}
				onCancel={() => setShowDeleteConfirm(false)}
				isDangerous
			/>
		</PageLayout>
	);
};

export default PostDetailPage;
